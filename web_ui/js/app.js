const ID_PREFIXES = {
  assets:'AS-',
  hardware:'HW-',
  software:'SW-',
  netzwerk:'NET-',
  tickets:'TIC-',
  notizen:'NOTE-',
  knowledge:'KB-'
};
const ID_COLUMNS = ['Asset-ID','Hardware-ID','Software-ID','Netzwerk-ID','Ticket-ID','Notiz-ID','Knowledge-ID'];
const LEGACY_ID_PATTERN = /^(AS|HW|SW|NET|TIC|NOTE|KB)-\d{4}-(\d+)$/;

const SEED = {"assets": [{"Asset-ID": "AS-0001", "Gerätename": "EAH-BIB-PC-001", "Asset-Typ": "PC", "Standort": "Bibliothek", "Raum": "05.00.060", "Status": "Aktiv", "Hauptnutzer": "Max Mustermann", "Hersteller": "Dell", "Modell": "OptiPlex 7010", "Seriennummer": "SN-PC-001", "Inventarnummer": "INV-1001", "Betriebssystem": "Windows 11", "Domäne": "EAH", "Notizen": "Standardarbeitsplatz Ausleihe"}, {"Asset-ID": "AS-0002", "Gerätename": "EAH-BIB-DR-004", "Asset-Typ": "Drucker", "Standort": "Bibliothek", "Raum": "05.00.061", "Status": "Aktiv", "Hauptnutzer": "Team Bibliothek", "Hersteller": "Kyocera", "Modell": "TASKalfa 2554ci", "Seriennummer": "SN-DR-004", "Inventarnummer": "INV-1004", "Betriebssystem": "Embedded", "Domäne": "-", "Notizen": "Zentraler Drucker Sekretariat"}], "hardware": [{"Hardware-ID": "HW-0001", "Asset-ID": "AS-0001", "Gerätename": "EAH-BIB-PC-001", "CPU": "Intel Core i5-13500", "RAM": "16 GB DDR4", "Speicher": "512 GB NVMe SSD", "Monitor": "2x Dell P2422H", "Dockingstation": "Keine", "Garantie bis": "31.12.2028", "Bemerkung": "Dual-Monitor Arbeitsplatz"}, {"Hardware-ID": "HW-0002", "Asset-ID": "AS-0002", "Gerätename": "EAH-BIB-DR-004", "CPU": "Embedded", "RAM": "4 GB", "Speicher": "32 GB Flash", "Monitor": "-", "Dockingstation": "-", "Garantie bis": "31.12.2026", "Bemerkung": "Drucker"}], "netzwerk": [{"Netzwerk-ID": "NET-0001", "Asset-ID": "AS-0001", "Gerätename": "EAH-BIB-PC-001", "Netzwerktyp": "LAN", "Adressart": "DHCP", "Verbindungstyp": "LAN direkt Wanddose", "IP-Adresse": "", "MAC-Adresse": "00:11:22:33:44:01", "DNS": "EAH-BIB-PC-001.eah.local", "VLAN": "120", "Switch-Port": "SW-BIB-01 / Port 12", "Wanddose": "D-05.00.060-01", "Access Point": "-", "SSID": "-", "Bemerkung": "Patchkabel geprüft"}, {"Netzwerk-ID": "NET-0002", "Asset-ID": "AS-0002", "Gerätename": "EAH-BIB-DR-004", "Netzwerktyp": "LAN", "Adressart": "Statisch", "Verbindungstyp": "LAN direkt Wanddose", "IP-Adresse": "10.20.30.40", "MAC-Adresse": "00:11:22:33:44:04", "DNS": "drucker-bib.eah.local", "VLAN": "120", "Switch-Port": "SW-BIB-01 / Port 24", "Wanddose": "D-05.00.061-01", "Access Point": "-", "SSID": "-", "Bemerkung": "Feste Drucker-IP"}], "software": [{"Software-ID": "SW-0001", "Asset-ID": "AS-0001", "Gerätename": "EAH-BIB-PC-001", "Softwarename": "Microsoft Office", "Version": "2021", "Hersteller": "Microsoft", "Lizenzstatus": "Aktiv", "Update-Status": "Aktuell", "Kritikalität": "Mittel", "Bemerkung": "Standard Office"}], "tickets": [{"Ticket-ID": "TIC-0001", "Asset-ID": "AS-0001", "Gerätename": "EAH-BIB-PC-001", "Titel": "Kein Internet am PC", "Kategorie": "Netzwerk", "Priorität": "Normal", "Status": "Gelöst", "Tags": "netzwerk;lan;wanddose", "Ursache": "Patchkabel defekt", "Lösung": "Patchkabel getauscht und Link geprüft", "Knowledge-ID": "KB-0001"}, {"Ticket-ID": "TIC-0002", "Asset-ID": "AS-0002", "Gerätename": "EAH-BIB-DR-004", "Titel": "Drucker druckt nicht", "Kategorie": "Drucker", "Priorität": "Hoch", "Status": "Offen", "Tags": "drucker;treiber", "Ursache": "", "Lösung": "", "Knowledge-ID": ""}], "notizen": [{"Notiz-ID": "NOTE-0001", "Asset-ID": "AS-0001", "Gerätename": "EAH-BIB-PC-001", "Titel": "Arbeitsplatz Ausleihe", "Kategorie": "Betrieb", "Status": "Aktiv", "Inhalt": "Standardarbeitsplatz mit zwei Monitoren."}], "knowledge": [{"Knowledge-ID": "KB-0001", "Titel": "LAN-Verbindung fehlt", "Kategorie": "Netzwerk", "Tags": "netzwerk;lan;wanddose", "Lösung": "Patchkabel, Switch-Port und DNS prüfen."}]};
const STORAGE_KEY = 'itverwaltung-bootstrap-v7-conditional';
let DB = loadDb();
let CSV_BACKEND_AVAILABLE = false;
let SERVER_STATUS = {loaded:false, ok:false, node:null, table_files:{}, legacy_table_files:{}, error:null};
let ASSET_DETAIL_TAB = 'overview';

const APP_SETTINGS_KEY = 'itverwaltung-v25-settings';
let APP_SETTINGS = loadAppSettings();
let BUILD_INFO = {version:null, name:null, buildDate:null, features:[], loaded:false, error:null};

const HERSTELLER_TYPEN = {
  "Dell": ["PC","Notebook","Monitor","Dockingstation","Server","Workstation"],
  "Lenovo": ["PC","Notebook","Monitor","Dockingstation","Workstation"],
  "HP": ["PC","Notebook","Monitor","Drucker","Workstation"],
  "Fujitsu": ["PC","Notebook","Monitor","Workstation","Server"],
  "IGEL": ["Thin Client"],
  "Kyocera": ["Drucker"],
  "Canon": ["Drucker","Scanner"],
  "Brother": ["Drucker","Scanner"],
  "Ricoh": ["Drucker","Scanner"],
  "Ubiquiti": ["Access Point","Switch","Gateway"],
  "Microsoft": ["Software"],
  "Mozilla": ["Software"],
  "VMware": ["Software"]
};


const SOFTWARE_HERSTELLER = ["Microsoft","Mozilla","VMware","Adobe","Citavi","Oracle","Google","Open Source"];
const SOFTWARE_KATALOG = {
  "Microsoft": ["Microsoft Office","Teams","Edge","Visual Studio Code"],
  "Mozilla": ["Firefox","Thunderbird"],
  "VMware": ["Horizon Client","VMware Tools"],
  "Adobe": ["Acrobat Reader","Creative Cloud"],
  "Citavi": ["Citavi"],
  "Oracle": ["Java Runtime"],
  "Google": ["Chrome","Google Drive"],
  "Open Source": ["7-Zip","LibreOffice","GIMP"]
};
const MANUFACTURER_NORMALIZATION = {
  microsoft:'Microsoft', 'microsoft corporation':'Microsoft', ms:'Microsoft',
  adobe:'Adobe', 'adobe systems':'Adobe', 'adobe inc.':'Adobe',
  dell:'Dell', 'dell inc.':'Dell', 'dell computer corporation':'Dell',
  hp:'HP', 'hewlett-packard':'HP', 'hewlett packard':'HP',
  lenovo:'Lenovo', 'lenovo group':'Lenovo',
  fujitsu:'Fujitsu', kyocera:'Kyocera', canon:'Canon', brother:'Brother',
  mozilla:'Mozilla', google:'Google', oracle:'Oracle', vmware:'VMware'
};
function getSoftwareNamesForManufacturer(manufacturer){
  return SOFTWARE_KATALOG[manufacturer] || [];
}
function normalizeManufacturer(value){
  const raw = String(value || '').trim();
  const key = raw.toLowerCase().replace(/\s+/g,' ');
  const mapped = MANUFACTURER_NORMALIZATION[key] || raw;
  const stamm = STAMM?.hersteller || [];
  return stamm.find(x => x.toLowerCase() === mapped.toLowerCase()) || mapped;
}

const MODELLSERIEN = {
  "Fujitsu": {
    "PC": ["Esprimo"],
    "Notebook": ["Lifebook"],
    "Workstation": ["Celsius"],
    "Monitor": ["B-Line","P-Line"],
    "Server": ["Primergy"]
  },
  "Dell": {
    "PC": ["OptiPlex"],
    "Notebook": ["Latitude","Precision Mobile"],
    "Workstation": ["Precision"],
    "Monitor": ["P-Serie","U-Serie"],
    "Server": ["PowerEdge"]
  },
  "Lenovo": {
    "PC": ["ThinkCentre"],
    "Notebook": ["ThinkPad"],
    "Workstation": ["ThinkStation"],
    "Monitor": ["ThinkVision"],
    "Dockingstation": ["ThinkPad Dock"]
  },
  "HP": {
    "PC": ["EliteDesk","ProDesk"],
    "Notebook": ["EliteBook","ProBook","ZBook"],
    "Drucker": ["LaserJet","OfficeJet"],
    "Monitor": ["E-Serie","Z-Serie"]
  },
  "Kyocera": {
    "Drucker": ["ECOSYS","TASKalfa"]
  },
  "Ubiquiti": {
    "Access Point": ["UniFi U6","UniFi U7"],
    "Switch": ["UniFi Switch"],
    "Gateway": ["UniFi Gateway"]
  },
  "IGEL": {
    "Thin Client": ["UD3","UD7"]
  }
};

function getManufacturersForType(type){
  const allManufacturers = STAMM.hersteller || ['Dell','Lenovo','HP','Fujitsu','Kyocera','Ubiquiti','Microsoft','Mozilla','Adobe'];
  if(typeof HERSTELLER_TYPEN === 'undefined'){
    return allManufacturers;
  }
  const list = Object.entries(HERSTELLER_TYPEN)
    .filter(([name, types]) => Array.isArray(types) && types.includes(type))
    .map(([name]) => name);
  return list.length ? list : allManufacturers;
}
function getModelSeriesFor(type, manufacturer){
  if(typeof MODELLSERIEN === 'undefined') return [];
  return (MODELLSERIEN[manufacturer] && MODELLSERIEN[manufacturer][type])
    ? MODELLSERIEN[manufacturer][type]
    : [];
}
function addManufacturerForCurrentType(){
  const type = (wizard && wizard.data && wizard.data.type) ? wizard.data.type : 'PC';
  const name = prompt('Neuen Hersteller für Gerätetyp "' + type + '" anlegen:');
  if(!name || !name.trim()) return;
  const clean = name.trim();

  if(typeof HERSTELLER_TYPEN !== 'undefined'){
    if(!HERSTELLER_TYPEN[clean]) HERSTELLER_TYPEN[clean] = [];
    if(!HERSTELLER_TYPEN[clean].includes(type)) HERSTELLER_TYPEN[clean].push(type);
  }
  if(!STAMM.hersteller) STAMM.hersteller = [];
  if(!STAMM.hersteller.includes(clean)) STAMM.hersteller.push(clean);
  if(wizard && wizard.data && wizard.data.grund) wizard.data.grund.Hersteller = clean;
  toast('Hersteller ergänzt.');
  renderWizard();
}
function addModelSeriesForCurrentSelection(){
  const type = (wizard && wizard.data && wizard.data.type) ? wizard.data.type : 'PC';
  const manufacturer = (wizard && wizard.data && wizard.data.grund) ? wizard.data.grund.Hersteller : '';
  if(!manufacturer){ alert('Bitte zuerst Hersteller auswählen.'); return; }
  const name = prompt('Neue Modellserie für "' + manufacturer + '" / "' + type + '" anlegen:');
  if(!name || !name.trim()) return;
  const clean = name.trim();

  if(typeof MODELLSERIEN !== 'undefined'){
    if(!MODELLSERIEN[manufacturer]) MODELLSERIEN[manufacturer] = {};
    if(!MODELLSERIEN[manufacturer][type]) MODELLSERIEN[manufacturer][type] = [];
    if(!MODELLSERIEN[manufacturer][type].includes(clean)) MODELLSERIEN[manufacturer][type].push(clean);
  }
  if(wizard && wizard.data && wizard.data.grund) wizard.data.grund.Modellserie = clean;
  toast('Modellserie ergänzt.');
  renderWizard();
}

const fieldStamm = {'Asset-Typ':'assetTypen','Status':'status','Standort':'standorte','Raum':'raeume','Hersteller':'hersteller','Betriebssystem':'betriebssysteme','Domäne':'domaenen','Netzwerktyp':'netzwerktypen','Adressart':'adressarten','Verbindungstyp':'verbindungstypen','VLAN':'vlans','Switch-Port':'switches','Access Point':'accesspoints','SSID':'ssids','Lizenzstatus':'lizenzstatus','Update-Status':'updateStatus','Kritikalität':'kritikalitaet','Kategorie':'ticketKategorien','Priorität':'prioritaeten','Tags':'tags'};
const modules = [
  {key:'dashboard',title:'Dashboard',mode:'dashboard',editable:false,group:'main'},
  {key:'assets',title:'Assets',mode:'asset',id:'Asset-ID',prefix:ID_PREFIXES.assets,editable:true,group:'main'},
  {key:'hardware',title:'Hardware',mode:'module',id:'Hardware-ID',prefix:ID_PREFIXES.hardware,editable:true,group:'main',context:'hardware'},
  {key:'software',title:'Software',mode:'module',id:'Software-ID',prefix:ID_PREFIXES.software,editable:true,group:'main',context:'software'},
  {key:'netzwerk',title:'Netzwerk',mode:'module',id:'Netzwerk-ID',prefix:ID_PREFIXES.netzwerk,editable:true,group:'main',context:'network'},
  {key:'tickets',title:'Tickets',mode:'module',id:'Ticket-ID',prefix:ID_PREFIXES.tickets,editable:true,group:'support'},
  {key:'notizen',title:'Notizen',mode:'module',id:'Notiz-ID',prefix:ID_PREFIXES.notizen,editable:true,group:'support'},
  {key:'knowledge',title:'Knowledge',mode:'simple',id:'Knowledge-ID',prefix:ID_PREFIXES.knowledge,editable:true,group:'support'},
  {key:'help',title:'Hilfe',mode:'help',editable:false,group:'support'},
  {key:'adminpanel',title:'Admin Panel',mode:'adminpanel',editable:false,group:'admin'},
  {key:'stammdaten',title:'Stammdaten',mode:'stammdaten',editable:false,group:'admin'}
];
let activeKey='dashboard', searchText='', selectedIndex=Object.fromEntries(modules.map(m=>[m.key,0]));
let modalState={key:null,index:null,mode:null}, wizard={step:0,data:null};
let officeWizardState = null;
const LIST_STATE_KEY = 'itverwaltung-v44-list-state';
let LIST_STATE = loadListState();

