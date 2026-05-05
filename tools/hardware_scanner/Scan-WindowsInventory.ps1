<#
IT-Verwaltung v43 - Windows Hardware Scanner PRO
- keine += Fehler durch List[object]
- CSV-Validierung
- Logging
- Backup
- sichere CIM/WMI-Fehlerbehandlung
- optional vollständige Softwareliste
#>

param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
    [switch]$IncludeSoftware = $true,
    [switch]$FullSoftwareScan = $false
)

$ErrorActionPreference = "Continue"

$DataDir = Join-Path $ProjectRoot "web_ui\data"
$BackupDir = Join-Path $ProjectRoot ("web_ui\backups\scanner_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$LogDir = Join-Path $ProjectRoot "logs"
$LogFile = Join-Path $LogDir ("hardware_scan_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".log")

function Ensure-Dir { param([string]$Path) if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Path $Path -Force | Out-Null } }
Ensure-Dir $DataDir; Ensure-Dir $BackupDir; Ensure-Dir $LogDir

function Write-Log {
    param([string]$Message,[string]$Level="INFO")
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    if($Level -eq "ERROR"){ Write-Host $line -ForegroundColor Red }
    elseif($Level -eq "WARN"){ Write-Host $line -ForegroundColor Yellow }
    else{ Write-Host $line }
}

$CimFailures = New-Object System.Collections.Generic.List[string]

function Test-IsAccessDenied {
    param($ErrorRecord)
    $message = [string]$ErrorRecord.Exception.Message
    $hresult = "{0:X8}" -f ($ErrorRecord.Exception.HResult -band 0xffffffff)

    return (
        $ErrorRecord.Exception -is [System.UnauthorizedAccessException] -or
        $hresult -eq "80041003" -or
        $message -match "Zugriff verweigert|Access denied|Unauthorized|0x80041003"
    )
}

function Get-CimSafe {
    param(
        [string]$ClassName,
        [string]$Label,
        [string]$Level="WARN"
    )

    try {
        return @(Get-CimInstance -ClassName $ClassName -ErrorAction Stop)
    } catch {
        $kind = if(Test-IsAccessDenied $_){"Zugriff verweigert"}else{"Fehler"}
        $message = "${Label} CIM/${ClassName} ${kind}: $($_.Exception.Message)"
        [void]$CimFailures.Add($message)
        Write-Log $message $Level
        return @()
    }
}

function Keep-ExistingIfEmpty {
    param(
        $NewValue,
        $ExistingRow,
        [string]$Column,
        [string]$Fallback=""
    )

    if($null -ne $NewValue -and [string]$NewValue -ne ""){ return [string]$NewValue }
    if($ExistingRow -and $ExistingRow.PSObject.Properties.Name -contains $Column -and [string]$ExistingRow.$Column -ne ""){
        return [string]$ExistingRow.$Column
    }
    return $Fallback
}

function Get-ExistingOrDefault {
    param(
        $ExistingRow,
        [string]$Column,
        [string]$Fallback=""
    )

    if($ExistingRow -and $ExistingRow.PSObject.Properties.Name -contains $Column -and [string]$ExistingRow.$Column -ne ""){
        return [string]$ExistingRow.$Column
    }
    return $Fallback
}


# ===== v43 SELF-HEALING CSV HELPERS =====
function Get-DelimiterFromHeader {
    param([string]$Header)
    if($Header -match ";"){ return ";" }
    if($Header -match ","){ return "," }
    return ";"
}

function Normalize-CsvHeaderName {
    param([string]$Name)
    return ([string]$Name).Trim().Trim([char]0xFEFF).Trim('"')
}

function Convert-ExistingCsvToRequiredColumns {
    param(
        [string]$Path,
        [string[]]$RequiredColumns
    )

    if(-not (Test-Path $Path)){
        Write-Log "CSV fehlt, wird mit Header erstellt: ${Path}" "WARN"
        ($RequiredColumns -join ";") | Set-Content -Path $Path -Encoding UTF8
        return
    }

    $content = @(Get-Content -Path $Path -Encoding UTF8 -ErrorAction SilentlyContinue)
    if($content.Count -eq 0){
        Write-Log "CSV leer, Header wird erstellt: ${Path}" "WARN"
        ($RequiredColumns -join ";") | Set-Content -Path $Path -Encoding UTF8
        return
    }

    $header = [string]$content[0]
    $delimiter = Get-DelimiterFromHeader $header
    $headers = @($header -split [regex]::Escape($delimiter) | ForEach-Object { Normalize-CsvHeaderName $_ })
    $missing = @($RequiredColumns | Where-Object { $_ -notin $headers })

    if($missing.Count -eq 0 -and $delimiter -eq ";"){ return }

    Write-Log "CSV wird repariert: ${Path}. Fehlende Spalten: $($missing -join ', ')" "WARN"

    try { $rows = @(Import-Csv -Path $Path -Delimiter $delimiter -Encoding UTF8) }
    catch {
        Write-Log "Import der alten CSV fehlgeschlagen. Datei wird neu initialisiert: ${Path}" "WARN"
        $rows = @()
    }

    $allColumns = New-Object System.Collections.Generic.List[string]
    foreach($c in $RequiredColumns){ if(-not $allColumns.Contains($c)){ [void]$allColumns.Add($c) } }
    foreach($h in $headers){ if($h -and -not $allColumns.Contains($h)){ [void]$allColumns.Add($h) } }

    $normalized = foreach($row in @($rows)){
        $obj = [ordered]@{}
        foreach($c in $allColumns){
            if($row.PSObject.Properties.Name -contains $c){ $obj[$c] = [string]$row.$c }
            else{ $obj[$c] = "" }
        }
        [PSCustomObject]$obj
    }

    if(@($normalized).Count -eq 0){
        ($allColumns.ToArray() -join ";") | Set-Content -Path $Path -Encoding UTF8
    }else{
        $normalized | Export-Csv -Path $Path -Delimiter ";" -NoTypeInformation -Encoding UTF8
    }
}

function Read-CsvSafe {
    param([string]$Path,[string[]]$DefaultColumns)
    Convert-ExistingCsvToRequiredColumns -Path $Path -RequiredColumns $DefaultColumns
    try { return @(Import-Csv -Path $Path -Delimiter ";" -Encoding UTF8) }
    catch {
        Write-Log "CSV Lesen fehlgeschlagen: ${Path} / $($_.Exception.Message)" "ERROR"
        return @()
    }
}

function Normalize-Rows {
    param([object[]]$Rows,[string[]]$Columns)
    $out = foreach($row in @($Rows)){
        $obj = [ordered]@{}
        foreach($col in $Columns){
            if($null -ne $row -and $row.PSObject.Properties.Name -contains $col){ $obj[$col] = [string]$row.$col }
            else{ $obj[$col] = "" }
        }
        [PSCustomObject]$obj
    }
    return @($out)
}

function Export-CsvSafe {
    param([string]$Path,[object[]]$Rows,[string[]]$Columns)
    try {
        $normalized = @(Normalize-Rows -Rows $Rows -Columns $Columns)
        $normalized | Export-Csv -Path $Path -Delimiter ";" -NoTypeInformation -Encoding UTF8
        Write-Log "CSV geschrieben: $Path ($($normalized.Count) Zeilen)"
        return $true
    } catch { Write-Log "CSV Schreiben fehlgeschlagen: $Path / $($_.Exception.Message)" "ERROR"; return $false }
}

function Upsert-Row {
    param([object[]]$Rows,[string]$KeyColumn,[string]$KeyValue,[hashtable]$NewValues)
    $result = New-Object System.Collections.Generic.List[object]
    $found = $false
    foreach($row in @($Rows)){
        if($null -ne $row -and [string]$row.$KeyColumn -eq [string]$KeyValue){
            $found = $true
            foreach($k in $NewValues.Keys){ $row | Add-Member -NotePropertyName $k -NotePropertyValue $NewValues[$k] -Force }
            [void]$result.Add($row)
        } elseif($null -ne $row) {
            [void]$result.Add($row)
        }
    }
    if(-not $found){
        $obj = [ordered]@{}
        foreach($k in $NewValues.Keys){ $obj[$k] = $NewValues[$k] }
        [void]$result.Add([PSCustomObject]$obj)
    }
    return @($result.ToArray())
}

function Get-First { param($Value,[string]$Fallback="") if($null -eq $Value){return $Fallback}; if($Value -is [array]){ if($Value.Count -gt 0){return [string]$Value[0]}; return $Fallback}; return [string]$Value }
function Get-NextId {
    param([object[]]$Rows,[string]$Column,[string]$Prefix)
    $max = 0
    foreach($r in @($Rows)){ $v=[string]$r.$Column; if($v -match "(\d+)$"){ $n=[int]$Matches[1]; if($n -gt $max){$max=$n} } }
    return "{0}{1:0000}" -f $Prefix, ($max+1)
}
function Get-AssetType {
    param($ComputerSystem)
    try { switch([int]$ComputerSystem.PCSystemType){ 1{"Desktop"} 2{"Notebook"} 3{"Workstation"} 4{"Server"} 8{"Tablet"} default{"PC"} } }
    catch { return "PC" }
}

Write-Log "Scanner PRO gestartet"
try {
    Get-ChildItem -Path $DataDir -Filter "*.csv" -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item $_.FullName -Destination (Join-Path $BackupDir $_.Name) -Force
    }
    Write-Log "Backup erstellt: $BackupDir"
} catch { Write-Log "Backup fehlgeschlagen: $($_.Exception.Message)" "ERROR" }

