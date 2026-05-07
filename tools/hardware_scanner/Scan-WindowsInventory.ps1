<#
IT-Verwaltung v43 - Windows Hardware Scanner PRO
- keine += Fehler durch List[object]
- CSV-Validierung
- Logging
- Backup
- sichere CIM/WMI-Fehlerbehandlung
- getrennte Hardware- und Software-Scanmodi
#>

param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
    [switch]$HardwareOnly = $false,
    [switch]$SoftwareOnly = $false,
    [switch]$IncludeSoftware = $false,
    [switch]$FullSoftwareScan = $false
)

$ErrorActionPreference = "Continue"

$IncludeHardware = $true
if($SoftwareOnly -or $FullSoftwareScan){
    $IncludeHardware = $false
    $IncludeSoftware = $true
}elseif($HardwareOnly){
    $IncludeHardware = $true
    $IncludeSoftware = $false
}

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
    elseif($Level -eq "SKIPPED"){ Write-Host $line -ForegroundColor DarkYellow }
    else{ Write-Host $line }
}

$SoftwareSourcesStatus = [ordered]@{}

function Write-ScannerLog {
    param(
        [string]$Message,
        [ValidateSet("INFO","WARN","ERROR","SKIPPED")]
        [string]$Level="INFO"
    )
    Write-Log $Message $Level
}

function Set-SoftwareSourceStatus {
    param(
        [string]$Source,
        [string]$Status,
        [string]$Message=""
    )
    if([string]::IsNullOrWhiteSpace($Source)){ return }
    $SoftwareSourcesStatus[$Source] = $Status
    $level = if($Status -match "^OK"){"INFO"}elseif($Status -match "^SKIPPED"){"SKIPPED"}elseif($Status -match "^FAIL"){"ERROR"}else{"WARN"}
    if($Message){ Write-ScannerLog -Level $level -Message "${Source}: ${Status} - ${Message}" }
    else{ Write-ScannerLog -Level $level -Message "${Source}: ${Status}" }
}

function Test-IsAdministrator {
    try {
        $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
        return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    } catch {
        Write-ScannerLog -Level "WARN" -Message "Administratorstatus konnte nicht ermittelt werden: $($_.Exception.Message)"
        return $false
    }
}

