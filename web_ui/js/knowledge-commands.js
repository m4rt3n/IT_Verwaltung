// Knowledge command suggestions and command rendering.

function renderKnowledgeCommands(row){
  const commands = knowledgeCommandSuggestions(row);
  if(!commands.length) return '';
  const topic = knowledgeCommandTopic(row);
  return `<div class="knowledge-commands mt-4">
    <div class="knowledge-section-title">Nützliche Befehle zur Prüfung <span class="badge text-bg-secondary">${safeEscape(topic.label)}</span></div>
    <div class="alert alert-warning py-2">Befehle zuerst prüfen. Manche Abfragen benötigen PowerShell als Administrator.</div>
    ${commands.map(renderKnowledgeCommand).join('')}
  </div>`;
}

function renderKnowledgeCommand(item){
  const encoded = encodeURIComponent(item.command);
  return `<div class="knowledge-command">
    <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
      <div>
        <b>${safeEscape(item.title)}</b>
        <div class="text-muted small">${safeEscape(item.shell)} · ${safeEscape(item.note || '')}</div>
      </div>
      <button class="btn btn-sm btn-outline-primary" onclick="copyCommand(decodeURIComponent('${encoded}'))">Kopieren</button>
    </div>
    <pre><code>${safeEscape(item.command)}</code></pre>
  </div>`;
}

function knowledgeCommandSuggestions(row){
  const profile = knowledgeCommandProfile(row);
  return profile ? profile.commands : [];
}

function knowledgeCommandTopic(row){
  const profile = knowledgeCommandProfile(row);
  return profile ? {kind:profile.kind, label:profile.label} : {kind:'none', label:'Keine Befehle'};
}

function normalizeKnowledgeTitle(row){
  return String(row.Titel || '')
    .replace(/^AS-\d+\s*-\s*/i, '')
    .replace(/\s*\(Variante\s*\d+\)\s*$/i, '')
    .trim()
    .toLowerCase();
}

function knowledgeCommandProfile(row){
  const title = normalizeKnowledgeTitle(row);
  return knowledgeCommandProfiles().find(profile => profile.match.test(title)) || null;
}

function command(title, shell, commandText, note=''){
  return {title, shell, command:commandText, note};
}