$AssetColumns = @("Asset-ID","Gerätename","Asset-Typ","Standort","Raum","Status","Hauptnutzer","Hersteller","Modellserie","Modell","Seriennummer","Inventarnummer","Betriebssystem","Domäne","Notizen")
$HardwareColumns = @("Hardware-ID","Asset-ID","Gerätename","CPU","RAM","Speicher","Monitor","Dockingstation","Garantie bis","Bemerkung")
$NetzwerkColumns = @("Netzwerk-ID","Asset-ID","Gerätename","Netzwerktyp","Adressart","Verbindungstyp","IP-Adresse","MAC-Adresse","DNS","VLAN","Switch-Port","Wanddose","Access Point","SSID","Bemerkung")
$SoftwareColumns = @("Software-ID","Asset-ID","Gerätename","Softwarename","Version","Hersteller","Lizenzstatus","Update-Status","Kritikalität","Bemerkung")
$SoftwareFullColumns = @("Name","Version","Hersteller","Quelle","InstallDatum")

$AssetsCsv = Join-Path $DataDir "assets.csv"
$HardwareCsv = Join-Path $DataDir "hardware.csv"
$NetzwerkCsv = Join-Path $DataDir "netzwerk.csv"
$SoftwareCsv = Join-Path $DataDir "software.csv"
$SoftwareFullCsv = Join-Path $DataDir "software_full.csv"


