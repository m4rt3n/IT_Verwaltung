// Device creation wizard and smart software checklist profile.

const SMART_SOFTWARE_PROFILES = {
  windows: [
    {key:'firefox', label:'Firefox installiert', vendor:'Mozilla', software:'Firefox', group:'Browser'},
    {key:'chrome', label:'Chrome installiert', vendor:'Google', software:'Chrome', group:'Browser'},
    {key:'edge', label:'Microsoft Edge installiert', vendor:'Microsoft', software:'Microsoft Edge', group:'Browser', packageId:'Microsoft.Edge'},
    {key:'brave', label:'Brave installiert', vendor:'Brave', software:'Brave', group:'Browser', packageId:'Brave.Brave'},
    {key:'adobe', label:'Adobe Reader installiert', vendor:'Adobe', software:'Acrobat Reader', group:'PDF / Signatur', children:[
      {key:'adobeCertRequired', label:'Signatur-Zertifikat benötigt'},
      {key:'adobeCertInstalled', label:'Signatur-Zertifikat installiert'}
    ], knowledgeTitle:'Adobe Signatur-Zertifikat installieren'},
    {key:'office', label:'Microsoft Office installiert', vendor:'Microsoft', software:'Microsoft Office', group:'Office', children:[
      {key:'officeActivated', label:'Office aktiviert / lizenziert'}
    ]},
    {key:'libreoffice', label:'LibreOffice installiert', vendor:'The Document Foundation', software:'LibreOffice', group:'Office', packageId:'TheDocumentFoundation.LibreOffice'},
    {key:'libreofficeHelp', label:'LibreOffice HelpPack installiert', vendor:'The Document Foundation', software:'LibreOffice HelpPack', group:'Office', packageId:'TheDocumentFoundation.LibreOffice.HelpPack'},
    {key:'thunderbird', label:'Thunderbird installiert', vendor:'Mozilla', software:'Thunderbird', group:'Office', packageId:'Mozilla.Thunderbird.de'},
    {key:'notepadpp', label:'Notepad++ installiert', vendor:'Notepad++', software:'Notepad++', group:'Office', packageId:'Notepad++.Notepad++'},
    {key:'vlc', label:'VLC installiert', vendor:'VideoLAN', software:'VLC media player', group:'Medien', packageId:'VideoLAN.VLC'},
    {key:'paintdotnet', label:'Paint.NET installiert', vendor:'dotPDN', software:'Paint.NET', group:'Medien', packageId:'dotPDN.PaintDotNet'},
    {key:'gimp', label:'GIMP installiert', vendor:'GIMP', software:'GIMP', group:'Medien', packageId:'GIMP.GIMP.3'},
    {key:'screenpresso', label:'Screenpresso installiert', vendor:'Learnpulse', software:'Screenpresso', group:'Medien', packageId:'Learnpulse.Screenpresso'},
    {key:'obsStudio', label:'OBS Studio installiert', vendor:'OBS Project', software:'OBS Studio', group:'Medien', packageId:'OBSProject.OBSStudio'},
    {key:'appInstaller', label:'Microsoft App Installer installiert', vendor:'Microsoft', software:'Microsoft App Installer', group:'Paketmanager', packageId:'Microsoft.AppInstaller'},
    {key:'uniget', label:'UniGet / WinGet installiert', vendor:'Microsoft', software:'UniGet / WinGet', group:'Paketmanager', packageId:'MartiCliment.UniGetUI'},
    {key:'chocolatey', label:'Chocolatey installiert', vendor:'Chocolatey', software:'Chocolatey', group:'Paketmanager', packageId:'Chocolatey.Chocolatey'},
    {key:'chocolateyGui', label:'Chocolatey GUI installiert', vendor:'Chocolatey', software:'Chocolatey GUI', group:'Paketmanager', packageId:'Chocolatey.ChocolateyGUI'},
    {key:'powershell', label:'PowerShell installiert', vendor:'Microsoft', software:'PowerShell', group:'Systemtools', packageId:'Microsoft.PowerShell'},
    {key:'terminal', label:'Windows Terminal installiert', vendor:'Microsoft', software:'Windows Terminal', group:'Systemtools', packageId:'Microsoft.WindowsTerminal'},
    {key:'powertoys', label:'PowerToys installiert', vendor:'Microsoft', software:'PowerToys', group:'Systemtools', packageId:'Microsoft.PowerToys'},
    {key:'sysinternals', label:'Sysinternals installiert', vendor:'Microsoft', software:'Sysinternals', group:'Systemtools', packageId:'Microsoft.Sysinternals'},
    {key:'pcHealthCheck', label:'Windows PC Health Check installiert', vendor:'Microsoft', software:'Windows PC Health Check', group:'Systemtools', packageId:'Microsoft.WindowsPCHealthCheck'},
    {key:'supportRecovery', label:'Support and Recovery Assistant installiert', vendor:'Microsoft', software:'Support and Recovery Assistant', group:'Systemtools', packageId:'Microsoft.SupportAndRecoveryAssistant'},
    {key:'windowsInstallationAssistant', label:'Windows Installation Assistant installiert', vendor:'Microsoft', software:'Windows Installation Assistant', group:'Systemtools', packageId:'Microsoft.WindowsInstallationAssistant'},
    {key:'crystalDiskInfo', label:'CrystalDiskInfo installiert', vendor:'Crystal Dew World', software:'CrystalDiskInfo', group:'Diagnose', packageId:'CrystalDewWorld.CrystalDiskInfo'},
    {key:'cpuZ', label:'CPU-Z installiert', vendor:'CPUID', software:'CPU-Z', group:'Diagnose', packageId:'CPUID.CPU-Z'},
    {key:'hwinfo', label:'HWiNFO installiert', vendor:'REALiX', software:'HWiNFO', group:'Diagnose', packageId:'REALiX.HWiNFO'},
    {key:'driverBooster', label:'Driver Booster installiert', vendor:'IObit', software:'Driver Booster', group:'Diagnose', packageId:'IObit.DriverBooster'},
    {key:'vcRuntime2005x86', label:'Visual C++ 2005 x86 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2005 x86', group:'Runtimes', packageId:'Microsoft.VCRedist.2005.x86'},
    {key:'vcRuntime2005x64', label:'Visual C++ 2005 x64 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2005 x64', group:'Runtimes', packageId:'Microsoft.VCRedist.2005.x64'},
    {key:'vcRuntime2008x86', label:'Visual C++ 2008 x86 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2008 x86', group:'Runtimes', packageId:'Microsoft.VCRedist.2008.x86'},
    {key:'vcRuntime2008x64', label:'Visual C++ 2008 x64 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2008 x64', group:'Runtimes', packageId:'Microsoft.VCRedist.2008.x64'},
    {key:'vcRuntime2010x86', label:'Visual C++ 2010 x86 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2010 x86', group:'Runtimes', packageId:'Microsoft.VCRedist.2010.x86'},
    {key:'vcRuntime2010x64', label:'Visual C++ 2010 x64 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2010 x64', group:'Runtimes', packageId:'Microsoft.VCRedist.2010.x64'},
    {key:'vcRuntime2012x86', label:'Visual C++ 2012 x86 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2012 x86', group:'Runtimes', packageId:'Microsoft.VCRedist.2012.x86'},
    {key:'vcRuntime2012x64', label:'Visual C++ 2012 x64 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2012 x64', group:'Runtimes', packageId:'Microsoft.VCRedist.2012.x64'},
    {key:'vcRuntime2013x86', label:'Visual C++ 2013 x86 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2013 x86', group:'Runtimes', packageId:'Microsoft.VCRedist.2013.x86'},
    {key:'vcRuntime2013x64', label:'Visual C++ 2013 x64 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2013 x64', group:'Runtimes', packageId:'Microsoft.VCRedist.2013.x64'},
    {key:'vcRuntime2015x86', label:'Visual C++ 2015+ x86 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2015+ x86', group:'Runtimes', packageId:'Microsoft.VCRedist.2015+.x86'},
    {key:'vcRuntime2015x64', label:'Visual C++ 2015+ x64 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable 2015+ x64', group:'Runtimes', packageId:'Microsoft.VCRedist.2015+.x64'},
    {key:'vcRuntime', label:'Visual C++ Runtime-Basis geprüft', vendor:'Microsoft', software:'Visual C++ Redistributable', group:'Runtimes'},
    {key:'dotnetRuntime', label:'.NET Runtime installiert', vendor:'Microsoft', software:'.NET Runtime', group:'Runtimes'},
    {key:'dotnetSdk10', label:'.NET SDK 10 installiert', vendor:'Microsoft', software:'.NET SDK 10', group:'Runtimes', packageId:'Microsoft.DotNet.SDK.10'},
    {key:'directx', label:'DirectX installiert', vendor:'Microsoft', software:'DirectX', group:'Runtimes', packageId:'Microsoft.DirectX'},
    {key:'sevenZip', label:'7-Zip installiert', vendor:'7-Zip', software:'7-Zip', group:'Tools', packageId:'7zip.7zip'},
    {key:'devHome', label:'Dev Home installiert', vendor:'Microsoft', software:'Dev Home', group:'Entwicklung', packageId:'Microsoft.DevHome'},
    {key:'vscode', label:'Visual Studio Code installiert', vendor:'Microsoft', software:'Visual Studio Code', group:'Entwicklung', packageId:'Microsoft.VisualStudioCode'},
    {key:'vscodeCli', label:'Visual Studio Code CLI installiert', vendor:'Microsoft', software:'Visual Studio Code CLI', group:'Entwicklung', packageId:'Microsoft.VisualStudioCode.CLI'},
    {key:'anaconda', label:'Anaconda installiert', vendor:'Anaconda', software:'Anaconda', group:'Entwicklung', packageId:'Anaconda.Anaconda3'},
    {key:'rstudio', label:'RStudio installiert', vendor:'Posit', software:'RStudio', group:'Entwicklung', packageId:'Posit.RStudio'},
    {key:'mysqlWorkbench', label:'MySQL Workbench installiert', vendor:'Oracle', software:'MySQL Workbench', group:'Entwicklung', packageId:'Oracle.MySQLWorkbench'},
    {key:'pythonLauncher', label:'Python Launcher installiert', vendor:'Python', software:'Python Launcher', group:'Entwicklung', packageId:'Python.Launcher'},
    {key:'jdk25', label:'Oracle JDK 25 installiert', vendor:'Oracle', software:'Oracle JDK 25', group:'Entwicklung', packageId:'Oracle.JDK.25'},
    {key:'wsl', label:'Windows Subsystem for Linux installiert', vendor:'Microsoft', software:'Windows Subsystem for Linux', group:'Entwicklung', packageId:'Microsoft.WSL'},
    {key:'windowsAdk', label:'Windows ADK installiert', vendor:'Microsoft', software:'Windows ADK', group:'Entwicklung', packageId:'Microsoft.WindowsADK'},
    {key:'autoIt', label:'AutoIt installiert', vendor:'AutoIt', software:'AutoIt', group:'Entwicklung', packageId:'AutoIt.AutoIt'},
    {key:'weka', label:'Weka installiert', vendor:'University of Waikato', software:'Weka', group:'Entwicklung', packageId:'UniversityOfWaikato.Weka'},
    {key:'vpnClient', label:'VPN Client installiert', vendor:'OpenVPN/Fortinet', software:'VPN Client', group:'Netzwerk'},
    {key:'printerDrivers', label:'Druckertreiber installiert', vendor:'Hersteller', software:'Druckertreiber', group:'Drucker'},
    {key:'bitlocker', label:'BitLocker aktiv', vendor:'Microsoft', software:'BitLocker', group:'Security'},
    {key:'windowsUpdates', label:'Windows Updates aktuell', vendor:'Microsoft', software:'Windows Update', group:'Security'}
  ],
  linux: [
    {key:'firefox', label:'Firefox installiert', vendor:'Mozilla', software:'Firefox', group:'Browser'},
    {key:'chrome', label:'Chrome/Chromium installiert', vendor:'Google/Open Source', software:'Chrome/Chromium', group:'Browser'},
    {key:'libreoffice', label:'LibreOffice installiert', vendor:'The Document Foundation', software:'LibreOffice', group:'Office'},
    {key:'pdfViewer', label:'PDF Viewer installiert', vendor:'Open Source', software:'PDF Viewer', group:'PDF'},
    {key:'cups', label:'CUPS / Drucker eingerichtet', vendor:'Open Source', software:'CUPS', group:'Drucker'},
    {key:'vpnClient', label:'VPN Client installiert', vendor:'OpenVPN/WireGuard', software:'VPN Client', group:'Netzwerk'},
    {key:'updates', label:'Systemupdates aktuell', vendor:'Linux', software:'Package Updates', group:'Security'}
  ],
  mac: [
    {key:'firefox', label:'Firefox installiert', vendor:'Mozilla', software:'Firefox', group:'Browser'},
    {key:'chrome', label:'Chrome installiert', vendor:'Google', software:'Chrome', group:'Browser'},
    {key:'office', label:'Microsoft Office installiert', vendor:'Microsoft', software:'Microsoft Office', group:'Office'},
    {key:'adobe', label:'Adobe Reader installiert', vendor:'Adobe', software:'Acrobat Reader', group:'PDF / Signatur', children:[
      {key:'adobeCertRequired', label:'Signatur-Zertifikat benötigt'},
      {key:'adobeCertInstalled', label:'Signatur-Zertifikat installiert'}
    ], knowledgeTitle:'Adobe Signatur-Zertifikat macOS installieren'},
    {key:'homebrew', label:'Homebrew installiert', vendor:'Open Source', software:'Homebrew', group:'Systemtools'},
    {key:'vpnClient', label:'VPN Client installiert', vendor:'OpenVPN/Fortinet', software:'VPN Client', group:'Netzwerk'},
    {key:'keychainCert', label:'Zertifikat im Schlüsselbund installiert', vendor:'Apple', software:'Keychain Certificate', group:'Security'}
  ],
  generic: [
    {key:'browser', label:'Browser installiert', vendor:'-', software:'Browser', group:'Basis'},
    {key:'office', label:'Office/PDF Basis vorhanden', vendor:'-', software:'Office/PDF', group:'Basis'},
    {key:'updates', label:'Updates/Firmware aktuell', vendor:'-', software:'Update/Firmware', group:'Basis'}
  ]
};
function getOsProfileName(){
  const os = ((wizard && wizard.data && wizard.data.grund && wizard.data.grund.Betriebssystem) || '').toLowerCase();
  if(os.includes('windows')) return 'windows';
  if(os.includes('linux') || os.includes('ubuntu') || os.includes('debian')) return 'linux';
  if(os.includes('mac')) return 'mac';
  return 'generic';
}
function ensureSmartSoftwareState(){
  if(!wizard || !wizard.data) return;
  if(!wizard.data.smartSoftware) wizard.data.smartSoftware = {};
  const profile = SMART_SOFTWARE_PROFILES[getOsProfileName()] || SMART_SOFTWARE_PROFILES.generic;
  profile.forEach(item=>{
    if(typeof wizard.data.smartSoftware[item.key] === 'undefined') wizard.data.smartSoftware[item.key] = false;
    (item.children||[]).forEach(ch=>{
      if(typeof wizard.data.smartSoftware[ch.key] === 'undefined') wizard.data.smartSoftware[ch.key] = false;
    });
  });
}
function smartSoftwareToggle(key, checked){
  ensureSmartSoftwareState();
  wizard.data.smartSoftware[key] = !!checked;
  if(key === 'adobe' && !checked){
    wizard.data.smartSoftware.adobeCertRequired = false;
    wizard.data.smartSoftware.adobeCertInstalled = false;
  }
  if(key === 'adobeCertInstalled' && checked){
    wizard.data.smartSoftware.adobeCertRequired = true;
    wizard.data.smartSoftware.adobe = true;
  }
  renderWizard();
  if(window.jQuery && (!APP_SETTINGS || APP_SETTINGS.animations)){
    $('.software-smart-card').hide().fadeIn(130);
  }
}
function renderSmartSoftwareStep(){
  ensureSmartSoftwareState();
  const profileName = getOsProfileName();
  const profile = SMART_SOFTWARE_PROFILES[profileName] || SMART_SOFTWARE_PROFILES.generic;
  const grouped = {};
  profile.forEach(item=>{ if(!grouped[item.group]) grouped[item.group] = []; grouped[item.group].push(item); });
  return `<h4>Software</h4>
    <div class="alert alert-info software-smart-intro">OS-Profil: <b>${profileName.toUpperCase()}</b> · strukturierte Software-Checkliste statt Freitext.</div>
    <div class="software-smart-grid">
      ${Object.entries(grouped).map(([group,items])=>`
        <div class="software-smart-group">
          <div class="software-smart-group-title">${softwareGroupIcon(group)} ${group}</div>
          ${items.map(renderSmartSoftwareItem).join('')}
        </div>`).join('')}
    </div>
    <div class="software-smart-extra mt-3">
      <label class="form-label">Zusatzsoftware / Bemerkung</label>
      <textarea id="wizSoftware" class="form-control" rows="5" placeholder="Optional: eine Software pro Zeile, z. B. Firefox;125;Mozilla">${(wizard.data.software||[]).join('\n')}</textarea>
    </div>
    ${renderSmartSoftwareWarnings()}`;
}
function renderSmartSoftwareItem(item){
  const state = wizard.data.smartSoftware || {};
  const checked = state[item.key] ? 'checked' : '';
  const childHtml = (item.children||[]).map(ch=>{
    const childChecked = state[ch.key] ? 'checked' : '';
    const disabled = item.key === 'adobe' && !state.adobe ? 'disabled' : '';
    return `<label class="software-child ${disabled}">
      <input type="checkbox" ${childChecked} ${disabled} onchange="smartSoftwareToggle('${ch.key}',this.checked)">
      ${ch.label}
    </label>`;
  }).join('');
  return `<div class="software-smart-card" data-softkey="${item.key}">
    <label class="software-main-toggle">
      <input type="checkbox" ${checked} onchange="smartSoftwareToggle('${item.key}',this.checked)">
      <span>${item.label}</span>
    </label>
    <div class="software-meta">${item.vendor} · ${item.software}</div>
    ${childHtml ? `<div class="software-children">${childHtml}</div>` : ''}
    ${item.knowledgeTitle ? renderKnowledgeAction(item) : ''}
  </div>`;
}
function renderKnowledgeAction(item){
  const state = wizard.data.smartSoftware || {};
  if(item.key === 'adobe' && state.adobe && state.adobeCertRequired && !state.adobeCertInstalled){
    const kb = findKnowledgeByTitle(item.knowledgeTitle);
    if(kb){
      return `<div class="software-warning">⚠ Zertifikat fehlt · Knowledge vorhanden: <b>${kb['Knowledge-ID']}</b></div>`;
    }
    return `<div class="software-warning">⚠ Zertifikat fehlt · <button type="button" class="btn btn-sm btn-outline-warning" onclick="createKnowledgeForSoftware('${item.knowledgeTitle}')">Knowledge erstellen</button></div>`;
  }
  return '';
}
function renderSmartSoftwareWarnings(){
  const state = wizard.data.smartSoftware || {};
  const warnings = [];
  if(state.adobe && state.adobeCertRequired && !state.adobeCertInstalled) warnings.push('Adobe Signatur-Zertifikat wird benötigt, ist aber noch nicht installiert.');
  if(state.office && !state.officeActivated) warnings.push('Office installiert, Aktivierung/Lizenzstatus noch offen.');
  if(!state.vcRuntime && getOsProfileName()==='windows') warnings.push('Visual C++ Runtime fehlt möglicherweise – häufige Ursache für Programmstartfehler.');
  return warnings.length ? `<div class="mt-3">${warnings.map(w=>`<div class="alert alert-warning py-2 software-alert">${w}</div>`).join('')}</div>` : '';
}
function softwareGroupIcon(group){
  const g = group.toLowerCase();
  if(g.includes('browser')) return '🌐';
  if(g.includes('pdf')) return '📄';
  if(g.includes('office')) return '📦';
  if(g.includes('runtime')) return '🧩';
  if(g.includes('system')) return '🛠️';
  if(g.includes('netzwerk')) return '🔐';
  if(g.includes('drucker')) return '🖨️';
  if(g.includes('security')) return '🛡️';
  return '✅';
}
function findKnowledgeByTitle(title){
  const needle = String(title || '').replace(/^AS-\d+\s*-\s*/i, '').trim().toLowerCase();
  return (DB.knowledge || []).find(k => String(k.Titel || '').replace(/^AS-\d+\s*-\s*/i, '').trim().toLowerCase() === needle);
}
function createKnowledgeForSoftware(title){
  if(!requireWriteAccess('Knowledge erstellen')) return;
  if(!DB.knowledge) DB.knowledge = [];
  const existing = findKnowledgeByTitle(title);
  if(existing){ toast('Knowledge existiert bereits.'); renderWizard(); return; }
  const id = nextId('knowledge','Knowledge-ID',ID_PREFIXES.knowledge);
  DB.knowledge.push({
    'Knowledge-ID': id, 'Titel': title, 'Kategorie': 'Software',
    'Tags': 'adobe;zertifikat;signatur;software',
    'Lösung': 'Zertifikat bereitstellen, in Adobe/Windows-Zertifikatsspeicher importieren, Signaturfunktion testen und Benutzer kurz einweisen.'
  });
  persist();
  if(typeof maybeSaveDbToServer === 'function') maybeSaveDbToServer(); else if(typeof saveDbToServer === 'function') saveDbToServer();
  toast('Knowledge-Eintrag erstellt.');
  renderWizard();
}
function smartSoftwareRowsForAsset(assetId, deviceName){
  ensureSmartSoftwareState();
  const state = wizard.data.smartSoftware || {};
  const profile = SMART_SOFTWARE_PROFILES[getOsProfileName()] || SMART_SOFTWARE_PROFILES.generic;
  const rows = [];
  profile.forEach(item=>{
    if(state[item.key]){
      rows.push({
        'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
        'Asset-ID': assetId, 'Gerätename': deviceName,
        'Softwarename': item.software, 'Version': '', 'Hersteller': item.vendor,
        'Lizenzstatus': item.key === 'office' ? (state.officeActivated ? 'Aktiv' : 'Prüfen') : 'Aktiv',
        'Update-Status': item.key === 'windowsUpdates' || item.key === 'updates' ? 'Aktuell' : 'Prüfen',
        'Kritikalität': ['vcRuntime','dotnetRuntime','vpnClient','bitlocker'].includes(item.key) ? 'Hoch' : 'Normal',
        'Bemerkung': smartSoftwareRemark(item.key, state) + (item.packageId ? ' Paket-ID: ' + item.packageId : '')
      });
    }
  });
  return rows;
}
function smartSoftwareRemark(key, state){
  if(key === 'adobe'){
    if(state.adobeCertRequired && state.adobeCertInstalled) return 'Adobe Signatur-Zertifikat installiert.';
    if(state.adobeCertRequired && !state.adobeCertInstalled) return 'Adobe Signatur-Zertifikat fehlt / Knowledge prüfen.';
  }
  if(key === 'office') return state.officeActivated ? 'Office aktiviert.' : 'Office installiert, Aktivierung prüfen.';
  return 'Aus Smart-Software-Checkliste erstellt.';
}

