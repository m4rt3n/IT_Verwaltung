// Software card view, full-scan inventory, scan standardization and profile helpers.

// ===== v27 SOFTWARE UI =====
let SOFTWARE_VIEW = localStorage.getItem('softwareView') || 'cards';
let SOFTWARE_FULL_SELECTED = 0;
const SOFTWARE_FULL_SCOPES = ['apps','productivity','admin','development','security','drivers','runtimes','windows','services','unknown','components','system','all'];
const STORED_SOFTWARE_FULL_SCOPE = localStorage.getItem('softwareFullScope') || 'apps';
let SOFTWARE_FULL_SCOPE = SOFTWARE_FULL_SCOPES.includes(STORED_SOFTWARE_FULL_SCOPE) ? STORED_SOFTWARE_FULL_SCOPE : 'apps';

const SOFTWARE_FULL_FAMILY_RULES = [
  {family:'Microsoft Visual C++ Redistributable', category:'component', patterns:[/Microsoft\.VCRedist/i,/Visual C\+\+/i,/VCLibs/i]},
  {family:'.NET Runtime', category:'component', patterns:[/Microsoft\.DotNet/i,/\.NET Host/i,/\.NET Runtime/i,/ASP\.NET Core/i,/Windows Desktop Runtime/i,/NET\.Native/i]},
  {family:'Windows App Runtime', category:'component', patterns:[/WindowsAppRuntime/i,/WinAppRuntime/i]},
  {family:'Microsoft VCLibs', category:'component', patterns:[/^VCLibs/i,/Microsoft\.VCLibs/i]},
  {family:'Python', category:'app', patterns:[/^Python\s+\d/i,/Python Launcher/i,/^pip$/i,/^pipx$/i]},
  {family:'Adobe Acrobat', category:'app', patterns:[/Acrobat/i,/Adobe Refresh Manager/i,/Adobe Notification Client/i,/AdobeAcrobat/i,/AdobeUpdateService/i]},
  {family:'Adobe Creative Cloud', category:'app', patterns:[/Adobe Creative Cloud/i]},
  {family:'Microsoft Office', category:'app', patterns:[/Microsoft Office/i,/MicrosoftOfficeHub/i,/Office 16 Click-to-Run/i,/OfficePushNotification/i]},
  {family:'LibreOffice', category:'app', patterns:[/LibreOffice/i,/^soffice$/i]},
  {family:'Microsoft Edge', category:'app', patterns:[/^Microsoft Edge$/i,/MicrosoftEdge\.Stable/i,/Edge\.GameAssist/i,/Microsoft Edge-Spielhilfe/i]},
  {family:'Microsoft Edge WebView2', category:'component', patterns:[/WebView2/i]},
  {family:'Visual Studio Code', category:'app', patterns:[/Visual Studio Code/i,/VisualStudioCode/i,/^Code$/i,/VS Code/i]},
  {family:'Microsoft Visual Studio', category:'app', patterns:[/Visual Studio Installer/i,/Visual Studio Setup/i,/Visual Studio Installer Elevation Service/i]},
  {family:'Chocolatey', category:'app', patterns:[/^chocolatey$/i,/Chocolatey/i]},
  {family:'7-Zip', category:'app', patterns:[/^7-Zip/i,/^7zFM$/i]},
  {family:'AOMEI Backupper', category:'app', patterns:[/AOMEI Backupper/i]},
  {family:'Google Chrome', category:'app', patterns:[/^Google Chrome$/i,/^Chrome$/i,/GoogleChromeElevationService/i]},
  {family:'Google Updater', category:'component', patterns:[/Google Updater/i]},
  {family:'Google Earth Pro', category:'app', patterns:[/Google Earth Pro/i]},
  {family:'Macrium Reflect', category:'app', patterns:[/Macrium Reflect/i,/Macrium Service/i]},
  {family:'Microsoft Teams', category:'app', patterns:[/^MSTeams$/i,/Microsoft Teams/i]},
  {family:'PowerToys', category:'app', patterns:[/PowerToys/i]},
  {family:'VLC media player', category:'app', patterns:[/^vlc$/i,/VLC media player/i]},
  {family:'WinSCP', category:'app', patterns:[/^WinSCP/i]},
  {family:'AnyToISO', category:'app', patterns:[/AnyToISO/i]},
  {family:'Git', category:'app', patterns:[/^Git$/i,/Git\.Git/i]},
  {family:'ShareX', category:'app', patterns:[/ShareX/i]},
  {family:'WhatsApp', category:'app', patterns:[/WhatsApp/i]},
  {family:'Notepad++', category:'app', patterns:[/notepad\+\+/i,/Notepad\+\+/i]},
  {family:'Sysinternals', category:'app', patterns:[/SysInternals/i,/Sysinternals/i]},
  {family:'ChatGPT', category:'app', patterns:[/^ChatGPT/i]},
  {family:'PowerShell', category:'app', patterns:[/^PowerShell\s*7/i]},
  {family:'OneDrive', category:'app', patterns:[/OneDrive/i]},
  {family:'Mozilla Firefox', category:'app', patterns:[/^firefox$/i,/Mozilla Firefox/i]},
  {family:'PuTTY', category:'app', patterns:[/^putty$/i,/PuTTY release/i]},
  {family:'Zoom Workplace', category:'app', patterns:[/^Zoom$/i,/Zoom Workplace/i]},
  {family:'IntelliJ IDEA Community', category:'app', patterns:[/IntelliJ IDEA Community/i]},
  {family:'Unity', category:'app', patterns:[/^Unity\s+\d/i,/Unity Hub/i]},
  {family:'Windows ADK', category:'component', patterns:[/Application Compatibility Toolkit/i,/Assessment/i,/Assessment and Deployment Kit/i,/WindowsADK/i,/Deployment Image Servicing/i,/Imaging (And )?(Configuration )?Designer/i,/Imaging Tools Support/i,/User State Migration Tool/i,/BCD and Boot/i,/DefaultPackMSI/i,/Kits Configuration Installer/i,/OA3Tool/i,/OACheck/i,/OATool/i,/Oscdimg/i,/Supply Chain Trust Tools ADK/i,/Toolkit Documentation/i,/UEV Tools/i,/Volume Activation Management Tool/i,/Windows Assessment Toolkit/i,/Windows Deployment/i,/Windows PE/i,/Windows Setup Files/i,/Windows System Image Manager/i,/WPT/i]},
  {family:'Sophos Endpoint Security', category:'component', patterns:[/^Sophos/i]},
  {family:'Brother Drucker/Scanner Suite', category:'app', patterns:[/^Brother/i,/^Br[A-Z]/i,/ControlCenter4/i,/StatusMonitor/i,/UsbRepairTool/i,/NetworkRepairTool/i,/HowToGuide/i,/AppLogLibSetup/i]},
  {family:'Paragon Partition Manager', category:'app', patterns:[/Paragon Partition Manager/i,/Paragon Block Device Mounter/i]},
  {family:'Canon Druckertreiber', category:'component', patterns:[/Canon.*Druckertreiber/i,/Canon Generic Plus/i]},
  {family:'Fujitsu DeskUpdate', category:'app', patterns:[/DeskUpdate/i]},
  {family:'Epic Online Services', category:'component', patterns:[/Epic Online Services/i]},
  {family:'GLPI Agent', category:'component', patterns:[/GLPI Agent/i]},
  {family:'Mozilla Maintenance Service', category:'component', patterns:[/Mozilla Maintenance Service/i]},
  {family:'Windows Subsystem for Linux', category:'app', patterns:[/Windows Subsystem for Linux/i,/Windows-Subsystem für Linux/i]},
  {family:'Microsoft XNA Framework', category:'component', patterns:[/XNA Framework/i,/Microsoft\.XNARedist/i]},
  {family:'Windows Medienerweiterungen', category:'system', patterns:[/AV1 ?Video Extension/i,/AV1VideoExtension/i,/AVC ?Encoder/i,/AVCEncoderVideoExtension/i,/HEIF/i,/HEVC/i,/MPEG-?2/i,/MPEG2VideoExtension/i,/Raw Image Extension/i,/RawImageExtension/i,/VP9/i,/WebMediaExtensions/i,/Webmedienerweiterungen/i,/WebP/i,/WebpImageExtension/i]},
  {family:'Windows Xbox/Gaming Apps', category:'system', patterns:[/^Xbox$/i,/XboxGame/i,/XboxGaming/i,/XboxIdentity/i,/XboxSpeech/i,/Game Bar/i,/Game Speech Window/i,/GamingApp/i,/Solitaire/i,/MicrosoftSolitaireCollection/i]},
  {family:'Windows Store Apps', category:'system', patterns:[/Microsoft Store/i,/WindowsStore/i,/StorePurchaseApp/i,/DesktopAppInstaller/i,/Host der Store-Benutzeroberfläche/i]},
  {family:'Windows Standard-Apps', category:'system', patterns:[/BingNews/i,/BingSearch/i,/BingWeather/i,/Microsoft Bing/i,/Microsoft Fotos/i,/Fotos/i,/Photos/i,/WindowsCamera/i,/Windows-Kamera/i,/WindowsCalculator/i,/Windows-Rechner/i,/WindowsAlarms/i,/Windows-Uhr/i,/WindowsSoundRecorder/i,/Windows-Audiorekorder/i,/WindowsNotepad/i,/Windows-Editor/i,/WindowsFeedbackHub/i,/Feedback-Hub/i,/WindowsMaps/i,/Windows-Karten/i,/GetHelp/i,/Hilfe anfordern/i,/Getstarted/i,/People/i,/Microsoft Kontakte/i,/Todos/i,/Microsoft To Do/i,/OutlookForWindows/i,/Outlook for Windows/i,/Paint$/i,/ScreenSketch/i,/Snipping Tool/i,/ZuneMusic/i,/ZuneVideo/i,/Filme & TV/i,/Windows Medienwiedergabe/i,/Mail und Kalender/i,/windowscommunicationsapps/i,/Smartphone-Link/i,/Geräteübergreifender Funktions-Host/i,/Power Automate/i,/PowerAutomate/i]},
  {family:'Windows Shell/Experience', category:'system', patterns:[/ApplicationCompatibilityEnhancements/i,/CrossDevice/i,/DevHome/i,/LanguageExperiencePack/i,/Deutsch Local Experience Pack/i,/NcsiUwpApp/i,/QuickAssist/i,/Remotehilfe/i,/SecHealthUI/i,/Services\.Store\.Engagement/i,/Start Experiences-App/i,/StartExperiencesApp/i,/WidgetsPlatformRuntime/i,/Windows Advanced Settings/i,/Windows Web Experience Pack/i,/Winget\.(Fonts\.)?Source/i]}
];