# v43: CSV-Struktur vor dem Lesen automatisch reparieren
Convert-ExistingCsvToRequiredColumns -Path $AssetsCsv -RequiredColumns $AssetColumns
Convert-ExistingCsvToRequiredColumns -Path $HardwareCsv -RequiredColumns $HardwareColumns
Convert-ExistingCsvToRequiredColumns -Path $NetzwerkCsv -RequiredColumns $NetzwerkColumns
Convert-ExistingCsvToRequiredColumns -Path $SoftwareCsv -RequiredColumns $SoftwareColumns

$Assets = @(Read-CsvSafe -Path $AssetsCsv -DefaultColumns $AssetColumns)
$Hardware = @(Read-CsvSafe -Path $HardwareCsv -DefaultColumns $HardwareColumns)
$Netzwerk = @(Read-CsvSafe -Path $NetzwerkCsv -DefaultColumns $NetzwerkColumns)
$Software = @(Read-CsvSafe -Path $SoftwareCsv -DefaultColumns $SoftwareColumns)

$CS = @(Get-CimSafe "Win32_ComputerSystem" "ComputerSystem" "ERROR" | Where-Object { $_ }) | Select-Object -First 1
$BIOS = @(Get-CimSafe "Win32_BIOS" "BIOS" "ERROR" | Where-Object { $_ }) | Select-Object -First 1
$CPU = @(Get-CimSafe "Win32_Processor" "CPU" "ERROR" | Where-Object { $_ }) | Select-Object -First 1
$OS = @(Get-CimSafe "Win32_OperatingSystem" "OS" "ERROR" | Where-Object { $_ }) | Select-Object -First 1

$PhysicalMemory = @(Get-CimSafe "Win32_PhysicalMemory" "RAM" "WARN" | Where-Object { $_ })
$RamBytes = if($PhysicalMemory.Count -gt 0){ ($PhysicalMemory | Measure-Object Capacity -Sum).Sum }else{ $null }
$RamGB = if($RamBytes){[math]::Round($RamBytes/1GB,0)}else{""}

$DiskDrives = @(Get-CimSafe "Win32_DiskDrive" "Disk" "WARN" | Where-Object { $_ })
$DiskBytes = if($DiskDrives.Count -gt 0){ ($DiskDrives | Where-Object { $_.MediaType -notmatch "Removable" } | Measure-Object Size -Sum).Sum }else{ $null }
$DiskGB = if($DiskBytes){[math]::Round($DiskBytes/1GB,0)}else{""}