function knowledgeCommandProfiles(){
  return [
    {
      match:/^lan-verbindung fehlt$/,
      kind:'network',
      label:'Netzwerk/LAN',
      commands:[
        command('IP-Konfiguration vollständig anzeigen','CMD','ipconfig /all','Adapter, DHCP, DNS und Gateway prüfen.'),
        command('Aktive Netzwerkadapter anzeigen','PowerShell','Get-NetAdapter | Sort-Object Status, Name | Format-Table Name, Status, LinkSpeed, MacAddress -AutoSize','Linkstatus und MAC vergleichen.'),
        command('IP-Konfiguration strukturiert prüfen','PowerShell','Get-NetIPConfiguration','IP, DNS und Gateway je Adapter.'),
        command('Gateway erreichbar prüfen','PowerShell','Test-NetConnection -ComputerName 10.81.20.1','Gateway-IP bei Bedarf ersetzen.')
      ]
    },
    {
      match:/bios\/uefi-grundkonfiguration prüfen/,
      kind:'hardware',
      label:'Hardware/BIOS',
      commands:[
        command('BIOS-Version und Seriennummer prüfen','PowerShell','Get-CimInstance Win32_BIOS | Select-Object SMBIOSBIOSVersion, Manufacturer, ReleaseDate, SerialNumber','BIOS-Stand dokumentieren.'),
        command('Firmware-/BIOS-Eigenschaften anzeigen','PowerShell','Get-ComputerInfo -Property "*bios*","*firmware*"','Windows PowerShell 5.1+.'),
        command('Secure-Boot Status prüfen','PowerShell','Confirm-SecureBootUEFI','Nur UEFI-Systeme, ggf. Adminrechte.'),
        command('Boot-Konfiguration anzeigen','CMD','bcdedit /enum','Nur anzeigen, nicht ändern.')
      ]
    },
    {
      match:/tpm-status unter windows 11 prüfen/,
      kind:'security',
      label:'TPM/BitLocker',
      commands:[
        command('TPM Status prüfen','PowerShell','Get-Tpm','TPM bereit, aktiviert und initialisiert?'),
        command('BitLocker Volume-Status prüfen','PowerShell','Get-BitLockerVolume C: | Format-List','Schutzstatus und Verschlüsselung prüfen.'),
        command('BitLocker Status per CMD prüfen','CMD','manage-bde -status C:','CMD-kompatible Gegenprüfung.'),
        command('TPM-Ereignisse prüfen','PowerShell','Get-WinEvent -LogName System -MaxEvents 80 | Where-Object ProviderName -match "TPM|TBS" | Select-Object TimeCreated, ProviderName, LevelDisplayName, Message','Nur relevante Systemereignisse.')
      ]
    },
    {
      match:/secure boot kontrollieren/,
      kind:'security',
      label:'Secure Boot',
      commands:[
        command('Secure-Boot Status prüfen','PowerShell','Confirm-SecureBootUEFI','Kernabfrage für Secure Boot.'),
        command('Firmwaretyp anzeigen','PowerShell','Get-ComputerInfo -Property BiosFirmwareType, BiosSMBIOSBIOSVersion','UEFI/BIOS-Kontext prüfen.'),
        command('Boot-Konfiguration anzeigen','CMD','bcdedit /enum','Bootpfad und Bootmanager nur lesen.'),
        command('BitLocker Status prüfen','PowerShell','Get-BitLockerVolume C: | Select-Object MountPoint, ProtectionStatus, VolumeStatus','Vor BIOS-Änderungen wichtig.')
      ]
    },
    {
      match:/intel i5-6600 leistungsengpässe analysieren/,
      kind:'hardware',
      label:'CPU/Performance',
      commands:[
        command('CPU-Modell und Kerne anzeigen','PowerShell','Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed','Hardwaredaten gegen Inventar prüfen.'),
        command('Aktuelle CPU-Last messen','PowerShell','Get-Counter "\\Processor(_Total)\\% Processor Time"','Momentaufnahme der CPU-Auslastung.'),
        command('CPU-lastige Prozesse anzeigen','PowerShell','Get-Process | Sort-Object CPU -Descending | Select-Object -First 15 Name, Id, CPU, WorkingSet','Auffällige Prozesse erkennen.'),
        command('Energieplan anzeigen','CMD','powercfg /getactivescheme','Leistungsprofil prüfen.')
      ]
    },
    {
      match:/ram-auslastung mit 32 gb prüfen/,
      kind:'hardware',
      label:'RAM',
      commands:[
        command('Installierten und freien RAM anzeigen','PowerShell','Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory','Werte in KB.'),
        command('RAM-Riegel anzeigen','PowerShell','Get-CimInstance Win32_PhysicalMemory | Select-Object BankLabel, Capacity, Speed, Manufacturer, PartNumber','Bestückung prüfen.'),
        command('Speicherintensive Prozesse anzeigen','PowerShell','Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 15 Name, Id, WorkingSet','WorkingSet zeigt aktuelle Speichernutzung.'),
        command('Verfügbaren Speicher messen','PowerShell','Get-Counter "\\Memory\\Available MBytes"','Kurze Live-Abfrage.')
      ]
    },
    {
      match:/ssd- und smart-werte bewerten/,
      kind:'hardware',
      label:'SSD/SMART',
      commands:[
        command('Physische Datenträger anzeigen','PowerShell','Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus, Size','Gesundheitsstatus prüfen.'),
        command('SMART-/Reliability-Werte anzeigen','PowerShell','Get-PhysicalDisk | Get-StorageReliabilityCounter | Format-List','Temperatur, Fehler, Wear soweit verfügbar.'),
        command('Volumes anzeigen','PowerShell','Get-Volume | Select-Object DriveLetter, FileSystemLabel, HealthStatus, SizeRemaining, Size','Freier Speicher und Volume-Status.'),
        command('Datenträgerdetails anzeigen','PowerShell','Get-Disk | Select-Object Number, FriendlyName, HealthStatus, OperationalStatus, PartitionStyle, Size','Datenträgerstatus strukturiert.')
      ]
    },
    {
      match:/fujitsu p24-8 we über displayport prüfen/,
      kind:'hardware',
      label:'Monitor/DisplayPort',
      commands:[
        command('Grafikadapter anzeigen','PowerShell','Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion, VideoModeDescription','Treiber und Auflösung prüfen.'),
        command('Monitor-PnP-Geräte anzeigen','PowerShell','Get-PnpDevice -Class Monitor | Format-Table Status, FriendlyName, InstanceId -AutoSize','Erkannten Monitor prüfen.'),
        command('Display-Diagnose exportieren','CMD','dxdiag /t "%TEMP%\\dxdiag.txt"','Erzeugt Textbericht im TEMP-Ordner.'),
        command('Display-relevante Fehler suchen','PowerShell','Get-WinEvent -LogName System -MaxEvents 80 | Where-Object Message -match "display|monitor|graphics|igfx|driver" | Select-Object TimeCreated, ProviderName, Message','Treiber-/Display-Hinweise.')
      ]
    },
    {
      match:/cmos-batterie und uhrzeit prüfen/,
      kind:'hardware',
      label:'CMOS/Zeit',
      commands:[
        command('Windows-Zeitstatus anzeigen','CMD','w32tm /query /status','Zeitquelle und Offset prüfen.'),
        command('Aktuelle Systemzeit anzeigen','PowerShell','Get-Date','Schnelle Sichtprüfung.'),
        command('BIOS-Datum und Version anzeigen','PowerShell','Get-CimInstance Win32_BIOS | Select-Object SMBIOSBIOSVersion, ReleaseDate, SerialNumber','BIOS-Kontext prüfen.'),
        command('Zeitsynchronisation testen','CMD','w32tm /resync /dryrun','Simulation ohne Änderung.')
      ]
    },
    {
      match:/usb-geräte und sicherheitsrichtlinien prüfen/,
      kind:'security',
      label:'USB/Richtlinien',
      commands:[
        command('USB-Geräte anzeigen','PowerShell','Get-PnpDevice -Class USB | Sort-Object Status, FriendlyName | Format-Table Status, FriendlyName, InstanceId -AutoSize','USB-Erkennung prüfen.'),
        command('USBSTOR-Dienststatus prüfen','PowerShell','Get-ItemProperty HKLM:\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR | Select-Object Start','Start=4 bedeutet typischerweise deaktiviert.'),
        command('Wechseldatenträger-Richtlinien prüfen','PowerShell','Get-ItemProperty -Path HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices -ErrorAction SilentlyContinue','GPO-basierte Sperren prüfen.'),
        command('Gruppenrichtlinien anzeigen','CMD','gpresult /scope computer /r','Computer-Richtlinien kurz anzeigen.')
      ]
    },
    {
      match:/geräuschentwicklung und lüfter prüfen/,
      kind:'hardware',
      label:'Lüfter/Last',
      commands:[
        command('CPU-lastige Prozesse anzeigen','PowerShell','Get-Process | Sort-Object CPU -Descending | Select-Object -First 15 Name, Id, CPU, WorkingSet','Hohe Last als Geräuschursache.'),
        command('CPU und BIOS anzeigen','PowerShell','Get-CimInstance Win32_Processor | Select-Object Name, CurrentClockSpeed, MaxClockSpeed','Takt-/CPU-Kontext prüfen.'),
        command('Temperatursensoren abfragen','PowerShell','Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace root/wmi -ErrorAction SilentlyContinue','Nicht jedes Gerät liefert Werte.'),
        command('Energieplan anzeigen','CMD','powercfg /getactivescheme','Leistungsprofil dokumentieren.')
      ]
    },
    {
      match:/dhcp-lease erneuern/,
      kind:'network',
      label:'DHCP',
      commands:[
        command('Aktuelle DHCP-Konfiguration anzeigen','CMD','ipconfig /all','Vor Änderung dokumentieren.'),
        command('DHCP-Lease freigeben','CMD','ipconfig /release','Ändert die Verbindung. Nur bewusst ausführen.'),
        command('DHCP-Lease erneuern','CMD','ipconfig /renew','Ändert die Verbindung.'),
        command('IP-Konfiguration danach prüfen','PowerShell','Get-NetIPConfiguration','Nachkontrolle.')
      ]
    },
    {
      match:/dns-auflösung reparieren/,
      kind:'network',
      label:'DNS',
      commands:[
        command('DNS-Server anzeigen','PowerShell','Get-DnsClientServerAddress','Konfigurierte DNS-Server prüfen.'),
        command('DNS-Auflösung testen','PowerShell','Resolve-DnsName www.eah-jena.de','Ziel bei Bedarf ersetzen.'),
        command('DNS per nslookup testen','CMD','nslookup www.eah-jena.de','CMD-Gegenprüfung.'),
        command('DNS-Cache anzeigen','CMD','ipconfig /displaydns','Cache prüfen.'),
        command('DNS-Cache leeren','CMD','ipconfig /flushdns','Ändert nur lokalen Cache.')
      ]
    },
    {
      match:/lan\/wlan-konflikt beseitigen/,
      kind:'network',
      label:'LAN/WLAN',
      commands:[
        command('Adapterstatus anzeigen','PowerShell','Get-NetAdapter | Sort-Object Status, Name | Format-Table Name, Status, InterfaceDescription, LinkSpeed, MacAddress -AutoSize','LAN/WLAN parallel prüfen.'),
        command('Alle IP-Konfigurationen anzeigen','PowerShell','Get-NetIPConfiguration -All','Auch getrennte/virtuelle Adapter sichtbar.'),
        command('Routingtabelle anzeigen','CMD','route print','Standardroute und Metriken prüfen.'),
        command('Netzwerkprofile anzeigen','PowerShell','Get-NetConnectionProfile','Profil je Adapter prüfen.')
      ]
    },
    {
      match:/switch-port und wanddose nachtragen/,
      kind:'network',
      label:'Switch/Wanddose',
      commands:[
        command('MAC-Adresse und Linkstatus anzeigen','PowerShell','Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress','MAC für Switchsuche dokumentieren.'),
        command('Nachbarn im Netz anzeigen','PowerShell','Get-NetNeighbor | Sort-Object State, IPAddress | Select-Object IPAddress, LinkLayerAddress, State','ARP/Neighbor-Tabelle prüfen.'),
        command('IP-Konfiguration dokumentieren','CMD','ipconfig /all','Adapterbeschreibung, DHCP und DNS.'),
        command('Gateway erreichen','PowerShell','Test-NetConnection -ComputerName 10.81.20.1','Gateway-IP ersetzen.')
      ]
    },
    {
      match:/paketverlust und latenz prüfen/,
      kind:'network',
      label:'Latenz/Paketverlust',
      commands:[
        command('Ping mit mehreren Versuchen','PowerShell','Test-Connection -ComputerName 10.81.20.1 -Count 20','Gateway/Ziel ersetzen.'),
        command('TCP-Erreichbarkeit testen','PowerShell','Test-NetConnection -ComputerName www.eah-jena.de -Port 443','DNS und HTTPS-Erreichbarkeit.'),
        command('Pfad mit Paketverlust prüfen','CMD','pathping www.eah-jena.de','Dauert einige Minuten.'),
        command('Route verfolgen','CMD','tracert www.eah-jena.de','Pfad sichtbar machen.')
      ]
    },
    {
      match:/windows update hängt/,
      kind:'windows',
      label:'Windows Update',
      commands:[
        command('Windows-Update Dienste prüfen','PowerShell','Get-Service wuauserv,bits,cryptsvc | Select-Object Name, Status, StartType','Basisdienste prüfen.'),
        command('Letzte Windows-Update Ereignisse','PowerShell','Get-WinEvent -ProviderName Microsoft-Windows-WindowsUpdateClient -MaxEvents 50 | Select-Object TimeCreated, Id, LevelDisplayName, Message','UpdateClient-Ereignisse.'),
        command('Installierte Hotfixes anzeigen','PowerShell','Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 20','Installationshistorie.'),
        command('Windows Update Log erzeugen','PowerShell','Get-WindowsUpdateLog','Erzeugt WindowsUpdate.log auf dem Desktop.')
      ]
    },
    {
      match:/defender-status prüfen/,
      kind:'security',
      label:'Defender',
      commands:[
        command('Defender Status anzeigen','PowerShell','Get-MpComputerStatus','Status und Signaturen prüfen.'),
        command('Defender Signaturen aktualisieren','PowerShell','Update-MpSignature','Ändert Signaturen, Internet nötig.'),
        command('Schnellscan starten','PowerShell','Start-MpScan -ScanType QuickScan','Aktive Prüfung, kann dauern.'),
        command('Defender Ereignisse anzeigen','PowerShell','Get-WinEvent -LogName "Microsoft-Windows-Windows Defender/Operational" -MaxEvents 50 | Select-Object TimeCreated, Id, Message','Defender Operational Log.')
      ]
    },
    {
      match:/bitlocker-recovery vermeiden/,
      kind:'security',
      label:'BitLocker',
      commands:[
        command('BitLocker Status prüfen','PowerShell','Get-BitLockerVolume C: | Format-List','Schutzstatus vor Änderungen.'),
        command('Protektoren anzeigen','PowerShell','(Get-BitLockerVolume -MountPoint C:).KeyProtector','Recovery-/TPM-Protektoren prüfen.'),
        command('BitLocker Status per CMD','CMD','manage-bde -status C:','CMD-Gegenprüfung.'),
        command('Schutz temporär aussetzen','PowerShell','Suspend-BitLocker -MountPoint C: -RebootCount 1','Ändert Schutzstatus. Nur vor BIOS/Firmware-Änderung bewusst nutzen.')
      ]
    },
    {
      match:/benutzerprofil reparieren/,
      kind:'windows',
      label:'Benutzerprofil',
      commands:[
        command('Aktuellen Benutzer anzeigen','CMD','whoami /user','SID dokumentieren.'),
        command('Lokale Benutzerprofile anzeigen','PowerShell','Get-CimInstance Win32_UserProfile | Select-Object LocalPath, SID, Loaded, LastUseTime','Profilzustand prüfen.'),
        command('Angemeldete Sitzungen anzeigen','CMD','query user','Sitzungen prüfen.'),
        command('Profilordner anzeigen','PowerShell','Get-ChildItem C:\\Users | Select-Object Name, LastWriteTime','Profilordner prüfen.')
      ]
    },
    {
      match:/gruppenrichtlinien prüfen/,
      kind:'windows',
      label:'Gruppenrichtlinien',
      commands:[
        command('RSoP Kurzbericht Computer','CMD','gpresult /scope computer /r','Computer-Richtlinien.'),
        command('RSoP Kurzbericht Benutzer','CMD','gpresult /scope user /r','Benutzer-Richtlinien.'),
        command('HTML-Bericht erzeugen','CMD','gpresult /h "%TEMP%\\gpresult.html" /f','Erzeugt Bericht im TEMP-Ordner.'),
        command('Gruppenrichtlinien aktualisieren','CMD','gpupdate /force','Ändert lokalen Richtlinienstand.')
      ]
    },
    {
      match:/firefox warten/,
      kind:'software',
      label:'Firefox',
      commands:[
        command('Firefox Installation suchen','PowerShell','winget list --name Firefox','Installierte Version prüfen.'),
        command('Firefox Updates prüfen','PowerShell','winget list --name Firefox --upgrade-available','Nur verfügbare Updates anzeigen.'),
        command('Firefox reparieren','PowerShell','winget repair --name Firefox','Reparatur, falls Paket unterstützt.'),
        command('Firefox Prozesse anzeigen','PowerShell','Get-Process firefox -ErrorAction SilentlyContinue | Select-Object Name, Id, Path','Laufende Instanzen prüfen.')
      ]
    },
    {
      match:/chrome warten/,
      kind:'software',
      label:'Chrome',
      commands:[
        command('Chrome Installation suchen','PowerShell','winget list --name "Google Chrome"','Installierte Version prüfen.'),
        command('Chrome Updates prüfen','PowerShell','winget list --name "Google Chrome" --upgrade-available','Nur verfügbare Updates.'),
        command('Chrome reparieren','PowerShell','winget repair --name "Google Chrome"','Reparatur, falls Paket unterstützt.'),
        command('Chrome Prozesse anzeigen','PowerShell','Get-Process chrome -ErrorAction SilentlyContinue | Select-Object Name, Id, Path','Laufende Instanzen prüfen.')
      ]
    },
    {
      match:/adobe acrobat reader absichern/,
      kind:'software',
      label:'Adobe Acrobat',
      commands:[
        command('Adobe Installation suchen','PowerShell','winget list --name Adobe','Installierte Adobe-Pakete prüfen.'),
        command('Adobe Updates prüfen','PowerShell','winget list --name Adobe --upgrade-available','Nur verfügbare Updates.'),
        command('Benutzerzertifikate anzeigen','PowerShell','Get-ChildItem Cert:\\CurrentUser\\My | Select-Object Subject, Issuer, NotAfter','Signatur-/Zertifikatkontext.'),
        command('Acrobat Prozesse anzeigen','PowerShell','Get-Process AcroRd32,Acrobat -ErrorAction SilentlyContinue | Select-Object Name, Id, Path','Laufende Adobe-Prozesse.')
      ]
    },
    {
      match:/microsoft office reparieren/,
      kind:'software',
      label:'Microsoft Office',
      commands:[
        command('Office Installation über Winget suchen','PowerShell','winget list --name Microsoft | Select-String -Pattern "Office|Microsoft 365"','Office/M365 Pakete finden.'),
        command('Office Uninstall-Registry prüfen','PowerShell','Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*,HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object DisplayName -match "Office|Microsoft 365" | Select-Object DisplayName, DisplayVersion, Publisher','Klassische Installationen.'),
        command('Office Prozesse anzeigen','PowerShell','Get-Process WINWORD,EXCEL,POWERPNT,OUTLOOK -ErrorAction SilentlyContinue | Select-Object Name, Id, Path','Laufende Office-Prozesse.'),
        command('Office Updates über Winget prüfen','PowerShell','winget list --name Microsoft --upgrade-available | Select-String -Pattern "Office|Microsoft 365"','Nur falls Winget Office erkennt.')
      ]
    },
    {
      match:/office deployment tool und office-updates verwalten/,
      kind:'software',
      label:'Office ODT/Updates',
      commands:[
        command('Office-Update-Richtlinien prüfen','CMD','reg query "HKLM\\SOFTWARE\\Policies\\Microsoft\\office\\16.0\\common\\officeupdate"','enableupdates, automatic updates und Button-Sichtbarkeit.'),
        command('Click-to-Run Konfiguration prüfen','CMD','reg query "HKLM\\SOFTWARE\\Microsoft\\Office\\ClickToRun\\Configuration"','Kanal, Plattform, Lizenzmodus und CDN-Fallback prüfen.'),
        command('Office Paket-Signaturen prüfen','PowerShell','Get-AuthenticodeSignature -LiteralPath "E:\\Microsoft Office\\setup.exe","E:\\Microsoft Office\\officedeploymenttool_19029-20136.exe" | Select-Object Path, Status, SignerCertificate','Vor Download/Installation prüfen.'),
        command('Office Paket downloaden','CMD','"E:\\Microsoft Office\\SpecificDownloadMSOFULL.bat"','Nutzt die lokale configuration.xml außerhalb des Repos.'),
        command('Office Paket installieren','CMD','"E:\\Microsoft Office\\SpecificInstallMSOFULL.bat"','Nur im Wartungsfenster ausführen. Kann bestehende Office-Installationen verändern.'),
        command('Profil M365 Current installieren','CMD','"E:\\Microsoft Office\\setup.exe" /Configure "E:\\Microsoft Office\\profiles\\M365-Current\\configuration.xml"','Profilpfad vor Nutzung anlegen und prüfen.'),
        command('Profil LTSC 2024 Standard installieren','CMD','"E:\\Microsoft Office\\setup.exe" /Configure "E:\\Microsoft Office\\profiles\\LTSC2024-Standard\\configuration.xml"','Nur mit dokumentierter Volumenlizenz nutzen.'),
        command('Profil LTSC 2024 mit Project/Visio installieren','CMD','"E:\\Microsoft Office\\setup.exe" /Configure "E:\\Microsoft Office\\profiles\\LTSC2024-ProPlus-Project-Visio\\configuration.xml"','Lizenzzuordnung für Project/Visio vorher dokumentieren.'),
        command('Office Registry-Profil importieren','CMD','reg import "E:\\Microsoft Office\\profiles\\<Profilname>\\MSO-Config.reg"','Nur nach Sichtprüfung und Freigabe importieren.'),
        command('Office Update-Aufgabe starten','CMD','schtasks /run /tn "\\Microsoft\\Office\\Office Automatic Updates 2.0"','Startet die geplante Office-Update-Aufgabe.'),
        command('Office Update für angemeldeten Benutzer','CMD','"C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeC2RClient.exe" /update user forceappshutdown=true','Kann Office-Anwendungen schließen.'),
        command('Office Update automatisiert starten','CMD','"C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeC2RClient.exe" /update base displaylevel=none updatepromptuser=false forceappshutdown=true','Für Wartungsfenster oder Skripte.'),
        command('Gruppenrichtlinien aktualisieren','CMD','gpupdate /force','Nach ADMX/Policy-Änderungen ausführen.')
      ]
    },
    {
      match:/visual c\+\+ redistributable prüfen/,
      kind:'software',
      label:'Visual C++',
      commands:[
        command('VC++ Pakete über Registry anzeigen','PowerShell','Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*,HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object DisplayName -match "Visual C\\+\\+" | Select-Object DisplayName, DisplayVersion, Publisher','32/64-Bit Installationen.'),
        command('VC++ über Winget suchen','PowerShell','winget list --name "Visual C++"','Winget-Sicht prüfen.'),
        command('VC++ Updates prüfen','PowerShell','winget list --name "Visual C++" --upgrade-available','Nur verfügbare Updates.')
      ]
    },
    {
      match:/\.net runtime prüfen/,
      kind:'software',
      label:'.NET',
      commands:[
        command('.NET Runtimes anzeigen','PowerShell','dotnet --list-runtimes','Installierte .NET-Runtimes.'),
        command('.NET SDKs anzeigen','PowerShell','dotnet --list-sdks','Nur relevant bei Entwicklungsumgebung.'),
        command('.NET Info anzeigen','PowerShell','dotnet --info','Gesamtkontext zur .NET-Installation.'),
        command('.NET über Winget suchen','PowerShell','winget list --name ".NET"','Winget-Sicht prüfen.')
      ]
    },
    {
      match:/winget\/uniget inventur nutzen/,
      kind:'software',
      label:'Winget/Inventur',
      commands:[
        command('Winget Info anzeigen','PowerShell','winget --info','Version, Quellen und Richtlinien.'),
        command('Installierte Pakete listen','PowerShell','winget list','Inventuransicht.'),
        command('Pakete mit Updates anzeigen','PowerShell','winget list --upgrade-available','Nur Updates.'),
        command('Paketliste exportieren','PowerShell','winget export -o "%TEMP%\\winget-export.json"','Erzeugt Exportdatei.')
      ]
    },
    {
      match:/windows-paketquellen und softwareupdates reparieren/,
      kind:'software',
      label:'Winget/Chocolatey',
      commands:[
        command('Winget Quellen zurücksetzen','PowerShell','winget source reset --force --disable-interactivity','Paketquellen neu aufbauen.'),
        command('Winget Quellen aktualisieren','PowerShell','winget source update --disable-interactivity','Quellenkataloge aktualisieren.'),
        command('Verfügbare Winget Updates anzeigen','PowerShell','winget upgrade','Vor dem Massenupdate prüfen.'),
        command('MS Store Pakete aktualisieren','PowerShell','winget upgrade --all -e --force --accept-package-agreements --accept-source-agreements -s msstore','Kann lange laufen.'),
        command('Winget Pakete aktualisieren','PowerShell','winget upgrade --all -e --force --accept-package-agreements --accept-source-agreements -s winget','Kann Installer starten.'),
        command('Chocolatey aktualisieren','PowerShell','choco upgrade chocolatey','Chocolatey selbst aktualisieren.'),
        command('Chocolatey Pakete aktualisieren','PowerShell','choco upgrade all','Benötigt vorhandene Chocolatey-Installation.'),
        command('Chocolatey via Winget aktualisieren','PowerShell','winget upgrade -e --id Chocolatey.Chocolatey','Alternative Aktualisierung über Winget.')
      ]
    },
    {
      match:/ticket aus störung erstellen/,
      kind:'process',
      label:'Ticket/Diagnose',
      commands:[
        command('Systeminfo für Ticket erfassen','CMD','systeminfo','Basisdaten für Ticket.'),
        command('Letzte Systemwarnungen anzeigen','PowerShell','Get-WinEvent -LogName System -MaxEvents 50 | Where-Object LevelDisplayName -in "Error","Warning" | Select-Object TimeCreated, ProviderName, LevelDisplayName, Message','Fehlerkontext.'),
        command('IP-Kontext erfassen','CMD','ipconfig /all','Netzwerkdaten für Ticket.'),
        command('Installierte Pakete exportieren','PowerShell','winget export -o "%TEMP%\\winget-ticket.json"','Softwarekontext für Ticket.')
      ]
    },
    {
      match:/neuinstallation vorbereiten/,
      kind:'process',
      label:'Neuinstallation',
      commands:[
        command('Systemdaten sichern','PowerShell','Get-ComputerInfo | Out-File "$env:TEMP\\computerinfo.txt"','Inventarkontext exportieren.'),
        command('BitLocker Status prüfen','PowerShell','Get-BitLockerVolume C: | Format-List','Recovery-Risiko vor Neuinstallation.'),
        command('Treiber-/Gerätestatus anzeigen','PowerShell','Get-PnpDevice | Where-Object Status -ne "OK" | Select-Object Status, Class, FriendlyName','Problemgeräte vor Neuinstallation.'),
        command('Winget Paketliste exportieren','PowerShell','winget export -o "$env:TEMP\\winget-before-reinstall.json"','Softwareliste für Wiederaufbau.')
      ]
    },
    {
      match:/asset-umzug dokumentieren/,
      kind:'process',
      label:'Asset-Umzug',
      commands:[
        command('Netzwerkdaten vor Umzug sichern','CMD','ipconfig /all','Vorher-Werte.'),
        command('Adapter/MAC dokumentieren','PowerShell','Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress','MAC für Switch-Port-Suche.'),
        command('Systemdaten dokumentieren','PowerShell','Get-ComputerInfo -Property CsName, CsManufacturer, CsModel, BiosSerialNumber, OsName','Asset-Kontext.'),
        command('Nachbarn/Gateway prüfen','PowerShell','Get-NetNeighbor | Select-Object IPAddress, LinkLayerAddress, State','Netzkontext.')
      ]
    },
    {
      match:/ausmusterung planen/,
      kind:'process',
      label:'Ausmusterung',
      commands:[
        command('BitLocker Status dokumentieren','PowerShell','Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus','Datenschutz-/Verschlüsselungskontext.'),
        command('Datenträger anzeigen','PowerShell','Get-Disk | Select-Object Number, FriendlyName, SerialNumber, HealthStatus, Size','Datenträger für Ausmusterung.'),
        command('System-/Seriennummer dokumentieren','PowerShell','Get-CimInstance Win32_BIOS | Select-Object SerialNumber, SMBIOSBIOSVersion','Inventarbezug.'),
        command('Installierte Software exportieren','PowerShell','winget export -o "$env:TEMP\\winget-retire.json"','Lizenz-/Softwarekontext.')
      ]
    },
    {
      match:/inventurprüfung durchführen/,
      kind:'process',
      label:'Inventur',
      commands:[
        command('Gerätebasisdaten anzeigen','PowerShell','Get-ComputerInfo -Property CsName, CsManufacturer, CsModel, BiosSerialNumber, OsName, OsVersion','Inventardaten abgleichen.'),
        command('Hardwaredaten anzeigen','PowerShell','Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model, TotalPhysicalMemory','Hardwareabgleich.'),
        command('Netzwerkdaten anzeigen','CMD','ipconfig /all','IP/MAC/DNS abgleichen.'),
        command('Softwareinventar anzeigen','PowerShell','winget list','Software-Sicht.')
      ]
    }
  ];
}