function normalizeIdValue(value){
  const text = String(value || '');
  const match = text.match(LEGACY_ID_PATTERN);
  if(!match) return value;
  return match[1] + '-' + String(match[2]).padStart(4, '0');
}
function normalizeDbIds(db){
  if(!db || typeof db !== 'object') return db;
  ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'].forEach(key=>{
    if(!Array.isArray(db[key])) return;
    db[key].forEach(row=>{
      if(!row || typeof row !== 'object') return;
      ID_COLUMNS.forEach(col=>{
        if(row[col]) row[col] = normalizeIdValue(row[col]);
      });
    });
  });
  return db;
}
function loadDb(){try{return normalizeDbIds(JSON.parse(localStorage.getItem(STORAGE_KEY))||structuredClone(SEED));}catch{return normalizeDbIds(structuredClone(SEED));}}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(DB));}
function val(row,key,fallback='-'){return row&&row[key]?row[key]:fallback;}
function firstByAsset(key,id){return byAsset(key,id)[0]||null;}
function assetName(id){const a=DB.assets.find(x=>x['Asset-ID']===id);return a?a['Gerätename']:'-';}
function assetFor(row){return DB.assets.find(a=>a['Asset-ID']===row['Asset-ID']);}
function loadListState(){try{return JSON.parse(localStorage.getItem(LIST_STATE_KEY)) || {};}catch{return {};}}
function saveListState(){localStorage.setItem(LIST_STATE_KEY, JSON.stringify(LIST_STATE));}
function listState(key){if(!LIST_STATE[key]) LIST_STATE[key]={sort:'smart', group:'none', filterField:'', filterValue:'', savedView:''};return LIST_STATE[key];}
function setListState(key, prop, value){listState(key)[prop]=value;saveListState();selectedIndex[key]=0;render();}
function filterRows(rows,key=activeKey){const base = !searchText.trim()?rows:rows.filter(r=>Object.values(r).join(' ').toLowerCase().includes(searchText.toLowerCase()));return applyListState(key, base);}
function applyListState(key, rows){
  const state = listState(key);
  let out = [...rows];
  if(state.savedView === 'open_tickets') out = out.filter(r => r.Status === 'Offen');
  if(state.savedView === 'incomplete') out = out.filter(r => missingRequiredFields(key, r).length > 0);
  if(state.savedView === 'orphan') out = out.filter(r => key !== 'assets' && r['Asset-ID'] && !CORE.findAsset(r['Asset-ID']));
  if(state.savedView === 'scan_unknown') out = out.filter(r => key === 'assets' && !hasFullScanForAsset(r));
  if(state.savedView === 'scan_standard') out = out.filter(r => key === 'software' && /Full-Scan|Paket-ID:/i.test(String(r.Bemerkung || '')));
  if(state.filterField && state.filterValue) out = out.filter(r => String(r[state.filterField] || '') === state.filterValue);
  out.sort((a,b)=>multiSortRows(key,a,b,state.sort));
  return out;
}
function multiSortRows(key,a,b,mode){
  const status = String(a.Status || a['Update-Status'] || '').localeCompare(String(b.Status || b['Update-Status'] || ''), 'de');
  if(status && (mode === 'smart' || mode === 'status')) return status;
  const nameA = String(a['Gerätename'] || a.Softwarename || a.Titel || a['Asset-ID'] || '');
  const nameB = String(b['Gerätename'] || b.Softwarename || b.Titel || b['Asset-ID'] || '');
  if(mode === 'date') return String(b.Datum || b['Garantie bis'] || '').localeCompare(String(a.Datum || a['Garantie bis'] || ''), 'de');
  return nameA.localeCompare(nameB, 'de');
}
function missingRequiredFields(key,row){
  const fields = (typeof REQUIRED_FIELDS !== 'undefined' && REQUIRED_FIELDS[key]) ? REQUIRED_FIELDS[key] : [];
  return fields.filter(field => !String(row[field] || '').trim());
}
function hasFullScanForAsset(asset){
  const rows = softwareFullBaseRows ? softwareFullBaseRows() : [];
  return rows.some(row => row['Asset-ID'] === asset['Asset-ID'] || row['Gerätename'] === asset['Gerätename']);
}
function clamp(i,len){if(len<=0)return 0;if(i<0)return 0;if(i>=len)return len-1;return i;}
function nextId(key,idField,prefix){const nums=(DB[key]||[]).map(r=>r[idField]||'').map(id=>parseInt((id.match(/(\d+)$/)||['0','0'])[1],10));return prefix+(Math.max(0,...nums)+1).toString().padStart(4,'0');}
function deviceCode(type){return {'PC':'PC','Notebook':'NB','Thin Client':'IGEL','Drucker':'DR','Access Point':'AP','Switch':'SW','Monitor':'MON'}[type]||'DEV';}
function nextDeviceName(type,bereich='BIB'){return `EAH-${bereich}-${deviceCode(type)}-${(DB.assets.length+1).toString().padStart(3,'0')}`;}
function clearSearch(){document.getElementById('globalSearch').value='';searchText='';render();}
function runCoreSelfTest(){
  const missing = [];
  ['setPath','getPath','sel','f','manufacturerSelect','modelSeriesSelect','saveWizardFields','renderWizard','wizardStepHtml'].forEach(name=>{
    if(typeof window[name] !== 'function') missing.push(name);
  });
  if(missing.length){
    console.error('Core helper missing:', missing.join(', '));
    return false;
  }
  return true;
}


// ===== v44 SAFE SMART SOFTWARE LAYER =====
function renderSoftwareStatus(assetId){
  ensureSmartSoftwareDefaults();
  if(typeof DB === 'undefined' || !DB || !DB.stammdaten || !Array.isArray(DB.stammdaten.software)) return "";
  return DB.stammdaten.software.map(sw=>{
    const installed = isSoftwareInstalled(assetId, sw.name);
    const badge = installed ? '<span class="badge bg-success ms-2">installiert</span>' :
      sw.required ? '<span class="badge bg-danger ms-2">Pflicht fehlt</span>' :
      '<span class="badge bg-warning ms-2">fehlt</span>';
    return `<div class="software-status-row">${sw.name} ${badge}</div>`;
  }).join("");
}

async function init(){runCoreSelfTest();await loadBuildInfo();await loadServerStatus();await loadDbFromServer();await loadSoftwareFullFromServer();await loadSoftwareClassification();await loadStammdaten();if(typeof loadHelpDocs === 'function') await loadHelpDocs();const search=document.getElementById('globalSearch');search.addEventListener('input',e=>{searchText=e.target.value;render();});search.addEventListener('keydown',e=>{if(e.key==='Escape'){clearSearch();}else if(e.key==='Enter'){render();}});installKeyboardShortcuts();renderAll();}

function installKeyboardShortcuts(){
  if(window.__itverwaltungShortcutsInstalled) return;
  window.__itverwaltungShortcutsInstalled = true;
  document.addEventListener('keydown', event => {
    const tag = String(event.target?.tagName || '').toLowerCase();
    const typing = ['input','textarea','select'].includes(tag);
    if(event.key === '/' && !typing){
      event.preventDefault();
      document.getElementById('globalSearch')?.focus();
      return;
    }
    if(event.key === 'ArrowDown' && !typing){
      event.preventDefault();
      nextRow(activeKey);
      return;
    }
    if(event.key === 'ArrowUp' && !typing){
      event.preventDefault();
      prevRow(activeKey);
      return;
    }
    if(event.ctrlKey && String(event.key).toLowerCase() === 's'){
      event.preventDefault();
      const modal = document.getElementById('editModal');
      if(modal && modal.classList.contains('show')) saveModal();
    }
  });
}
function isAdminRole(){
  return (APP_SETTINGS.role || 'admin') === 'admin';
}
function canWrite(){
  return isAdminRole();
}
function requireWriteAccess(action='Diese Aktion'){
  if(canWrite()) return true;
  notify(`${action} ist im Normalmodus gesperrt.`, 'warning');
  return false;
}
function visibleModules(){
  return modules.filter(m => isAdminRole() || m.group !== 'admin');
}
function roleLabel(){
  return isAdminRole() ? 'Admin' : 'Normal';
}
function renderRoleControl(){
  return `<div class="role-control" title="Lokaler UI-Modus: Normal blendet Admin-Funktionen aus und sperrt Schreibaktionen.">
    <span class="role-label">${roleLabel()}</span>
    <select class="form-select form-select-sm role-select" onchange="setRole(this.value)" aria-label="Rollenmodus wechseln">
      <option value="admin" ${isAdminRole()?'selected':''}>Admin</option>
      <option value="normal" ${!isAdminRole()?'selected':''}>Normal</option>
    </select>
  </div>`;
}
function applyRoleUi(){
  const roleTarget = document.getElementById('roleControl');
  if(roleTarget) roleTarget.innerHTML = renderRoleControl();
  const newDeviceBtn = document.getElementById('newDeviceBtn');
  if(newDeviceBtn){
    newDeviceBtn.classList.toggle('d-none', !canWrite());
    newDeviceBtn.title = canWrite() ? 'Neues Gerät über den Wizard erfassen.' : 'Im Normalmodus sind Schreibaktionen gesperrt.';
  }
}
function setRole(role){
  APP_SETTINGS.role = role === 'normal' ? 'normal' : 'admin';
  saveAppSettings();
  renderAll();
  notify(`Rollenmodus: ${roleLabel()}`, 'info');
}
function tabButton(m){
  const cls = [
    'nav-link',
    m.key===activeKey ? 'active' : '',
    m.group==='support' ? 'nav-link-support' : '',
    m.group==='admin' ? 'nav-link-admin' : '',
    m.group==='main' ? 'nav-link-main' : ''
  ].join(' ');
  return `<li class="nav-item"><button class="${cls}" onclick="openTab('${m.key}')">${m.title}</button></li>`;
}
function navGroup(title, groupKey){
  const groupModules = visibleModules().filter(m=>m.group===groupKey);
  if(!groupModules.length) return '';
  return `<div class="nav-group nav-group-${groupKey}">
    <div class="nav-group-label">${title}</div>
    <ul class="nav nav-tabs grouped-tabs">${groupModules.map(tabButton).join('')}</ul>
  </div>`;
}
function renderAll(){
  if(!visibleModules().some(m=>m.key===activeKey)) activeKey='dashboard';
  applyRoleUi();
  document.getElementById('tabs').innerHTML =
    navGroup('IT-Verwaltung', 'main') +
    navGroup('Dokumentation & Wissen', 'support') +
    navGroup('Konfiguration', 'admin');
  render();
}
function openTab(key){if(!visibleModules().some(m=>m.key===key))key='dashboard';activeKey=key;renderAll();}
function render(){
  const mod=visibleModules().find(m=>m.key===activeKey)||visibleModules()[0];
  const c=document.getElementById('tabContent');
  c.className='pt-3 page-group-'+(mod?.group||'main');
  let html='';
  if(mod.mode==='dashboard')html=renderDashboard();
  else if(mod.mode==='asset')html=renderAssets();
  else if(mod.mode==='module')html=renderLinkedModule(mod);
  else if(mod.mode==='adminpanel')html=renderAdminPanel();
  else if(mod.mode==='stammdaten')html=renderStammdaten();
  else if(mod.mode==='help')html=renderHelp();
  else html=renderSimpleModule(mod);
  c.innerHTML=renderWorkflowBar(mod)+html;
  uxAnimateContent();
}

function renderBuildInfoCard(){
  return `<div class="card mt-3 build-info-card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Build Info</span>
      <span class="badge text-bg-${BUILD_INFO.loaded ? 'primary' : 'warning'}">${BUILD_INFO.version || 'nicht geladen'}</span>
    </div>
    <div class="card-body">
      <div class="row g-2">
        <div class="col-md-3"><b>Version</b><br>${BUILD_INFO.version || '-'}</div>
        <div class="col-md-3"><b>Name</b><br>${BUILD_INFO.name || '-'}</div>
        <div class="col-md-3"><b>Build</b><br>${BUILD_INFO.buildDate || '-'}</div>
        <div class="col-md-3"><b>Start</b><br>start.bat / app_server.py</div>
      </div>
      ${BUILD_INFO.error ? `<div class="alert alert-warning mt-3 mb-0">${escapeHtml(BUILD_INFO.error)}</div>` : ''}
    </div>
  </div>`;
}
function loadDemoData(){
  if(!requireWriteAccess('Demo-Daten laden')) return;
  fetch('demo_data.json?v=' + Date.now())
    .then(r=>r.json())
    .then(data=>{
      ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'].forEach(k=>DB[k]=data[k]||[]);
      toast('Demo-Daten geladen');
      renderAll();
    })
    .catch(()=>notify('demo_data.json konnte nicht geladen werden.', 'error'));
}
function importJson(){
  return importAllFromOneFile();
}
function generateRandomTickets(){
  if(!requireWriteAccess('Tickets generieren')) return;
  const problems=['PC startet nicht','WLAN instabil','Blue Screen','Drucker offline','Softwarefehler','Netzwerk langsam'];
  (DB.assets||[]).forEach(a=>{
    if(Math.random()>.6){
      DB.tickets.push({
        'Ticket-ID':nextId('tickets','Ticket-ID',ID_PREFIXES.tickets),
        'Asset-ID':a['Asset-ID'],
        'Gerätename':a['Gerätename'],
        'Titel':problems[Math.floor(Math.random()*problems.length)],
        'Kategorie':'Demo',
        'Priorität':'Normal',
        'Status':'Offen',
        'Tags':'auto;demo',
        'Ursache':'',
        'Lösung':'',
        'Knowledge-ID':''
      });
    }
  });
  toast('Zufällige Tickets generiert');
  renderAll();
}
function renderHeatmap(){
  const counts={};
  (DB.tickets||[]).forEach(t=>{counts[t['Asset-ID']] = (counts[t['Asset-ID']]||0)+1;});
  return `<div class="row g-2">
    ${(DB.assets||[]).map(a=>{
      const c=counts[a['Asset-ID']]||0;
      const border=c>2?'border-danger':c>0?'border-warning':'border-success';
      return `<div class="col-md-3"><div class="card ${border}"><div class="card-body"><b>${escapeHtml(a['Gerätename'])}</b><br>Tickets: ${c}</div></div></div>`;
    }).join('')}
  </div>`;
}