$DesktopMonitors = @(Get-CimSafe "Win32_DesktopMonitor" "Monitor" "WARN" | Where-Object { $_ })
$Monitors = @($DesktopMonitors | Where-Object { $_.Name } | Select-Object -ExpandProperty Name) -join ", "

$Hostname = $env:COMPUTERNAME
$Domain = if($CS -and $CS.PartOfDomain){$CS.Domain}else{"WORKGROUP"}
$AssetType = if($CS){Get-AssetType $CS}else{"PC"}
$Serial = if($BIOS){Get-First $BIOS.SerialNumber}else{""}

$NetworkAdapters = @(Get-CimSafe "Win32_NetworkAdapterConfiguration" "NIC" "WARN" | Where-Object { $_ })
$NIC = $NetworkAdapters | Where-Object { $_.IPEnabled -eq $true -and $_.MACAddress } | Select-Object -First 1

$IP = if($NIC -and $NIC.IPAddress){($NIC.IPAddress | Where-Object { $_ -match "^\d+\.\d+\.\d+\.\d+$" } | Select-Object -First 1)}else{""}
$MAC = if($NIC){Get-First $NIC.MACAddress}else{""}
$DNS = if($NIC -and $NIC.DNSServerSearchOrder){($NIC.DNSServerSearchOrder -join ", ")}else{""}
$DHCP = if($NIC){if($NIC.DHCPEnabled){"DHCP"}else{"Statisch"}}else{""}

$ExistingAsset = $Assets | Where-Object { $_."Gerätename" -eq $Hostname -or ($Serial -and $_."Seriennummer" -eq $Serial) } | Select-Object -First 1
$AssetId = if($ExistingAsset){$ExistingAsset."Asset-ID"}else{Get-NextId $Assets "Asset-ID" "AS-"}
$ExistingHardware = $Hardware | Where-Object { $_."Asset-ID" -eq $AssetId } | Select-Object -First 1
$HardwareId = if($ExistingHardware){$ExistingHardware."Hardware-ID"}else{Get-NextId $Hardware "Hardware-ID" "HW-"}
$ExistingNetzwerk = $Netzwerk | Where-Object { $_."Asset-ID" -eq $AssetId } | Select-Object -First 1
$NetzwerkId = if($ExistingNetzwerk){$ExistingNetzwerk."Netzwerk-ID"}else{Get-NextId $Netzwerk "Netzwerk-ID" "NET-"}