const SOFTWARE_FULL_SYSTEM_PATTERNS = [
  /^Microsoft\.Windows/i,
  /^Windows\./i,
  /^Microsoft\.(AAD|AccountsControl|AsyncTextService|BioEnrollment|CredentialDialogHost|LockApp|SecHealthUI|WindowsStore)/i,
  /^(StartExperiencesApp|CrossDevice|YourPhone|Xbox\.|Xbox TCUI|Clipchamp|Copilot|Microsoft 365 Copilot|Microsoft Search in Bing|App-Installer|Windows Installer)$/i,
  /^(Speion|Voiess)$/i
];

function setSoftwareView(view){
  SOFTWARE_VIEW = view;
  localStorage.setItem('softwareView', view);
  render();
}

function setSoftwareFullSelected(i){
  SOFTWARE_FULL_SELECTED = i;
  render();
}

function setSoftwareFullScope(scope){
  SOFTWARE_FULL_SCOPE = SOFTWARE_FULL_SCOPES.includes(scope) ? scope : 'apps';
  SOFTWARE_FULL_SELECTED = 0;
  localStorage.setItem('softwareFullScope', SOFTWARE_FULL_SCOPE);
  render();
}

function softwareFullBaseRows(){
  const full = DB.softwareFull || {};
  const rows = Array.isArray(full.rows) ? full.rows : [];
  const q = searchText.trim().toLowerCase();
  return rows
    .filter(r=>!q || Object.values(r).join(' ').toLowerCase().includes(q))
    .filter(r=>String(r.Name || '').trim() && String(r.Name || '').trim() !== '-');
}

function softwareFullRows(){
  const filtered = softwareFullBaseRows()
    .filter(r=>{
      const category = softwareFullCategory(r);
      const swClass = softwareFullClass(r);
      if(SOFTWARE_FULL_SCOPE === 'all') return true;
      if(SOFTWARE_FULL_SCOPE === 'apps') return category === 'app';
      if(SOFTWARE_FULL_SCOPE === 'productivity') return swClass === 'productivity';
      if(SOFTWARE_FULL_SCOPE === 'admin') return swClass === 'admin';
      if(SOFTWARE_FULL_SCOPE === 'development') return swClass === 'development';
      if(SOFTWARE_FULL_SCOPE === 'security') return swClass === 'security';
      if(SOFTWARE_FULL_SCOPE === 'drivers') return swClass === 'driver';
      if(SOFTWARE_FULL_SCOPE === 'runtimes') return swClass === 'runtime';
      if(SOFTWARE_FULL_SCOPE === 'windows') return swClass === 'windows';
      if(SOFTWARE_FULL_SCOPE === 'services') return swClass === 'service';
      if(SOFTWARE_FULL_SCOPE === 'unknown') return swClass === 'unclear';
      if(SOFTWARE_FULL_SCOPE === 'components') return category === 'component';
      if(SOFTWARE_FULL_SCOPE === 'system') return category === 'system';
      return category === 'app';
    });
  return compactSoftwareFullRows(filtered);
}

function softwareFullCategory(row){
  const family = softwareFullFamily(row);
  if(family?.category) return family.category;
  if(isWindowsSystemSoftware(row)) return 'system';
  if(isSoftwareComponent(row)) return 'component';
  return 'app';
}

function isWindowsSystemSoftware(row){
  const name = String(row.DisplayName || row.Name || '').trim();
  const publisher = String(row.Publisher || row.Hersteller || '');
  const packageType = String(row.PackageType || row.Pakettyp || '');
  const path = String(row.InstallLocation || row.RawPath || row.RawSourceKey || '');
  const normalizedPath = path.replaceAll('/', '\\').toLowerCase();
  const source = String(row.Sources || row.Source || row.Quelle || '');

  if(/\b(Service|Driver)\b/i.test(packageType)) return true;
  if(/CN=Microsoft Windows/i.test(publisher)) return true;
  if(SOFTWARE_FULL_SYSTEM_PATTERNS.some(pattern=>pattern.test(name))) return true;
  if(/CN=Microsoft Corporation/i.test(publisher) && /Appx\/MSIX/i.test(packageType) && SOFTWARE_FULL_SYSTEM_PATTERNS.some(pattern=>pattern.test(name))) return true;
  if(['\\windows\\systemapps\\','\\windows\\winsxs\\','\\windows\\system32\\','\\windows\\syswow64\\'].some(part=>normalizedPath.includes(part))) return true;
  if(/^(Microsoft\.Windows|Windows\.|Microsoft\.UI\.Xaml|UI\.Xaml|Microsoft\.VCLibs|Microsoft\.NET\.Native|Microsoft\.Services\.Store)/i.test(name)) return true;
  if(/^Microsoft\.(AAD|AccountsControl|AsyncTextService|BioEnrollment|CredentialDialogHost|LockApp|SecHealthUI|WindowsStore)/i.test(name)) return true;
  if(/HKEY_USERS_S-1-5-(18|19|20)/i.test(source)) return true;
  return false;
}

function isSoftwareComponent(row){
  const name = String(row.DisplayName || row.Name || '').trim();
  const publisher = String(row.Publisher || row.Hersteller || '');
  const packageType = String(row.PackageType || row.Pakettyp || '');
  const blob = `${name} ${publisher} ${packageType}`.toLowerCase();
  if(/\b(runtime|redistributable|webview|vclibs|framework|sdk|dependency|library|driver package|hosting bundle|shared framework|desktop runtime|native runtime)\b/i.test(blob)) return true;
  if(/\b(update service|updater|notification client|refresh manager|helper|maintenance service|crash reporter|telemetry|licensing service|scheduler service)\b/i.test(blob)) return true;
  if(/^(adobe(acrobaticondccoreapp|notificationclient)|acrobat notification client|adobe notification client|adobe refresh manager)$/i.test(name.replace(/\s+/g, ' ').trim())) return true;
  return false;
}