function renderTopologyView(){
  const assets = DB.assets || [];
  const switches = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('switch'));
  const aps = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('access point'));
  const printers = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('drucker'));
  const servers = assets.filter(a => (a['Asset-Typ']||'').toLowerCase().includes('server'));
  const clients = assets.filter(a => ['PC','Notebook','Workstation','Thin Client'].includes(a['Asset-Typ']));
  const others = assets.filter(a => !switches.includes(a) && !aps.includes(a) && !printers.includes(a) && !servers.includes(a) && !clients.includes(a));

  return `<div class="topology-wrap">
    <div class="topology-toolbar">
      <span class="badge text-bg-primary">Topologie</span>
      <span class="text-muted">Unifi-ähnliche Sicht: Infrastruktur oben, Clients unten</span>
    </div>

    <div class="topology-stage">
      <svg class="topology-lines" viewBox="0 0 1200 620" preserveAspectRatio="none">
        ${topologyLines()}
      </svg>

      <div class="topology-layer layer-core">
        ${topologyNode({title:'Internet / WAN', subtitle:'Upstream', icon:'🌐', cls:'wan'})}
        ${topologyNode({title:'Firewall / Gateway', subtitle:'Router / DHCP / DNS', icon:'🛡️', cls:'gateway'})}
      </div>

      <div class="topology-layer layer-switch">
        ${switches.length ? switches.map(a=>topologyAssetNode(a,'switch')).join('') : topologyNode({title:'Core Switch', subtitle:'SW-CORE-01', icon:'🔀', cls:'switch'})}
        ${servers.map(a=>topologyAssetNode(a,'server')).join('')}
      </div>

      <div class="topology-layer layer-ap">
        ${aps.map(a=>topologyAssetNode(a,'ap')).join('')}
        ${printers.map(a=>topologyAssetNode(a,'printer')).join('')}
      </div>

      <div class="topology-layer layer-client">
        ${clients.map(a=>topologyAssetNode(a,'client')).join('')}
        ${others.map(a=>topologyAssetNode(a,'other')).join('')}
      </div>
    </div>
  </div>`;
}
function topologyNode(n){
  return `<div class="topology-node topo-${n.cls}">
    <div class="topo-icon">${n.icon}</div>
    <div class="topo-title">${escapeHtml(n.title)}</div>
    <div class="topo-sub">${escapeHtml(n.subtitle||'')}</div>
  </div>`;
}
function topologyAssetNode(a, cls){
  const id = a['Asset-ID'];
  const net = firstByAsset('netzwerk', id);
  const ip = net ? (net['IP-Adresse'] || net['Adressart'] || '-') : '-';
  const tickets = byAsset('tickets', id).length;
  const status = a.Status === 'Defekt' ? 'defect' : 'ok';
  return `<div class="topology-node topo-${cls} topo-status-${status}" onclick="openAssetFromGraph('${id}')">
    <div class="topo-icon">${topologyIcon(a['Asset-Typ'])}</div>
    <div class="topo-title">${escapeHtml(a['Gerätename'])}</div>
    <div class="topo-sub">${escapeHtml(a['Asset-Typ'])} · ${escapeHtml(ip)}</div>
    ${tickets ? `<div class="topo-ticket">${tickets} Ticket(s)</div>` : ''}
  </div>`;
}
function topologyIcon(type){
  const t = (type||'').toLowerCase();
  if(t.includes('switch')) return '🔀';
  if(t.includes('access point')) return '📡';
  if(t.includes('drucker')) return '🖨️';
  if(t.includes('notebook')) return '💻';
  if(t.includes('server')) return '🗄️';
  if(t.includes('workstation')) return '🧰';
  if(t.includes('thin')) return '🖥️';
  return '🖥️';
}
function topologyLines(){
  let lines = '';
  // WAN -> Gateway
  lines += `<path class="topo-line topo-line-core" d="M600 45 C600 70,600 70,600 95"/>`;
  // Gateway -> Switch Layer
  lines += `<path class="topo-line topo-line-core" d="M600 130 C600 180,600 180,600 220"/>`;
  // Switch -> AP/Printer
  lines += `<path class="topo-line topo-line-network" d="M600 260 C420 315,330 315,240 365"/>`;
  lines += `<path class="topo-line topo-line-network" d="M600 260 C600 315,600 315,600 365"/>`;
  lines += `<path class="topo-line topo-line-network" d="M600 260 C780 315,870 315,960 365"/>`;
  // AP/Printer -> Clients
  lines += `<path class="topo-line topo-line-client" d="M240 395 C240 460,360 470,430 515"/>`;
  lines += `<path class="topo-line topo-line-client" d="M600 395 C600 455,600 470,600 515"/>`;
  lines += `<path class="topo-line topo-line-client" d="M960 395 C960 460,840 470,770 515"/>`;
  return lines;
}

// ===== v25 CLEAN UX + ADMIN PANEL =====
function loadAppSettings(){
  const defaults = {
    darkMode:false,
    animations:true,
    compactMode:false,
    autosave:true,
    confirmDelete:true,
    startView:'topology',
    role:'admin'
  };
  try{
    return {...defaults, ...(JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {})};
  }catch{
    return defaults;
  }
}
function saveAppSettings(){
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(APP_SETTINGS));
  applyAppSettings();
}
function applyAppSettings(){
  document.body.classList.toggle('dark-mode', !!APP_SETTINGS.darkMode);
  document.body.classList.toggle('animations-off', !APP_SETTINGS.animations);
  document.body.classList.toggle('compact-mode', !!APP_SETTINGS.compactMode);
  document.body.classList.toggle('role-normal', !isAdminRole());
}
function setSetting(key, value){
  APP_SETTINGS[key] = value;
  saveAppSettings();
  render();
}
function uxAnimateContent(){
  if(!APP_SETTINGS.animations || typeof $ === 'undefined') return;
  $('#tabContent').hide().fadeIn(140);
  $('.card').addClass('ux-card-enter');
  setTimeout(()=>$('.card').removeClass('ux-card-enter'), 280);
}
let DASHBOARD_VIEW = localStorage.getItem('dashboardView') || APP_SETTINGS.startView || 'topology';

function renderWorkflowBar(mod){
  if(!mod || mod.mode === 'help') return '';
  const steps = workflowStepsFor(mod);
  const active = workflowActiveStep(mod);
  const help = contextHelpButton(mod.key);
  return `<div class="workflow-bar mb-3">
    <div class="workflow-steps" aria-label="Workflow">
      ${steps.map((step,index)=>`<span class="workflow-step ${index<=active?'active':''}">${index+1}. ${safeEscape(step)}</span>`).join('')}
    </div>
    <div class="workflow-actions">
      ${workflowPrimaryAction(mod)}
      ${help}
    </div>
  </div>`;
}

function workflowStepsFor(mod){
  if(mod.key === 'software') return ['Scan laden','Asset prüfen','Standard abgleichen','Full-Scan nacharbeiten'];
  if(mod.key === 'assets') return ['Asset wählen','Details prüfen','Nacharbeit starten','Dokumentieren'];
  if(mod.key === 'tickets') return ['Ticket wählen','Ursache klären','Lösung dokumentieren','Knowledge erstellen'];
  if(mod.key === 'knowledge') return ['Thema wählen','Lösung lesen','Befehl prüfen','Anwenden'];
  if(mod.key === 'adminpanel') return ['Backup prüfen','Scanner wählen','Aktion bestätigen','Ergebnis prüfen'];
  if(mod.key === 'stammdaten') return ['Liste wählen','Verwendung prüfen','Ändern','Reload'];
  if(mod.key === 'dashboard') return ['Überblick','Hinweis öffnen','Nacharbeit','Bericht'];
  return ['Eintrag wählen','Kontext prüfen','Bearbeiten','Speichern'];
}

function workflowActiveStep(mod){
  if(mod.key === 'software'){
    if(SOFTWARE_VIEW === 'full') return 3;
    if(DB.softwareFull?.available && softwareExactScanAsset()) return 2;
    if(DB.softwareFull?.available) return 1;
    return 0;
  }
  if(String(searchText || '').trim()) return 1;
  return 0;
}

function workflowPrimaryAction(mod){
  if(mod.key === 'software'){
    if(!DB.softwareFull?.available) return '<button class="btn btn-sm btn-outline-primary" onclick="activeKey=\'adminpanel\';renderAll()">Scanner öffnen</button>';
    if(SOFTWARE_VIEW !== 'full') return '<button class="btn btn-sm btn-outline-primary" onclick="setSoftwareView(\'full\')">Full-Scan</button>';
  }
  if(mod.key === 'dashboard') return '<button class="btn btn-sm btn-outline-secondary" onclick="exportDashboardReport()">Prüfbericht</button>';
  if(mod.key === 'assets' && canWrite()) return '<button class="btn btn-sm btn-primary" onclick="openDeviceWizard()">Neues Gerät</button>';
  return '';
}

function contextHeader(mod){
  if(!mod.context) return '';
  const data = {
    hardware: {
      cls:'context-hardware',
      title:'Hardware-Kontext',
      text:'Hier geht es um physische Geräteinformationen: Gerätehersteller, Modellserie, Seriennummer, CPU, RAM, Speicher, Monitor, Garantie.'
    },
    software: {
      cls:'context-software',
      title:'Software-Kontext',
      text:'Hier geht es um Softwareinformationen: Softwarehersteller, Version, Lizenzstatus, Update-Status und Kritikalität. Nicht mit Gerätehersteller verwechseln.'
    },
    network: {
      cls:'context-network',
      title:'Netzwerk-Kontext',
      text:'Hier geht es um Netzwerkanbindung: LAN/WLAN, DHCP/Statisch, IP, MAC, DNS, VLAN, Switch-Port, Wanddose, Access Point und SSID.'
    }
  }[mod.context];
  return `<div class="context-banner ${data.cls}">
    <div class="context-title">${data.title}</div>
    <div>${data.text}</div>
  </div>`;
}

function toolbar(mod,row,idx){
  if(!row){
    return emptyStateFor(mod?.key || activeKey);
  }
  if(!canWrite()){
    return `<div class="alert alert-secondary py-2 mb-2">Normalmodus: Daten können angesehen, aber nicht geändert werden.</div>`;
  }

  // v14: Hardware darf nicht separat neu angelegt werden.
  // Hardware entsteht ausschließlich über den Wizard „+ Neues Gerät erfassen“.
  if(mod && mod.key === 'hardware'){
    return `
      <div class="alert alert-info py-2 mb-2">
        Hardware wird ausschließlich über <b>+ Neues Gerät erfassen</b> erstellt.
      </div>
      <div class="d-flex gap-2 mb-2">
        <button class="btn btn-outline-primary" onclick="openEdit('${mod.key}',${idx})">Bearbeiten</button>
        <button class="btn btn-outline-danger" onclick="deleteRow('${mod.key}',${idx})">Löschen</button>
      </div>
    `;
  }

  if(!mod.editable) return '';

  let extra = '';
  if(mod.key === 'tickets' && row && row.Status === 'Gelöst'){
    extra = `<button class="btn btn-success" onclick="createKnowledgeFromTicket(${idx})">Knowledge erstellen</button>`;
  }

  const createAction = isAssetLinkedModule(mod.key) ? `openReferenceCreate('${mod.key}')` : `openCreate('${mod.key}')`;
  const createLabel = isAssetLinkedModule(mod.key) ? `+ ${getModuleLabel(mod.key)} zu Asset` : 'Neu anlegen';
  const hint = isAssetLinkedModule(mod.key)
    ? `<div class="alert alert-info py-2 mb-2">Neue ${getModuleLabel(mod.key)}-Einträge werden immer gegen ein bestehendes Asset referenziert.</div>`
    : '';

  return `${hint}
    <div class="d-flex gap-2 mb-2">
      <button class="btn btn-primary" onclick="${createAction}">${createLabel}</button>
      <button class="btn btn-outline-primary" onclick="openEdit('${mod.key}',${idx})">Bearbeiten</button>
      <button class="btn btn-outline-danger" onclick="deleteRow('${mod.key}',${idx})">Löschen</button>
      ${extra}
      ${contextHelpButton(mod.key)}
    </div>`;
}

function emptyStateFor(key){
  if(!CSV_BACKEND_AVAILABLE){
    return `<div class="alert alert-warning py-2 mb-2">CSV Backend nicht verbunden. Starte die App über <b>start.bat</b>, damit lokale Daten geladen und gespeichert werden können.</div>`;
  }
  if(String(searchText || '').trim()){
    return `<div class="alert alert-info py-2 mb-2">Keine Treffer für die aktuelle Suche im Tab <b>${safeEscape(key || 'Daten')}</b>. <button class="btn btn-sm btn-outline-primary ms-2" onclick="clearSearch()">Suche löschen</button></div>`;
  }
  const actions = {
    software:'<button class="btn btn-sm btn-outline-primary" onclick="setSoftwareView(\'full\')">Full-Scan prüfen</button> <button class="btn btn-sm btn-primary" onclick="openSoftwareProfileCreate()">Standardsoftware hinzufügen</button>',
    assets:'<button class="btn btn-sm btn-primary" onclick="openDeviceWizard()">Neues Gerät erfassen</button>',
    tickets:'<button class="btn btn-sm btn-primary" onclick="openReferenceCreate(\'tickets\')">Ticket zu Asset</button>',
    knowledge:'<button class="btn btn-sm btn-outline-primary" onclick="openContextHelp(\'faq\')">Hilfe öffnen</button>'
  }[key] || '';
  return `<div class="alert alert-secondary py-2 mb-2">Noch keine Daten im Tab <b>${safeEscape(key || 'Daten')}</b> vorhanden. ${actions}</div>`;
}

function contextHelpButton(key){
  const slug = {
    assets:'schnellstart',
    hardware:'checklisten',
    software:'checklisten',
    netzwerk:'checklisten',
    tickets:'faq',
    notizen:'schnellstart',
    knowledge:'faq'
  }[key] || 'schnellstart';
  return `<button class="btn btn-outline-secondary" onclick="openContextHelp('${slug}')">Hilfe</button>`;
}

function listFilterFields(key){
  return {
    assets:['Status','Standort','Raum','Hersteller'],
    hardware:['Gerätename'],
    software:['Hersteller','Update-Status','Kritikalität','Lizenzstatus'],
    netzwerk:['Netzwerktyp','Adressart','VLAN'],
    tickets:['Status','Kategorie','Priorität','Gerätename'],
    notizen:['Status','Kategorie'],
    knowledge:['Kategorie']
  }[key] || [];
}

function listGroupFields(key){
  return {
    assets:[['Standort','Standort'],['Raum','Raum']],
    software:[['Hersteller','Hersteller'],['family','Produktfamilie'],['Update-Status','Update-Status'],['Kritikalität','Kritikalität']],
    tickets:[['Status','Status'],['Kategorie','Kategorie'],['Priorität','Priorität'],['Gerätename','Asset']]
  }[key] || [];
}