function openDeviceWizard(){if(!requireWriteAccess('Neues Gerät erfassen')) return;wizard={step:0,data:{type:'PC',grund:{Standort:STAMM.standorte?.[0]||'Bibliothek',Raum:STAMM.raeume?.[0]||'',Status:STAMM.status?.[0]||'Aktiv',Hauptnutzer:'',Hersteller:STAMM.hersteller?.[0]||'',Modellserie:'',Modell:'',Seriennummer:'',Inventarnummer:'',Betriebssystem:STAMM.betriebssysteme?.[0]||'Windows 11',Domäne:STAMM.domaenen?.[0]||'EAH',Ausmusterungsdatum:'',Defektbeschreibung:'',Notizen:''},hardware:{CPU:'',RAM:'',Speicher:'',Monitor:'',Dockingstation:'',Druckertyp:'',Toner:'',Zählerstand:'',PoE:'',Controller:'',GarantieBis:'',Bemerkung:''},netzwerk:{Netzwerktyp:STAMM.netzwerktypen?.[0]||'LAN',Adressart:'DHCP',Verbindungstyp:STAMM.verbindungstypen?.[0]||'LAN direkt Wanddose','IP-Adresse':'',DNS:'','MAC-Adresse':'',VLAN:STAMM.vlans?.[0]||'',SwitchPort:STAMM.switches?.[0]||'',Wanddose:'',AccessPoint:STAMM.accesspoints?.[0]||'',SSID:STAMM.ssids?.[0]||'',Bemerkung:''},software:[],smartSoftware:{},notiz:''}};renderWizard();new bootstrap.Modal(document.getElementById('deviceWizardModal')).show();}
function wizardSteps(){return ['Gerätetyp','Grunddaten','Hardware','Netzwerk','Software','Vorschau'];}