function Get-ScannerContext {
    try {
        $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $isSystem = ([string]$identity.User.Value -eq "S-1-5-18")
        $isAdmin = Test-IsAdministrator
        $mode = if($isSystem){"SYSTEM"}elseif($isAdmin){"ADMIN"}else{"USER"}
        $capabilities = if($mode -eq "SYSTEM"){
            "HKLM,HKEY_USERS,AppxAllUsers,Services,Drivers,Portable"
        }elseif($mode -eq "ADMIN"){
            "HKLM,HKEY_USERS,AppxAllUsers,Services,Drivers,Portable"
        }else{
            "HKCU,HKLM-read,AppxCurrentUser,Portable-limited"
        }
        return [PSCustomObject]@{
            CurrentUser = [string]$identity.Name
            UserSID = [string]$identity.User.Value
            IsAdmin = [bool]$isAdmin
            IsSystem = [bool]$isSystem
            ScanMode = [string]$mode
            ElevatedCapabilities = [string]$capabilities
        }
    } catch {
        Write-ScannerLog -Level "WARN" -Message "ScannerContext konnte nicht vollständig ermittelt werden: $($_.Exception.Message)"
        return [PSCustomObject]@{
            CurrentUser = [string]$env:USERNAME
            UserSID = ""
            IsAdmin = $false
            IsSystem = $false
            ScanMode = "USER"
            ElevatedCapabilities = "HKCU,HKLM-read,AppxCurrentUser,Portable-limited"
        }
    }
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

$ScannerContext = Get-ScannerContext
Write-Log "Scanner PRO gestartet. Hardware=$IncludeHardware Software=$IncludeSoftware FullSoftware=$FullSoftwareScan"
Write-ScannerLog -Level "INFO" -Message "ScannerContext:`n- User: $($ScannerContext.CurrentUser)`n- IsAdmin: $($ScannerContext.IsAdmin)`n- IsSystem: $($ScannerContext.IsSystem)`n- ScanMode: $($ScannerContext.ScanMode)"
if($ScannerContext.ScanMode -eq "USER"){
    Write-ScannerLog -Level "WARN" -Message "Eingeschränkter Scan wegen fehlender Administratorrechte"
}elseif($ScannerContext.ScanMode -eq "ADMIN"){
    Write-ScannerLog -Level "INFO" -Message "Tiefenscan aktiviert"
}elseif($ScannerContext.ScanMode -eq "SYSTEM"){
    Write-ScannerLog -Level "INFO" -Message "Vollständiger Enterprise-Scan aktiviert"
}
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
$SoftwareFullColumns = @(
    "Asset-ID","Gerätename","Name","DisplayName","Version","Hersteller","Quelle","Pakettyp","PaketId","InstallDatum","Installationsort","Architektur","BenutzerKontext",
    "Publisher","InstallDate","InstallLocation","Source","Sources","Scope","Architecture","UserSID","PackageType","DetectionConfidence","RawSourceKey","RawPath","RawNames","RawEntryCount","ScanStatus","ScanMode",
    "UpdateStatus","UpdateAvailable","InstalledVersion","LatestVersion","UpdateSource","UpdateRaw","UpdateCheckedAt"
)

$AssetsCsv = Join-Path $DataDir "assets.csv"
$HardwareCsv = Join-Path $DataDir "hardware.csv"
$NetzwerkCsv = Join-Path $DataDir "netzwerk.csv"
$SoftwareCsv = Join-Path $DataDir "software_standard.csv"
$SoftwareLegacyCsv = Join-Path $DataDir "software.csv"
$SoftwareFullCsv = Join-Path $DataDir "software_full.csv"
$SoftwareFullJson = Join-Path $DataDir "software_full.json"

if(-not (Test-Path $SoftwareCsv) -and (Test-Path $SoftwareLegacyCsv)){
    Copy-Item -Path $SoftwareLegacyCsv -Destination $SoftwareCsv -Force
    Write-Log "Legacy-Softwaredatei übernommen: software.csv -> software_standard.csv" "WARN"
}


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

$DetectedManufacturer = if($CS){Get-First $CS.Manufacturer}else{""}
$DetectedModel = if($CS){Get-First $CS.Model}else{""}
$DetectedOS = if($OS){Get-First $OS.Caption}else{""}
$DetectedCpu = if($CPU){Get-First $CPU.Name}else{""}
$DetectedRam = if($RamGB){"$RamGB GB"}else{""}
$DetectedDisk = if($DiskGB){"$DiskGB GB"}else{""}

$AssetManufacturer = Keep-ExistingIfEmpty $DetectedManufacturer $ExistingAsset "Hersteller"
$AssetModel = Keep-ExistingIfEmpty $DetectedModel $ExistingAsset "Modell"
$AssetSerial = Keep-ExistingIfEmpty $Serial $ExistingAsset "Seriennummer"
$AssetOS = Keep-ExistingIfEmpty $DetectedOS $ExistingAsset "Betriebssystem"
$AssetDomain = Keep-ExistingIfEmpty $Domain $ExistingAsset "Domäne" "WORKGROUP"
$AssetNotes = if($ExistingAsset -and $ExistingAsset.Notizen){$ExistingAsset.Notizen}else{$ScanStatus}

$HardwareCpu = Keep-ExistingIfEmpty $DetectedCpu $ExistingHardware "CPU"
$HardwareRam = Keep-ExistingIfEmpty $DetectedRam $ExistingHardware "RAM"
$HardwareDisk = Keep-ExistingIfEmpty $DetectedDisk $ExistingHardware "Speicher"
$HardwareMonitor = Keep-ExistingIfEmpty $Monitors $ExistingHardware "Monitor"
$HardwareRemark = if($CimFailures.Count -gt 0){$ScanStatus}else{"Automatisch erfasst durch Scanner PRO."}

$NetworkIp = Keep-ExistingIfEmpty $IP $ExistingNetzwerk "IP-Adresse"
$NetworkMac = Keep-ExistingIfEmpty $MAC $ExistingNetzwerk "MAC-Adresse"
$NetworkDns = Keep-ExistingIfEmpty $DNS $ExistingNetzwerk "DNS"
$NetworkAddressType = Keep-ExistingIfEmpty $DHCP $ExistingNetzwerk "Adressart"
$NetworkRemark = if($CimFailures.Count -gt 0){$ScanStatus}else{"Automatisch erfasst. Verbindungstyp bitte prüfen."}

if($IncludeHardware){
    $Assets = @(Upsert-Row $Assets "Asset-ID" $AssetId @{
        "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "Asset-Typ"=$AssetType; "Standort"=Get-ExistingOrDefault $ExistingAsset "Standort"; "Raum"=Get-ExistingOrDefault $ExistingAsset "Raum"; "Status"="Aktiv"; "Hauptnutzer"=$env:USERNAME; "Hersteller"=$AssetManufacturer; "Modellserie"=Get-ExistingOrDefault $ExistingAsset "Modellserie"; "Modell"=$AssetModel; "Seriennummer"=$AssetSerial; "Inventarnummer"=Get-ExistingOrDefault $ExistingAsset "Inventarnummer"; "Betriebssystem"=$AssetOS; "Domäne"=$AssetDomain; "Notizen"=$AssetNotes
    })
    $Hardware = @(Upsert-Row $Hardware "Hardware-ID" $HardwareId @{
        "Hardware-ID"=$HardwareId; "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "CPU"=$HardwareCpu; "RAM"=$HardwareRam; "Speicher"=$HardwareDisk; "Monitor"=$HardwareMonitor; "Dockingstation"=Get-ExistingOrDefault $ExistingHardware "Dockingstation"; "Garantie bis"=Get-ExistingOrDefault $ExistingHardware "Garantie bis"; "Bemerkung"=$HardwareRemark
    })
    $Netzwerk = @(Upsert-Row $Netzwerk "Netzwerk-ID" $NetzwerkId @{
        "Netzwerk-ID"=$NetzwerkId; "Asset-ID"=$AssetId; "Gerätename"=$Hostname; "Netzwerktyp"="LAN/WLAN"; "Adressart"=$NetworkAddressType; "Verbindungstyp"=Get-ExistingOrDefault $ExistingNetzwerk "Verbindungstyp"; "IP-Adresse"=$NetworkIp; "MAC-Adresse"=$NetworkMac; "DNS"=$NetworkDns; "VLAN"=Get-ExistingOrDefault $ExistingNetzwerk "VLAN"; "Switch-Port"=Get-ExistingOrDefault $ExistingNetzwerk "Switch-Port"; "Wanddose"=Get-ExistingOrDefault $ExistingNetzwerk "Wanddose"; "Access Point"=Get-ExistingOrDefault $ExistingNetzwerk "Access Point"; "SSID"=Get-ExistingOrDefault $ExistingNetzwerk "SSID"; "Bemerkung"=$NetworkRemark
    })
}

function Get-InstalledSoftwareList {
    param([switch]$Deep)

    $items = New-Object System.Collections.Generic.List[object]
    $seen = @{}
    $UpdateCandidatesByName = @{}
    $UpdateCandidatesById = @{}

    function Normalize-SoftwareKeyPart {
        param([string]$Value)
        return ([string]$Value).Trim().ToLowerInvariant() -replace "\s+"," "
    }

    function Normalize-UpdateKey {
        param([string]$Value)
        return (([string]$Value).Trim().ToLowerInvariant() -replace "[^a-z0-9]+","")
    }

    function Get-SoftwareDisplayName {
        param([string]$Name,[string]$PackageType="")
        $display = ([string]$Name).Trim()
        if([string]::IsNullOrWhiteSpace($display)){ return "" }

        if($PackageType -match "Appx|MSIX"){
            $display = $display -replace "^[A-Z0-9]{4,}\.",""
            $display = $display -replace "^(Microsoft|Windows)\.",""
        }
        $display = $display -replace "Desktop$",""
        $display = $display -replace "(?i)\bdesktop app\b",""
        $display = $display -replace "(?i)\s+app$",""
        $display = $display.Trim()

        $aliases = @{
            "whatsappdesktop" = "WhatsApp"
            "whatsapp" = "WhatsApp"
            "microsoftteams" = "Microsoft Teams"
            "teams" = "Microsoft Teams"
            "googlechrome" = "Google Chrome"
            "chrome" = "Google Chrome"
        }
        $aliasKey = ($display -replace "[^A-Za-z0-9]","").ToLowerInvariant()
        if($aliases.ContainsKey($aliasKey)){ return $aliases[$aliasKey] }
        return $display
    }

    function Add-SoftwareItem {
        param(
            [string]$Name,
            [string]$Version="",
            [string]$Publisher="",
            [string]$Source="",
            [string]$PackageType="Unknown",
            [string]$PaketId="",
            [string]$InstallDate="",
            [string]$InstallLocation="",
            [string]$Architecture="Unknown",
            [string]$Scope="Unknown",
            [string]$UserSID="",
            [string]$DetectionConfidence="Medium",
            [string]$RawSourceKey="",
            [string]$RawPath="",
            [string]$ScanStatus="OK"
        )
        if([string]::IsNullOrWhiteSpace($Name)){ return }
        $displayName = Get-SoftwareDisplayName -Name $Name -PackageType $PackageType
        $key = ("{0}|{1}" -f (Normalize-SoftwareKeyPart $displayName), (Normalize-SoftwareKeyPart $Version))
        if($seen.ContainsKey($key)){
            $existing = $seen[$key]
            $sources = New-Object 'System.Collections.Generic.HashSet[string]'
            foreach($s in @(([string]$existing.Sources -split "\s*,\s*"))){ if($s){ [void]$sources.Add($s) } }
            if($Source){ [void]$sources.Add($Source) }
            $existing.Sources = (@($sources) | Sort-Object) -join ", "
            $existing.Quelle = $existing.Sources

            $types = New-Object 'System.Collections.Generic.HashSet[string]'
            foreach($t in @(([string]$existing.PackageType -split "\s*,\s*"))){ if($t){ [void]$types.Add($t) } }
            if($PackageType){ [void]$types.Add($PackageType) }
            $mergedTypes = (@($types) | Sort-Object) -join ", "
            $existing.PackageType = $mergedTypes
            $existing.Pakettyp = $mergedTypes

            if(-not $existing.RawPath -and $RawPath){ $existing.RawPath = $RawPath }
            if(-not $existing.RawSourceKey -and $RawSourceKey){ $existing.RawSourceKey = $RawSourceKey }
            if(-not $existing.InstallLocation -and $InstallLocation){ $existing.InstallLocation = $InstallLocation; $existing.Installationsort = $InstallLocation }
            if(-not $existing.PaketId -and $PaketId){ $existing.PaketId = $PaketId }
            $rawNames = New-Object 'System.Collections.Generic.HashSet[string]'
            foreach($rawName in @(([string]$existing.RawNames -split "\s*\|\s*"))){ if($rawName){ [void]$rawNames.Add($rawName) } }
            if($Name){ [void]$rawNames.Add($Name.Trim()) }
            $existing.RawNames = (@($rawNames) | Sort-Object) -join " | "
            $count = 1
            [void][int]::TryParse([string]$existing.RawEntryCount, [ref]$count)
            $existing.RawEntryCount = [string]($count + 1)
            $existing.ScanStatus = "OK_COMPACTED"
            return
        }
        if([string]::IsNullOrWhiteSpace($Source)){ $Source = $PackageType }
        if([string]::IsNullOrWhiteSpace($Architecture)){ $Architecture = "Unknown" }
        if([string]::IsNullOrWhiteSpace($Scope)){ $Scope = "Unknown" }
        if([string]::IsNullOrWhiteSpace($PackageType)){ $PackageType = "Unknown" }

        $obj = [PSCustomObject]@{
            "Asset-ID"=$AssetId
            "Gerätename"=$Hostname
            Name=$Name.Trim()
            DisplayName=$displayName
            Version=$Version
            Hersteller=$Publisher
            Quelle=$Source
            Pakettyp=$PackageType
            PaketId=$PaketId
            InstallDatum=$InstallDate
            Installationsort=$InstallLocation
            Architektur=$Architecture
            BenutzerKontext=$Scope
            Publisher=$Publisher
            InstallDate=$InstallDate
            InstallLocation=$InstallLocation
            Source=$Source
            Sources=$Source
            Scope=$Scope
            Architecture=$Architecture
            UserSID=$UserSID
            PackageType=$PackageType
            DetectionConfidence=$DetectionConfidence
            RawSourceKey=$RawSourceKey
            RawPath=$RawPath
            RawNames=$Name.Trim()
            RawEntryCount="1"
            ScanStatus=$ScanStatus
            ScanMode=$ScannerContext.ScanMode
            UpdateStatus="NotChecked"
            UpdateAvailable="False"
            InstalledVersion=$Version
            LatestVersion=""
            UpdateSource=""
            UpdateRaw=""
            UpdateCheckedAt=""
        }
        $seen[$key] = $obj
        [void]$items.Add($obj)
    }

    function Add-SoftwareUpdateCandidate {
        param(
            [string]$Name,
            [string]$CurrentVersion="",
            [string]$AvailableVersion="",
            [string]$Source="",
            [string]$PackageId="",
            [string]$Raw=""
        )
        if([string]::IsNullOrWhiteSpace($Name)){ return }
        $displayName = Get-SoftwareDisplayName -Name $Name
        $candidate = [PSCustomObject]@{
            Name = $Name.Trim()
            DisplayName = $displayName
            CurrentVersion = $CurrentVersion
            AvailableVersion = $AvailableVersion
            Source = $Source
            PackageId = $PackageId
            Raw = $Raw
            CheckedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        }
        $nameKey = Normalize-UpdateKey $displayName
        if($nameKey){ $UpdateCandidatesByName[$nameKey] = $candidate }
        $rawNameKey = Normalize-UpdateKey $Name
        if($rawNameKey){ $UpdateCandidatesByName[$rawNameKey] = $candidate }
        $idKey = Normalize-UpdateKey $PackageId
        if($idKey){ $UpdateCandidatesById[$idKey] = $candidate }
    }

    function Apply-SoftwareUpdateInfo {
        foreach($item in @($items)){
            $candidate = $null
            foreach($keyValue in @($item.DisplayName,$item.Name,$item.PaketId)){
                $nameKey = Normalize-UpdateKey ([string]$keyValue)
                if($nameKey -and $UpdateCandidatesByName.ContainsKey($nameKey)){ $candidate = $UpdateCandidatesByName[$nameKey]; break }
                if($nameKey -and $UpdateCandidatesById.ContainsKey($nameKey)){ $candidate = $UpdateCandidatesById[$nameKey]; break }
            }
            if($candidate){
                $item.UpdateStatus = "UpdateAvailable"
                $item.UpdateAvailable = "True"
                $item.InstalledVersion = if($candidate.CurrentVersion){$candidate.CurrentVersion}else{$item.Version}
                $item.LatestVersion = $candidate.AvailableVersion
                $item.UpdateSource = $candidate.Source
                $item.UpdateRaw = $candidate.Raw
                $item.UpdateCheckedAt = $candidate.CheckedAt
            }elseif($item.UpdateStatus -eq "NotChecked"){
                $item.UpdateStatus = "NoUpdateKnown"
                $item.UpdateAvailable = "False"
            }
        }
    }

    function Invoke-ExternalTool {
        param([string]$Command,[string[]]$Arguments=@(),[int]$TimeoutSeconds=45)
        $cmd = Get-Command $Command -ErrorAction SilentlyContinue
        if(-not $cmd){ return $null }
        $stdout = Join-Path $env:TEMP ("itv_stdout_{0}.txt" -f ([guid]::NewGuid().ToString("N")))
        $stderr = Join-Path $env:TEMP ("itv_stderr_{0}.txt" -f ([guid]::NewGuid().ToString("N")))
        $result = [PSCustomObject]@{ ExitCode=$null; Output=""; Error=""; TimedOut=$false }
        function Start-ToolProcess {
            param([string]$FilePath,[string[]]$ArgumentList)
            $process = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -NoNewWindow -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr -ErrorAction Stop
            if(-not $process.WaitForExit($TimeoutSeconds * 1000)){
                $result.TimedOut = $true
                try { $process.Kill() } catch {}
            }else{
                $result.ExitCode = $process.ExitCode
            }
        }
        try {
            Start-ToolProcess -FilePath $cmd.Source -ArgumentList $Arguments
            if(Test-Path $stdout){ $result.Output = Get-Content -Path $stdout -Raw -Encoding UTF8 -ErrorAction SilentlyContinue }
            if(Test-Path $stderr){ $result.Error = Get-Content -Path $stderr -Raw -Encoding UTF8 -ErrorAction SilentlyContinue }
        } catch {
            try {
                Clear-Content -Path $stdout,$stderr -ErrorAction SilentlyContinue
                $quotedCommand = '"' + $Command.Replace('"','\"') + '"'
                $commandLine = ($quotedCommand + " " + ($Arguments -join " ")).Trim()
                Start-ToolProcess -FilePath "cmd.exe" -ArgumentList @("/d","/c",$commandLine)
                if(Test-Path $stdout){ $result.Output = Get-Content -Path $stdout -Raw -Encoding UTF8 -ErrorAction SilentlyContinue }
                if(Test-Path $stderr){ $result.Error = Get-Content -Path $stderr -Raw -Encoding UTF8 -ErrorAction SilentlyContinue }
            } catch {
                $result.Error = $_.Exception.Message
            }
        } finally {
            Remove-Item -Path $stdout,$stderr -Force -ErrorAction SilentlyContinue
        }
        return $result
    }

    function Add-RegistrySoftware {
        param([string]$Path,[string]$StatusName,[string]$Scope,[string]$Architecture,[string]$UserSID="")
        try {
            $count = 0
            Get-ItemProperty $Path -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | ForEach-Object {
                $count++
                Add-SoftwareItem -Name ([string]$_.DisplayName) -Version ([string]$_.DisplayVersion) -Publisher ([string]$_.Publisher) -Source $StatusName -PackageType "Registry" -PaketId ([string]$_.PSChildName) -InstallDate ([string]$_.InstallDate) -InstallLocation ([string]$_.InstallLocation) -Architecture $Architecture -Scope $Scope -UserSID $UserSID -DetectionConfidence "High" -RawSourceKey ([string]$_.PSPath) -RawPath ([string]$_.InstallLocation) -ScanStatus "OK"
            }
            Set-SoftwareSourceStatus $StatusName "OK" "$count Einträge"
        } catch {
            Set-SoftwareSourceStatus $StatusName "WARN" $_.Exception.Message
        }
    }

    function Add-AppxSoftware {
        param([switch]$AllUsers)
        $statusName = if($AllUsers){"AppxAllUsers"}else{"AppxCurrentUser"}
        if(-not (Get-Command Get-AppxPackage -ErrorAction SilentlyContinue)){
            Set-SoftwareSourceStatus $statusName "SKIPPED_NOT_AVAILABLE" "Get-AppxPackage nicht verfügbar"
            return
        }
        if($AllUsers -and -not ($ScannerContext.IsAdmin -or $ScannerContext.IsSystem)){
            Set-SoftwareSourceStatus $statusName "SKIPPED_NOT_ADMIN" "AllUsers benötigt erhöhte Rechte"
            return
        }
        try {
            $packages = if($AllUsers){ @(Get-AppxPackage -AllUsers -ErrorAction Stop) }else{ @(Get-AppxPackage -ErrorAction Stop) }
            foreach($pkg in $packages){
                $scopeValue = if($AllUsers){"AllUsers"}else{"User"}
                Add-SoftwareItem -Name ([string]$pkg.Name) -Version ([string]$pkg.Version) -Publisher ([string]$pkg.Publisher) -Source $statusName -PackageType "Appx/MSIX" -PaketId ([string]$pkg.PackageFullName) -InstallLocation ([string]$pkg.InstallLocation) -Architecture ([string]$pkg.Architecture) -Scope $scopeValue -DetectionConfidence "High" -RawSourceKey ([string]$pkg.PackageFamilyName) -RawPath ([string]$pkg.InstallLocation) -ScanStatus "OK"
            }
            Set-SoftwareSourceStatus $statusName "OK" "$($packages.Count) Einträge"
        } catch {
            Set-SoftwareSourceStatus $statusName "WARN" $_.Exception.Message
        }
    }

    function Add-WingetSoftware {
        if(-not (Get-Command winget.exe -ErrorAction SilentlyContinue)){
            Set-SoftwareSourceStatus "Winget" "SKIPPED_NOT_FOUND" "winget.exe nicht gefunden"
            return
        }
        $result = Invoke-ExternalTool -Command "winget.exe" -Arguments @("list","--accept-source-agreements","--disable-interactivity") -TimeoutSeconds 90
        if($result.TimedOut){ Set-SoftwareSourceStatus "Winget" "WARN_TIMEOUT" "winget list überschritt das Zeitlimit"; return }
        if($result.ExitCode -ne 0 -and [string]::IsNullOrWhiteSpace($result.Output)){ Set-SoftwareSourceStatus "Winget" "WARN" $result.Error; return }
        $count = 0
        foreach($line in @($result.Output -split "`r?`n")){
            $trim = $line.Trim()
            if(-not $trim -or $trim -match "^-{3,}" -or $trim -match "^(Name|Name\s+)"){ continue }
            $parts = @($trim -split "\s{2,}" | Where-Object { $_ })
            if($parts.Count -ge 2){
                $name = $parts[0]
                $id = if($parts.Count -ge 3){$parts[1]}else{""}
                $version = if($parts.Count -ge 3){$parts[2]}else{$parts[1]}
                if($version -match "([0-9]+(?:\.[0-9A-Za-z-]+)+)\s*$"){ $version = $Matches[1] }
                if($name -eq "-" -or $name -match "^[\\|]+$"){ continue }
                Add-SoftwareItem -Name $name -Version $version -Source "Winget" -PackageType "Winget" -PaketId $id -Scope "Machine/User" -DetectionConfidence "Medium" -ScanStatus "OK"
                $count++
            }
        }
        $status = if($count -gt 0){"OK"}else{"WARN_EMPTY"}
        Set-SoftwareSourceStatus "Winget" $status "$count Einträge"
    }

    function Add-ChocoSoftware {
        if(-not (Get-Command choco.exe -ErrorAction SilentlyContinue)){
            Set-SoftwareSourceStatus "Choco" "SKIPPED_NOT_FOUND" "choco.exe nicht gefunden"
            return
        }
        $result = Invoke-ExternalTool -Command "choco.exe" -Arguments @("list","--limit-output") -TimeoutSeconds 60
        if($result.TimedOut){ Set-SoftwareSourceStatus "Choco" "WARN_TIMEOUT" "choco list überschritt das Zeitlimit"; return }
        $count = 0
        foreach($line in @($result.Output -split "`r?`n")){
            if($line -match "^([^|]+)\|(.+)$"){
                Add-SoftwareItem -Name $Matches[1] -Version $Matches[2] -Source "Choco" -PackageType "Choco" -Scope "Machine" -DetectionConfidence "Medium" -ScanStatus "OK"
                $count++
            }
        }
        $status = if($count -gt 0){"OK"}else{"WARN_EMPTY"}
        Set-SoftwareSourceStatus "Choco" $status "$count Einträge"
    }

    function Add-ScoopSoftware {
        $command = if(Get-Command scoop.cmd -ErrorAction SilentlyContinue){"scoop.cmd"}elseif(Get-Command scoop -ErrorAction SilentlyContinue){"scoop"}else{""}
        if(-not $command){ Set-SoftwareSourceStatus "Scoop" "SKIPPED_NOT_FOUND" "scoop nicht gefunden"; return }
        $result = Invoke-ExternalTool -Command $command -Arguments @("list") -TimeoutSeconds 60
        if($result.TimedOut){ Set-SoftwareSourceStatus "Scoop" "WARN_TIMEOUT" "scoop list überschritt das Zeitlimit"; return }
        $count = 0
        foreach($line in @($result.Output -split "`r?`n")){
            $trim = $line.Trim()
            if(-not $trim -or $trim -match "^Installed apps|^-+|Name\s+Version"){ continue }
            $parts = @($trim -split "\s+" | Where-Object { $_ })
            if($parts.Count -ge 2){
                Add-SoftwareItem -Name $parts[0] -Version $parts[1] -Source "Scoop" -PackageType "Scoop" -Scope "User" -DetectionConfidence "Medium" -ScanStatus "OK"
                $count++
            }
        }
        $status = if($count -gt 0){"OK"}else{"WARN_EMPTY"}
        Set-SoftwareSourceStatus "Scoop" $status "$count Einträge"
    }

    function Add-PythonSoftware {
        if(Get-Command python.exe -ErrorAction SilentlyContinue){
            $result = Invoke-ExternalTool -Command "python.exe" -Arguments @("-m","pip","list","--format=json") -TimeoutSeconds 60
            if($result -and -not $result.TimedOut -and $result.Output){
                try {
                    $packages = @($result.Output | ConvertFrom-Json)
                    foreach($pkg in $packages){ Add-SoftwareItem -Name ([string]$pkg.name) -Version ([string]$pkg.version) -Source "Pip" -PackageType "Pip" -Scope "User/Machine" -DetectionConfidence "Medium" -ScanStatus "OK" }
                    Set-SoftwareSourceStatus "Pip" "OK" "$($packages.Count) Einträge"
                } catch { Set-SoftwareSourceStatus "Pip" "WARN" $_.Exception.Message }
            }else{ Set-SoftwareSourceStatus "Pip" "WARN" "pip list lieferte keine auswertbare Ausgabe" }
        }else{ Set-SoftwareSourceStatus "Pip" "SKIPPED_NOT_FOUND" "python.exe nicht gefunden" }

        if(Get-Command pipx.exe -ErrorAction SilentlyContinue){
            $result = Invoke-ExternalTool -Command "pipx.exe" -Arguments @("list","--json") -TimeoutSeconds 60
            if($result -and -not $result.TimedOut -and $result.Output){
                try {
                    $json = $result.Output | ConvertFrom-Json
                    $count = 0
                    foreach($prop in @($json.venvs.PSObject.Properties)){
                        Add-SoftwareItem -Name ([string]$prop.Name) -Version ([string]$prop.Value.metadata.main_package.package_version) -Source "Pipx" -PackageType "Pip" -Scope "User" -DetectionConfidence "Medium" -ScanStatus "OK"
                        $count++
                    }
                    Set-SoftwareSourceStatus "Pipx" "OK" "$count Einträge"
                } catch { Set-SoftwareSourceStatus "Pipx" "WARN" $_.Exception.Message }
            }else{ Set-SoftwareSourceStatus "Pipx" "WARN" "pipx list lieferte keine auswertbare Ausgabe" }
        }else{ Set-SoftwareSourceStatus "Pipx" "SKIPPED_NOT_FOUND" "pipx.exe nicht gefunden" }
    }

    function Add-NodeSoftware {
        $command = if(Get-Command npm.cmd -ErrorAction SilentlyContinue){"npm.cmd"}elseif(Get-Command npm -ErrorAction SilentlyContinue){"npm"}else{""}
        if(-not $command){ Set-SoftwareSourceStatus "Npm" "SKIPPED_NOT_FOUND" "npm nicht gefunden"; return }
        $result = Invoke-ExternalTool -Command $command -Arguments @("list","-g","--depth=0","--json") -TimeoutSeconds 60
        if($result.TimedOut){ Set-SoftwareSourceStatus "Npm" "WARN_TIMEOUT" "npm list überschritt das Zeitlimit"; return }
        try {
            $json = $result.Output | ConvertFrom-Json
            $count = 0
            foreach($prop in @($json.dependencies.PSObject.Properties)){
                Add-SoftwareItem -Name ([string]$prop.Name) -Version ([string]$prop.Value.version) -Source "Npm" -PackageType "Npm" -Scope "Global" -DetectionConfidence "Medium" -RawPath ([string]$prop.Value.path) -ScanStatus "OK"
                $count++
            }
            Set-SoftwareSourceStatus "Npm" "OK" "$count Einträge"
        } catch { Set-SoftwareSourceStatus "Npm" "WARN" $_.Exception.Message }
    }

    function Add-WingetUpgradeInfo {
        if(-not (Get-Command winget.exe -ErrorAction SilentlyContinue)){
            Set-SoftwareSourceStatus "WingetUpgrade" "SKIPPED_NOT_FOUND" "winget.exe nicht gefunden"
            return
        }
        $result = Invoke-ExternalTool -Command "winget.exe" -Arguments @("upgrade","--accept-source-agreements","--disable-interactivity") -TimeoutSeconds 90
        if($result.TimedOut){ Set-SoftwareSourceStatus "WingetUpgrade" "WARN_TIMEOUT" "winget upgrade überschritt das Zeitlimit"; return }
        if($result.ExitCode -ne 0 -and [string]::IsNullOrWhiteSpace($result.Output)){ Set-SoftwareSourceStatus "WingetUpgrade" "WARN" $result.Error; return }
        $count = 0
        foreach($line in @($result.Output -split "`r?`n")){
            $trim = $line.Trim()
            if(-not $trim -or $trim -match "^-{3,}" -or $trim -match "^(Name|No installed package|Keine installierten|The following packages|Die folgenden Pakete)"){ continue }
            $parts = @($trim -split "\s{2,}" | Where-Object { $_ })
            if($parts.Count -ge 4){
                Add-SoftwareUpdateCandidate -Name $parts[0] -PackageId $parts[1] -CurrentVersion $parts[2] -AvailableVersion $parts[3] -Source "WingetUpgrade" -Raw $trim
                $count++
            }
        }
        $status = if($count -gt 0){"OK"}else{"OK_EMPTY"}
        Set-SoftwareSourceStatus "WingetUpgrade" $status "$count Updates"
    }

    function Add-ChocoOutdatedInfo {
        if(-not (Get-Command choco.exe -ErrorAction SilentlyContinue)){
            Set-SoftwareSourceStatus "ChocoOutdated" "SKIPPED_NOT_FOUND" "choco.exe nicht gefunden"
            return
        }
        $result = Invoke-ExternalTool -Command "choco.exe" -Arguments @("outdated","--limit-output") -TimeoutSeconds 60
        if($result.TimedOut){ Set-SoftwareSourceStatus "ChocoOutdated" "WARN_TIMEOUT" "choco outdated überschritt das Zeitlimit"; return }
        $count = 0
        foreach($line in @($result.Output -split "`r?`n")){
            $trim = $line.Trim()
            if($trim -match "^([^|]+)\|([^|]*)\|([^|]+)"){
                Add-SoftwareUpdateCandidate -Name $Matches[1] -PackageId $Matches[1] -CurrentVersion $Matches[2] -AvailableVersion $Matches[3] -Source "ChocoOutdated" -Raw $trim
                $count++
            }
        }
        $status = if($count -gt 0){"OK"}else{"OK_EMPTY"}
        Set-SoftwareSourceStatus "ChocoOutdated" $status "$count Updates"
    }

    function Add-PipOutdatedInfo {
        if(-not (Get-Command python.exe -ErrorAction SilentlyContinue)){
            Set-SoftwareSourceStatus "PipOutdated" "SKIPPED_NOT_FOUND" "python.exe nicht gefunden"
            return
        }
        $result = Invoke-ExternalTool -Command "python.exe" -Arguments @("-m","pip","list","--outdated","--format=json") -TimeoutSeconds 60
        if($result.TimedOut){ Set-SoftwareSourceStatus "PipOutdated" "WARN_TIMEOUT" "pip outdated überschritt das Zeitlimit"; return }
        if(-not $result.Output){ Set-SoftwareSourceStatus "PipOutdated" "OK_EMPTY" "0 Updates"; return }
        try {
            $packages = @($result.Output | ConvertFrom-Json)
            foreach($pkg in $packages){
                Add-SoftwareUpdateCandidate -Name ([string]$pkg.name) -CurrentVersion ([string]$pkg.version) -AvailableVersion ([string]$pkg.latest_version) -Source "PipOutdated" -Raw ($pkg | ConvertTo-Json -Compress)
            }
            Set-SoftwareSourceStatus "PipOutdated" "OK" "$($packages.Count) Updates"
        } catch {
            Set-SoftwareSourceStatus "PipOutdated" "WARN" $_.Exception.Message
        }
    }

    function Add-NpmOutdatedInfo {
        $command = if(Get-Command npm.cmd -ErrorAction SilentlyContinue){"npm.cmd"}elseif(Get-Command npm -ErrorAction SilentlyContinue){"npm"}else{""}
        if(-not $command){ Set-SoftwareSourceStatus "NpmOutdated" "SKIPPED_NOT_FOUND" "npm nicht gefunden"; return }
        $result = Invoke-ExternalTool -Command $command -Arguments @("outdated","-g","--json") -TimeoutSeconds 60
        if($result.TimedOut){ Set-SoftwareSourceStatus "NpmOutdated" "WARN_TIMEOUT" "npm outdated überschritt das Zeitlimit"; return }
        if(-not $result.Output){ Set-SoftwareSourceStatus "NpmOutdated" "OK_EMPTY" "0 Updates"; return }
        try {
            $json = $result.Output | ConvertFrom-Json
            $count = 0
            foreach($prop in @($json.PSObject.Properties)){
                Add-SoftwareUpdateCandidate -Name ([string]$prop.Name) -CurrentVersion ([string]$prop.Value.current) -AvailableVersion ([string]$prop.Value.latest) -Source "NpmOutdated" -Raw ($prop.Value | ConvertTo-Json -Compress)
                $count++
            }
            Set-SoftwareSourceStatus "NpmOutdated" "OK" "$count Updates"
        } catch {
            Set-SoftwareSourceStatus "NpmOutdated" "WARN" $_.Exception.Message
        }
    }

    function Add-PortableSoftware {
        $knownExe = @("firefox.exe","chrome.exe","msedge.exe","code.exe","notepad++.exe","7zfm.exe","putty.exe","winscp.exe","filezilla.exe","thunderbird.exe","soffice.exe","acrord32.exe","acrobat.exe","teams.exe","zoom.exe","vlc.exe","keepass.exe","keepassxc.exe")
        $roots = @("C:\Program Files","C:\Program Files (x86)","C:\ProgramData",(Join-Path $env:LOCALAPPDATA "Programs"),$env:LOCALAPPDATA,$env:APPDATA,([Environment]::GetFolderPath("Desktop"))) | Where-Object { $_ -and (Test-Path $_) }
        $script:PortableFileCount = 0
        $script:PortableHitCount = 0
        $script:PortableWarnCount = 0
        $maxDepth = 2
        $maxFiles = 800
        function Scan-PortablePath {
            param([string]$Root,[int]$Depth)
            if($script:PortableFileCount -ge $maxFiles){ return }
            try {
                foreach($file in @(Get-ChildItem -LiteralPath $Root -File -Filter "*.exe" -ErrorAction Stop)){
                    if($script:PortableFileCount -ge $maxFiles){ return }
                    $script:PortableFileCount++
                    if($knownExe -contains $file.Name.ToLowerInvariant()){
                        Add-SoftwareItem -Name $file.BaseName -Source "PortableScan" -PackageType "Portable" -Scope "Portable" -Architecture "Unknown" -DetectionConfidence "Low" -RawPath $file.FullName -InstallLocation $file.DirectoryName -ScanStatus "OK_LIMITED"
                        $script:PortableHitCount++
                    }
                }
                if($Depth -lt $maxDepth){
                    foreach($dir in @(Get-ChildItem -LiteralPath $Root -Directory -ErrorAction Stop)){
                        if($dir.Name -match "^(Windows|WinSxS|System32|SysWOW64|Temp|Cache|Caches|node_modules|\.git)$"){ continue }
                        Scan-PortablePath -Root $dir.FullName -Depth ($Depth + 1)
                    }
                }
            } catch { $script:PortableWarnCount++ }
        }
        foreach($root in @($roots)){ Scan-PortablePath -Root $root -Depth 0 }
        Set-SoftwareSourceStatus "PortableScan" "OK_LIMITED" "$script:PortableHitCount Treffer, $script:PortableFileCount EXE geprüft, $script:PortableWarnCount Warnungen"
    }

    function Add-ServiceSoftware {
        if(-not ($ScannerContext.IsAdmin -or $ScannerContext.IsSystem)){ Set-SoftwareSourceStatus "Services" "SKIPPED_NOT_ADMIN" "Dienstpfade werden nur erhöht erfasst"; return }
        try {
            $services = @(Get-CimInstance -ClassName Win32_Service -ErrorAction Stop)
            foreach($svc in $services){ Add-SoftwareItem -Name ([string]$svc.DisplayName) -Source "Services" -PackageType "Service" -Scope "System" -DetectionConfidence "Low" -RawPath ([string]$svc.PathName) -ScanStatus "OK" }
            Set-SoftwareSourceStatus "Services" "OK" "$($services.Count) Dienste"
        } catch { Set-SoftwareSourceStatus "Services" "WARN" $_.Exception.Message }
    }

    function Add-DriverSoftware {
        if(-not ($ScannerContext.IsAdmin -or $ScannerContext.IsSystem)){ Set-SoftwareSourceStatus "Drivers" "SKIPPED_NOT_ADMIN" "Treiberinventur wird nur erhöht erfasst"; return }
        if(-not (Get-Command pnputil.exe -ErrorAction SilentlyContinue)){ Set-SoftwareSourceStatus "Drivers" "SKIPPED_NOT_FOUND" "pnputil.exe nicht gefunden"; return }
        $result = Invoke-ExternalTool -Command "pnputil.exe" -Arguments @("/enum-drivers") -TimeoutSeconds 90
        if($result.TimedOut){ Set-SoftwareSourceStatus "Drivers" "WARN_TIMEOUT" "pnputil überschritt das Zeitlimit"; return }
        try {
            $current = @{}
            $count = 0
            foreach($line in @($result.Output -split "`r?`n")){
                if($line -match "^\s*$"){
                    if($current.Count -gt 0){
                        $name = if($current["Original Name"]){$current["Original Name"]}elseif($current["Published Name"]){$current["Published Name"]}else{"DriverSoftware"}
                        Add-SoftwareItem -Name $name -Version ([string]$current["Driver Version"]) -Publisher ([string]$current["Provider Name"]) -Source "Drivers" -PackageType "Driver" -PaketId ([string]$current["Published Name"]) -Scope "System" -DetectionConfidence "Medium" -ScanStatus "OK"
                        $count++
                        $current = @{}
                    }
                }elseif($line -match "^\s*([^:]+):\s*(.+)$"){
                    $current[$Matches[1].Trim()] = $Matches[2].Trim()
                }
            }
            if($current.Count -gt 0){
                $name = if($current["Original Name"]){$current["Original Name"]}elseif($current["Published Name"]){$current["Published Name"]}else{"DriverSoftware"}
                Add-SoftwareItem -Name $name -Version ([string]$current["Driver Version"]) -Publisher ([string]$current["Provider Name"]) -Source "Drivers" -PackageType "Driver" -PaketId ([string]$current["Published Name"]) -Scope "System" -DetectionConfidence "Medium" -ScanStatus "OK"
                $count++
            }
            Set-SoftwareSourceStatus "Drivers" "OK" "$count Treiber"
        } catch { Set-SoftwareSourceStatus "Drivers" "WARN" $_.Exception.Message }
    }

    Add-RegistrySoftware -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -StatusName "RegistryHKLM64" -Scope "Machine" -Architecture "x64"
    Add-RegistrySoftware -Path "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -StatusName "RegistryHKLM32" -Scope "Machine" -Architecture "x86"
    Add-RegistrySoftware -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -StatusName "RegistryHKCU" -Scope "User" -Architecture "Unknown" -UserSID $ScannerContext.UserSID

    if($Deep){
        $sidCount = 0
        try {
            $userKeys = @(Get-ChildItem -Path "Registry::HKEY_USERS" -ErrorAction Stop | Where-Object { $_.PSChildName -notmatch "_Classes$" -and $_.PSChildName -match "^S-\d-\d+-.+" })
            foreach($userKey in $userKeys){
                $sid = [string]$userKey.PSChildName
                Add-RegistrySoftware -Path "Registry::HKEY_USERS\$sid\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -StatusName "HKEY_USERS_$sid" -Scope "User" -Architecture "Unknown" -UserSID $sid
                Add-RegistrySoftware -Path "Registry::HKEY_USERS\$sid\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -StatusName "HKEY_USERS_${sid}_WOW6432" -Scope "User" -Architecture "x86" -UserSID $sid
                $sidCount++
            }
            $status = if($sidCount -gt 0){"OK"}else{"WARN_EMPTY"}
            Set-SoftwareSourceStatus "HKEY_USERS" $status "$sidCount geladene Benutzer-SIDs geprüft"
        } catch { Set-SoftwareSourceStatus "HKEY_USERS" "WARN" $_.Exception.Message }

        Add-AppxSoftware
        Add-AppxSoftware -AllUsers
        Add-WingetSoftware
        Add-ChocoSoftware
        Add-ScoopSoftware
        Add-PythonSoftware
        Add-NodeSoftware
        Add-PortableSoftware
        Add-ServiceSoftware
        Add-DriverSoftware
        Add-WingetUpgradeInfo
        Add-ChocoOutdatedInfo
        Add-PipOutdatedInfo
        Add-NpmOutdatedInfo
        Apply-SoftwareUpdateInfo
    }else{
        foreach($source in @("HKEY_USERS","AppxCurrentUser","AppxAllUsers","Winget","Choco","Scoop","Pip","Pipx","Npm","PortableScan","Services","Drivers","WingetUpgrade","ChocoOutdated","PipOutdated","NpmOutdated")){
            Set-SoftwareSourceStatus $source "SKIPPED_STANDARD_MODE" "nur im Full-Software-Scan aktiv"
        }
    }

    return @($items.ToArray() | Sort-Object Name,Version,Hersteller,Quelle)
}

if($IncludeSoftware){
    $Installed = @(Get-InstalledSoftwareList -Deep:$FullSoftwareScan)
    if($FullSoftwareScan){
        Export-CsvSafe $SoftwareFullCsv $Installed $SoftwareFullColumns | Out-Null
        try {
            $jsonPayload = [PSCustomObject]@{
                ScannerContext = $ScannerContext
                Asset = [PSCustomObject]@{
                    "Asset-ID" = $AssetId
                    "Gerätename" = $Hostname
                }
                SoftwareSourcesStatus = $SoftwareSourcesStatus
                Software = $Installed
            }
            $jsonPayload | ConvertTo-Json -Depth 8 | Set-Content -Path $SoftwareFullJson -Encoding UTF8
            Write-ScannerLog -Level "INFO" -Message "JSON geschrieben: $SoftwareFullJson ($($Installed.Count) Softwareeinträge)"
        } catch {
            Write-ScannerLog -Level "WARN" -Message "JSON Schreiben fehlgeschlagen: $SoftwareFullJson / $($_.Exception.Message)"
        }
    }

    $CanWriteSoftwareTable = $IncludeHardware -or $ExistingAsset
    if(-not $CanWriteSoftwareTable){
        Write-Log "Software-Tabelle wird nicht aktualisiert, weil kein bestehendes Asset fuer ${Hostname} gefunden wurde. Erst Hardware-Scan ausfuehren oder Asset anlegen." "WARN"
    }

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
    if($CanWriteSoftwareTable){
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
}

if($IncludeHardware){
    Export-CsvSafe $AssetsCsv $Assets $AssetColumns | Out-Null
    Export-CsvSafe $HardwareCsv $Hardware $HardwareColumns | Out-Null
    Export-CsvSafe $NetzwerkCsv $Netzwerk $NetzwerkColumns | Out-Null
}
if($IncludeSoftware -and ($IncludeHardware -or $ExistingAsset)){
    Export-CsvSafe $SoftwareCsv $Software $SoftwareColumns | Out-Null
}

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
if($IncludeHardware -and $IncludeSoftware){ $RunLabel = "Hardware- und Software-Scan" }
elseif($IncludeHardware){ $RunLabel = "Hardware-Scan" }
elseif($IncludeSoftware){ $RunLabel = "Software-Scan" }
else{ $RunLabel = "Scannerlauf ohne Schreibmodus" }
Write-Host "$RunLabel abgeschlossen." -ForegroundColor Green
if($IncludeHardware -or $ExistingAsset){ Write-Host "Asset-ID:   $AssetId" }
else{ Write-Host "Asset-ID:   nicht zugeordnet - Hardware-Scan zuerst ausführen oder Asset anlegen" -ForegroundColor Yellow }
Write-Host "Gerät:      $Hostname"
Write-Host "CSV Ordner: $DataDir"
Write-Host "Backup:     $BackupDir"
Write-Host "Log:        $LogFile"
if($FullSoftwareScan){
    Write-Host "Software:   $SoftwareFullCsv"
    Write-Host "Software JSON: $SoftwareFullJson"
}
Write-Host ""
if($ValidationErrors.Count -gt 0){ Write-Host "Validierung: FEHLER - bitte Log prüfen." -ForegroundColor Red } else { Write-Host "Validierung: OK" -ForegroundColor Green }
if($CimFailures.Count -gt 0){
    Write-Host "CIM/WMI:    EINGESCHRAENKT ($($CimFailures.Count) Fehler) - siehe Log." -ForegroundColor Yellow
}else{
    Write-Host "CIM/WMI:    OK" -ForegroundColor Green
}
Write-Host ""
Write-Host "Starte danach start.bat neu oder lade die Seite neu." -ForegroundColor Yellow