function uniqueValues(rows, field){
  return Array.from(new Set(rows.map(r => String(r[field] || '').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'de')).slice(0, 18);
}

function renderListControls(key, sourceRows){
  const state = listState(key);
  const fields = listFilterFields(key);
  const groupFields = listGroupFields(key);
  if(!fields.length && !groupFields.length) return '';
  const values = state.filterField ? uniqueValues(sourceRows, state.filterField) : [];
  return `<div class="card mb-2 list-controls"><div class="card-body d-flex flex-wrap gap-2 align-items-center">
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','sort',this.value)">
      <option value="smart" ${state.sort==='smart'?'selected':''}>Sortierung: Status + Name</option>
      <option value="name" ${state.sort==='name'?'selected':''}>Sortierung: Name</option>
      <option value="date" ${state.sort==='date'?'selected':''}>Sortierung: Datum/Garantie</option>
    </select>
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','filterField',this.value);setListState('${key}','filterValue','')">
      <option value="">Filterfeld</option>
      ${fields.map(field=>`<option value="${safeEscape(field)}" ${state.filterField===field?'selected':''}>${safeEscape(field)}</option>`).join('')}
    </select>
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','filterValue',this.value)" ${state.filterField?'':'disabled'}>
      <option value="">Alle Werte</option>
      ${values.map(value=>`<option value="${safeEscape(value)}" ${state.filterValue===value?'selected':''}>${safeEscape(value)}</option>`).join('')}
    </select>
    <select class="form-select form-select-sm list-select" onchange="setListState('${key}','group',this.value)">
      <option value="none">Keine Gruppierung</option>
      ${groupFields.map(([field,label])=>`<option value="${safeEscape(field)}" ${state.group===field?'selected':''}>Gruppe: ${safeEscape(label)}</option>`).join('')}
    </select>
    <button class="btn btn-sm btn-outline-secondary ${state.savedView==='incomplete'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='incomplete'?'':'incomplete')">Fehlende Pflichtfelder</button>
    ${key!=='assets'?`<button class="btn btn-sm btn-outline-secondary ${state.savedView==='orphan'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='orphan'?'':'orphan')">Ohne Asset</button>`:''}
    ${key==='tickets'?`<button class="btn btn-sm btn-outline-secondary ${state.savedView==='open_tickets'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='open_tickets'?'':'open_tickets')">Offene Tickets</button>`:''}
    ${key==='assets'?`<button class="btn btn-sm btn-outline-secondary ${state.savedView==='scan_unknown'?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='scan_unknown'?'':'scan_unknown')">Scan unbekannt</button>`:''}
    <button class="btn btn-sm btn-outline-secondary" onclick="LIST_STATE['${key}']={sort:'smart',group:'none',filterField:'',filterValue:'',savedView:''};saveListState();render()">Zurücksetzen</button>
    ${renderQuickFilterChips(key)}
  </div></div>`;
}

function renderQuickFilterChips(key){
  const chips = {
    software:[
      ['scan_standard','Scan-Standard'],
      ['incomplete','Prüfen'],
      ['orphan','Ohne Asset']
    ],
    assets:[
      ['incomplete','Unvollständig'],
      ['scan_unknown','Scan fehlt']
    ],
    tickets:[
      ['open_tickets','Offen'],
      ['incomplete','Pflichtfelder']
    ]
  }[key] || [];
  if(!chips.length) return '';
  return `<div class="quick-filter-chips">${chips.map(([view,label])=>`<button class="btn btn-sm btn-outline-primary ${listState(key).savedView===view?'active':''}" onclick="setListState('${key}','savedView',listState('${key}').savedView==='${view}'?'':'${view}')">${label}</button>`).join('')}</div>`;
}

function openContextHelp(slug){
  if(typeof setHelpArticle === 'function') setHelpArticle(slug);
  activeKey = 'help';
  renderAll();
}

function renderAssets(){
  const sourceRows = DB.assets || [];
  const rows = filterRows(sourceRows, 'assets');
  const idx = clamp(selectedIndex.assets, rows.length);
  selectedIndex.assets = idx;
  const row = rows[idx] || null;

  const actions = row && canWrite() ? `
    <div class="alert alert-info py-2 mb-2">
      Neue Assets werden weiterhin über <b>+ Neues Gerät erfassen</b> erstellt.
      Bestehende Assets können hier bearbeitet oder gelöscht werden.
    </div>
    <div class="d-flex gap-2 mb-2">
      <button class="btn btn-outline-primary" onclick="openEdit('assets',${idx})">Asset bearbeiten</button>
      <button class="btn btn-outline-danger" onclick="deleteAssetWithReferences(${idx})">Asset löschen</button>
    </div>
  ` : row ? '<div class="alert alert-secondary py-2 mb-2">Normalmodus: Assets können angesehen, aber nicht geändert werden.</div>' : '';

  return renderListControls('assets', sourceRows) + actions + renderSplit('assets', rows, assetColumns(), row, renderAssetCard(row, idx, rows.length));
}

function formatCell(row,key){
  const text = val(row,key);
  if(!searchText.trim()) return safeEscape(text);
  const escaped = safeEscape(text);
  const q = safeEscape(searchText.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(q, 'ig'), match => `<mark>${match}</mark>`);
}
function selectRow(key,idx){selectedIndex[key]=idx;render();}
function prevRow(key){if(typeof selectedIndex[key] !== 'number') return; selectedIndex[key]--;render();}
function nextRow(key){if(typeof selectedIndex[key] !== 'number') return; selectedIndex[key]++;render();}
function nav(key,idx,total){return `<div class="card"><div class="card-body d-flex justify-content-between align-items-center"><button class="btn btn-outline-primary" onclick="prevRow('${key}')">←</button><b>${total?idx+1:0} / ${total}</b><button class="btn btn-outline-primary" onclick="nextRow('${key}')">→</button></div></div>`;}
function navCustom(idx,total,setter){return `<div class="card"><div class="card-body d-flex justify-content-between align-items-center"><button class="btn btn-outline-primary" onclick="${setter}(${Math.max(0,idx-1)})">←</button><b>${total?idx+1:0} / ${total}</b><button class="btn btn-outline-primary" onclick="${setter}(${total?Math.min(total-1,idx+1):0})">→</button></div></div>`;}
function assetColumns(){return ['Asset-ID','Gerätename','Asset-Typ','Standort','Status','Hauptnutzer','Inventarnummer'];}
function moduleColumns(key){const m={hardware:['Hardware-ID','Asset-ID','Gerätename','CPU','RAM','Speicher'],netzwerk:['Netzwerk-ID','Asset-ID','Gerätename','Adressart','Verbindungstyp','IP-Adresse'],software:['Software-ID','Asset-ID','Gerätename','Softwarename','Version','Lizenzstatus'],tickets:['Ticket-ID','Asset-ID','Gerätename','Titel','Status','Priorität'],notizen:['Notiz-ID','Asset-ID','Gerätename','Titel','Kategorie','Status'],knowledge:['Knowledge-ID','Titel','Kategorie','Tags']};return m[key]||Object.keys((DB[key]||[])[0]||{}).slice(0,6);}

function displayFieldLabel(moduleKey, field){
  const map = {
    hardware: {
      'Hersteller':'Gerätehersteller',
      'Modell':'Gerätemodell',
      'Modellserie':'Geräte-Modellserie',
      'Bemerkung':'Hardware-Bemerkung'
    },
    software: {
      'Hersteller':'Softwarehersteller',
      'Softwarename':'Software / Anwendung',
      'Version':'Softwareversion',
      'Bemerkung':'Software-Bemerkung'
    },
    netzwerk: {
      'Hersteller':'Netzwerkhersteller',
      'DNS':'DNS-Eintrag',
      'IP-Adresse':'IP-Adresse',
      'MAC-Adresse':'MAC-Adresse',
      'Bemerkung':'Netzwerk-Bemerkung'
    }
  };
  return (map[moduleKey] && map[moduleKey][field]) ? map[moduleKey][field] : field;
}

function htmlToPlainText(value){
  return String(value || '')
    .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function kv(k,v){
  const value = (v === undefined || v === null || v === '') ? '-' : v;
  return `<div class="k">${safeEscape(k)}</div><div>${safeEscape(htmlToPlainText(value))}</div>`;
}
function small(title,body){return `<div class="card mini-card"><div class="card-body"><b>${title}</b><div class="preline mt-2">${body||'-'}</div></div></div>`;}
function setAssetDetailTab(tab){ASSET_DETAIL_TAB=tab;render();}
function assetTabButton(key,label,count){
  const active = ASSET_DETAIL_TAB === key ? 'active' : '';
  const suffix = count === undefined ? '' : ` <span class="badge text-bg-light text-dark">${count}</span>`;
  return `<button class="nav-link ${active}" onclick="setAssetDetailTab('${key}')">${label}${suffix}</button>`;
}
function assetRowsTable(rows, columns){
  if(!rows.length) return '<div class="text-muted">Keine Einträge vorhanden.</div>';
  return `<div class="table-responsive"><table class="table table-sm table-striped mb-0"><thead><tr>${columns.map(c=>`<th>${safeEscape(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${columns.map(c=>`<td>${safeEscape(row[c] || '-')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function renderAssetHistory(a, related){
  const entries = [];
  if(a.Status) entries.push({type:'Status', text:a.Status});
  related.tickets.forEach(t=>entries.push({type:'Ticket', text:`${t.Titel || t['Ticket-ID']} [${t.Status || '-'}]`}));
  related.notes.forEach(n=>entries.push({type:'Notiz', text:n.Titel || n['Notiz-ID']}));
  related.software.forEach(s=>entries.push({type:'Software', text:s.Softwarename || s['Software-ID']}));
  if(!entries.length) return '<div class="text-muted">Noch keine Historienpunkte ableitbar.</div>';
  return `<ul class="list-group list-group-flush">${entries.map(entry=>`<li class="list-group-item d-flex justify-content-between gap-3"><span>${safeEscape(entry.text)}</span><span class="badge text-bg-secondary">${safeEscape(entry.type)}</span></li>`).join('')}</ul>`;
}
function renderAssetWorkflowActions(a){
  const assetArg = encodeURIComponent(a['Asset-ID'] || '');
  return `<div class="asset-workflow-actions d-flex flex-wrap gap-2 mt-3">
    <button class="btn btn-sm btn-primary" onclick="openTicketFromAsset(decodeURIComponent('${assetArg}'))">Ticket aus Asset</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'move')">Umzug planen</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'retire')">Ausmusterung planen</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'inventory')">Inventur bestätigen</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="createAssetWorkflowNote(decodeURIComponent('${assetArg}'),'loan')">Ausgabe/Rückgabe planen</button>
  </div>`;
}
function renderAssetTabContent(a, related){
  const hw = related.hardware[0] || null;
  const net = related.network[0] || null;
  if(ASSET_DETAIL_TAB === 'hardware') return hw ? `<div class="kv">${Object.entries(hw).map(([k,v])=>kv(displayFieldLabel('hardware',k),v)).join('')}</div>` : '<div class="text-muted">Keine Hardware erfasst.</div>';
  if(ASSET_DETAIL_TAB === 'software') return assetRowsTable(related.software, ['Software-ID','Softwarename','Version','Hersteller','Lizenzstatus','Update-Status']);
  if(ASSET_DETAIL_TAB === 'network') return net ? `<div class="kv">${Object.entries(net).map(([k,v])=>kv(displayFieldLabel('netzwerk',k),v)).join('')}</div>` : '<div class="text-muted">Keine Netzwerkdaten erfasst.</div>';
  if(ASSET_DETAIL_TAB === 'tickets') return assetRowsTable(related.tickets, ['Ticket-ID','Titel','Kategorie','Priorität','Status','Knowledge-ID']);
  if(ASSET_DETAIL_TAB === 'notes') return assetRowsTable(related.notes, ['Notiz-ID','Titel','Kategorie','Status','Inhalt']);
  if(ASSET_DETAIL_TAB === 'knowledge') return assetRowsTable(related.knowledge, ['Knowledge-ID','Titel','Kategorie','Tags','Lösung']);
  if(ASSET_DETAIL_TAB === 'history') return renderAssetHistory(a, related);
  return `<div class="row mt-3"><div class="col"><div class="kv">${kv('Asset-ID',a['Asset-ID'])}${kv('Standort',val(a,'Standort'))}${kv('Raum',val(a,'Raum'))}${kv('Hauptnutzer',val(a,'Hauptnutzer'))}</div></div><div class="col"><div class="kv">${kv('Hersteller',val(a,'Hersteller'))}${kv('Modell',val(a,'Modell'))}${kv('Betriebssystem',val(a,'Betriebssystem'))}${kv('Inventar',val(a,'Inventarnummer'))}</div></div></div>`;
}
function renderAssetCard(a,idx,total){
  if(!a) return '<div class="card"><div class="card-body">Keine Daten</div></div>';
  const id = a['Asset-ID'];
  const related = {
    hardware: byAsset('hardware', id),
    network: byAsset('netzwerk', id),
    software: byAsset('software', id),
    tickets: byAsset('tickets', id),
    notes: byAsset('notizen', id),
    knowledge: (DB.knowledge || []).filter(k => byAsset('tickets', id).some(t => t['Knowledge-ID'] && t['Knowledge-ID'] === k['Knowledge-ID']))
  };
  if(!['overview','hardware','software','network','tickets','notes','knowledge','history'].includes(ASSET_DETAIL_TAB)) ASSET_DETAIL_TAB = 'overview';
  return `${nav('assets',idx,total)}
  <div class="card mt-3">
    <div class="card-body">
      <div class="detail-title">${val(a,'Gerätename')}</div>
      <span class="badge text-bg-primary">${val(a,'Asset-Typ')}</span>
      <span class="badge text-bg-success">${val(a,'Status')}</span>
      ${renderAssetWorkflowActions(a)}
      <ul class="nav nav-pills mt-3 asset-detail-tabs">
        ${assetTabButton('overview','Übersicht')}
        ${assetTabButton('hardware','Hardware',related.hardware.length)}
        ${assetTabButton('software','Software',related.software.length)}
        ${assetTabButton('network','Netzwerk',related.network.length)}
        ${assetTabButton('tickets','Tickets',related.tickets.length)}
        ${assetTabButton('notes','Notizen',related.notes.length)}
        ${assetTabButton('knowledge','Knowledge',related.knowledge.length)}
        ${assetTabButton('history','Historie')}
      </ul>
      <div class="asset-detail-panel mt-3">${renderAssetTabContent(a, related)}</div>
    </div>
  </div>`;}
function renderModuleCard(mod,r,idx,total){if(!r)return '<div class="card"><div class="card-body">Keine Daten</div></div>';const a=assetFor(r);let main='';Object.entries(r).forEach(([k,v])=>main+=kv(displayFieldLabel(mod.key,k),v));return `${nav(mod.key,idx,total)}<div class="card mt-3 card-context-${mod.context||'default'}"><div class="card-body"><div class="detail-title">${r[mod.id]||mod.title}</div><span class="badge text-bg-primary">${mod.title}</span> <span class="badge text-bg-success">zugeordnet zu: ${assetName(r['Asset-ID'])}</span>${logicBadges(mod.key,r)}<div class="row mt-3"><div class="col"><h5>Eintrag</h5><div class="kv">${main}</div></div><div class="col"><h5>Zugeordnetes Asset</h5>${a?assetSummary(a):'<p>Kein Asset zugeordnet.</p>'}</div></div></div></div>`;}
function logicBadges(key,r){let out='';if(key==='tickets'&&r.Status==='Gelöst')out+='<div class="alert alert-success mt-2">Ticket ist gelöst: Knowledge-Erstellung ist sinnvoll.</div>';if(key==='netzwerk'&&r.Adressart==='DHCP')out+='<div class="alert alert-info mt-2">DHCP aktiv: IP-Adresse wird nicht manuell gepflegt.</div>';if(key==='netzwerk'&&r.Verbindungstyp.includes('WLAN'))out+='<div class="alert alert-info mt-2">WLAN aktiv: Access Point und SSID relevant.</div>';return out;}
function renderGenericCard(mod,r,idx,total){
  if(!r) return '<div class="card"><div class="card-body">Keine Daten</div></div>';
  if(mod.key === 'knowledge') return renderKnowledgeCard(mod,r,idx,total);
  let main='';
  Object.entries(r).forEach(([k,v])=>main+=kv(displayFieldLabel(mod.key,k),v));
  return `${nav(mod.key,idx,total)}<div class="card mt-3 card-context-${mod.context||'default'}"><div class="card-body"><div class="detail-title">${safeEscape(r[mod.id]||mod.title)}</div><div class="kv mt-3">${main}</div></div></div>`;
}

function assetSummary(a){return `<div class="kv">${kv('Asset-ID',val(a,'Asset-ID'))}${kv('Gerätename',val(a,'Gerätename'))}${kv('Typ',val(a,'Asset-Typ'))}${kv('Standort',val(a,'Standort')+' / '+val(a,'Raum'))}${kv('Nutzer',val(a,'Hauptnutzer'))}${kv('Status',val(a,'Status'))}</div>`;}

// Conditional logic helpers
function isComputeType(type){return ['PC','Notebook','Thin Client'].includes(type);}
function isInfraType(type){return ['Access Point','Switch'].includes(type);}
function isPrinterType(type){return type==='Drucker';}
function isMonitorType(type){return type==='Monitor';}

// Wizard

// ===== v22 SAFE UX LOGIC =====
function getConnectionProfile(conn){
  const c = (conn || '').toLowerCase();
  if(c.includes('wlan')) return 'wlan';
  if(c.includes('vpn')) return 'vpn';
  if(c.includes('offline')) return 'offline';
  if(c.includes('poe')) return 'lan';
  if(c.includes('lan')) return 'lan';
  return 'other';
}
function getNetworkTypeFromConnection(conn){
  const p = getConnectionProfile(conn);
  if(p === 'wlan') return 'WLAN';
  if(p === 'vpn') return 'VPN';
  if(p === 'offline') return 'Offline';
  return 'LAN';
}
function filterConnectionTypes(networkType){
  const defaults = {
    LAN: ['LAN direkt Wanddose','LAN über Dockingstation','LAN über lokalen Switch','PoE direkt Switch'],
    WLAN: ['WLAN über Access Point'],
    VPN: ['VPN'],
    Offline: ['Offline']
  };

  const all = (STAMM.verbindungstypen && STAMM.verbindungstypen.length)
    ? STAMM.verbindungstypen
    : [...defaults.LAN, ...defaults.WLAN, ...defaults.VPN, ...defaults.Offline];

  const nt = String(networkType || '').toLowerCase();
  let filtered = [];

  if(nt.includes('wlan')){
    filtered = all.filter(x => String(x).toLowerCase().includes('wlan'));
    return filtered.length ? filtered : defaults.WLAN;
  }
  if(nt.includes('vpn')){
    filtered = all.filter(x => String(x).toLowerCase().includes('vpn'));
    return filtered.length ? filtered : defaults.VPN;
  }
  if(nt.includes('offline')){
    filtered = all.filter(x => String(x).toLowerCase().includes('offline'));
    return filtered.length ? filtered : defaults.Offline;
  }
  if(nt.includes('lan')){
    filtered = all.filter(x => {
      const v = String(x).toLowerCase();
      return (v.includes('lan') || v.includes('poe') || v.includes('wanddose') || v.includes('dock')) && !v.includes('wlan');
    });
    return filtered.length ? filtered : defaults.LAN;
  }

  return all;
}
function isValidIPv4(ip){
  if(!ip) return false;
  const parts = String(ip).trim().split('.');
  if(parts.length !== 4) return false;
  return parts.every(p => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}
function isValidMac(mac){
  if(!mac) return true;
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(String(mac).trim());
}
function networkValidationMessages(data){
  const n = data.netzwerk || data;
  const profile = getConnectionProfile(n.Verbindungstyp);
  const msgs = [];
  const warnings = [];

  if(!networkTypeMatchesConnection(n.Netzwerktyp, n.Verbindungstyp)){
    msgs.push('Netzwerktyp und Verbindungstyp passen nicht zusammen.');
  }

  if(profile === 'lan'){
    if(!n.SwitchPort && !n['Switch-Port']) msgs.push('LAN: Switch-Port ist Pflicht.');
    if(!n.Wanddose) warnings.push('LAN: Wanddose ist empfohlen.');
  }
  if(profile === 'wlan'){
    if(!n.AccessPoint && !n['Access Point']) msgs.push('WLAN: Access Point ist Pflicht.');
    if(!n.SSID) msgs.push('WLAN: SSID ist Pflicht.');
  }
  if(profile === 'vpn'){
    warnings.push('VPN: keine physische Infrastruktur erforderlich.');
  }
  if(profile === 'offline'){
    warnings.push('Offline: Netzwerkdaten werden bewusst leer gelassen.');
  }
  if(n.Adressart === 'Statisch'){
    const ip = n['IP-Adresse'] || n.IPAdresse || '';
    const dns = n.DNS || '';
    if(!ip) msgs.push('Statisch: IP-Adresse ist Pflicht.');
    else if(!isValidIPv4(ip)) msgs.push('IP-Adresse hat kein gültiges IPv4-Format.');
    if(!dns) msgs.push('Statisch: DNS-Eintrag ist Pflicht.');
  }
  if(n['MAC-Adresse'] && !isValidMac(n['MAC-Adresse'])) msgs.push('MAC-Adresse hat kein gültiges Format.');
  const vlan = String(n.VLAN || '').trim();
  if(vlan && vlan !== '-' && !/^\d{1,4}$/.test(vlan)) warnings.push('VLAN sollte als Zahl gepflegt werden.');
  if(/^\d+$/.test(vlan) && (Number(vlan) < 1 || Number(vlan) > 4094)) msgs.push('VLAN liegt ausserhalb des gültigen Bereichs 1-4094.');
  return {errors: msgs, warnings};
}
function resetNetworkFieldsForProfile(){
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  const profile = getConnectionProfile(n.Verbindungstyp);
  n.Netzwerktyp = getNetworkTypeFromConnection(n.Verbindungstyp);

  if(n.Adressart === 'DHCP'){
    n['IP-Adresse'] = '';
    n.DNS = '';
  }

  if(profile === 'lan'){
    n.AccessPoint = '-';
    n.SSID = '-';
  }
  if(profile === 'wlan'){
    n.SwitchPort = '';
    n.Wanddose = '';
  }
  if(profile === 'vpn'){
    n.SwitchPort = '';
    n.Wanddose = '';
    n.AccessPoint = '-';
    n.SSID = '-';
    n.VLAN = '';
  }
  if(profile === 'offline'){
    n.Adressart = 'DHCP';
    n['IP-Adresse'] = '';
    n.DNS = '';
    n['MAC-Adresse'] = '';
    n.VLAN = '';
    n.SwitchPort = '';
    n.Wanddose = '';
    n.AccessPoint = '-';
    n.SSID = '-';
  }
}

function networkTypeMatchesConnection(networkType, connectionType){
  const nt = (networkType || '').toLowerCase();
  const profile = getConnectionProfile(connectionType);

  if(nt.includes('wlan')) return profile === 'wlan';
  if(nt.includes('vpn')) return profile === 'vpn';
  if(nt.includes('offline')) return profile === 'offline';
  if(nt.includes('lan')) return profile === 'lan';

  return true;
}
function normalizeNetworkSelection(){
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  const allowed = filterConnectionTypes(n.Netzwerktyp);

  if(!allowed.includes(n.Verbindungstyp)){
    n.Verbindungstyp = allowed[0] || '';
  }

  resetNetworkFieldsForProfile();
}
function onWizardNetworkTypeChanged(){
  saveWizardFields();
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  const allowed = filterConnectionTypes(n.Netzwerktyp);
  n.Verbindungstyp = allowed[0] || '';
  resetNetworkFieldsForProfile();
  renderWizard();
}

function onWizardConnectionTypeChanged(){
  saveWizardFields();
  if(!wizard || !wizard.data || !wizard.data.netzwerk) return;
  const n = wizard.data.netzwerk;
  n.Netzwerktyp = getNetworkTypeFromConnection(n.Verbindungstyp);
  resetNetworkFieldsForProfile();
  renderWizard();
}


function wizardSafeNotice(){
  if(!wizard || !wizard.data) return '';
  const type = wizard.data.type;
  if(isMonitorType(type)) return '<div class="alert alert-warning">Monitor: Netzwerk und Software sind nicht erforderlich. Nur Grunddaten/Hardware-Zuordnung pflegen.</div>';
  if(isInfraType(type)) return '<div class="alert alert-info">Infrastrukturgerät: Netzwerk-/Managementdaten sind besonders wichtig. Software wird eher als Firmware dokumentiert.</div>';
  if(isPrinterType(type)) return '<div class="alert alert-info">Drucker: Software-Step kann für Treiber/Druckserver genutzt werden.</div>';
  return '';
}
function renderValidationSummary(){
  if(!wizard || !wizard.data) return '';
  const net = (typeof networkValidationMessages === 'function') ? networkValidationMessages(wizard.data) : {errors:[], warnings:[]};
  const checks = [];
  const g = wizard.data.grund || {};
  if(!g.Standort) checks.push({level:'danger', text:'Standort fehlt'});
  if(!g.Raum) checks.push({level:'warning', text:'Raum fehlt'});
  if(!g.Hersteller) checks.push({level:'danger', text:'Hersteller fehlt'});
  if(!g.Modell) checks.push({level:'warning', text:'Modell ist leer'});
  (net.errors||[]).forEach(x=>checks.push({level:'danger', text:x}));
  (net.warnings||[]).forEach(x=>checks.push({level:'warning', text:x}));
  if(!checks.length) checks.push({level:'success', text:'Alle Pflichtprüfungen bestanden'});
  return `<div class="mt-3">
    <h5>Prüfstatus</h5>
    ${checks.map(c=>`<div class="alert alert-${c.level} py-2 mb-2">${c.text}</div>`).join('')}
  </div>`;
}



// ===== v26 SOFTWARE SMART CHECKLIST =====

// ===== v26.3 SAFE FORM HELPER FIX =====
function safeEscape(value){
  if(typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function sel(path,label,value,items,cls='',onchange='saveWizardFields();renderWizard();'){
  const safeItems = Array.isArray(items) ? items : [];
  return `<div class="${cls}" data-fieldwrap="${safeEscape(path)}">
    <label class="form-label">${safeEscape(label)}</label>
    <select class="form-select wiz" data-path="${safeEscape(path)}" onchange="${onchange}">
      ${safeItems.map(x=>`<option value="${safeEscape(x)}" ${x===value?'selected':''}>${safeEscape(x)}</option>`).join('')}
    </select>
  </div>`;
}

function f(path,label,value='',type='text',cls=''){
  return `<div class="${cls}" data-fieldwrap="${safeEscape(path)}">
    <label class="form-label">${safeEscape(label)}</label>
    <input type="${safeEscape(type)}" class="form-control wiz" data-path="${safeEscape(path)}" value="${safeEscape(value||'')}" oninput="applyWizardLogic()" onchange="applyWizardLogic()">
  </div>`;
}

function manufacturerSelect(type, value){
  const items = getManufacturersForType(type);
  const current = items.includes(value) ? value : (items[0] || value || '');
  if(wizard && wizard.data && wizard.data.grund && wizard.data.grund.Hersteller !== current){
    wizard.data.grund.Hersteller = current;
  }
  return `<div>
    <label class="form-label">Hersteller</label>
    <div class="input-group">
      <select class="form-select wiz" data-path="grund.Hersteller" onchange="saveWizardFields();wizard.data.grund.Modellserie='';renderWizard();">
        ${items.map(x=>`<option value="${safeEscape(x)}" ${x===current?'selected':''}>${safeEscape(x)}</option>`).join('')}
      </select>
      <button class="btn btn-outline-primary" type="button" onclick="saveWizardFields();addManufacturerForCurrentType()">+ Hersteller</button>
    </div>
    <div class="logic-hint">Gefiltert nach Gerätetyp: ${safeEscape(type)}</div>
  </div>`;
}
function modelSeriesSelect(type, manufacturer, value){
  const items = getModelSeriesFor(type, manufacturer);
  if(!items.length){
    return `<div>
      <label class="form-label">Modellserie</label>
      <div class="input-group">
        <input class="form-control wiz" data-path="grund.Modellserie" value="${safeEscape(value||'')}" placeholder="optional, z. B. Lifebook">
        <button class="btn btn-outline-primary" type="button" onclick="saveWizardFields();addModelSeriesForCurrentSelection()">+ Serie</button>
      </div>
      <div class="logic-hint">Keine Serien für diese Hersteller/Gerätetyp-Kombination hinterlegt.</div>
    </div>`;
  }
  const current = items.includes(value) ? value : '';
  return `<div>
    <label class="form-label">Modellserie</label>
    <div class="input-group">
      <select class="form-select wiz" data-path="grund.Modellserie">
        <option value="">-</option>
        ${items.map(x=>`<option value="${safeEscape(x)}" ${x===current?'selected':''}>${safeEscape(x)}</option>`).join('')}
      </select>
      <button class="btn btn-outline-primary" type="button" onclick="saveWizardFields();addModelSeriesForCurrentSelection()">+ Serie</button>
    </div>
    <div class="logic-hint">${safeEscape(manufacturer)}: Serien passend für ${safeEscape(type)}</div>
  </div>`;
}
function wizardStepHtml(){
  const d = wizard.data;

  if(wizard.step===0){
    return `<h4>Gerätetyp auswählen</h4>
      ${sel('type','Gerätetyp',d.type,STAMM.assetTypen)}
      <div class="alert alert-info mt-3" id="typeHint"></div>`;
  }

  if(wizard.step===1){
    return `<h4>Grunddaten</h4>
      <div class="form-grid">
        ${sel('grund.Standort','Standort',d.grund.Standort,STAMM.standorte)}
        ${sel('grund.Raum','Raum',d.grund.Raum,STAMM.raeume)}
        ${sel('grund.Status','Status',d.grund.Status,STAMM.status)}
        ${f('grund.Hauptnutzer','Hauptnutzer',d.grund.Hauptnutzer)}
        ${manufacturerSelect(d.type,d.grund.Hersteller)}
        ${modelSeriesSelect(d.type,d.grund.Hersteller,d.grund.Modellserie)}
        ${f('grund.Modell','Modell / genaue Bezeichnung',d.grund.Modell)}
        ${f('grund.Seriennummer','Seriennummer',d.grund.Seriennummer)}
        ${f('grund.Inventarnummer','Inventarnummer',d.grund.Inventarnummer)}
        ${sel('grund.Betriebssystem','Betriebssystem',d.grund.Betriebssystem,STAMM.betriebssysteme,'logic-compute')}
        ${sel('grund.Domäne','Domäne',d.grund.Domäne,STAMM.domaenen,'logic-compute')}
        ${f('grund.Ausmusterungsdatum','Ausmusterungsdatum',d.grund.Ausmusterungsdatum,'date','logic-retired')}
        ${f('grund.Defektbeschreibung','Defektbeschreibung',d.grund.Defektbeschreibung,'text','logic-defect')}
        <div style="grid-column:1/-1">
          <label class="form-label">Notizen</label>
          <textarea class="form-control wiz" data-path="grund.Notizen">${d.grund.Notizen}</textarea>
        </div>
      </div>
      <div id="grundHint" class="alert alert-warning mt-3 d-none"></div>`;
  }

  if(wizard.step===2){
    return `<h4>Hardware</h4>
      <div class="form-grid">
        ${f('hardware.CPU','CPU',d.hardware.CPU,'text','logic-compute')}
        ${f('hardware.RAM','RAM',d.hardware.RAM,'text','logic-compute')}
        ${f('hardware.Speicher','Speicher',d.hardware.Speicher,'text','logic-compute')}
        ${f('hardware.Monitor','Monitor',d.hardware.Monitor,'text','logic-compute logic-monitor-ref')}
        ${f('hardware.Dockingstation','Dockingstation',d.hardware.Dockingstation,'text','logic-dock')}
        ${f('hardware.Druckertyp','Druckertyp',d.hardware.Druckertyp,'text','logic-printer')}
        ${f('hardware.Toner','Toner',d.hardware.Toner,'text','logic-printer')}
        ${f('hardware.Zählerstand','Zählerstand',d.hardware.Zählerstand,'text','logic-printer')}
        ${f('hardware.PoE','PoE',d.hardware.PoE,'text','logic-infra')}
        ${f('hardware.Controller','Controller',d.hardware.Controller,'text','logic-infra')}
        ${f('hardware.GarantieBis','Garantie bis',d.hardware.GarantieBis,'date')}
        <div style="grid-column:1/-1">
          <label class="form-label">Bemerkung</label>
          <textarea class="form-control wiz" data-path="hardware.Bemerkung">${d.hardware.Bemerkung}</textarea>
        </div>
      </div>
      <div id="hardwareHint" class="alert alert-info mt-3"></div>`;
  }

  if(wizard.step===3){
    const connItems = filterConnectionTypes(d.netzwerk.Netzwerktyp);
    if(connItems.length && !connItems.includes(d.netzwerk.Verbindungstyp)){
      d.netzwerk.Verbindungstyp = connItems[0];
    }
    resetNetworkFieldsForProfile();
    return `<h4>Netzwerk</h4>
      ${wizardSafeNotice()}
      <div class="form-grid">
        ${sel('netzwerk.Netzwerktyp','Netzwerktyp',d.netzwerk.Netzwerktyp,STAMM.netzwerktypen || ['LAN','WLAN','VPN','Offline'],'','onWizardNetworkTypeChanged()')}
        ${sel('netzwerk.Adressart','Adressart',d.netzwerk.Adressart,STAMM.adressarten || ['DHCP','Statisch'],'','saveWizardFields();resetNetworkFieldsForProfile();renderWizard();')}
        ${sel('netzwerk.Verbindungstyp','Verbindungstyp',d.netzwerk.Verbindungstyp,connItems,'','onWizardConnectionTypeChanged()')}
        ${f('netzwerk.IP-Adresse','IP-Adresse',d.netzwerk['IP-Adresse'],'text','logic-static')}
        ${f('netzwerk.DNS','DNS',d.netzwerk.DNS,'text','logic-static')}
        ${f('netzwerk.MAC-Adresse','MAC-Adresse',d.netzwerk['MAC-Adresse'])}
        ${sel('netzwerk.VLAN','VLAN',d.netzwerk.VLAN,STAMM.vlans || ['110','120','130'],'logic-vlan')}
        ${sel('netzwerk.SwitchPort','Switch-Port',d.netzwerk.SwitchPort,STAMM.switches || [],'logic-lan')}
        ${f('netzwerk.Wanddose','Wanddose',d.netzwerk.Wanddose,'text','logic-lan')}
        ${sel('netzwerk.AccessPoint','Access Point',d.netzwerk.AccessPoint,STAMM.accesspoints || ['-'],'logic-wlan')}
        ${sel('netzwerk.SSID','SSID',d.netzwerk.SSID,STAMM.ssids || ['EAH-Intern','eduroam','-'],'logic-wlan')}
        <div style="grid-column:1/-1">
          <label class="form-label">Bemerkung</label>
          <textarea class="form-control wiz" data-path="netzwerk.Bemerkung">${d.netzwerk.Bemerkung}</textarea>
        </div>
      </div>
      <div id="networkHint" class="alert alert-info mt-3"></div>
      <div id="networkErrors" class="mt-2"></div>`;
  }

  if(wizard.step===4){
    const disabled = !isComputeType(d.type);
    if(disabled){
      return `<h4>Software / Firmware</h4>
        <div class="alert alert-warning">
          Für diesen Gerätetyp ist klassische Software-Erfassung optional. Nutze das Feld für Firmware, Treiber oder Controller-Hinweise.
        </div>
        <textarea id="wizSoftware" class="form-control" rows="6">${(d.software||[]).join('\n')}</textarea>`;
    }
    return renderSmartSoftwareStep();
  }

  return wizardPreview();
}

function renderWizard(){
  document.getElementById('wizardSteps').innerHTML=wizardSteps().map((s,i)=>`<div class="wizard-step ${i===wizard.step?'active':i<wizard.step?'done':''}">${i+1}. ${s}</div>`).join('');
  const body = document.getElementById('wizardBody');
  if(typeof wizardStepHtml !== 'function'){
    body.innerHTML = '<div class="alert alert-danger">Wizard-Renderer fehlt. Bitte Version prüfen.</div>';
    return;
  }
  body.innerHTML=wizardStepHtml();
  document.getElementById('wizardNextBtn').classList.toggle('d-none',wizard.step===5);
  document.getElementById('wizardSaveBtn').classList.toggle('d-none',wizard.step!==5);
  applyWizardLogic();
}

function wizardBack(){
  saveWizardFields();
  if(wizard.step > 0){
    wizard.step--;
    renderWizard();
  }
}
 function wizardNext(){
  if(!validateWizardStep()) return;
  if(wizard.step < 5){
    wizard.step++;
    renderWizard();
  }
}

function saveWizardFields(){
  if(!wizard || !wizard.data) return;
  document.querySelectorAll('.wiz').forEach(el=>{
    const path = el.dataset ? el.dataset.path : null;
    if(!path) return;
    setPath(wizard.data, path, el.value);
  });

  const sw = document.getElementById('wizSoftware');
  if(sw){
    wizard.data.software = sw.value
      .split('\n')
      .map(x=>x.trim())
      .filter(Boolean);
    if(typeof ensureSmartSoftwareState === 'function') ensureSmartSoftwareState();
  }
}


function setWrap(selector, visible, disabled=false){document.querySelectorAll(selector).forEach(el=>{el.classList.toggle('d-none-logic',!visible);el.classList.toggle('disabled-field',disabled);el.querySelectorAll('input,select,textarea').forEach(i=>i.disabled=disabled);});}
function applyWizardLogic(){if(!wizard || !wizard.data) return;const t=wizard.data.type, status=wizard.data.grund?.Status, addr=wizard.data.netzwerk?.Adressart, conn=wizard.data.netzwerk?.Verbindungstyp||'';if(wizard.step===0){const typeHint=document.getElementById('typeHint');if(typeHint){typeHint.innerHTML=isComputeType(t)?'PC/Notebook/Thin Client: Hardware, Netzwerk und Software werden erfasst.':isPrinterType(t)?'Drucker: Druckerfelder werden aktiv, Software ist optional.':isInfraType(t)?'Infrastrukturgerät: PoE/Controller und Management-Netzwerk sind relevant.':'Monitor: keine Netzwerk- oder Softwarepflicht.';}}if(wizard.step===1){setWrap('.logic-compute',isComputeType(t),!isComputeType(t));setWrap('.logic-retired',status==='Ausgemustert');setWrap('.logic-defect',status==='Defekt');const h=document.getElementById('grundHint');if(h){if(status==='Defekt'){h.classList.remove('d-none');h.textContent='Status Defekt: Defektbeschreibung ausfüllen und anschließend Ticket anlegen.';}else if(status==='Ausgemustert'){h.classList.remove('d-none');h.textContent='Status Ausgemustert: Netzwerk/Software können später entfernt oder archiviert werden.';}else h.classList.add('d-none');}}if(wizard.step===2){setWrap('.logic-compute',isComputeType(t),!isComputeType(t));setWrap('.logic-printer',isPrinterType(t));setWrap('.logic-infra',isInfraType(t));setWrap('.logic-dock',t==='Notebook');setWrap('.logic-monitor-ref',isComputeType(t));const hardwareHint=document.getElementById('hardwareHint');if(hardwareHint){hardwareHint.textContent=isPrinterType(t)?'Drucker: CPU/RAM sind ausgeblendet, Druckertyp/Toner/Zählerstand sind aktiv.':isInfraType(t)?'Access Point/Switch: PoE und Controller sind relevant.':isMonitorType(t)?'Monitor: Hardwaredetails stark reduziert.':'Computergerät: CPU, RAM, Speicher, Monitor und ggf. Dockingstation erfassen.';}}if(wizard.step===3){
  const isStatic=addr==='Statisch';
  const profile=getConnectionProfile(conn);
  const isWlan=profile==='wlan';
  const isLan=profile==='lan';
  const isVpn=profile==='vpn';
  const isOffline=profile==='offline';
  setWrap('.logic-static',true,!isStatic||isOffline,isStatic&&!isOffline);
  setWrap('.logic-wlan',isWlan,!isWlan);
  setWrap('.logic-lan',isLan,!isLan);
  setWrap('.logic-vlan',!isVpn&&!isOffline,isVpn||isOffline);
  const hint=document.getElementById('networkHint');
  if(hint){
    if(isLan) hint.textContent='LAN: Switch-Port ist Pflicht, Wanddose wird empfohlen. Access Point/SSID werden ausgeblendet.';
    else if(isWlan) hint.textContent='WLAN: Access Point und SSID sind Pflicht. Switch-Port/Wanddose werden ausgeblendet.';
    else if(isVpn) hint.textContent='VPN: virtuelle Verbindung ohne Switch-Port, Wanddose, AP oder SSID.';
    else if(isOffline) hint.textContent='Offline: Netzwerkdaten werden nicht gepflegt.';
    else hint.textContent=isStatic?'Statisch: IP-Adresse und DNS sind Pflicht.':'DHCP: IP-Adresse und DNS werden nicht manuell gepflegt.';
  }
  const validation=networkValidationMessages(wizard.data);
  const box=document.getElementById('networkErrors');
  if(box) box.innerHTML=[
    ...validation.errors.map(e=>`<div class="alert alert-danger py-2 mb-2">${e}</div>`),
    ...validation.warnings.map(e=>`<div class="alert alert-warning py-2 mb-2">${e}</div>`)
  ].join('');
}}
function validateWizardStep(){
  saveWizardFields();
  if(wizard.step===3){
    const result=networkValidationMessages(wizard.data);
    if(result.errors.length){
      alert('Bitte Netzwerkangaben prüfen:\n\n' + result.errors.join('\n'));uxShake('#wizardBody .form-control,#wizardBody .form-select');
      return false;
    }
  }
  return true;
}
function wizardPreview(){
  const d = wizard.data;
  const validation = (typeof networkValidationMessages === 'function') ? networkValidationMessages(d) : {errors:[], warnings:[]};

  return `<h4>Vorschau</h4>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><b>Asset</b></div>
          <div class="card-body kv">
            ${kv('Typ',d.type)}
            ${kv('Standort',d.grund.Standort)}
            ${kv('Raum',d.grund.Raum)}
            ${kv('Status',d.grund.Status)}
            ${kv('Hauptnutzer',d.grund.Hauptnutzer)}
            ${kv('Hersteller',d.grund.Hersteller)}
            ${kv('Modellserie',d.grund.Modellserie||'-')}
            ${kv('Modell',d.grund.Modell)}
            ${kv('Betriebssystem',d.grund.Betriebssystem)}
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><b>Netzwerk / Software</b></div>
          <div class="card-body kv">
            ${kv('Netzwerktyp',d.netzwerk.Netzwerktyp)}
            ${kv('Adressart',d.netzwerk.Adressart)}
            ${kv('Verbindungstyp',d.netzwerk.Verbindungstyp)}
            ${kv('IP-Adresse',d.netzwerk['IP-Adresse']||'-')}
            ${kv('Software-Checks',Object.values(d.smartSoftware||{}).filter(Boolean).length+' aktiv')}
            ${kv('Zusatzsoftware',(d.software||[]).join(', ')||'-')}
          </div>
        </div>
      </div>
    </div>
    ${renderValidationSummary ? renderValidationSummary() : ''}
    ${validation.errors.length ? `<div class="alert alert-danger mt-3"><b>Fehler:</b><br>${validation.errors.join('<br>')}</div>` : ''}
    ${validation.warnings.length ? `<div class="alert alert-warning mt-3"><b>Hinweise:</b><br>${validation.warnings.join('<br>')}</div>` : ''}`;
}

function wizardSave(){
  try{
    if(!requireWriteAccess('Gerät erstellen')) return;
    saveWizardFields();
    const validation=networkValidationMessages(wizard.data);
    if(validation.errors.length){
      alert('Speichern nicht möglich:\n\n'+validation.errors.join('\n'));
      uxShake('#wizardBody .form-control,#wizardBody .form-select');
      return;
    }
    if(!safetyConfirm('Neues Gerät final erstellen?', 'Asset, Hardware, Netzwerk und Notiz werden angelegt.')){
      return;
    }
    const d=wizard.data, assetId=nextId('assets','Asset-ID',ID_PREFIXES.assets), hwId=nextId('hardware','Hardware-ID',ID_PREFIXES.hardware), netId=nextId('netzwerk','Netzwerk-ID',ID_PREFIXES.netzwerk), noteId=nextId('notizen','Notiz-ID',ID_PREFIXES.notizen), name=nextDeviceName(wizard.data.type);
    DB.assets.push({'Asset-ID':assetId,'Gerätename':name,'Asset-Typ':wizard.data.type,'Standort':wizard.data.grund.Standort,'Raum':wizard.data.grund.Raum,'Status':wizard.data.grund.Status,'Hauptnutzer':wizard.data.grund.Hauptnutzer,'Hersteller':wizard.data.grund.Hersteller,'Modellserie':wizard.data.grund.Modellserie,'Modell':wizard.data.grund.Modell,'Seriennummer':wizard.data.grund.Seriennummer,'Inventarnummer':wizard.data.grund.Inventarnummer,'Betriebssystem':wizard.data.grund.Betriebssystem,'Domäne':wizard.data.grund.Domäne,'Notizen':wizard.data.grund.Notizen});
    DB.hardware.push({'Hardware-ID':hwId,'Asset-ID':assetId,'Gerätename':name,'CPU':wizard.data.hardware.CPU,'RAM':wizard.data.hardware.RAM,'Speicher':wizard.data.hardware.Speicher,'Monitor':wizard.data.hardware.Monitor,'Dockingstation':wizard.data.hardware.Dockingstation,'Garantie bis':wizard.data.hardware.GarantieBis,'Bemerkung':wizard.data.hardware.Bemerkung||wizard.data.hardware.Druckertyp||wizard.data.hardware.Controller});
    DB.netzwerk.push({'Netzwerk-ID':netId,'Asset-ID':assetId,'Gerätename':name,'Netzwerktyp':wizard.data.netzwerk.Netzwerktyp,'Adressart':wizard.data.netzwerk.Adressart,'Verbindungstyp':wizard.data.netzwerk.Verbindungstyp,'IP-Adresse':wizard.data.netzwerk['IP-Adresse'],'MAC-Adresse':wizard.data.netzwerk['MAC-Adresse'],'DNS':wizard.data.netzwerk.DNS,'VLAN':wizard.data.netzwerk.VLAN,'Switch-Port':wizard.data.netzwerk.SwitchPort,'Wanddose':wizard.data.netzwerk.Wanddose,'Access Point':wizard.data.netzwerk.AccessPoint,'SSID':wizard.data.netzwerk.SSID,'Bemerkung':wizard.data.netzwerk.Bemerkung});
    if(isComputeType(wizard.data.type)){
      wizard.data.software.forEach(line=>{
        const p=line.split(';');
        DB.software.push({'Software-ID':nextId('software','Software-ID',ID_PREFIXES.software),'Asset-ID':assetId,'Gerätename':name,'Softwarename':p[0]||line,'Version':p[1]||'','Hersteller':p[2]||'','Lizenzstatus':STAMM.lizenzstatus?.[0]||'Aktiv','Update-Status':STAMM.updateStatus?.[0]||'Prüfen','Kritikalität':STAMM.kritikalitaet?.[1]||'Normal','Bemerkung':'Aus Wizard erstellt'});
      });
    }
    DB.notizen.push({'Notiz-ID':noteId,'Asset-ID':assetId,'Gerätename':name,'Titel':'Geräteanlage','Kategorie':'Erfassung','Status':'Aktiv','Inhalt':'Über Wizard erfasst. '+(wizard.data.grund.Notizen||'')});
    persist();
    maybeSaveDbToServer();
    selectedIndex.assets=DB.assets.length-1;
    activeKey='assets';
    bootstrap.Modal.getInstance(document.getElementById('deviceWizardModal')).hide();
    renderAll();
    toast('Gerät vollständig erstellt.');
  }catch(e){
    console.error(e);
    alert('Gerät konnte nicht erstellt werden:\n' + e.message);
  }
}


// Referenzierte Erstellung: Hardware/Netzwerk/Software/Notizen werden gegen ein bestehendes Asset referenziert.
// Dadurch entstehen keine losen Hardware-Einträge ohne Asset-Bezug.
function isAssetLinkedModule(key){
  return ['netzwerk','software','notizen','tickets'].includes(key);
}
function getModuleLabel(key){
  return ({hardware:'Hardware',netzwerk:'Netzwerk',software:'Software',notizen:'Notiz',tickets:'Ticket'}[key] || key);
}
function hasExistingAssetLink(key, assetId){
  return (DB[key]||[]).some(x => x['Asset-ID'] === assetId);
}
function openReferenceCreate(key){
  if(!requireWriteAccess('Eintrag anlegen')) return;
  const mod = modules.find(m => m.key === key);
  if(!mod) return;
  const assets = DB.assets || [];
  if(assets.length === 0){
    alert('Es existiert noch kein Asset. Bitte zuerst über „+ Neues Gerät erfassen“ ein Asset erstellen.');
    return;
  }
  modalState = {key, index:null, mode:'create'};
  const template = (DB[key] && DB[key][0]) ? Object.fromEntries(Object.keys(DB[key][0]).map(k => [k,''])) : {};
  template[mod.id] = nextId(key, mod.id, mod.prefix);
  template['Asset-ID'] = assets[0]['Asset-ID'];
  template['Gerätename'] = assets[0]['Gerätename'];

  if(key === 'hardware' && hasExistingAssetLink('hardware', template['Asset-ID'])){
    template['Bemerkung'] = 'Zusätzliche Hardware / Austausch / Ergänzung';
  }
  buildForm(mod, template, 'Neu anlegen – Asset referenzieren');
}

function openTicketFromAsset(assetId){
  if(!requireWriteAccess('Ticket aus Asset erstellen')) return;
  const asset = CORE.findAsset(assetId);
  if(!asset){
    notify('Asset nicht gefunden.', 'error');
    return;
  }
  const mod = modules.find(m => m.key === 'tickets');
  modalState = {key:'tickets', index:null, mode:'create'};
  const template = {
    'Ticket-ID': nextId('tickets','Ticket-ID',ID_PREFIXES.tickets),
    'Asset-ID': asset['Asset-ID'],
    'Gerätename': asset['Gerätename'],
    'Titel': '',
    'Kategorie': (STAMM.ticketKategorien || ['Allgemein'])[0] || 'Allgemein',
    'Priorität': (STAMM.prioritaeten || ['Normal']).includes('Normal') ? 'Normal' : ((STAMM.prioritaeten || ['Normal'])[0] || 'Normal'),
    'Status': 'Offen',
    'Tags': 'asset;nacharbeit',
    'Ursache': '',
    'Lösung': '',
    'Knowledge-ID': ''
  };
  buildForm(mod, template, 'Ticket aus Asset erstellen');
}

function createAssetNote(asset, title, content){
  if(!asset) return false;
  if(!safetyConfirm(title + '?', asset['Gerätename'] || asset['Asset-ID'])) return false;
  if(!Array.isArray(DB.notizen)) DB.notizen = [];
  DB.notizen.push({
    'Notiz-ID': nextId('notizen','Notiz-ID',ID_PREFIXES.notizen),
    'Asset-ID': asset['Asset-ID'],
    'Gerätename': asset['Gerätename'],
    'Titel': title,
    'Kategorie': 'Workflow',
    'Status': 'Aktiv',
    'Inhalt': content
  });
  persist();
  maybeSaveDbToServer();
  ASSET_DETAIL_TAB = 'notes';
  renderAll();
  toast('Workflow-Notiz erstellt.');
  return true;
}

function createAssetWorkflowNote(assetId, type){
  if(!requireWriteAccess('Workflow-Notiz erstellen')) return;
  const asset = CORE.findAsset(assetId);
  if(!asset){
    notify('Asset nicht gefunden.', 'error');
    return;
  }
  const today = new Date().toISOString().slice(0,10);
  const workflows = {
    move: {
      title: 'Workflow: Asset umziehen',
      content: `Umzug vorbereiten (${today})\n\nNeuer Standort/Raum:\nNetzwerkbezug prüfen: VLAN, Switch-Port, Wanddose, Access Point, SSID\nBetroffene Tickets/Notizen prüfen:\nAbschlussnotiz ergänzen:`
    },
    retire: {
      title: 'Workflow: Asset ausmustern',
      content: `Ausmusterung vorbereiten (${today})\n\nStatus auf Ausgemustert setzen\nOffene Tickets prüfen\nSoftware-/Lizenzhinweise prüfen\nDatenträger-/Datenschutzschritt dokumentieren\nRückgabe, Lager oder Entsorgung festlegen:`
    },
    inventory: {
      title: 'Inventur bestätigt',
      content: `Inventur bestätigt am ${today}\n\nStandort/Raum geprüft:\nSeriennummer/Inventarnummer geprüft:\nAbweichungen:\nGesehen von:`
    },
    loan: {
      title: 'Workflow: Ausgabe/Rückgabe',
      content: `Ausgabe/Rückgabe vorbereiten (${today})\n\nPerson/Team:\nZubehör:\nZustand bei Ausgabe/Rückgabe:\nFrist/Rückgabedatum:\nUnterschrift/Bestätigung:`
    }
  };
  const workflow = workflows[type] || workflows.inventory;
  createAssetNote(asset, workflow.title, workflow.content);
}

function createScannerReviewNote(idx){
  if(!requireWriteAccess('Scannerbefund notieren')) return;
  const row = softwareFullRows()[idx] || softwareFullRows()[SOFTWARE_FULL_SELECTED];
  if(!row){
    notify('Kein Scannerbefund ausgewählt.', 'warning');
    return;
  }
  const asset = softwareFullAsset(row);
  if(!asset){
    notify('Der Scannerbefund ist keinem Asset zugeordnet. Bitte zuerst Asset-Kontext prüfen.', 'warning');
    return;
  }
  const name = row.DisplayName || softwareFullDisplayName(row);
  const content = [
    'Scannerbefund prüfen',
    '',
    `Software: ${name || '-'}`,
    `Version: ${softwareFullVersion(row) || '-'}`,
    `Hersteller: ${row.Publisher || row.Hersteller || '-'}`,
    `Quelle: ${row.Sources || row.Source || row.Quelle || '-'}`,
    `Confidence: ${row.DetectionConfidence || '-'}`,
    `Update-Auswertung: ${softwareFullUpdateAssessment(row)}`,
    '',
    'Nacharbeit:',
    '- Anwendung fachlich einordnen',
    '- Update-/Lizenzstatus prüfen',
    '- Standardsoftware oder Ausnahme dokumentieren'
  ].join('\n');
  createAssetNote(asset, 'Scannerbefund prüfen: ' + (name || 'Software'), content);
}

// CRUD modal

function deleteAssetWithReferences(idx){
  if(!requireWriteAccess('Asset löschen')) return;
  const rows = filterRows(DB.assets || [], 'assets');
  const asset = rows[idx];
  if(!asset) return;

  const assetId = asset['Asset-ID'];
  const name = asset['Gerätename'] || assetId;

  const refs = {
    hardware: byAsset('hardware', assetId).length,
    netzwerk: byAsset('netzwerk', assetId).length,
    software: byAsset('software', assetId).length,
    tickets: byAsset('tickets', assetId).length,
    notizen: byAsset('notizen', assetId).length
  };

  const refText = Object.entries(refs)
    .filter(([k,v])=>v>0)
    .map(([k,v])=>`${k}: ${v}`)
    .join('\n');

  const msg = refText
    ? `Asset wirklich löschen?\n\n${name}\n${assetId}\n\nVerknüpfte Einträge werden ebenfalls gelöscht:\n${refText}`
    : `Asset wirklich löschen?\n\n${name}\n${assetId}`;

  if(APP_SETTINGS.confirmDelete && !confirm(msg)) return;

  const realIdx = DB.assets.indexOf(asset);
  if(realIdx >= 0) DB.assets.splice(realIdx,1);

  ['hardware','netzwerk','software','tickets','notizen'].forEach(table=>{
    DB[table] = (DB[table] || []).filter(row => row['Asset-ID'] !== assetId);
  });

  selectedIndex.assets = 0;
  persist();
  saveDbToServer();
  render();
  toast('Asset inklusive Referenzen gelöscht.');
}

function openCreate(key){if(!requireWriteAccess('Eintrag anlegen')) return;const mod=modules.find(m=>m.key===key);modalState={key,index:null,mode:'create'};const template=(DB[key]&&DB[key][0])?Object.fromEntries(Object.keys(DB[key][0]).map(k=>[k,''])):{};template[mod.id]=nextId(key,mod.id,mod.prefix);if(template['Asset-ID']!==undefined){template['Asset-ID']=DB.assets[0]?.['Asset-ID']||'';template['Gerätename']=DB.assets[0]?.['Gerätename']||'';}buildForm(mod,template,'Neu anlegen');}
function openEdit(key,idx){if(!requireWriteAccess('Eintrag bearbeiten')) return;const rows=filterRows(DB[key]||[],key), row=rows[idx], realIdx=DB[key].indexOf(row);modalState={key,index:realIdx,mode:'edit'};buildForm(modules.find(m=>m.key===key),{...row},'Bearbeiten');}
function buildForm(mod,row,title){document.getElementById('editTitle').textContent=`${mod.title} – ${title}`;document.getElementById('editForm').innerHTML=renderModalRequiredSummary(mod.key)+Object.keys(row).map(k=>fieldHtml(k,row[k],mod)).join('');new bootstrap.Modal(document.getElementById('editModal')).show();setTimeout(applyEditLogic,50);}
function renderModalRequiredSummary(key){
  const fields = (typeof REQUIRED_FIELDS !== 'undefined' && REQUIRED_FIELDS[key]) ? REQUIRED_FIELDS[key] : [];
  if(!fields.length) return '';
  return `<div class="alert alert-light modal-required-summary"><b>Pflichtfelder:</b> ${fields.map(safeEscape).join(', ')}</div>`;
}
function fieldHtml(k,v,mod){const readonly=(k===mod.id);if(k==='Asset-ID' && modalState.key==='assets')return `<div><label class="form-label required-label">${displayFieldLabel(modalState.key,k)}</label><input class="form-control edit-field" data-key="${k}" value="${v||''}" readonly><div class="logic-hint">Asset-ID bleibt fest.</div></div>`;
if(k==='Asset-ID')return `<div><label class="form-label required-label">${displayFieldLabel(modalState.key,k)}</label><select class="form-select edit-field" data-key="${k}" onchange="syncAssetName(this.value);applyEditLogic();showReferenceWarning()">${DB.assets.map(a=>`<option value="${a['Asset-ID']}" ${a['Asset-ID']===v?'selected':''}>${a['Asset-ID']} – ${a['Gerätename']}</option>`).join('')}</select><div class="logic-hint">Pflicht: Eintrag wird mit diesem Asset verknüpft.</div></div>`;
if(modalState.key==='software' && k==='Hersteller'){
  return `<div class="context-field-software"><label class="form-label">Softwarehersteller</label>
    <select class="form-select edit-field" data-key="${k}" onchange="applySoftwareManufacturerLogic();applyEditLogic()">
      ${SOFTWARE_HERSTELLER.map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}
    </select>
    <div class="logic-hint">Softwarehersteller, nicht Gerätehersteller.</div>
  </div>`;
}
if(modalState.key==='software' && k==='Softwarename'){
  const currentHersteller = getEditVal('Hersteller') || SOFTWARE_HERSTELLER[0];
  const names = getSoftwareNamesForManufacturer(currentHersteller);
  if(names.length){
    return `<div class="context-field-software"><label class="form-label">Software / Anwendung</label>
      <select class="form-select edit-field" data-key="${k}">
        ${names.map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}
      </select>
      <div class="logic-hint">Gefiltert nach Softwarehersteller.</div>
    </div>`;
  }
}


if(modalState.key==='netzwerk' && k==='Netzwerktyp'){
  return `<div data-editwrap="${k}">
    <label class="form-label">${displayFieldLabel(modalState.key,k)}</label>
    <select class="form-select edit-field" data-key="${k}" onchange="onEditNetworkTypeChanged()">
      ${(STAMM.netzwerktypen||['LAN','WLAN','VPN','Offline']).map(s=>`<option value="${escapeHtml(s)}" ${s===v?'selected':''}>${escapeHtml(s)}</option>`).join('')}
    </select>
  </div>`;
}
if(modalState.key==='netzwerk' && k==='Verbindungstyp'){
  const rowNetType = getEditVal('Netzwerktyp') || (modalState.index!==null && DB.netzwerk[modalState.index] ? DB.netzwerk[modalState.index]['Netzwerktyp'] : 'LAN');
  const allowed = filterConnectionTypes(rowNetType || 'LAN');
  const current = allowed.includes(v) ? v : (allowed[0] || v);
  return `<div data-editwrap="${k}">
    <label class="form-label">${displayFieldLabel(modalState.key,k)}</label>
    <select class="form-select edit-field" data-key="${k}" onchange="onEditConnectionTypeChanged()">
      ${allowed.map(s=>`<option value="${escapeHtml(s)}" ${s===current?'selected':''}>${escapeHtml(s)}</option>`).join('')}
    </select>
    <div class="logic-hint">Gefiltert nach Netzwerktyp.</div>
  </div>`;
}
const stKey=fieldStamm[k];if(stKey)return `<div data-editwrap="${k}"><label class="form-label">${displayFieldLabel(modalState.key,k)}</label><select class="form-select edit-field" data-key="${k}" onchange="applyEditLogic()">${(STAMM[stKey]||[]).map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}</select></div>`;if((v||'').length>80||k==='Inhalt'||k==='Lösung'||k==='Bemerkung'||k==='Notizen'||k==='Ursache')return `<div style="grid-column:1/-1" data-editwrap="${k}"><label class="form-label">${displayFieldLabel(modalState.key,k)}</label><textarea class="form-control edit-field" rows="3" data-key="${k}" ${readonly?'readonly':''} oninput="applyEditLogic()">${v||''}</textarea></div>`;return `<div data-editwrap="${k}"><label class="form-label">${displayFieldLabel(modalState.key,k)}</label><input class="form-control edit-field" data-key="${k}" value="${v||''}" ${readonly?'readonly':''} oninput="applyEditLogic()"></div>`;}
function getEditVal(k){const el=document.querySelector(`.edit-field[data-key="${k}"]`);return el?el.value:'';}
function setEditWrap(k,visible,disabled=false,required=false){document.querySelectorAll(`[data-editwrap="${k}"]`).forEach(w=>{w.classList.toggle('d-none-logic',!visible);w.classList.toggle('disabled-field',disabled);w.querySelectorAll('input,select,textarea').forEach(i=>{i.disabled=disabled;i.required=required;});const l=w.querySelector('label');if(l)l.classList.toggle('required-label',required);});}

function showReferenceWarning(){
  const key = modalState.key;
  const assetId = getEditVal('Asset-ID');
  const warnings = [];
  if(isAssetLinkedModule(key) && !assetId) warnings.push('Asset-ID ist Pflicht.');
  if(key === 'hardware' && assetId && hasExistingAssetLink('hardware', assetId) && modalState.mode === 'create'){
    warnings.push('Für dieses Asset existiert bereits ein Hardware-Eintrag. Dies wird als Ergänzung/Austausch dokumentiert.');
  }
  const box = document.getElementById('editWarnings');
  if(box && warnings.length) box.innerHTML = warnings.map(w=>`<div class="alert alert-info">${w}</div>`).join('');
}

function applySoftwareManufacturerLogic(){
  if(modalState.key!=='software') return;
  const manufacturer = getEditVal('Hersteller');
  const softwareField = document.querySelector('.edit-field[data-key="Softwarename"]');
  if(!softwareField) return;
  const names = getSoftwareNamesForManufacturer(manufacturer);
  if(names.length && !names.includes(softwareField.value)){
    softwareField.value = names[0];
  }
}

function onEditNetworkTypeChanged(){
  const nt = getEditVal('Netzwerktyp');
  const connEl = document.querySelector('.edit-field[data-key="Verbindungstyp"]');
  const allowed = filterConnectionTypes(nt);
  if(connEl){
    connEl.innerHTML = allowed.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    connEl.value = allowed[0] || '';
  }
  onEditConnectionTypeChanged();
}
function onEditConnectionTypeChanged(){
  const conn = getEditVal('Verbindungstyp');
  const ntEl = document.querySelector('.edit-field[data-key="Netzwerktyp"]');
  if(ntEl){
    ntEl.value = getNetworkTypeFromConnection(conn);
  }
  const profile = getConnectionProfile(conn);
  if(profile === 'lan'){
    setEditValue('Access Point','-'); setEditValue('SSID','-');
  }
  if(profile === 'wlan'){
    setEditValue('Switch-Port',''); setEditValue('Wanddose','');
  }
  if(profile === 'vpn' || profile === 'offline'){
    setEditValue('Switch-Port',''); setEditValue('Wanddose','');
    setEditValue('Access Point','-'); setEditValue('SSID','-');
  }
  if(profile === 'offline'){
    setEditValue('IP-Adresse',''); setEditValue('DNS',''); setEditValue('MAC-Adresse',''); setEditValue('VLAN','');
  }
  applyEditLogic();
}
function setEditValue(key,value){
  const el = document.querySelector(`.edit-field[data-key="${key}"]`);
  if(el) el.value = value;
}
function applyEditLogic(){const key=modalState.key;const warn=[];if(isAssetLinkedModule(key)){const assetId=getEditVal('Asset-ID');if(!assetId)warn.push('Asset-ID ist Pflicht.');if(key==='hardware'&&assetId&&hasExistingAssetLink('hardware',assetId)&&modalState.mode==='create')warn.push('Für dieses Asset existiert bereits Hardware. Der neue Eintrag wird als Ergänzung/Austausch geführt.');}if(key==='netzwerk'){
  const addr=getEditVal('Adressart'), conn=getEditVal('Verbindungstyp');
  const profile=getConnectionProfile(conn);
  const isStatic=addr==='Statisch', isWlan=profile==='wlan', isLan=profile==='lan', isVpn=profile==='vpn', isOffline=profile==='offline';
  setEditWrap('IP-Adresse',true,!isStatic||isOffline,isStatic&&!isOffline);
  setEditWrap('DNS',true,!isStatic||isOffline,isStatic&&!isOffline);
  setEditWrap('Access Point',isWlan,!isWlan);
  setEditWrap('SSID',isWlan,!isWlan);
  setEditWrap('Switch-Port',isLan,!isLan,isLan);
  setEditWrap('Wanddose',isLan,!isLan,false);
  setEditWrap('VLAN',!isVpn&&!isOffline,isVpn||isOffline,false);
  if(isLan) warn.push('LAN: Switch-Port Pflicht, Wanddose empfohlen.');
  if(isWlan) warn.push('WLAN: Access Point und SSID Pflicht.');
  if(isVpn) warn.push('VPN: keine physische Infrastruktur erforderlich.');
  if(isOffline) warn.push('Offline: Netzwerkfelder werden nicht gepflegt.');
}if(key==='tickets'){const status=getEditVal('Status');setEditWrap('Ursache',true,false,status==='Gelöst');setEditWrap('Lösung',true,false,status==='Gelöst');if(status==='Gelöst')warn.push('Gelöst: Ursache und Lösung pflegen. Knowledge-Erstellung ist sinnvoll.');else warn.push('Knowledge-Erstellung erst bei Status „Gelöst“ sinnvoll.');}if(key==='software'){
  const liz=getEditVal('Lizenzstatus');
  if(liz==='Abgelaufen')warn.push('Lizenz abgelaufen: Ticket/Aufgabe zur Lizenzprüfung anlegen.');
  warn.push('Kontext: Feld „Softwarehersteller“ beschreibt den Hersteller der Anwendung, nicht den Gerätehersteller.');
}document.getElementById('editWarnings').innerHTML=warn.map(w=>`<div class="alert alert-warning">${w}</div>`).join('');}
function syncAssetName(assetId){const a=DB.assets.find(x=>x['Asset-ID']===assetId);if(!a)return;document.querySelectorAll('.edit-field').forEach(el=>{if(el.dataset.key==='Gerätename')el.value=a['Gerätename'];});}

// ===== v9 NETWORK VALIDATION & AUTOFILL =====
function validateNetworkStrict(obj){
  const check = networkValidationMessages(obj || {});
  if(check.errors.length) return check.errors[0];
  return null;
}

function autoFillNetwork(obj){
  if(obj['Verbindungstyp']?.includes('WLAN') && !obj['VLAN']){
    obj['VLAN'] = 'WLAN';
  }
  if(obj['Adressart']==='DHCP'){
    obj['IP-Adresse'] = '';
    obj['DNS'] = '';
  }
  return obj;
}

function saveModal(){
  try{
    if(!requireWriteAccess('Speichern')) return;
    applyEditLogic();
    let obj={};
    document.querySelectorAll('.edit-field').forEach(el=>{
      obj[el.dataset.key]=el.value;
    });
    if(obj.Tags) obj.Tags = normalizeTags(obj.Tags);
    if(isAssetLinkedModule(modalState.key)&&!obj['Asset-ID']){
      alert('Bitte ein Asset auswählen.');
      return;
    }
    if(modalState.key==='netzwerk'){
      if(!networkTypeMatchesConnection(obj['Netzwerktyp'], obj['Verbindungstyp'])){
        alert('Netzwerktyp und Verbindungstyp passen nicht zusammen.');
        return;
      }
      obj = autoFillNetwork(obj);
      const check = networkValidationMessages(obj);
      if(check.errors.length){
        alert(check.errors.join('\n'));
        return;
      }
    }
    if(modalState.key==='netzwerk'&&obj.Adressart==='Statisch'&&!obj['IP-Adresse']){
      alert('Bei statischer Adressierung ist eine IP-Adresse Pflicht.');
      return;
    }
    if(modalState.key==='tickets'&&obj.Status==='Gelöst'&&(!obj.Ursache||!obj.Lösung)){
      alert('Bei gelöstem Ticket sind Ursache und Lösung Pflicht.');
      return;
    }
    const action = modalState.mode==='create' ? 'Eintrag anlegen?' : 'Änderungen speichern?';
    const detail = `${getModuleLabel(modalState.key)}: ${obj['Gerätename'] || obj.Titel || obj[modules.find(m=>m.key===modalState.key)?.id] || ''}`;
    if(!safetyConfirm(action, detail)){
      return;
    }
    if(modalState.mode==='create'){
      DB[modalState.key].push(obj);
      selectedIndex[modalState.key]=DB[modalState.key].length-1;
    }else{
      DB[modalState.key][modalState.index]=obj;
    }
    persist();
    maybeSaveDbToServer();
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    render();
    toast('Gespeichert.');
  }catch(e){
    console.error(e);
    alert('Speichern fehlgeschlagen:\n' + e.message);
  }
}

function normalizeTags(value){
  return Array.from(new Set(String(value || '')
    .split(/[;,]/)
    .map(x => x.trim().toLowerCase())
    .filter(Boolean)))
    .join(';');
}
function deleteRow(key,idx){if(!requireWriteAccess('Eintrag löschen')) return;const rows=filterRows(DB[key]||[],key), row=rows[idx], realIdx=DB[key].indexOf(row);if(realIdx<0)return;if(!APP_SETTINGS.confirmDelete || confirm('Eintrag wirklich löschen?')){DB[key].splice(realIdx,1);selectedIndex[key]=0;persist();maybeSaveDbToServer();render();toast('Gelöscht.');}}
function createKnowledgeFromTicket(idx){
  if(!requireWriteAccess('Knowledge erstellen')) return;
  const rows = filterRows(DB.tickets, 'tickets');
  const t = rows[idx];
  if(!t || t.Status !== 'Gelöst'){
    alert('Knowledge kann erst aus gelöstem Ticket erstellt werden.');
    return;
  }
  const preview = [
    'Knowledge aus gelöstem Ticket erstellen?',
    '',
    `Titel: ${t.Titel || '-'}`,
    `Kategorie: ${t.Kategorie || '-'}`,
    `Tags: ${t.Tags || '-'}`,
    `Ursache: ${t.Ursache || '-'}`,
    `Lösung: ${t.Lösung || '-'}`
  ].join('\n');
  if(!confirm(preview)) return;
  const kbId = nextId('knowledge','Knowledge-ID',ID_PREFIXES.knowledge);
  const solution = [
    t.Ursache ? `Ursache: ${t.Ursache}` : '',
    t.Lösung ? `Lösung: ${t.Lösung}` : '',
    `Quelle: Ticket ${t['Ticket-ID'] || ''} (${t['Gerätename'] || t['Asset-ID'] || '-'})`
  ].filter(Boolean).join('\n\n');
  DB.knowledge.push({
    'Knowledge-ID': kbId,
    'Titel': t.Titel,
    'Kategorie': t.Kategorie,
    'Tags': t.Tags,
    'Lösung': solution
  });
  t['Knowledge-ID'] = kbId;
  persist();
  maybeSaveDbToServer();
  activeKey = 'knowledge';
  selectedIndex.knowledge = DB.knowledge.length - 1;
  renderAll();
  toast('Knowledge aus Ticket erstellt.');
}

function duplicateKeys(rows, keyFn){
  const seen = new Map();
  rows.forEach(row => {
    const key = keyFn(row);
    if(!key) return;
    if(!seen.has(key)) seen.set(key, []);
    seen.get(key).push(row);
  });
  return Array.from(seen.entries()).filter(([,items]) => items.length > 1);
}

function dataQualityFindings(){
  const findings = [];
  duplicateKeys(DB.assets || [], a => String(a['Gerätename'] || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelter Gerätename: ${key} (${items.length})`));
  duplicateKeys(DB.assets || [], a => String(a.Seriennummer || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelte Seriennummer: ${key} (${items.length})`));
  duplicateKeys(DB.assets || [], a => String(a.Inventarnummer || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelte Inventarnummer: ${key} (${items.length})`));
  duplicateKeys(DB.netzwerk || [], n => String(n['MAC-Adresse'] || '').toLowerCase()).forEach(([key,items]) => findings.push(`Doppelte MAC-Adresse: ${key} (${items.length})`));
  duplicateKeys(DB.software || [], s => [s['Asset-ID'], String(s.Softwarename || '').toLowerCase(), String(s.Version || '').toLowerCase(), normalizeManufacturer(s.Hersteller).toLowerCase()].join('|')).forEach(([key,items]) => findings.push(`Doppelter Softwareeintrag: ${key} (${items.length})`));
  findings.push(...stammdatenFindings());
  return findings;
}

function stammdatenFindings(){
  const checks = [
    {table:'assets', field:'Asset-Typ', stamm:'assetTypen'},
    {table:'assets', field:'Status', stamm:'status'},
    {table:'assets', field:'Standort', stamm:'standorte'},
    {table:'assets', field:'Raum', stamm:'raeume'},
    {table:'assets', field:'Hersteller', stamm:'hersteller', normalize:normalizeManufacturer},
    {table:'netzwerk', field:'Netzwerktyp', stamm:'netzwerktypen'},
    {table:'netzwerk', field:'Adressart', stamm:'adressarten'},
    {table:'tickets', field:'Status', stamm:'ticketStatus'},
    {table:'tickets', field:'Priorität', stamm:'prioritaeten'}
  ];
  const findings = [];
  checks.forEach(check => {
    const allowed = new Set((STAMM[check.stamm] || []).map(x => String(x).toLowerCase()));
    if(!allowed.size) return;
    (DB[check.table] || []).forEach(row => {
      const raw = row[check.field];
      if(!raw) return;
      const value = check.normalize ? check.normalize(raw) : raw;
      if(!allowed.has(String(value).toLowerCase())) findings.push(`${check.table}.${check.field}: "${raw}" nicht in Stammdaten`);
    });
  });
  return findings;
}

function showStartupError(error){
  console.error('APP START ERROR:', error);
  const target = document.getElementById('tabContent') || document.body;
  if(target){
    target.innerHTML = `<div class="alert alert-danger m-3"><b>App konnte nicht gestartet werden.</b><br>${escapeHtml(error.message || error)}</div>`;
  }
}

function startApp(){
  const run = function(){
    Promise.resolve(init()).catch(showStartupError);
  };
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, {once:true});
  }else{
    run();
  }
}

startApp();

function OpenDeviceWizard(){ return openDeviceWizard(); }