function softwareFullCategoryCounts(rows){
  return rows.reduce((acc,row)=>{
    const category = softwareFullCategory(row);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {app:0, component:0, system:0});
}

function softwareFullClassCounts(rows){
  return rows.reduce((acc,row)=>{
    const swClass = softwareFullClass(row);
    acc[swClass] = (acc[swClass] || 0) + 1;
    return acc;
  }, {});
}

function softwareFullDisplayName(row){
  let name = String(row.DisplayName || row.Name || '').trim();
  if(!name) return 'Software';
  const family = softwareFullFamily({...row, Name:name, DisplayName:''});
  if(family) return family.family;
  name = name.replace(/^[A-Z0-9]{4,}\./, '');
  name = name.replace(/^(Microsoft|Windows)\./, '');
  name = name.replace(/Desktop$/i, '');
  name = name.replace(/\s+app$/i, '');
  const normalizedFamily = softwareFullFamily({...row, Name:name, DisplayName:''});
  if(normalizedFamily) return normalizedFamily.family;
  if(/^Chocolatey/i.test(name)) return 'Chocolatey';
  if(/^Microsoft Visual Studio Code/i.test(name) || /^Visual Studio Code/i.test(name)) return 'Visual Studio Code';
  if(/^Python\s+\d/i.test(name) && !/^Python Launcher/i.test(name)) return 'Python';
  if(/^Microsoft Edge$|^MicrosoftEdge\.Stable$/i.test(name)) return 'Microsoft Edge';
  if(/^Microsoft Office LTSC|^MicrosoftOfficeHub$/i.test(name)) return 'Microsoft Office';
  if(/^LibreOffice/i.test(name) || /^soffice$/i.test(name)) return 'LibreOffice';
  const aliasKey = name.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const aliases = {
    '7zfm':'7-Zip',
    '7zip':'7-Zip',
    'acrord32':'Adobe Acrobat Reader',
    'acrobatreader':'Adobe Acrobat Reader',
    'adobeacrobat64bit':'Adobe Acrobat',
    'adobeacrobat':'Adobe Acrobat',
    'adobeacrobatdccoreapp':'Adobe Acrobat',
    'adobeacrobaticondccoreapp':'Adobe Acrobat',
    'acrobatnotificationclient':'Adobe Acrobat',
    'adobenotificationclient':'Adobe Acrobat',
    'adoberefreshmanager':'Adobe Acrobat',
    'chocolateyinstallonly':'Chocolatey',
    'chocolateygui':'Chocolatey',
    'code':'Visual Studio Code',
    'microsoftvisualstudiocodeuser':'Visual Studio Code',
    'microsoftvisualstudiocodecli':'Visual Studio Code',
    'soffice':'LibreOffice',
    whatsappdesktop:'WhatsApp',
    whatsapp:'WhatsApp',
    googlechrome:'Google Chrome',
    chrome:'Google Chrome',
    microsoftteams:'Microsoft Teams',
    teams:'Microsoft Teams'
  };
  return aliases[aliasKey] || name.trim();
}

function softwareFullFamily(row){
  const name = String(row.DisplayName || row.Name || '').trim();
  const publisher = String(row.Publisher || row.Hersteller || '').trim();
  const packageType = String(row.PackageType || row.Pakettyp || '').trim();
  const source = String(row.Sources || row.Source || row.Quelle || '').trim();
  const raw = String(row.RawSourceKey || row.RawPath || row.InstallLocation || '').trim();
  const haystack = `${name} ${publisher} ${packageType} ${source} ${raw}`;
  const fields = [name, publisher, packageType, source, raw, haystack];
  return SOFTWARE_FULL_FAMILY_RULES.find(rule=>rule.patterns.some(pattern=>fields.some(value=>pattern.test(value)))) || null;
}

function softwareFullProductHint(row){
  const config = DB.softwareClassification || {};
  const hints = config.productHints || {};
  const name = String(row.DisplayName || softwareFullDisplayName(row) || '').trim();
  return hints[name] || {};
}

function softwareFullClass(row){
  const hint = softwareFullProductHint(row);
  if(hint.class) return hint.class;
  const category = softwareFullCategory(row);
  const packageType = String(row.PackageType || row.Pakettyp || '').toLowerCase();
  const name = String(row.DisplayName || row.Name || '').toLowerCase();
  const publisher = String(row.Publisher || row.Hersteller || '').toLowerCase();
  if(category === 'system') return 'windows';
  if(packageType.includes('driver')) return 'driver';
  if(packageType.includes('service')) return 'service';
  if(category === 'component') return 'runtime';
  if(/defender|sophos|security|antivirus|bitlocker|firewall|endpoint/.test(`${name} ${publisher}`)) return 'security';
  if(/powershell|putty|winscp|sysinternals|chocolatey|uniget|winget|glpi|deskupdate|backup|partition|remote|ssh|scanner/.test(name)) return 'admin';
  if(/python|git|visual studio|code|intellij|unity|node|npm|java|jdk|sdk/.test(name)) return 'development';
  if(!publisher || publisher === '-' || String(row.DetectionConfidence || '').toLowerCase() === 'low') return 'unclear';
  return 'productivity';
}

function softwareFullClassLabel(row){
  const labels = (DB.softwareClassification || {}).classLabels || {};
  const swClass = softwareFullClass(row);
  return labels[swClass] || swClass || 'Unklar';
}

function softwareFullRisk(row){
  const hint = softwareFullProductHint(row);
  if(hint.risk) return hint.risk;
  const swClass = softwareFullClass(row);
  if(['admin','security'].includes(swClass)) return 'high';
  if(['development','driver','productivity'].includes(swClass)) return 'medium';
  return 'low';
}

function softwareFullLabels(row){
  const hint = softwareFullProductHint(row);
  const labels = new Set(Array.isArray(hint.labels) ? hint.labels : []);
  const swClass = softwareFullClass(row);
  const scope = String(row.Scope || row.BenutzerKontext || '').toLowerCase();
  const packageType = String(row.PackageType || row.Pakettyp || '').toLowerCase();
  const confidence = String(row.DetectionConfidence || '').toLowerCase();
  if(swClass === 'windows') labels.add('Windows-Bordmittel');
  if(swClass === 'runtime') labels.add('Komponente');
  if(swClass === 'admin') labels.add('Admin-/IT-Tool');
  if(swClass === 'development') labels.add('Entwicklung');
  if(swClass === 'security') labels.add('Security-relevant');
  if(packageType.includes('portable')) labels.add('Portable');
  if(scope.includes('user')) labels.add('Benutzerinstallation');
  if(confidence === 'low' || swClass === 'unclear') labels.add('Pruefen');
  scannerUncertaintyLabels(row).forEach(label => labels.add(label));
  return Array.from(labels);
}

function softwareFullProfileStatus(row){
  const asset = softwareFullAsset(row);
  const config = DB.softwareClassification || {};
  const profiles = config.standardProfiles || {};
  const type = asset?.['Asset-Typ'] || 'Desktop';
  const profile = profiles[type] || profiles.Desktop || [];
  const name = row.DisplayName || softwareFullDisplayName(row);
  if(!Array.isArray(profile) || !profile.length) return 'Kein Profil';
  return profile.includes(name) ? 'Standardprofil' : 'Zusatzsoftware';
}

function softwareFullLogo(row){
  const hint = softwareFullProductHint(row);
  if(hint.logo) return hint.logo;
  const name = String(row.DisplayName || softwareFullDisplayName(row) || '').trim();
  return name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase() || 'SW';
}

function softwareFullLogoPath(row){
  const hint = softwareFullProductHint(row);
  return hint.logoPath || '';
}

function renderSoftwareFullLogo(row, size='list'){
  const path = softwareFullLogoPath(row);
  const text = softwareFullLogo(row);
  const title = row.DisplayName || softwareFullDisplayName(row);
  if(path){
    return `<span class="software-logo-mark software-logo-${size}" title="${safeEscape(title)}"><img src="${safeEscape(path)}" alt="${safeEscape(title)} Logo" onerror="this.style.display='none';this.parentNode.classList.add('logo-fallback');this.parentNode.dataset.logo='${safeEscape(text)}';"></span>`;
  }
  return `<span class="software-logo-mark software-logo-${size} logo-fallback" data-logo="${safeEscape(text)}" title="${safeEscape(title)}"></span>`;
}

function softwareFullUpdateAssessment(row){
  const normalized = normalizeUpdateStatus(row);
  if(normalized === 'UpdateAvailable'){
    const latest = row.LatestVersion ? ` -> ${row.LatestVersion}` : '';
    return `Update verfuegbar${latest} (${row.UpdateSource || 'Quelle unbekannt'})`;
  }
  if(normalized === 'Current') return 'Aktuell';
  if(normalized === 'Error') return 'Update-Pruefung fehlerhaft';
  if(normalized === 'Unknown') return 'Update unbekannt';
  if(row.UpdateStatus === 'NoUpdateKnown') return 'Kein Update aus Quellen bekannt';
  if(normalized === 'NotChecked') return 'Update nicht geprüft';
  const source = String(row.Sources || row.Source || row.Quelle || '').toLowerCase();
  const swClass = softwareFullClass(row);
  if(swClass === 'windows' || swClass === 'runtime') return 'System-/Komponentenpflege';
  if(source.includes('winget')) return 'Winget erkannt, Upgrade-Abgleich möglich';
  if(source.includes('choco')) return 'Chocolatey erkannt, Upgrade-Abgleich möglich';
  if(source.includes('pip') || source.includes('npm')) return 'Paketmanager erkannt, Version prüfen';
  return 'Manuell prüfen';
}

function normalizeUpdateStatus(row){
  const raw = String(row.UpdateStatus || row['Update-Status'] || '').toLowerCase();
  const available = String(row.UpdateAvailable || '').toLowerCase();
  if(available === 'true' || raw.includes('available') || raw.includes('verfüg') || raw.includes('verfueg')) return 'UpdateAvailable';
  if(raw.includes('current') || raw.includes('aktuell') || raw.includes('ok')) return 'Current';
  if(raw.includes('error') || raw.includes('fehler') || raw.includes('warn')) return 'Error';
  if(raw.includes('notchecked') || raw.includes('not checked') || raw.includes('nicht geprüft') || raw.includes('nicht gepr')) return 'NotChecked';
  if(raw.includes('unknown') || raw.includes('unbekannt')) return 'Unknown';
  return raw ? 'Unknown' : 'NotChecked';
}

function scannerUncertaintyLabels(row){
  const labels = [];
  const type = String(row['Asset-Typ'] || row.DeviceType || '').trim().toLowerCase();
  const connection = String(row.Verbindungstyp || row.ConnectionType || '').trim().toLowerCase();
  const blob = Object.values(row || {}).join(' ').toLowerCase();
  if(type === 'desktop') labels.push('Typ Desktop pruefen');
  if(connection === '' || connection === 'lan/wlan') labels.push('Verbindung unsicher');
  if(/to be filled|system product name|o\.e\.m\.|oem|default string|not specified|unknown/i.test(blob)) labels.push('OEM-Platzhalter');
  return labels;
}

function softwareFullSourceTrust(row){
  const source = String(row.Sources || row.Source || row.Quelle || row.PackageType || row.Pakettyp || '').toLowerCase();
  if(source.includes('winget') || source.includes('registry')) return {level:'hoch', text:'Hohe Verlässlichkeit'};
  if(source.includes('appx') || source.includes('msix') || source.includes('choco')) return {level:'mittel', text:'Mittlere Verlässlichkeit'};
  if(source.includes('pip') || source.includes('npm') || source.includes('service') || source.includes('driver')) return {level:'niedrig', text:'Technischer Kontext, fachlich prüfen'};
  return {level:'unklar', text:'Quelle unbekannt'};
}

function softwareFullVersion(row){
  const raw = String(row.Version || '').trim();
  const matches = raw.match(/[0-9]+(?:\.[0-9A-Za-z-]+)+/g);
  return matches && matches.length ? matches[matches.length - 1] : raw;
}

function softwareFamilyParts(row){
  const name = String(row.DisplayName || row.Softwarename || row.Name || '').trim();
  const source = String(row.Sources || row.Source || row.Quelle || row.PackageType || '').trim();
  const version = softwareFullVersion(row);
  const family = name
    .replace(/\b\d+(?:\.\d+)+\b/g, '')
    .replace(/\b(x64|x86|64-bit|32-bit|deutsch|german|english)\b/ig, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {family: family || name, version, source};
}

function compactSoftwareFullRows(rows){
  const groups = new Map();
  rows.forEach(row=>{
    const displayName = softwareFullDisplayName(row);
    const version = softwareFullVersion(row);
    const category = softwareFullCategory(row);
    const key = softwareFullGroupKey(row, displayName, version, category);
    if(!groups.has(key)){
      groups.set(key, {...row, DisplayName:displayName, Version:version, EntryCount:1, SoftwareCategory:category, RawNames:[row.Name].filter(Boolean), ComponentDetails:[row]});
      const created = groups.get(key);
      created.UpdateStatus = created.UpdateStatus || "NoUpdateKnown";
      created.UpdateAvailable = created.UpdateAvailable || "False";
      created.InstalledVersion = created.InstalledVersion || version || "";
      created.LatestVersion = created.LatestVersion || "";
      created.UpdateSource = created.UpdateSource || "";
      created.UpdateRaw = created.UpdateRaw || "";
      created.UpdateCheckedAt = created.UpdateCheckedAt || "";
      return;
    }
    const existing = groups.get(key);
    existing.EntryCount += 1;
    existing.ComponentDetails.push(row);
    if(row.Name && !existing.RawNames.includes(row.Name)) existing.RawNames.push(row.Name);
    existing.Sources = mergeCsvValues(existing.Sources || existing.Source || existing.Quelle, row.Sources || row.Source || row.Quelle);
    existing.Quelle = existing.Sources;
    existing.PackageType = mergeCsvValues(existing.PackageType || existing.Pakettyp, row.PackageType || row.Pakettyp);
    existing.Pakettyp = existing.PackageType;
    existing.Scope = mergeCsvValues(existing.Scope || existing.BenutzerKontext, row.Scope || row.BenutzerKontext);
    existing.BenutzerKontext = existing.Scope;
    if(!existing.Publisher && (row.Publisher || row.Hersteller)) existing.Publisher = row.Publisher || row.Hersteller;
    if(!existing.Hersteller && (row.Hersteller || row.Publisher)) existing.Hersteller = row.Hersteller || row.Publisher;
    if(!existing.InstallLocation && row.InstallLocation) existing.InstallLocation = row.InstallLocation;
    if(!existing.RawPath && row.RawPath) existing.RawPath = row.RawPath;
    if(!existing.RawSourceKey && row.RawSourceKey) existing.RawSourceKey = row.RawSourceKey;
    existing.Version = mergeVersionValues(existing.Version, version);
    if(String(row.UpdateAvailable || '').toLowerCase() === 'true'){
      existing.UpdateStatus = row.UpdateStatus || 'UpdateAvailable';
      existing.UpdateAvailable = row.UpdateAvailable;
      existing.InstalledVersion = row.InstalledVersion || row.Version || existing.InstalledVersion;
      existing.LatestVersion = row.LatestVersion || existing.LatestVersion;
      existing.UpdateSource = mergeCsvValues(existing.UpdateSource, row.UpdateSource);
      existing.UpdateRaw = row.UpdateRaw || existing.UpdateRaw;
      existing.UpdateCheckedAt = row.UpdateCheckedAt || existing.UpdateCheckedAt;
    }else{
      existing.UpdateStatus = existing.UpdateStatus || row.UpdateStatus || 'NoUpdateKnown';
      existing.UpdateAvailable = existing.UpdateAvailable || row.UpdateAvailable || 'False';
      existing.InstalledVersion = existing.InstalledVersion || row.InstalledVersion || version || '';
      existing.LatestVersion = existing.LatestVersion || row.LatestVersion || '';
      existing.UpdateSource = existing.UpdateSource || row.UpdateSource || '';
      existing.UpdateCheckedAt = existing.UpdateCheckedAt || row.UpdateCheckedAt || '';
    }
    existing.SoftwareCategory = existing.SoftwareCategory || category;
  });
  return Array.from(groups.values()).sort((a,b)=>softwareFullDisplayName(a).localeCompare(softwareFullDisplayName(b), 'de'));
}

function softwareFullGroupKey(row, displayName, version, category){
  const nameKey = displayName.toLowerCase();
  const family = softwareFullFamily(row);
  if(family) return `${category}|family|${family.family.toLowerCase()}`;
  if(SOFTWARE_FULL_SCOPE === 'apps' && category === 'app') return `app|${nameKey}`;
  if(/^(Adobe Acrobat|Microsoft Visual C\+\+ Redistributable|Microsoft Edge WebView2|\.NET Runtime|Windows App Runtime|Microsoft VCLibs|Sophos Endpoint Security|Brother Drucker\/Scanner Suite)$/i.test(displayName)) return `${category}|${nameKey}`;
  return `${category}|${nameKey}|${version.toLowerCase()}`;
}

function mergeVersionValues(a,b){
  const values = new Set();
  String(a || '').split(/\s*,\s*/).forEach(v=>{ if(v) values.add(v); });
  String(b || '').split(/\s*,\s*/).forEach(v=>{ if(v) values.add(v); });
  const list = Array.from(values).filter(Boolean).sort();
  if(list.length > 4) return `${list[0]} ... ${list[list.length - 1]} (${list.length} Versionen)`;
  return list.join(', ');
}

function mergeCsvValues(a,b){
  const parts = new Set();
  String(a || '').split(/\s*,\s*/).forEach(v=>{ if(v) parts.add(v); });
  String(b || '').split(/\s*,\s*/).forEach(v=>{ if(v) parts.add(v); });
  return Array.from(parts).sort().join(', ');
}

function softwareFullAsset(row){
  const full = DB.softwareFull || {};
  const assetId = row?.['Asset-ID'] || full.asset?.['Asset-ID'] || '';
  const host = row?.['Gerätename'] || full.asset?.['Gerätename'] || '';
  return (DB.assets || []).find(a =>
    (assetId && a['Asset-ID'] === assetId) ||
    (host && String(a['Gerätename']).toLowerCase() === String(host).toLowerCase())
  ) || null;
}

function softwareStatusClass(row){
  if(row && (row.__profileMissing || row.__scanStandard)) return 'info';
  const lic = String(row['Lizenzstatus']||'').toLowerCase();
  const upd = String(row['Update-Status']||'').toLowerCase();
  const crit = String(row['Kritikalität']||'').toLowerCase();
  if(lic.includes('abgelaufen') || upd.includes('veraltet') || crit.includes('hoch')) return 'danger';
  if(lic.includes('prüfen') || upd.includes('prüfen') || crit.includes('mittel')) return 'warning';
  return 'success';
}

function softwareStatusLabel(row){
  if(row && row.__scanStandard) return 'Scan';
  if(row && row.__profileMissing) return 'Profil';
  const cls = softwareStatusClass(row);
  if(cls === 'danger') return 'Prüfen';
  if(cls === 'warning') return 'Hinweis';
  return 'OK';
}

function softwareIcon(row){
  const name = String(row['Softwarename']||'').toLowerCase();
  if(name.includes('firefox') || name.includes('chrome') || name.includes('edge')) return '🌐';
  if(name.includes('adobe') || name.includes('pdf')) return '📄';
  if(name.includes('office') || name.includes('teams')) return '📦';
  if(name.includes('visual c') || name.includes('.net') || name.includes('runtime')) return '🧩';
  if(name.includes('vpn')) return '🔐';
  if(name.includes('druck')) return '🖨️';
  if(name.includes('bitlocker') || name.includes('update')) return '🛡️';
  return '💜';
}

function renderSoftwareModern(){
  const mod = modules.find(m=>m.key==='software');
  const sourceRows = DB.software || [];
  const rows = filterRows(sourceRows, 'software');
  const scanAsset = softwareExactScanAsset();
  const cardRows = SOFTWARE_VIEW === 'cards' ? softwareStandardCardRows(rows) : rows;
  const viewRows = SOFTWARE_VIEW === 'cards' ? cardRows : rows;
  const idx = clamp(selectedIndex.software, viewRows.length);
  selectedIndex.software = idx;
  const row = viewRows[idx] || viewRows[0];

  return `${contextHeader(mod)}
    <div class="software-ui-toolbar card mb-3">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Software-Verwaltung</h4>
          <div class="text-muted">Wizard-Style Karten, Status-Badges, Knowledge-Hinweise und Asset-Kontext.</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <div class="btn-group" role="group" aria-label="Softwareansicht">
            <button class="btn btn-outline-secondary ${SOFTWARE_VIEW==='cards'?'active':''}" onclick="setSoftwareView('cards')">Standardkarten</button>
            <button class="btn btn-outline-secondary ${SOFTWARE_VIEW==='table'?'active':''}" onclick="setSoftwareView('table')">Tabelle</button>
            <button class="btn btn-outline-secondary ${SOFTWARE_VIEW==='full'?'active':''}" onclick="setSoftwareView('full')">Full-Scan</button>
          </div>
          <button class="btn btn-primary" onclick="openSoftwareProfileCreate()">+ Standardsoftware</button>
          <button class="btn btn-outline-primary" onclick="openReferenceCreate('software')">+ Einzelsoftware</button>
        </div>
      </div>
    </div>

    ${SOFTWARE_VIEW==='cards' ? renderSoftwareScanContext(scanAsset, cardRows) : ''}
    <div class="row g-3 mb-3">
      ${softwareStatCard('Gesamt', viewRows.length, 'primary')}
      ${softwareStatCard('OK', viewRows.filter(r=>softwareStatusClass(r)==='success').length, 'success')}
      ${softwareStatCard('Hinweise', viewRows.filter(r=>softwareStatusClass(r)==='warning').length, 'warning')}
      ${softwareStatCard('Prüfen', viewRows.filter(r=>softwareStatusClass(r)==='danger').length, 'danger')}
    </div>

    ${renderListControls('software', sourceRows)}
    ${SOFTWARE_VIEW==='full' ? renderSoftwareFullInventory() : SOFTWARE_VIEW==='table' ? renderSplit('software',rows,moduleColumns('software'),row,renderModuleCard(mod,row,idx,rows.length)) : renderSoftwareCardsLayout(cardRows,row,idx,mod)}
  `;
}

function renderSoftwareScanContext(asset, rows){
  if(!DB.softwareFull?.available){
    return `<div class="alert alert-warning">
      Kein Full-Software-Scan geladen. Die Standardkarten zeigen nur kuratierte Einträge aus <code>software_standard.csv</code>.
    </div>`;
  }
  if(!asset){
    return `<div class="alert alert-danger">
      Full-Scan ohne eindeutige Asset-Zuordnung. Standardsoftware kann erst nach eindeutiger Zuordnung übernommen werden.
    </div>`;
  }
  const scanDetected = rows.filter(row => row.__scanStandard).length;
  const curated = rows.filter(row => !row.__scanStandard && !row.__profileMissing).length;
  return `<div class="alert alert-info d-flex justify-content-between align-items-center flex-wrap gap-2">
    <div><b>Scan-Kontext:</b> ${safeEscape(asset['Asset-ID'] || '-')} / ${safeEscape(asset['Gerätename'] || '-')} · ${curated} kuratierte Standardsoftware · ${scanDetected} erkannte Standardsoftware aus Full-Scan</div>
    <button class="btn btn-sm btn-outline-primary" onclick="setSoftwareView('full')">Full-Scan anzeigen</button>
  </div>`;
}

function renderSoftwareFullInventory(){
  const full = DB.softwareFull || {};
  const baseRows = softwareFullBaseRows();
  const categoryCounts = softwareFullCategoryCounts(baseRows);
  const classCounts = softwareFullClassCounts(baseRows);
  const rows = softwareFullRows();
  SOFTWARE_FULL_SELECTED = clamp(SOFTWARE_FULL_SELECTED, rows.length);
  const row = rows[SOFTWARE_FULL_SELECTED] || rows[0];
  const sources = full.sourcesStatus || {};
  const okCount = Object.values(sources).filter(v=>String(v).startsWith('OK')).length;
  const warnCount = Object.values(sources).filter(v=>String(v).startsWith('WARN')).length;
  const skippedCount = Object.values(sources).filter(v=>String(v).startsWith('SKIPPED')).length;
  if(!full.available){
    return `<div class="card"><div class="card-body">
      <h5>Full-Software-Scan</h5>
      <p class="text-muted mb-3">Es wurde noch keine ` + '`software_full.json`' + ` geladen. Starte im Admin Panel den Full-Software-Scan und lade danach die Seite neu.</p>
      <button class="btn btn-outline-primary" onclick="startScanner('software_full')">Full-Software-Scan starten</button>
    </div></div>`;
  }
  return `<div class="row g-3">
    <div class="col-12">
      <div class="card software-full-summary">
        <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 class="mb-1">Full-Software-Inventar</h5>
            <div class="text-muted">${safeEscape(full.asset?.['Gerätename'] || full.scannerContext?.CurrentUser || 'lokaler Scan')} · ${rows.length} angezeigte Einträge · ${categoryCounts.app} Anwendungen · ${categoryCounts.component} Komponenten · ${categoryCounts.system} System · ${classCounts.unclear || 0} unklare Funde</div>
          </div>
          <div class="software-source-pills">
            ${softwareFullScopeButton('apps','Anwendungen',categoryCounts.app)}
            ${softwareFullScopeButton('productivity','Produktiv',classCounts.productivity)}
            ${softwareFullScopeButton('admin','Admin/IT',classCounts.admin)}
            ${softwareFullScopeButton('development','Entwicklung',classCounts.development)}
            ${softwareFullScopeButton('security','Security',classCounts.security)}
            ${softwareFullScopeButton('drivers','Treiber',classCounts.driver)}
            ${softwareFullScopeButton('runtimes','Runtimes',classCounts.runtime)}
            ${softwareFullScopeButton('windows','Windows',classCounts.windows)}
            ${softwareFullScopeButton('services','Dienste',classCounts.service)}
            ${softwareFullScopeButton('unknown','Unklar',classCounts.unclear)}
            ${softwareFullScopeButton('all','Alle',baseRows.length)}
            <span class="badge text-bg-success">${okCount} OK</span>
            <span class="badge text-bg-warning">${warnCount} Warnung</span>
            <span class="badge text-bg-secondary">${skippedCount} übersprungen</span>
            <span class="badge text-bg-primary">${safeEscape(full.scannerContext?.ScanMode || '-')}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Inventar-Karten</span>
          <span class="badge text-bg-secondary">${rows.length}</span>
        </div>
        <div class="card-body software-card-list">
          ${rows.length ? rows.map((r,i)=>renderSoftwareFullListCard(r,i)).join('') : '<div class="text-muted">Keine Full-Scan-Einträge passend zur Suche.</div>'}
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      ${row ? renderSoftwareFullDetailCard(row, SOFTWARE_FULL_SELECTED, rows.length) : '<div class="card"><div class="card-body text-muted">Kein Eintrag ausgewählt.</div></div>'}
    </div>
  </div>`;
}

function softwareFullScopeButton(scope,label,count){
  return `<button class="btn btn-sm btn-outline-secondary ${SOFTWARE_FULL_SCOPE===scope?'active':''}" onclick="setSoftwareFullScope('${scope}')">${label} <span class="badge text-bg-light">${count || 0}</span></button>`;
}

function renderSoftwareFullListCard(r,i){
  const active = i === SOFTWARE_FULL_SELECTED ? 'active' : '';
  const hasUpdate = String(r.UpdateAvailable || '').toLowerCase() === 'true';
  const cls = hasUpdate ? 'danger' : String(r.ScanStatus || '').startsWith('OK') ? 'success' : 'warning';
  const risk = softwareFullRisk(r);
  const riskCls = risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : 'secondary';
  return `<div class="software-list-card ${active}" onclick="setSoftwareFullSelected(${i})">
    <div class="software-list-icon" title="${safeEscape(r.DisplayName || softwareFullDisplayName(r))}">${renderSoftwareFullLogo(r, 'list')}</div>
    <div class="software-list-main">
      <div class="software-list-title">${safeEscape(r.DisplayName || softwareFullDisplayName(r))}</div>
      <div class="software-list-sub">${safeEscape(r.Publisher || r.Hersteller || '-')} · ${safeEscape(softwareFullVersion(r) || '-')}</div>
      <div class="software-list-asset">${safeEscape(softwareFullClassLabel(r))} · ${safeEscape(r.PackageType || r.Pakettyp || '-')} · ${safeEscape(r.Sources || r.Source || '-')}</div>
    </div>
    <div class="d-flex flex-column align-items-end gap-1">
      <span class="badge text-bg-${cls}">${hasUpdate ? 'Update' : r.EntryCount>1 ? safeEscape(r.EntryCount + ' Quellen') : safeEscape(r.DetectionConfidence || 'Scan')}</span>
      <span class="badge text-bg-${riskCls}">${safeEscape(risk.toUpperCase())}</span>
    </div>
  </div>`;
}

function renderSoftwareFullDetailsMenu(row){
  const details = Array.isArray(row.ComponentDetails) ? row.ComponentDetails : [];
  if(details.length <= 1) return '';
  return `<details class="software-full-details mt-3">
    <summary>${details.length} zusammengeführte Einzelquellen anzeigen</summary>
    <div class="table-wrap mt-2">
      <table class="table table-sm">
        <thead><tr><th>Name</th><th>Version</th><th>Typ</th><th>Quelle</th></tr></thead>
        <tbody>
          ${details.map(item=>`<tr>
            <td>${safeEscape(item.DisplayName || item.Name || '-')}</td>
            <td>${safeEscape(softwareFullVersion(item) || '-')}</td>
            <td>${safeEscape(item.PackageType || item.Pakettyp || '-')}</td>
            <td>${safeEscape(item.Sources || item.Source || item.Quelle || '-')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </details>`;
}

function softwareFullIcon(row){
  const type = String(row.PackageType || row.Pakettyp || '').toLowerCase();
  const name = String(row.DisplayName || row.Name || '').toLowerCase();
  if(type.includes('driver')) return '🛠️';
  if(type.includes('service')) return '⚙️';
  if(type.includes('appx')) return '▣';
  if(type.includes('pip') || type.includes('npm')) return '{}';
  if(name.includes('chrome') || name.includes('firefox') || name.includes('edge')) return '🌐';
  return '◼';
}

function renderSoftwareFullDetailCard(row,idx,total){
  const asset = softwareFullAsset(row);
  const labels = softwareFullLabels(row);
  const risk = softwareFullRisk(row);
  const trust = softwareFullSourceTrust(row);
  const family = softwareFamilyParts(row);
  const riskCls = risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : 'secondary';
  const updateCls = String(row.UpdateAvailable || '').toLowerCase() === 'true' ? 'danger' : 'secondary';
  return `${navCustom(idx,total,'setSoftwareFullSelected')}
    <div class="card software-detail-card mt-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${renderSoftwareFullLogo(row, 'detail')}</div>
            <h3 class="mb-1">${safeEscape(row.DisplayName || softwareFullDisplayName(row))}</h3>
            <span class="badge text-bg-primary">${safeEscape(row.PackageType || row.Pakettyp || 'Scan')}</span>
            <span class="badge text-bg-secondary">${safeEscape(row.Scope || row.BenutzerKontext || '-')}</span>
            <span class="badge text-bg-info">${safeEscape(softwareFullClassLabel(row))}</span>
            <span class="badge text-bg-${riskCls}">Risiko: ${safeEscape(risk)}</span>
            <span class="badge text-bg-${updateCls}">${safeEscape(row.UpdateStatus || 'Update unbekannt')}</span>
            <span class="badge text-bg-dark">${safeEscape(softwareFullProfileStatus(row))}</span>
            <span class="badge text-bg-success">zugeordnet zu: ${safeEscape(asset?.['Gerätename'] || row['Gerätename'] || row['Asset-ID'] || '-')}</span>
          </div>
          <button class="btn btn-outline-warning ${asset ? '' : 'd-none'}" onclick="createScannerReviewNote(${idx})">Nacharbeit notieren</button>
        </div>
        ${labels.length ? `<div class="mt-3 d-flex flex-wrap gap-1">${labels.map(label=>`<span class="badge text-bg-light">${safeEscape(label)}</span>`).join('')}</div>` : ''}
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Software</h5>
            <div class="kv">
              ${kv('Anwendung',row.DisplayName || softwareFullDisplayName(row))}
              ${kv('Produktfamilie',family.family)}
              ${kv('Version',softwareFullVersion(row))}
              ${kv('Hersteller',normalizeManufacturer(row.Publisher || row.Hersteller))}
              ${kv('Klasse',softwareFullClassLabel(row))}
              ${kv('Risiko/Relevanz',risk)}
              ${kv('Quellenvertrauen',trust.level + ' - ' + trust.text)}
              ${kv('Normalisierter Update-Status',normalizeUpdateStatus(row))}
              ${kv('Profil-Abgleich',softwareFullProfileStatus(row))}
              ${kv('Update-Auswertung',softwareFullUpdateAssessment(row))}
              ${kv('Installierte Version',row.InstalledVersion || softwareFullVersion(row))}
              ${kv('Neueste Version',row.LatestVersion || '-')}
              ${kv('Update-Quelle',row.UpdateSource || '-')}
              ${kv('Pakettyp',row.PackageType || row.Pakettyp)}
              ${kv('Quelle',row.Sources || row.Source || row.Quelle)}
              ${kv('Scope',row.Scope || row.BenutzerKontext)}
              ${kv('Zusammengeführt',row.EntryCount > 1 ? row.EntryCount + ' Rohquellen' : 'Nein')}
              ${kv('Confidence',row.DetectionConfidence)}
              ${kv('Status',row.ScanStatus)}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Zugeordnetes Asset</h5>
            <div class="kv">
              ${kv('Asset-ID',asset?.['Asset-ID'] || row['Asset-ID'])}
              ${kv('Gerätename',asset?.['Gerätename'] || row['Gerätename'])}
              ${kv('Typ',asset?.['Asset-Typ'] || '-')}
              ${kv('Standort',asset ? ((asset.Standort || '-') + ' / ' + (asset.Raum || '-')) : '-')}
              ${kv('Nutzer',asset?.Hauptnutzer || '-')}
              ${kv('Status',asset?.Status || '-')}
            </div>
          </div>
        </div>
        ${renderSoftwareFullAssetSummary(row)}
        ${renderSoftwareFullDetailsMenu(row)}
        <div class="software-raw-path mt-3">${safeEscape(row.InstallLocation || row.RawPath || row.RawSourceKey || '')}</div>
      </div>
    </div>`;
}

function renderSoftwareFullAssetSummary(row){
  const asset = softwareFullAsset(row);
  if(!asset) return '';
  const allRows = compactSoftwareFullRows(softwareFullBaseRows().filter(r=>softwareFullAsset(r)?.['Asset-ID'] === asset['Asset-ID'] || softwareFullAsset(r)?.['Gerätename'] === asset['Gerätename']));
  const counts = allRows.reduce((acc,item)=>{
    const swClass = softwareFullClass(item);
    acc[swClass] = (acc[swClass] || 0) + 1;
    return acc;
  }, {});
  return `<div class="alert alert-light mt-3 mb-0">
    <b>Asset-Softwareprofil:</b>
    ${allRows.length} verdichtete Einträge,
    ${(counts.productivity || 0)} Produktiv,
    ${(counts.admin || 0)} Admin/IT,
    ${(counts.development || 0)} Entwicklung,
    ${(counts.security || 0)} Security,
    ${(counts.unclear || 0)} unklar.
  </div>`;
}

function softwareStatCard(title,value,color){
  return `<div class="col-md-3">
    <div class="card software-stat software-stat-${color}">
      <div class="card-body">
        <div class="software-stat-label">${title}</div>
        <div class="software-stat-value">${value}</div>
      </div>
    </div>
  </div>`;
}

function softwareStandardCardRows(rows){
  const asset = softwareExactScanAsset();
  if(!asset) return rows.map(row => ({...row, __profileMissing:false}));
  const installedRows = rows
    .filter(row => String(row['Asset-ID'] || '') === String(asset['Asset-ID']))
    .map(row => ({...row, __profileMissing:false}));
  const existing = new Set(installedRows.map(row => softwareProfileMatchKey(row)));
  const scanRows = softwareFullStandardRowsForAsset(asset)
    .filter(row => !softwareStandardExistsForFullRow(row, existing))
    .map(row => softwareScanStandardPlaceholder(row, asset));
  return installedRows.concat(scanRows);
}

function softwareExactScanAsset(){
  const full = DB.softwareFull || {};
  const assetInfo = full.asset || {};
  const rows = Array.isArray(full.rows) ? full.rows : [];
  const assetId = assetInfo['Asset-ID'] || singleNonEmptyValue(rows, 'Asset-ID');
  const deviceName = assetInfo['Gerätename'] || singleNonEmptyValue(rows, 'Gerätename');
  if(assetId){
    return CORE.findAsset(assetId) || {['Asset-ID']:assetId, ['Gerätename']:deviceName || assetId};
  }
  if(deviceName){
    return (DB.assets || []).find(a => String(a['Gerätename'] || '').toLowerCase() === String(deviceName).toLowerCase()) || {['Asset-ID']:'', ['Gerätename']:deviceName};
  }
  return null;
}

function singleNonEmptyValue(rows, field){
  const values = Array.from(new Set((rows || []).map(row => String(row?.[field] || '').trim()).filter(Boolean)));
  return values.length === 1 ? values[0] : '';
}

function softwareProfileMatchKey(row){
  const packageId = String(row.Bemerkung || '').match(/Paket-ID:\s*([^;]+)/i)?.[1] || row.PaketId || row.PackageId || row.PackageIdentifier || '';
  const name = softwareComparableName(row['Softwarename'] || row.DisplayName || row.Name || softwareFullDisplayName(row));
  return packageId ? 'pkg:' + String(packageId).toLowerCase() : 'name:' + name;
}

function softwareProfileItemMatchKey(item){
  return item.packageId ? 'pkg:' + String(item.packageId).toLowerCase() : 'name:' + softwareComparableName(item.software);
}

function softwareProfileItemNameKey(item){
  return 'name:' + softwareComparableName(item.software);
}

function softwareProfileItemExists(item, existingKeys){
  return existingKeys.has(softwareProfileItemMatchKey(item)) || existingKeys.has(softwareProfileItemNameKey(item));
}

function softwareComparableName(value){
  return String(value || '')
    .toLowerCase()
    .replace(/^microsoft\s+/, '')
    .replace(/^adobe\s+/, '')
    .replace(/\s+reader$/, ' reader')
    .replace(/\s+/g,' ')
    .trim();
}

function softwareFullStandardRowsForAsset(asset){
  if(!asset || !DB.softwareFull?.available) return [];
  return compactSoftwareFullRows(softwareFullBaseRows().filter(row =>
    (asset['Asset-ID'] && String(row['Asset-ID'] || '') === String(asset['Asset-ID'])) ||
    (asset['Gerätename'] && String(row['Gerätename'] || '').toLowerCase() === String(asset['Gerätename']).toLowerCase())
  )).filter(row => softwareStandardCatalogItemForFullRow(row));
}

function softwareStandardCatalogItemForFullRow(row){
  const profile = SMART_SOFTWARE_PROFILES.windows || [];
  const packageId = String(row.PaketId || row.PackageId || row.PackageIdentifier || row.RawSourceKey || '').toLowerCase();
  const name = softwareComparableName(row.DisplayName || softwareFullDisplayName(row) || row.Name);
  return profile.find(item => {
    if(!item || !item.software) return false;
    if(item.packageId && packageId && packageId.includes(String(item.packageId).toLowerCase())) return true;
    return softwareComparableName(item.software) === name;
  }) || null;
}

function softwareStandardExistsForFullRow(row, existingKeys){
  const item = softwareStandardCatalogItemForFullRow(row);
  if(item && softwareProfileItemExists(item, existingKeys)) return true;
  return existingKeys.has('name:' + softwareComparableName(row.DisplayName || softwareFullDisplayName(row) || row.Name));
}

function softwareScanStandardPlaceholder(row, asset){
  const item = softwareStandardCatalogItemForFullRow(row) || {};
  const packageId = item.packageId || row.PaketId || row.PackageId || row.RawSourceKey || '';
  return {
    'Software-ID': '',
    'Asset-ID': asset['Asset-ID'] || row['Asset-ID'] || '',
    'Gerätename': asset['Gerätename'] || row['Gerätename'] || '',
    'Softwarename': item.software || row.DisplayName || softwareFullDisplayName(row),
    'Version': softwareFullVersion(row) || row.Version || '',
    'Hersteller': item.vendor || normalizeManufacturer(row.Publisher || row.Hersteller || ''),
    'Lizenzstatus': 'Prüfen',
    'Update-Status': normalizeUpdateStatus(row) === 'Current' ? 'Aktuell' : 'Prüfen',
    'Kritikalität': ['runtime','security'].includes(softwareFullClass(row)) ? 'Hoch' : 'Normal',
    'Bemerkung': 'Aus Full-Scan als Standardsoftware erkannt.' + (packageId ? ' Paket-ID: ' + packageId : ''),
    __scanStandard: true,
    __fullRow: row,
    __profileItem: item
  };
}

function softwareProfilePlaceholder(item, assetId, deviceName){
  return {
    'Software-ID': '',
    'Asset-ID': assetId,
    'Gerätename': deviceName,
    'Softwarename': item.software,
    'Version': '',
    'Hersteller': item.vendor,
    'Lizenzstatus': 'Nicht zugeordnet',
    'Update-Status': 'Profil',
    'Kritikalität': ['vcRuntime','dotnetRuntime','dotnetSdk10','directx','bitlocker','windowsUpdates'].includes(item.key) ? 'Hoch' : 'Normal',
    'Bemerkung': 'Aus Standardsoftware-Profil erwartet.' + (item.packageId ? ' Paket-ID: ' + item.packageId : ''),
    __profileMissing: true,
    __profileItem: item
  };
}

function renderSoftwareCardsLayout(rows,row,idx,mod){
  const sectionedRows = renderSoftwareCardSections(rows, idx);
  return `<div class="row g-3">
    <div class="col-lg-5">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Software-Karten</span>
          <span class="badge text-bg-secondary">${rows.length}</span>
        </div>
        <div class="card-body software-card-list">
          ${rows.length ? sectionedRows : '<div class="text-muted">Keine Software vorhanden.</div>'}
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      ${row ? renderSoftwareDetailCard(row,idx,rows.length,mod) : '<div class="card"><div class="card-body text-muted">Kein Eintrag ausgewählt.</div></div>'}
    </div>
  </div>`;
}

function renderSoftwareCardSections(rows, idx){
  const curated = rows.map((row,index)=>({row,index})).filter(item => !item.row.__scanStandard && !item.row.__profileMissing);
  const scan = rows.map((row,index)=>({row,index})).filter(item => item.row.__scanStandard);
  const missing = rows.map((row,index)=>({row,index})).filter(item => item.row.__profileMissing);
  return [
    renderSoftwareCardSection('Kuratierte Standardsoftware', curated, idx, 'Bereits in software_standard.csv'),
    renderSoftwareCardSection('Aus Full-Scan erkannt', scan, idx, 'Noch nicht kuratiert'),
    renderSoftwareCardSection('Erwartet, aber nicht zugeordnet', missing, idx, 'Profilhinweis')
  ].filter(Boolean).join('');
}

function renderSoftwareCardSection(title, items, idx, subtitle){
  if(!items.length) return '';
  return `<div class="software-card-section">
    <div class="software-card-section-title">${safeEscape(title)} <span>${items.length}</span><small>${safeEscape(subtitle)}</small></div>
    ${items.map(item=>renderSoftwareListCard(item.row,item.index,idx)).join('')}
  </div>`;
}

function renderSoftwareListCard(r,i,idx){
  const cls = softwareStatusClass(r);
  return `<div class="software-list-card ${r.__profileMissing || r.__scanStandard ? 'software-profile-missing' : ''} ${i===idx?'active':''}" onclick="selectedIndex.software=${i};render();">
    <div class="software-list-icon">${softwareIcon(r)}</div>
    <div class="software-list-main">
      <div class="software-list-title">${safeEscape(r['Softwarename']||'Software')}</div>
      <div class="software-list-sub">${safeEscape(r['Hersteller']||'-')} · ${safeEscape(r['Version']||'-')}</div>
      <div class="software-list-asset">${safeEscape(r['Gerätename']||r['Asset-ID']||'-')}</div>
    </div>
    <span class="badge text-bg-${cls}">${softwareStatusLabel(r)}</span>
  </div>`;
}

function renderSoftwareDetailCard(row,idx,total,mod){
  if(row.__scanStandard) return renderSoftwareScanStandardDetailCard(row,idx,total);
  if(row.__profileMissing) return renderSoftwareProfileDetailCard(row,idx,total);
  const asset = CORE.findAsset(row['Asset-ID']);
  const cls = softwareStatusClass(row);
  const kbHint = softwareKnowledgeHint(row);
  return `${nav('software',idx,total)}
    <div class="card software-detail-card mt-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${softwareIcon(row)}</div>
            <h3 class="mb-1">${safeEscape(row['Softwarename']||'Software')}</h3>
            <span class="badge text-bg-primary">Software</span>
            <span class="badge text-bg-${cls}">${softwareStatusLabel(row)}</span>
            <span class="badge text-bg-success">zugeordnet zu: ${safeEscape(row['Gerätename']||row['Asset-ID']||'-')}</span>
          </div>
          <div class="d-flex gap-2 ${canWrite() ? '' : 'd-none'}">
            <button class="btn btn-outline-primary" onclick="openEdit('software',${idx})">Bearbeiten</button>
            <button class="btn btn-outline-danger" onclick="deleteRow('software',${idx})">Löschen</button>
          </div>
        </div>
        ${kbHint}
        ${renderSoftwareInstalledElsewhere(row)}
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Software</h5>
            <div class="kv">
              ${kv('Software-ID',row['Software-ID'])}
              ${kv('Anwendung',row['Softwarename'])}
              ${kv('Version',row['Version'])}
              ${kv('Hersteller',row['Hersteller'])}
              ${kv('Lizenzstatus',row['Lizenzstatus'])}
              ${kv('Update-Status',row['Update-Status'])}
              ${kv('Kritikalität',row['Kritikalität'])}
              ${kv('Bemerkung',row['Bemerkung'])}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Zugeordnetes Asset</h5>
            <div class="kv">
              ${kv('Asset-ID',row['Asset-ID'])}
              ${kv('Gerätename',asset?.['Gerätename']||row['Gerätename']||'-')}
              ${kv('Typ',asset?.['Asset-Typ']||'-')}
              ${kv('Standort',asset?(asset.Standort+' / '+asset.Raum):'-')}
              ${kv('Nutzer',asset?.Hauptnutzer||'-')}
              ${kv('Status',asset?.Status||'-')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderSoftwareScanStandardDetailCard(row,idx,total){
  const asset = CORE.findAsset(row['Asset-ID']);
  const packageId = row.__profileItem?.packageId || String(row.Bemerkung || '').match(/Paket-ID:\s*([^;]+)/i)?.[1] || '';
  return `${nav('software',idx,total)}
    <div class="card software-detail-card mt-3 software-profile-detail">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${softwareIcon(row)}</div>
            <h3 class="mb-1">${safeEscape(row['Softwarename'] || 'Software')}</h3>
            <span class="badge text-bg-info">Aus Full-Scan erkannt</span>
            <span class="badge text-bg-secondary">${safeEscape(row.__profileItem?.group || 'Standardsoftware')}</span>
            <span class="badge text-bg-success">Scan-Asset: ${safeEscape(row['Gerätename'] || row['Asset-ID'] || '-')}</span>
          </div>
          <button class="btn btn-primary ${canWrite() ? '' : 'd-none'}" onclick="acceptScannedStandardSoftware(${idx})">In Standardsoftware übernehmen</button>
        </div>
        ${renderSoftwareInstalledElsewhere(row)}
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Erkannte Standardsoftware</h5>
            <div class="kv">
              ${kv('Anwendung',row['Softwarename'])}
              ${kv('Version',row['Version'])}
              ${kv('Hersteller',row['Hersteller'])}
              ${kv('Rubrik',row.__profileItem?.group || '-')}
              ${kv('Winget-Paket-ID',packageId || '-')}
              ${kv('Update-Status',row['Update-Status'])}
              ${kv('Kritikalität',row['Kritikalität'])}
              ${kv('Bemerkung',row['Bemerkung'])}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Exaktes Scan-Asset</h5>
            <div class="kv">
              ${kv('Asset-ID',row['Asset-ID'])}
              ${kv('Gerätename',asset?.['Gerätename']||row['Gerätename']||'-')}
              ${kv('Typ',asset?.['Asset-Typ']||'-')}
              ${kv('Standort',asset?(asset.Standort+' / '+asset.Raum):'-')}
              ${kv('Nutzer',asset?.Hauptnutzer||'-')}
              ${kv('Status',asset?.Status||'-')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function acceptScannedStandardSoftware(cardIndex){
  if(!requireWriteAccess('Standardsoftware aus Scan übernehmen')) return;
  const rows = softwareStandardCardRows(filterRows(DB.software || [], 'software'));
  const row = rows[cardIndex];
  if(!row || !row.__scanStandard){
    notify('Kein übernehmbarer Scan-Standard ausgewählt.', 'warning');
    return;
  }
  if(!DB.software) DB.software = [];
  const exists = DB.software.some(existing =>
    String(existing['Asset-ID'] || '') === String(row['Asset-ID'] || '') &&
    softwareProfileMatchKey(existing) === softwareProfileMatchKey(row)
  );
  if(exists){
    notify('Diese Standardsoftware ist für das Asset bereits vorhanden.', 'info');
    return;
  }
  const preview = [
    'Scan-Standardsoftware übernehmen?',
    '',
    `Asset: ${row['Asset-ID'] || '-'} / ${row['Gerätename'] || '-'}`,
    `Software: ${row['Softwarename'] || '-'}`,
    `Version: ${row['Version'] || '-'}`,
    `Hersteller: ${row['Hersteller'] || '-'}`,
    '',
    'Es wird ein kuratierter Eintrag in software_standard.csv vorbereitet.'
  ].join('\n');
  if(!safetyConfirm('Standardsoftware aus Full-Scan übernehmen?', preview)) return;
  DB.software.push({
    'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
    'Asset-ID': row['Asset-ID'],
    'Gerätename': row['Gerätename'],
    'Softwarename': row['Softwarename'],
    'Version': row['Version'],
    'Hersteller': row['Hersteller'],
    'Lizenzstatus': row['Lizenzstatus'],
    'Update-Status': row['Update-Status'],
    'Kritikalität': row['Kritikalität'],
    'Bemerkung': row['Bemerkung']
  });
  persist();
  maybeSaveDbToServer();
  render();
  toast('Scan-Standardsoftware übernommen.');
}

function renderSoftwareProfileDetailCard(row,idx,total){
  const asset = CORE.findAsset(row['Asset-ID']);
  const item = row.__profileItem || {};
  const packageId = item.packageId || String(row.Bemerkung || '').match(/Paket-ID:\s*([^;]+)/i)?.[1] || '';
  return `${nav('software',idx,total)}
    <div class="card software-detail-card mt-3 software-profile-detail">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${softwareIcon(row)}</div>
            <h3 class="mb-1">${safeEscape(row['Softwarename'] || 'Software')}</h3>
            <span class="badge text-bg-info">Standardsoftware-Profil</span>
            <span class="badge text-bg-secondary">${safeEscape(item.group || 'Standardsoftware')}</span>
            <span class="badge text-bg-warning">noch nicht zugeordnet</span>
            <span class="badge text-bg-success">für: ${safeEscape(row['Gerätename'] || row['Asset-ID'] || '-')}</span>
          </div>
          <button class="btn btn-primary ${canWrite() ? '' : 'd-none'}" onclick="addSoftwareProfileItemToAsset('${safeEscape(item.key || '')}','${safeEscape(row['Asset-ID'] || '')}')">Zu Standardsoftware hinzufügen</button>
        </div>
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Profilpaket</h5>
            <div class="kv">
              ${kv('Anwendung',row['Softwarename'])}
              ${kv('Hersteller',row['Hersteller'])}
              ${kv('Rubrik',item.group || '-')}
              ${kv('Winget-Paket-ID',packageId || '-')}
              ${kv('Kritikalität',row['Kritikalität'])}
              ${kv('Bemerkung',row['Bemerkung'])}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Ziel-Asset</h5>
            <div class="kv">
              ${kv('Asset-ID',row['Asset-ID'])}
              ${kv('Gerätename',asset?.['Gerätename']||row['Gerätename']||'-')}
              ${kv('Typ',asset?.['Asset-Typ']||'-')}
              ${kv('Standort',asset?(asset.Standort+' / '+asset.Raum):'-')}
              ${kv('Nutzer',asset?.Hauptnutzer||'-')}
              ${kv('Status',asset?.Status||'-')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderSoftwareInstalledElsewhere(row){
  const currentAsset = String(row['Asset-ID'] || '');
  const needle = softwareComparableName(row['Softwarename'] || row.DisplayName || row.Name || '');
  if(!needle) return '';
  const standardHits = (DB.software || [])
    .filter(item => softwareComparableName(item['Softwarename']) === needle)
    .filter(item => String(item['Asset-ID'] || '') !== currentAsset)
    .map(item => ({assetId:item['Asset-ID'] || '', deviceName:item['Gerätename'] || '', version:item.Version || '-', source:'Standard'}));
  const fullHits = DB.softwareFull?.available ? compactSoftwareFullRows(softwareFullBaseRows())
    .filter(item => softwareComparableName(item.DisplayName || softwareFullDisplayName(item) || item.Name) === needle)
    .filter(item => String(item['Asset-ID'] || '') !== currentAsset)
    .map(item => ({assetId:item['Asset-ID'] || '', deviceName:item['Gerätename'] || '', version:softwareFullVersion(item) || '-', source:'Full-Scan'})) : [];
  const merged = new Map();
  standardHits.concat(fullHits).forEach(hit => {
    const key = (hit.assetId || '') + '|' + (hit.deviceName || '');
    if(key.replace('|','').trim() && !merged.has(key)) merged.set(key, hit);
  });
  const hits = Array.from(merged.values()).slice(0, 12);
  if(!hits.length) return '';
  return `<div class="alert alert-light mt-3">
    <b>Auch installiert auf:</b>
    <div class="d-flex flex-wrap gap-1 mt-2">
      ${hits.map(hit => `<span class="badge text-bg-secondary">${safeEscape(hit.assetId || '-')} / ${safeEscape(hit.deviceName || '-')} · ${safeEscape(hit.version)} · ${safeEscape(hit.source)}</span>`).join('')}
    </div>
  </div>`;
}

function addSoftwareProfileItemToAsset(itemKey, assetId){
  if(!requireWriteAccess('Standardsoftware hinzufügen')) return;
  const item = (SMART_SOFTWARE_PROFILES.windows || []).find(x => x.key === itemKey);
  const asset = CORE.findAsset(assetId);
  if(!item || !asset){
    notify('Profilpaket oder Asset nicht gefunden.', 'warning');
    return;
  }
  if(!DB.software) DB.software = [];
  const exists = DB.software.some(row => String(row['Asset-ID'] || '') === String(assetId) && softwareProfileMatchKey(row) === softwareProfileItemMatchKey(item));
  if(exists){
    notify('Dieses Paket ist für das Asset bereits zugeordnet.', 'info');
    return;
  }
  DB.software.push({
    'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
    'Asset-ID': assetId,
    'Gerätename': asset['Gerätename'] || '',
    'Softwarename': item.software,
    'Version': '',
    'Hersteller': item.vendor,
    'Lizenzstatus': 'Prüfen',
    'Update-Status': 'Prüfen',
    'Kritikalität': ['vcRuntime','dotnetRuntime','dotnetSdk10','directx','bitlocker','windowsUpdates'].includes(item.key) ? 'Hoch' : 'Normal',
    'Bemerkung': 'Aus Standardsoftware-Profil erstellt.' + (item.packageId ? ' Paket-ID: ' + item.packageId : '')
  });
  persist();
  maybeSaveDbToServer();
  selectedIndex.software = DB.software.length - 1;
  render();
  toast('Standardsoftware zugeordnet.');
}

function softwareKnowledgeHint(row){
  const text = String((row['Softwarename']||'') + ' ' + (row['Bemerkung']||'')).toLowerCase();
  if(text.includes('adobe') && (text.includes('zertifikat') || text.includes('signatur') || text.includes('fehlt'))){
    const kb = findKnowledgeByTitle('Adobe Signatur-Zertifikat installieren');
    if(kb){
      return `<div class="alert alert-warning mt-3">⚠ Signatur/Zertifikat relevant · Knowledge vorhanden: <b>${kb['Knowledge-ID']}</b> – ${safeEscape(kb.Titel)}</div>`;
    }
    return `<div class="alert alert-warning mt-3">⚠ Signatur/Zertifikat relevant · <button class="btn btn-sm btn-outline-warning" onclick="createKnowledgeForSoftware('Adobe Signatur-Zertifikat installieren')">Knowledge erstellen</button></div>`;
  }
  return '';
}

function openSoftwareProfileCreate(){
  if(!requireWriteAccess('Standardsoftware hinzufügen')) return;
  const assets = DB.assets || [];
  const html = `<div class="modal fade" id="softwareProfileModal" tabindex="-1"><div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Standardsoftware hinzufügen</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <label class="form-label">Asset</label>
      <select id="profileAsset" class="form-select mb-3">
        ${assets.map(a=>`<option value="${safeEscape(a['Asset-ID'])}">${safeEscape(a['Asset-ID'])} – ${safeEscape(a['Gerätename'])}</option>`).join('')}
      </select>
      <div class="alert alert-info">Wähle typische Software aus. Beim Speichern werden einzelne Software-Einträge erzeugt.</div>
      <div class="software-smart-grid">
        ${SMART_SOFTWARE_PROFILES.windows.map(item=>`<label class="software-smart-card">
          <input type="checkbox" class="profileSoft" value="${safeEscape(item.key)}" data-name="${safeEscape(item.software)}" data-vendor="${safeEscape(item.vendor)}" data-package-id="${safeEscape(item.packageId || '')}">
          <b>${softwareGroupIcon(item.group)} ${safeEscape(item.label)}</b><br>
          <span class="software-meta">${safeEscape(item.vendor)} · ${safeEscape(item.software)}</span>
        </label>`).join('')}
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button><button class="btn btn-primary" onclick="saveSoftwareProfile()">Speichern</button></div>
  </div></div></div>`;
  document.getElementById('dynamicModalHost')?.remove();
  const host=document.createElement('div');host.id='dynamicModalHost';host.innerHTML=html;document.body.appendChild(host);
  new bootstrap.Modal(document.getElementById('softwareProfileModal')).show();
}

function saveSoftwareProfile(){
  if(!requireWriteAccess('Standardsoftware speichern')) return;
  const assetId = document.getElementById('profileAsset').value;
  const asset = CORE.findAsset(assetId);
  document.querySelectorAll('.profileSoft:checked').forEach(el=>{
    DB.software.push({
      'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
      'Asset-ID': assetId,
      'Gerätename': asset?.['Gerätename'] || '',
      'Softwarename': el.dataset.name || el.value,
      'Version': '',
      'Hersteller': el.dataset.vendor || '',
      'Lizenzstatus': 'Aktiv',
      'Update-Status': 'Prüfen',
      'Kritikalität': ['vcRuntime','dotnetRuntime','vpnClient','bitlocker'].includes(el.value) ? 'Hoch' : 'Normal',
       'Bemerkung': 'Aus Standardsoftware-Profil erstellt.' + (el.dataset.packageId ? ' Paket-ID: ' + el.dataset.packageId : '')
    });
  });
  persist();
  if(typeof maybeSaveDbToServer === 'function') maybeSaveDbToServer(); else saveDbToServer();
  bootstrap.Modal.getInstance(document.getElementById('softwareProfileModal')).hide();
  activeKey='software';
  renderAll();
  toast('Standardsoftware hinzugefügt.');
}

function renderLinkedModule(mod){if(mod.key==='software')return renderSoftwareModern();const sourceRows=DB[mod.key]||[];const rows=filterRows(sourceRows,mod.key);const idx=clamp(selectedIndex[mod.key],rows.length);selectedIndex[mod.key]=idx;const row=rows[idx]||null;return contextHeader(mod)+renderListControls(mod.key,sourceRows)+toolbar(mod,row,idx)+renderSplit(mod.key,rows,moduleColumns(mod.key),row,renderModuleCard(mod,row,idx,rows.length));}
function renderSimpleModule(mod){const sourceRows=DB[mod.key]||[];const rows=filterRows(sourceRows,mod.key);const idx=clamp(selectedIndex[mod.key],rows.length);selectedIndex[mod.key]=idx;const row=rows[idx]||null;return renderListControls(mod.key,sourceRows)+toolbar(mod,row,idx)+renderSplit(mod.key,rows,moduleColumns(mod.key),row,renderGenericCard(mod,row,idx,rows.length));}
function renderSplit(key,rows,cols,row,cardHtml){
  const empty = rows.length === 0
    ? `<tr><td colspan="${Math.max(cols.length,1)}">${emptyStateFor(key)}</td></tr>`
    : '';
  return `<div class="split"><div><div class="card"><div class="card-header">Liste</div><div class="card-body"><div class="table-wrap"><table class="table table-sm table-hover data-table"><thead><tr>${cols.map(c=>`<th>${safeEscape(c)}</th>`).join('')}</tr></thead><tbody>${empty || renderGroupedRows(key, rows, cols)}</tbody></table></div></div></div></div><div>${cardHtml}</div></div>`;
}
function renderGroupedRows(key, rows, cols){
  const group = listState(key).group;
  let last = null;
  return rows.map((r,i)=>{
    const current = group && group !== 'none' ? groupValue(key, r, group) : null;
    const header = current && current !== last ? `<tr class="table-group-row"><td colspan="${Math.max(cols.length,1)}">${safeEscape(current)}</td></tr>` : '';
    last = current || last;
    return header + `<tr class="${i===selectedIndex[key]?'active':''}" onclick="selectRow('${key}',${i})">${cols.map(c=>`<td>${formatCell(r,c)}</td>`).join('')}</tr>`;
  }).join('');
}
function groupValue(key,row,group){
  if(group === 'family') return softwareFamilyParts(row).family || 'Ohne Produktfamilie';
  return row[group] || 'Ohne Wert';
}