$ScanStatus = if($CimFailures.Count -gt 0){
    "Automatisch erfasst eingeschraenkt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'). CIM/WMI Fehler: $($CimFailures.Count). Siehe Log: $(Split-Path $LogFile -Leaf)"
}else{
    "Automatisch erfasst: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

$AssetManufacturer = Keep-ExistingIfEmpty (if($CS){Get-First $CS.Manufacturer}else{""}) $ExistingAsset "Hersteller"
$AssetModel = Keep-ExistingIfEmpty (if($CS){Get-First $CS.Model}else{""}) $ExistingAsset "Modell"
$AssetSerial = Keep-ExistingIfEmpty $Serial $ExistingAsset "Seriennummer"
$AssetOS = Keep-ExistingIfEmpty (if($OS){Get-First $OS.Caption}else{""}) $ExistingAsset "Betriebssystem"
$AssetDomain = Keep-ExistingIfEmpty $Domain $ExistingAsset "Domäne" "WORKGROUP"
$AssetNotes = if($ExistingAsset -and $ExistingAsset.Notizen){$ExistingAsset.Notizen}else{$ScanStatus}

$HardwareCpu = Keep-ExistingIfEmpty (if($CPU){Get-First $CPU.Name}else{""}) $ExistingHardware "CPU"
$HardwareRam = Keep-ExistingIfEmpty (if($RamGB){"$RamGB GB"}else{""}) $ExistingHardware "RAM"
$HardwareDisk = Keep-ExistingIfEmpty (if($DiskGB){"$DiskGB GB"}else{""}) $ExistingHardware "Speicher"
$HardwareMonitor = Keep-ExistingIfEmpty $Monitors $ExistingHardware "Monitor"
$HardwareRemark = if($CimFailures.Count -gt 0){$ScanStatus}else{"Automatisch erfasst durch Scanner PRO."}

$NetworkIp = Keep-ExistingIfEmpty $IP $ExistingNetzwerk "IP-Adresse"
$NetworkMac = Keep-ExistingIfEmpty $MAC $ExistingNetzwerk "MAC-Adresse"
$NetworkDns = Keep-ExistingIfEmpty $DNS $ExistingNetzwerk "DNS"
$NetworkAddressType = Keep-ExistingIfEmpty $DHCP $ExistingNetzwerk "Adressart"
$NetworkRemark = if($CimFailures.Count -gt 0){$ScanStatus}else{"Automatisch erfasst. Verbindungstyp bitte prüfen."}

$Assets = @(Upsert-Row $Assets "Asset-ID" $AssetId @{
    "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "Asset-Typ"=$AssetType; "Standort"=Get-ExistingOrDefault $ExistingAsset "Standort"; "Raum"=Get-ExistingOrDefault $ExistingAsset "Raum"; "Status"="Aktiv"; "Hauptnutzer"=$env:USERNAME; "Hersteller"=$AssetManufacturer; "Modellserie"=Get-ExistingOrDefault $ExistingAsset "Modellserie"; "Modell"=$AssetModel; "Seriennummer"=$AssetSerial; "Inventarnummer"=Get-ExistingOrDefault $ExistingAsset "Inventarnummer"; "Betriebssystem"=$AssetOS; "Domäne"=$AssetDomain; "Notizen"=$AssetNotes
})
$Hardware = @(Upsert-Row $Hardware "Hardware-ID" $HardwareId @{
    "Hardware-ID"=$HardwareId; "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "CPU"=$HardwareCpu; "RAM"=$HardwareRam; "Speicher"=$HardwareDisk; "Monitor"=$HardwareMonitor; "Dockingstation"=Get-ExistingOrDefault $ExistingHardware "Dockingstation"; "Garantie bis"=Get-ExistingOrDefault $ExistingHardware "Garantie bis"; "Bemerkung"=$HardwareRemark
})
$Netzwerk = @(Upsert-Row $Netzwerk "Netzwerk-ID" $NetzwerkId @{
    "Netzwerk-ID"=$NetzwerkId; "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "Netzwerktyp"="LAN/WLAN"; "Adressart"=$NetworkAddressType; "Verbindungstyp"=Get-ExistingOrDefault $ExistingNetzwerk "Verbindungstyp"; "IP-Adresse"=$NetworkIp; "MAC-Adresse"=$NetworkMac; "DNS"=$NetworkDns; "VLAN"=Get-ExistingOrDefault $ExistingNetzwerk "VLAN"; "Switch-Port"=Get-ExistingOrDefault $ExistingNetzwerk "Switch-Port"; "Wanddose"=Get-ExistingOrDefault $ExistingNetzwerk "Wanddose"; "Access Point"=Get-ExistingOrDefault $ExistingNetzwerk "Access Point"; "SSID"=Get-ExistingOrDefault $ExistingNetzwerk "SSID"; "Bemerkung"=$NetworkRemark
})

function Get-InstalledSoftwareList {
    $items = New-Object System.Collections.Generic.List[object]
    $RegistryPaths = @("HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*","HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*","HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*")
    foreach($rp in $RegistryPaths){
        try {
            Get-ItemProperty $rp -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | ForEach-Object {
                [void]$items.Add([PSCustomObject]@{Name=[string]$_.DisplayName; Version=[string]$_.DisplayVersion; Hersteller=[string]$_.Publisher; Quelle=$rp; InstallDatum=[string]$_.InstallDate})
            }
        } catch { Write-Log "Software Registry Fehler: $rp / $($_.Exception.Message)" "WARN" }
    }
    return @($items.ToArray() | Sort-Object Name -Unique)
}

if($IncludeSoftware){
    $Installed = @(Get-InstalledSoftwareList)
    if($FullSoftwareScan){ Export-CsvSafe $SoftwareFullCsv $Installed $SoftwareFullColumns | Out-Null }
    $Standard = @(
        @{Name="Firefox";Pattern="Firefox";Vendor="Mozilla";Required=$false},
        @{Name="Chrome";Pattern="Chrome";Vendor="Google";Required=$false},
        @{Name="Adobe Acrobat Reader";Pattern="Adobe Acrobat|Acrobat Reader";Vendor="Adobe";Required=$true},
        @{Name="Microsoft Office";Pattern="Microsoft Office|Microsoft 365 Apps";Vendor="Microsoft";Required=$true},
        @{Name="UniGet / WinGet";Pattern="App Installer|winget";Vendor="Microsoft";Required=$false},
        @{Name="Visual C++ Redistributable";Pattern="Visual C\+\+|VC\+\+";Vendor="Microsoft";Required=$true},
        @{Name=".NET Runtime";Pattern="\.NET Runtime|\.NET Desktop Runtime";Vendor="Microsoft";Required=$true},
        @{Name="VPN Client";Pattern="OpenVPN|FortiClient|Cisco AnyConnect|GlobalProtect";Vendor="VPN";Required=$false}
    )
    foreach($sw in $Standard){
        $match = $Installed | Where-Object { $_.Name -match $sw.Pattern } | Select-Object -First 1
        if($match){
            $ExistingSw = $Software | Where-Object { $_."Asset-ID" -eq $AssetId -and $_."Softwarename" -eq $sw.Name } | Select-Object -First 1
            $SoftwareId = if($ExistingSw){$ExistingSw."Software-ID"}else{Get-NextId $Software "Software-ID" "SW-"}
            $Software = @(Upsert-Row $Software "Software-ID" $SoftwareId @{
                "Software-ID"=$SoftwareId; "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "Softwarename"=$sw.Name; "Version"=$match.Version; "Hersteller"=if($match.Hersteller){$match.Hersteller}else{$sw.Vendor}; "Lizenzstatus"="Prüfen"; "Update-Status"="Prüfen"; "Kritikalität"=if($sw.Required){"Hoch"}else{"Normal"}; "Bemerkung"="Automatisch erkannt: $($match.Name)"
            })
        } else { Write-Log "Standardsoftware fehlt/nicht erkannt: $($sw.Name)" "WARN" }
    }
}

Export-CsvSafe $AssetsCsv $Assets $AssetColumns | Out-Null
Export-CsvSafe $HardwareCsv $Hardware $HardwareColumns | Out-Null
Export-CsvSafe $NetzwerkCsv $Netzwerk $NetzwerkColumns | Out-Null
Export-CsvSafe $SoftwareCsv $Software $SoftwareColumns | Out-Null

function Test-CsvRequiredColumns {
    param([string]$Path,[string[]]$RequiredColumns)
    if(-not (Test-Path $Path)){ return "Datei fehlt: ${Path}" }
    try {
        $headerLine = Get-Content -Path $Path -Encoding UTF8 -TotalCount 1
        if(-not $headerLine){ return "Header fehlt: ${Path}" }
        $headers = @($headerLine -split ";" | ForEach-Object { Normalize-CsvHeaderName $_ })
        $missing = $RequiredColumns | Where-Object { $_ -notin $headers }
        if($missing.Count -gt 0){ return "Spalten fehlen in ${Path}: $($missing -join ', ')" }
        return $null
    } catch { return "Validierung fehlgeschlagen ${Path}: $($_.Exception.Message)" }
}

$ValidationErrors = New-Object System.Collections.Generic.List[string]
foreach($err in @((Test-CsvRequiredColumns $AssetsCsv @("Asset-ID","Gerätename")),(Test-CsvRequiredColumns $HardwareCsv @("Hardware-ID","Asset-ID")),(Test-CsvRequiredColumns $NetzwerkCsv @("Netzwerk-ID","Asset-ID")),(Test-CsvRequiredColumns $SoftwareCsv @("Software-ID","Asset-ID")))){
    if($err){ [void]$ValidationErrors.Add($err) }
}

if($ValidationErrors.Count -gt 0){
    Write-Log "Validierung FEHLER" "ERROR"
    $ValidationErrors | ForEach-Object { Write-Log $_ "ERROR" }
}else{ Write-Log "Validierung OK" }

Write-Host ""
Write-Host "Hardware-Scan abgeschlossen." -ForegroundColor Green
Write-Host "Asset-ID:   $AssetId"
Write-Host "Gerät:      $Hostname"
Write-Host "CSV Ordner: $DataDir"
Write-Host "Backup:     $BackupDir"
Write-Host "Log:        $LogFile"
Write-Host ""
if($ValidationErrors.Count -gt 0){ Write-Host "Validierung: FEHLER - bitte Log prüfen." -ForegroundColor Red } else { Write-Host "Validierung: OK" -ForegroundColor Green }
if($CimFailures.Count -gt 0){
    Write-Host "CIM/WMI:    EINGESCHRAENKT ($($CimFailures.Count) Fehler) - siehe Log." -ForegroundColor Yellow
}else{
    Write-Host "CIM/WMI:    OK" -ForegroundColor Green
}
Write-Host ""
Write-Host "Starte danach start.bat neu oder lade die Seite neu." -ForegroundColor Yellow
