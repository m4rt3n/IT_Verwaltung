// ===== v35 UI ENGINE =====
const UI = {
  speed: 160,
  fadeSwap: function(el, html){
    $(el).fadeOut(this.speed, function(){
      $(this).html(html).fadeIn(UI.speed);
    });
  },
  pulse: function(el){
    $(el).addClass('pulse-success');
    setTimeout(function(){ $(el).removeClass('pulse-success'); }, 800);
  }
};

function bindUiChromeEvents(){
  if(!window.jQuery) return;
  $(document).on('mouseenter', '.card', function(){
    $(this).addClass('shadow-lg').css('transform','translateY(-4px)');
  });
  $(document).on('mouseleave', '.card', function(){
    $(this).removeClass('shadow-lg').css('transform','translateY(0)');
  });
  $(document).on('click', '.btn', function(){
    const b = $(this);
    b.css('transform','scale(0.95)');
    setTimeout(function(){ b.css('transform','scale(1)'); }, 120);
  });
  $('#editModal, #deviceWizardModal').on('hidden.bs.modal', function () {
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  });
}

document.addEventListener('DOMContentLoaded', bindUiChromeEvents, {once:true});

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

// ===== v43 CLEAN CORE LAYER =====
const CORE = {
  version: 'v43',
  findAsset: function(assetId){
    if(!window.DB && typeof DB === 'undefined') return null;
    if(!DB || !Array.isArray(DB.assets)) return null;
    return DB.assets.find(function(a){ return a && a['Asset-ID'] === assetId; }) || null;
  },
  byAsset: function(table, assetId){
    if(!DB || !Array.isArray(DB[table])) return [];
    return DB[table].filter(function(row){ return row && row['Asset-ID'] === assetId; });
  },
  safeGet: function(obj, path, def){
    try{
      return String(path).split('.').reduce(function(o,k){ return o ? o[k] : undefined; }, obj) ?? def;
    }catch(e){
      return def;
    }
  },
  setPath: function(obj, path, value){
    if(!obj || !path) return;
    var parts = String(path).split('.');
    var cur = obj;
    for(var i=0;i<parts.length-1;i++){
      var key = parts[i];
      if(typeof cur[key] !== 'object' || cur[key] === null) cur[key] = {};
      cur = cur[key];
    }
    cur[parts[parts.length-1]] = value;
  },
  ensureSmartSoftwareDefaults: function(){
    if(typeof DB === 'undefined' || !DB) return;
    if(!DB.stammdaten) DB.stammdaten = {};
    if(!Array.isArray(DB.stammdaten.software)){
      DB.stammdaten.software = [
        {name:"Firefox", isStandard:true, required:false},
        {name:"Chrome", isStandard:true, required:false},
        {name:"Adobe Acrobat Reader", isStandard:true, required:true},
        {name:"Microsoft Office", isStandard:true, required:true},
        {name:"UniGet / WinGet", isStandard:true, required:false},
        {name:"Visual C++ Redistributable", isStandard:true, required:true},
        {name:".NET Runtime", isStandard:true, required:true},
        {name:"VPN Client", isStandard:false, required:false}
      ];
    }
  },
  isSoftwareInstalled: function(assetId, name){
    if(typeof DB === 'undefined' || !DB || !Array.isArray(DB.software)) return false;
    const needle = String(name || '').toLowerCase();
    return DB.software.some(s =>
      String(s["Asset-ID"] || '') === String(assetId || '') &&
      String(s["Softwarename"] || '').toLowerCase().includes(needle)
    );
  }
};

function findAsset(assetId){
  return CORE.findAsset(assetId);
}
function byAsset(table, assetId){
  return CORE.byAsset(table, assetId);
}
function getPath(obj, path, def){
  return CORE.safeGet(obj, path, def);
}
function setPath(obj, path, value){
  return CORE.setPath(obj, path, value);
}
function ensureSmartSoftwareDefaults(){
  return CORE.ensureSmartSoftwareDefaults();
}
function isSoftwareInstalled(assetId, name){
  return CORE.isSoftwareInstalled(assetId, name);
}

const APP_SETTINGS_KEY = 'itverwaltung-v25-settings';
let APP_SETTINGS = loadAppSettings();
let BUILD_INFO = {version:null, name:null, buildDate:null, features:[], loaded:false, error:null};
let STAMM = {};
const STAMM_FILES = {
  assetTypen:'stammdaten_asset_typen.md', status:'stammdaten_status.md', standorte:'stammdaten_standorte.md',
  raeume:'stammdaten_raeume.md', hersteller:'stammdaten_hersteller.md', betriebssysteme:'stammdaten_betriebssysteme.md',
  domaenen:'stammdaten_domaenen.md', netzwerktypen:'stammdaten_netzwerktypen.md', adressarten:'stammdaten_adressarten.md',
  verbindungstypen:'stammdaten_verbindungstypen.md', vlans:'stammdaten_vlans.md', switches:'stammdaten_switches.md',
  accesspoints:'stammdaten_accesspoints.md', ssids:'stammdaten_ssids.md', lizenzstatus:'stammdaten_lizenzstatus.md',
  updateStatus:'stammdaten_update_status.md', kritikalitaet:'stammdaten_kritikalitaet.md', ticketKategorien:'stammdaten_ticket_kategorien.md',
  prioritaeten:'stammdaten_prioritaeten.md', ticketStatus:'stammdaten_ticket_status.md', notizKategorien:'stammdaten_notiz_kategorien.md', tags:'stammdaten_tags.md'
};
const FALLBACK_STAMM = {
  assetTypen:['PC','Notebook','Thin Client','Drucker','Access Point','Switch','Monitor'], status:['Aktiv','Defekt','Ausgemustert'],
  standorte:['Bibliothek'], raeume:['05.00.060'], hersteller:['Dell','Lenovo'], betriebssysteme:['Windows 11','Embedded'], domaenen:['EAH','-'],
  netzwerktypen:['LAN','WLAN','LAN/WLAN'], adressarten:['DHCP','Statisch'], verbindungstypen:['LAN direkt Wanddose','WLAN über Access Point'],
  vlans:['120'], switches:['SW-BIB-01 / Port 12'], accesspoints:['AP-BIB-01','-'], ssids:['EAH-Intern','-'],
  lizenzstatus:['Aktiv','Prüfen','Abgelaufen'], updateStatus:['Aktuell','Prüfen'], kritikalitaet:['Niedrig','Normal','Mittel','Hoch'],
  ticketKategorien:['Netzwerk','Software','Drucker'], prioritaeten:['Niedrig','Normal','Hoch','Kritisch'], ticketStatus:['Offen','In Bearbeitung','Gelöst','Geschlossen'],
  notizKategorien:['Betrieb','Erfassung'], tags:['netzwerk','lan','drucker']
};

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
function getSoftwareNamesForManufacturer(manufacturer){
  return SOFTWARE_KATALOG[manufacturer] || [];
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
  {key:'adminpanel',title:'Admin Panel',mode:'adminpanel',editable:false,group:'admin'},
  {key:'stammdaten',title:'Stammdaten',mode:'stammdaten',editable:false,group:'admin'}
];
let activeKey='dashboard', searchText='', selectedIndex=Object.fromEntries(modules.map(m=>[m.key,0]));
let modalState={key:null,index:null,mode:null}, wizard={step:0,data:null};

function parseMdList(text){return text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.startsWith('- ')).map(l=>l.replace(/^- /,'').trim()).filter(Boolean);}
async function loadStammdaten(){STAMM={};for(const [key,file] of Object.entries(STAMM_FILES)){try{const txt=await fetch('stammdaten/'+file+'?v='+Date.now()).then(r=>{if(!r.ok)throw new Error();return r.text();});STAMM[key]=parseMdList(txt);}catch{STAMM[key]=FALLBACK_STAMM[key]||[];}}}
async function reloadStammdaten(){await loadStammdaten();render();toast('Stammdaten neu geladen.');}
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
function byAsset(key,id){return (DB[key]||[]).filter(x=>x['Asset-ID']===id);}
function firstByAsset(key,id){return byAsset(key,id)[0]||null;}
function assetName(id){const a=DB.assets.find(x=>x['Asset-ID']===id);return a?a['Gerätename']:'-';}
function assetFor(row){return DB.assets.find(a=>a['Asset-ID']===row['Asset-ID']);}
function filterRows(rows){if(!searchText.trim())return rows;const q=searchText.toLowerCase();return rows.filter(r=>Object.values(r).join(' ').toLowerCase().includes(q));}
function clamp(i,len){if(len<=0)return 0;if(i<0)return 0;if(i>=len)return len-1;return i;}
function nextId(key,idField,prefix){const nums=(DB[key]||[]).map(r=>r[idField]||'').map(id=>parseInt((id.match(/(\d+)$/)||['0','0'])[1],10));return prefix+(Math.max(0,...nums)+1).toString().padStart(4,'0');}
function deviceCode(type){return {'PC':'PC','Notebook':'NB','Thin Client':'IGEL','Drucker':'DR','Access Point':'AP','Switch':'SW','Monitor':'MON'}[type]||'DEV';}
function nextDeviceName(type,bereich='BIB'){return `EAH-${bereich}-${deviceCode(type)}-${(DB.assets.length+1).toString().padStart(3,'0')}`;}
function clearSearch(){document.getElementById('globalSearch').value='';searchText='';render();}
function toast(msg){const t=document.getElementById('toast');t.innerHTML=`<div class="alert alert-success shadow">${msg}</div>`;setTimeout(()=>t.innerHTML='',1800);}
function safetyConfirm(action, detail=''){
  const text = detail ? `${action}\n\n${detail}` : action;
  return confirm(`${text}\n\nFortfahren?`);
}
const REQUIRED_FIELDS = {
  assets:['Asset-ID','Gerätename','Asset-Typ','Status'],
  hardware:['Hardware-ID','Asset-ID','Gerätename'],
  software:['Software-ID','Asset-ID','Gerätename','Softwarename'],
  netzwerk:['Netzwerk-ID','Asset-ID','Gerätename','Netzwerktyp','Adressart'],
  tickets:['Ticket-ID','Asset-ID','Gerätename','Titel','Status'],
  notizen:['Notiz-ID','Asset-ID','Gerätename','Titel'],
  knowledge:['Knowledge-ID','Titel','Lösung']
};
function validateDbBeforeWrite(){
  const required = ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'];
  const missing = required.filter(k=>!Array.isArray(DB[k]));
  if(missing.length){
    return {ok:false, message:'Fehlende oder ungueltige Tabellen: ' + missing.join(', ')};
  }
  const fieldErrors = [];
  Object.entries(REQUIRED_FIELDS).forEach(([table, fields])=>{
    (DB[table] || []).forEach((row, index)=>{
      const missingFields = fields.filter(field=>!String(row?.[field] || '').trim());
      if(missingFields.length){
        fieldErrors.push(`${table}[${index + 1}]: ${missingFields.join(', ')}`);
      }
    });
  });
  if(fieldErrors.length){
    return {ok:false, message:'Pflichtfelder fehlen: ' + fieldErrors.slice(0, 20).join('; ')};
  }
  return {ok:true, message:''};
}
async function loadBuildInfo(){
  try{
    const data = await fetch('build-info.json?v=' + Date.now()).then(r=>{
      if(!r.ok) throw new Error('build-info.json konnte nicht geladen werden.');
      return r.json();
    });
    BUILD_INFO = {
      version: data.version || null,
      name: data.name || null,
      buildDate: data.buildDate || null,
      features: Array.isArray(data.features) ? data.features : [],
      loaded: true,
      error: null
    };
  }catch(e){
    BUILD_INFO = {version:null, name:null, buildDate:null, features:[], loaded:false, error:e.message};
  }
}

async function loadDbFromServer(){
  try{
    const res = await fetch('/api/load?v=' + Date.now());
    if(!res.ok) throw new Error('API load failed');
    const data = await res.json();
    ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'].forEach(k=>{
      if(Array.isArray(data[k])) DB[k] = data[k];
    });
    normalizeDbIds(DB);
    CSV_BACKEND_AVAILABLE = true;
    return true;
  }catch(e){
    CSV_BACKEND_AVAILABLE = false;
    return false;
  }
}

function maybeSaveDbToServer(){
  if(APP_SETTINGS.autosave) return saveDbToServer();
  render();
  return Promise.resolve(false);
}

async function saveDbToServer(manual=false){
  try{
    const check = validateDbBeforeWrite();
    if(!check.ok) throw new Error(check.message);
    if(manual && !safetyConfirm('CSV-Dateien jetzt speichern?', 'Vor dem Schreiben erstellt der Server automatisch ein Backup.')){
      return false;
    }
    const res = await fetch('/api/save', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(DB)
    });
    if(!res.ok){
      const txt = await res.text();
      throw new Error(txt || 'Speichern fehlgeschlagen');
    }
    CSV_BACKEND_AVAILABLE = true;
    if(typeof showToast === 'function') showToast('In CSV gespeichert.', 'success'); else toast('In CSV gespeichert.');
    render();
    return true;
  }catch(e){
    console.error(e);
    CSV_BACKEND_AVAILABLE = false;
    if(typeof showToast === 'function') showToast('CSV-Speichern fehlgeschlagen: ' + e.message, 'error'); else alert('CSV-Speichern fehlgeschlagen: ' + e.message);
    render();
    return false;
  }
}


async function backupCsvServer(){
  try{
    if(!safetyConfirm('CSV-Ordner-Backup erstellen?', 'Es werden Kopien der aktuellen CSV-Dateien unter web_ui/backups abgelegt.')){
      return false;
    }
    const res = await fetch('/api/backup', {method:'POST'});
    if(!res.ok) throw new Error(await res.text());
    toast('CSV-Backup erstellt.');
    return true;
  }catch(e){
    alert('Backup nicht möglich:\n' + e.message);
    return false;
  }
}
function csvStatusBadge(){
  return CSV_BACKEND_AVAILABLE
    ? '<span class="badge text-bg-success">CSV Backend aktiv</span>'
    : '<span class="badge text-bg-warning">Browser-Modus / nicht gespeichert</span>';
}


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


// ===== v30.2 SAFE UX SAVE LAYER =====
function showToast(msg, type='success'){
  const old = document.querySelectorAll('.toast-custom');
  old.forEach(x=>x.remove());
  const el = document.createElement('div');
  el.className = 'toast-custom toast-' + type;
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(()=> el.classList.add('show'), 10);
  setTimeout(()=> el.remove(), 3000);
}

function setSaving(state){
  document.querySelectorAll('[data-save-button="true"]').forEach(b=>{
    if(state){
      if(!b.dataset.old) b.dataset.old = b.innerHTML;
      b.innerHTML = '⏳ Speichern...';
      b.disabled = true;
    }else{
      if(b.dataset.old) b.innerHTML = b.dataset.old;
      b.disabled = false;
      delete b.dataset.old;
    }
  });
}

function safeSave(fn){
  try{
    return fn();
  }catch(e){
    console.error('SAVE ERROR:', e);
    showToast('Fehler: ' + e.message, 'error');
    return false;
  }
}


// ===== v43 SAFE SMART SOFTWARE LAYER =====
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

async function init(){runCoreSelfTest();await loadBuildInfo();await loadDbFromServer();await loadStammdaten();document.getElementById('globalSearch').addEventListener('input',e=>{searchText=e.target.value;render();});renderAll();}
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
  return `<div class="nav-group nav-group-${groupKey}">
    <div class="nav-group-label">${title}</div>
    <ul class="nav nav-tabs grouped-tabs">${modules.filter(m=>m.group===groupKey).map(tabButton).join('')}</ul>
  </div>`;
}
function renderAll(){
  document.getElementById('tabs').innerHTML =
    navGroup('IT-Verwaltung', 'main') +
    navGroup('Dokumentation & Wissen', 'support') +
    navGroup('Konfiguration', 'admin');
  render();
}
function openTab(key){activeKey=key;renderAll();}
function render(){const mod=modules.find(m=>m.key===activeKey);const c=document.getElementById('tabContent');c.className='pt-3 page-group-'+(mod?.group||'main');if(mod.mode==='dashboard')c.innerHTML=renderDashboard();else if(mod.mode==='asset')c.innerHTML=renderAssets();else if(mod.mode==='module')c.innerHTML=renderLinkedModule(mod);else if(mod.mode==='adminpanel')c.innerHTML=renderAdminPanel();else if(mod.mode==='stammdaten')c.innerHTML=renderStammdaten();else c.innerHTML=renderSimpleModule(mod);uxAnimateContent();}

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
  fetch('demo_data.json?v=' + Date.now())
    .then(r=>r.json())
    .then(data=>{
      ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'].forEach(k=>DB[k]=data[k]||[]);
      toast('Demo-Daten geladen');
      renderAll();
    })
    .catch(()=>alert('demo_data.json konnte nicht geladen werden.'));
}
function importJson(){
  const input = document.createElement('input');
  input.type='file';
  input.accept='application/json';
  input.onchange=e=>{
    const file=e.target.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(reader.result);
        ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'].forEach(k=>DB[k]=data[k]||[]);
        toast('Daten importiert');
        renderAll();
      }catch(err){ alert('Fehler beim Import: ungültiges JSON'); }
    };
    reader.readAsText(file);
  };
  input.click();
}
function generateRandomTickets(){
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
  try{
    return JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {
      darkMode:false,
      animations:true,
      compactMode:false,
      autosave:true,
      confirmDelete:true,
      startView:'topology'
    };
  }catch{
    return {darkMode:false,animations:true,compactMode:false,autosave:true,confirmDelete:true,startView:'topology'};
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
function uxHighlight(selector){
  if(!APP_SETTINGS.animations || typeof $ === 'undefined') return;
  $(selector).addClass('ux-highlight');
  setTimeout(()=>$(selector).removeClass('ux-highlight'), 650);
}
function uxShake(selector){
  if(!APP_SETTINGS.animations || typeof $ === 'undefined') return;
  $(selector).addClass('ux-shake');
  setTimeout(()=>$(selector).removeClass('ux-shake'), 450);
}
function uxSuccess(message){
  toast(message || 'Gespeichert.');
  uxHighlight('.card:visible:first');
}

// ===== v31 ONE-FILE BACKUP / IMPORT =====
function createExportPayload(){
  return {
    meta:{
      app:'IT-Verwaltung',
      version:(typeof BUILD_INFO !== 'undefined' && BUILD_INFO.version) ? BUILD_INFO.version : 'unknown',
      exportedAt:new Date().toISOString(),
      format:'itverwaltung-full-backup-json-v1'
    },
    data:{
      assets:DB.assets||[],
      hardware:DB.hardware||[],
      software:DB.software||[],
      netzwerk:DB.netzwerk||[],
      tickets:DB.tickets||[],
      notizen:DB.notizen||[],
      knowledge:DB.knowledge||[]
    }
  };
}

function exportAllToOneFile(){
  if(!safetyConfirm('Backup-Datei erstellen?', 'Alle Tabellen werden als JSON-Datei exportiert.')){
    return;
  }
  const payload = createExportPayload();
  const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const filename = `IT-Verwaltung_Backup_${stamp}.json`;
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
  if(typeof showToast === 'function') showToast('Backup-Datei erstellt.', 'success'); else toast('Backup-Datei erstellt.');
}

function importAllFromOneFile(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(reader.result);
        const data = parsed.data || parsed;
        const keys = ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'];
        const missing = keys.filter(k=>!Array.isArray(data[k]));
        if(missing.length){
          throw new Error('Ungültige Backup-Datei. Fehlende Tabellen: ' + missing.join(', '));
        }
        if(!safetyConfirm('Backup importieren?', 'Aktuelle Browserdaten werden ersetzt und anschließend in CSV geschrieben.')){
          return;
        }
        keys.forEach(k=>DB[k] = data[k] || []);
        persist();
        if(typeof saveDbToServer === 'function') saveDbToServer();
        renderAll();
        if(typeof showToast === 'function') showToast('Backup importiert.', 'success'); else toast('Backup importiert.');
      }catch(err){
        console.error(err);
        alert('Import fehlgeschlagen: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function adminStoragePanel(){
  return `<div class="card admin-card mb-3">
    <div class="card-header"><b>Backup & Import</b></div>
    <div class="card-body">
      <div class="alert alert-info">
        Ein-Klick-Backup speichert alle Tabellen in <b>eine JSON-Datei</b>.
        Der Import lädt diese eine Datei wieder ein und schreibt die Daten anschließend in CSV.
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-success" onclick="exportAllToOneFile()">⬇ Alles als eine Datei sichern</button>
        <button class="btn btn-primary" onclick="exportNotionZip()">Notion Export ZIP</button>
        <button class="btn btn-outline-primary" onclick="importAllFromOneFile()">⬆ Eine Backup-Datei laden</button>
        <button class="btn btn-outline-success" data-save-button="true" onclick="saveDbToServer(true)">CSV jetzt speichern</button>
        <button class="btn btn-outline-secondary" onclick="backupCsvServer()">CSV-Ordner-Backup</button>
      </div>
      <div class="text-muted mt-2">
        Empfehlung: Für normale Sicherungen die JSON-Datei nutzen. CSV bleibt intern als Arbeitsdatenbestand erhalten.
      </div>
    </div>
  </div>`;
}


// ===== v38 NOTION READY EXPORT =====
function csvEscapeValue(value){
  if(value === null || typeof value === 'undefined') return '';
  return '"' + String(value).replace(/"/g,'""').replace(/\r?\n/g,' ') + '"';
}

function toNotionCSV(rows, preferredColumns){
  rows = Array.isArray(rows) ? rows : [];
  let columns = [];
  (preferredColumns || []).forEach(c => { if(!columns.includes(c)) columns.push(c); });
  rows.forEach(row => {
    Object.keys(row || {}).forEach(k => { if(!columns.includes(k)) columns.push(k); });
  });
  if(!columns.length) return '';
  const lines = [];
  lines.push(columns.map(csvEscapeValue).join(','));
  rows.forEach(row => {
    lines.push(columns.map(c => csvEscapeValue(row ? row[c] : '')).join(','));
  });
  return lines.join('\n');
}

function notionExportTables(){
  return {
    "assets.csv": {
      rows: DB.assets || [],
      columns: ["Asset-ID","Gerätename","Asset-Typ","Standort","Raum","Status","Hauptnutzer","Hersteller","Modellserie","Modell","Seriennummer","Inventarnummer","Betriebssystem","Domäne","Notizen"]
    },
    "hardware.csv": {
      rows: DB.hardware || [],
      columns: ["Hardware-ID","Asset-ID","Gerätename","CPU","RAM","Speicher","Monitor","Dockingstation","Garantie bis","Bemerkung"]
    },
    "software.csv": {
      rows: DB.software || [],
      columns: ["Software-ID","Asset-ID","Gerätename","Softwarename","Version","Hersteller","Lizenzstatus","Update-Status","Kritikalität","Bemerkung"]
    },
    "netzwerk.csv": {
      rows: DB.netzwerk || [],
      columns: ["Netzwerk-ID","Asset-ID","Gerätename","Netzwerktyp","Adressart","Verbindungstyp","IP-Adresse","MAC-Adresse","DNS","VLAN","Switch-Port","Wanddose","Access Point","SSID","Bemerkung"]
    },
    "tickets.csv": {
      rows: DB.tickets || [],
      columns: ["Ticket-ID","Asset-ID","Gerätename","Titel","Kategorie","Priorität","Status","Tags","Ursache","Lösung","Knowledge-ID"]
    },
    "notizen.csv": {
      rows: DB.notizen || [],
      columns: ["Notiz-ID","Asset-ID","Gerätename","Titel","Kategorie","Status","Inhalt"]
    },
    "knowledge.csv": {
      rows: DB.knowledge || [],
      columns: ["Knowledge-ID","Titel","Kategorie","Tags","Lösung"]
    }
  };
}

function notionReadmeText(){
  return `NOTION IMPORT ANLEITUNG

Export erstellt: ${new Date().toLocaleString()}

INHALT
- assets.csv
- hardware.csv
- software.csv
- netzwerk.csv
- tickets.csv
- notizen.csv
- knowledge.csv

EMPFOHLENE IMPORT-REIHENFOLGE
1. assets.csv zuerst importieren
2. hardware.csv importieren
3. software.csv importieren
4. netzwerk.csv importieren
5. tickets.csv importieren
6. notizen.csv importieren
7. knowledge.csv importieren

WICHTIG
- Asset-ID ist der gemeinsame Schlüssel.
- Notion erstellt Relationen nicht automatisch aus CSV.
- Nach dem Import kannst du in Notion Relation-Felder anlegen.

EMPFOHLENE RELATIONEN
- hardware.Asset-ID -> assets.Asset-ID
- software.Asset-ID -> assets.Asset-ID
- netzwerk.Asset-ID -> assets.Asset-ID
- tickets.Asset-ID -> assets.Asset-ID
- notizen.Asset-ID -> assets.Asset-ID
- tickets.Knowledge-ID -> knowledge.Knowledge-ID

HINWEIS
Diese ZIP ist ohne Notion API nutzbar.
Jede CSV wird in Notion als eigene Datenbank importiert.
`;
}

function downloadBlob(blob, filename){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function exportNotionZip(){
  try{
    if(!safetyConfirm('Notion Export ZIP erstellen?', 'Alle Tabellen werden als Notion-kompatible CSV-Dateien in eine ZIP geschrieben.')){
      return;
    }
    if(typeof JSZip === 'undefined'){
      alert('JSZip konnte nicht geladen werden. Bitte Internetverbindung/CDN prüfen oder lokale JSZip-Datei einbinden.');
      return;
    }

    const zip = new JSZip();
    const tables = notionExportTables();
    Object.entries(tables).forEach(([filename, cfg]) => {
      zip.file(filename, toNotionCSV(cfg.rows, cfg.columns));
    });
    zip.file("README.txt", notionReadmeText());

    const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    zip.generateAsync({type:"blob"}).then(content => {
      downloadBlob(content, `notion_export_${stamp}.zip`);
      if(typeof showToast === 'function') showToast('Notion Export ZIP erstellt.', 'success');
      else if(typeof toast === 'function') toast('Notion Export ZIP erstellt.');
    }).catch(err => {
      console.error(err);
      alert('Notion ZIP Export fehlgeschlagen: ' + err.message);
    });
  }catch(e){
    console.error(e);
    alert('Notion Export Fehler: ' + e.message);
  }
}

function renderAdminPanel(){
  return `${adminStoragePanel()}${renderBuildInfoCard()}<div class="row g-3">
    <div class="col-lg-5">
      <div class="card admin-card">
        <div class="card-header"><b>Darstellung</b></div>
        <div class="card-body">
          ${adminSwitch('darkMode','Dark Mode','Dunkle Oberfläche aktivieren')}
          ${adminSwitch('animations','Animationen','dezente jQuery Effekte aktivieren')}
          ${adminSwitch('compactMode','Kompaktmodus','weniger Abstände in Tabellen/Karten')}
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      <div class="card admin-card">
        <div class="card-header"><b>Speicherung & Sicherheit</b></div>
        <div class="card-body">
          ${adminSwitch('autosave','Auto-Save','nach Änderungen automatisch CSV speichern')}
          ${adminSwitch('confirmDelete','Löschbestätigung','vor Löschvorgängen Sicherheitsabfrage anzeigen')}
          <hr>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-outline-primary" onclick="reloadStammdaten()">Stammdaten neu laden</button>
          </div>
          <div class="text-muted mt-2">Backup, Import, Export und manuelles CSV-Speichern liegen ausschließlich im Bereich <b>Backup & Import</b>.</div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card admin-card">
        <div class="card-header"><b>Dashboard</b></div>
        <div class="card-body">
          <label class="form-label">Standardansicht</label>
          <select class="form-select" onchange="setSetting('startView',this.value);DASHBOARD_VIEW=this.value;localStorage.setItem('dashboardView',this.value)">
            <option value="topology" ${APP_SETTINGS.startView==='topology'?'selected':''}>Topologie</option>
            <option value="graph" ${APP_SETTINGS.startView==='graph'?'selected':''}>Graph</option>
          </select>
          <div class="text-muted mt-2">Legt fest, welche Dashboard-Visualisierung bevorzugt wird.</div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card admin-card">
        <div class="card-header"><b>System</b></div>
        <div class="card-body">
          <div class="kv">
            ${kv('Version', BUILD_INFO.version || '-')}
            ${kv('Build', BUILD_INFO.buildDate || '-')}
            ${kv('CSV Backend', CSV_BACKEND_AVAILABLE ? 'aktiv' : 'nicht verbunden')}
            ${kv('Assets', DB.assets.length)}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function adminSwitch(key,title,desc){
  const checked = APP_SETTINGS[key] ? 'checked' : '';
  return `<div class="form-check form-switch admin-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="set_${key}" ${checked} onchange="setSetting('${key}',this.checked)">
    <label class="form-check-label" for="set_${key}"><b>${title}</b><br><span class="text-muted">${desc}</span></label>
  </div>`;
}


function renderDashboardModeSwitch(){
  return `<div class="btn-group btn-group-sm" role="group">
    <button class="btn btn-outline-primary" onclick="setDashboardView('graph')">Graph</button>
    <button class="btn btn-outline-primary" onclick="setDashboardView('topology')">Topologie</button>
  </div>`;
}
let DASHBOARD_VIEW = localStorage.getItem('dashboardView') || APP_SETTINGS.startView || 'topology';
function setDashboardView(view){
  DASHBOARD_VIEW = view;
  localStorage.setItem('dashboardView', view);
  render();
}
function renderDashboardVisual(){
  if(DASHBOARD_VIEW === 'topology'){
    return renderTopologyView();
  }

  return `<div class="asset-graph-wrap">
      ${renderAssetGraph()}
    </div>
    <div class="graph-legend mt-3">
      <span class="legend-dot legend-asset"></span> Asset
      <span class="legend-dot legend-hardware"></span> Hardware
      <span class="legend-dot legend-software"></span> Software
      <span class="legend-dot legend-network"></span> Netzwerk
      <span class="legend-dot legend-ticket"></span> Tickets
      <span class="legend-dot legend-note"></span> Notizen
    </div>`;
}


function renderDashboard(){
  return `<div class="row g-3">
    ${stat('Assets',DB.assets.length,'primary')}
    ${stat('Hardware',DB.hardware.length,'success')}
    ${stat('Netzwerk',DB.netzwerk.length,'warning')}
    ${stat('Software',DB.software.length,'info')}
    ${stat('Offene Tickets',DB.tickets.filter(t=>t.Status==='Offen').length,'danger')}
    ${stat('Gelöste Tickets',DB.tickets.filter(t=>t.Status==='Gelöst').length,'success')}
  </div>

  <div class="card mt-3">
    <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <span>Asset-Übersicht</span>
        <span class="ms-2">${csvStatusBadge()}</span>
      </div>
      <div class="d-flex gap-2 flex-wrap align-items-center">
        ${renderDashboardModeSwitch()}
        <button class="btn btn-sm btn-outline-warning" onclick="generateRandomTickets()">Tickets generieren</button>
        <button class="btn btn-sm btn-outline-primary" onclick="toggleGraphAnimation()">Animation an/aus</button>
      </div>
    </div>
    <div class="card-body">
      ${renderDashboardVisual()}
    </div>
  </div>

  <div class="card mt-3">
    <div class="card-header">Ticket-Heatmap</div>
    <div class="card-body">
      ${renderHeatmap()}
    </div>
  </div>`;
}


function renderAssetGraph(){
  const assets = DB.assets || [];
  const width = 980, height = 540;
  const cx = width/2, cy = height/2;
  let svg = `<svg id="assetGraph" viewBox="0 0 ${width} ${height}" class="asset-graph-svg">`;
  svg += `<defs>
    <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
    <radialGradient id="centerGrad"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e9ecef"/></radialGradient>
  </defs>`;
  svg += `<circle class="graph-center-pulse" cx="${cx}" cy="${cy}" r="58"></circle>`;
  svg += `<circle class="graph-center" cx="${cx}" cy="${cy}" r="48"></circle>`;
  svg += `<text x="${cx}" y="${cy-4}" text-anchor="middle" class="graph-center-title">IT</text>`;
  svg += `<text x="${cx}" y="${cy+18}" text-anchor="middle" class="graph-center-sub">Assets</text>`;

  assets.forEach((a,i)=>{
    const angle = (Math.PI*2/assets.length)*i - Math.PI/2;
    const ax = cx + Math.cos(angle)*250;
    const ay = cy + Math.sin(angle)*185;
    const id = a['Asset-ID'];
    const hw = byAsset('hardware',id).length;
    const sw = byAsset('software',id).length;
    const nw = byAsset('netzwerk',id).length;
    const tk = byAsset('tickets',id).length;
    const nt = byAsset('notizen',id).length;
    svg += `<line class="graph-link graph-link-main" x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}"></line>`;
    svg += `<g class="asset-node graph-clickable" onclick="openAssetFromGraph('${id}')" style="animation-delay:${i*.15}s">`;
    svg += `<circle class="node-asset" cx="${ax}" cy="${ay}" r="38"></circle>`;
    svg += `<text x="${ax}" y="${ay-4}" text-anchor="middle" class="node-title">${escapeHtml(a['Asset-Typ'])}</text>`;
    svg += `<text x="${ax}" y="${ay+13}" text-anchor="middle" class="node-sub">${escapeHtml(a['Gerätename'])}</text>`;
    svg += `</g>`;

    const satellites = [
      {label:'HW '+hw, cls:'hardware', count:hw, da: -0.95},
      {label:'SW '+sw, cls:'software', count:sw, da: -0.48},
      {label:'NET '+nw, cls:'network', count:nw, da: 0},
      {label:'TIC '+tk, cls:'ticket', count:tk, da: 0.48},
      {label:'NOTE '+nt, cls:'note', count:nt, da: 0.95}
    ];
    satellites.forEach((s,j)=>{
      if(s.count===0) return;
      const sx = ax + Math.cos(angle+s.da)*82;
      const sy = ay + Math.sin(angle+s.da)*64;
      svg += `<line class="graph-link graph-link-${s.cls}" x1="${ax}" y1="${ay}" x2="${sx}" y2="${sy}"></line>`;
      svg += `<g class="sat-node sat-${s.cls}" style="animation-delay:${(i+j)*.12}s">`;
      svg += `<circle cx="${sx}" cy="${sy}" r="22"></circle>`;
      svg += `<text x="${sx}" y="${sy+4}" text-anchor="middle">${s.label}</text>`;
      svg += `</g>`;
    });
  });
  svg += `</svg>`;
  return svg;
}
function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function openAssetFromGraph(assetId){
  const idx = DB.assets.findIndex(a => a['Asset-ID'] === assetId);
  if(idx >= 0){
    selectedIndex.assets = idx;
    activeKey = 'assets';
    renderAll();
  }
}
function toggleGraphAnimation(){
  document.body.classList.toggle('graph-paused');
}
function resetGraphView(){
  render();
}
function stat(label,num,color){return `<div class="col-md-4"><div class="card border-${color}"><div class="card-body"><div class="text-muted">${label}</div><div class="display-6 fw-bold">${num}</div></div></div></div>`;}
function renderStammdaten(){
  return `
    <div class="card mb-3 stammdaten-header-card">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 class="mb-1"><i class="bi bi-sliders"></i> Stammdaten</h3>
          <div class="text-muted">Zentrale Dropdown-Werte verwalten. Änderungen sind sofort in Formularen verfügbar.</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" onclick="reloadStammdaten()"><i class="bi bi-arrow-clockwise"></i> aus *.md neu laden</button>
          <button class="btn btn-outline-secondary" onclick="exportStammdatenJson()"><i class="bi bi-download"></i> Export</button>
        </div>
      </div>
    </div>
    <div class="row g-3">
      ${Object.entries(STAMM).map(([key,arr])=>renderStammCard(key,arr)).join('')}
    </div>`;
}
function renderStammCard(key, arr){
  return `<div class="col-md-4">
    <div class="card h-100 stamm-card ${stammCardClass(key)}">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${stammIcon(key)} <b>${stammTitle(key)}</b> <span class="badge text-bg-secondary">${arr.length}</span></span>
        <button class="btn btn-sm btn-success" onclick="stammAdd('${key}')"><i class="bi bi-plus-circle"></i> Neu</button>
      </div>
      <div class="card-body">
        <div class="stamm-list">
          ${arr.map((item,i)=>renderStammItem(key,item,i)).join('')}
        </div>
      </div>
    </div>
  </div>`;
}
function renderStammItem(key,item,i){
  return `<div class="stamm-item">
    <span class="stamm-value">${escapeHtml(item)}</span>
    <span class="stamm-actions">
      <button class="btn btn-sm btn-outline-primary" title="Bearbeiten" onclick="stammEdit('${key}',${i})"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger" title="Löschen" onclick="stammDelete('${key}',${i})"><i class="bi bi-trash"></i></button>
    </span>
  </div>`;
}
function stammTitle(key){
  const map={assetTypen:'Gerätetypen',status:'Status',standorte:'Standorte',raeume:'Räume',hersteller:'Hersteller',betriebssysteme:'Betriebssysteme',domaenen:'Domänen',netzwerktypen:'Netzwerktypen',adressarten:'Adressarten',verbindungstypen:'Verbindungstypen',vlans:'VLANs',switches:'Switch/Ports',accesspoints:'Access Points',ssids:'SSIDs',lizenzstatus:'Lizenzstatus',updateStatus:'Update-Status',kritikalitaet:'Kritikalität',ticketKategorien:'Ticket-Kategorien',prioritaeten:'Prioritäten',ticketStatus:'Ticket-Status',notizKategorien:'Notiz-Kategorien',tags:'Tags'};
  return map[key]||key;
}
function stammIcon(key){
  const map={assetTypen:'<i class="bi bi-pc-display-horizontal text-primary"></i>',status:'<i class="bi bi-toggles text-secondary"></i>',standorte:'<i class="bi bi-building text-success"></i>',raeume:'<i class="bi bi-door-open text-success"></i>',hersteller:'<i class="bi bi-tools text-success"></i>',betriebssysteme:'<i class="bi bi-window text-primary"></i>',domaenen:'<i class="bi bi-diagram-3 text-primary"></i>',netzwerktypen:'<i class="bi bi-hdd-network text-info"></i>',adressarten:'<i class="bi bi-ethernet text-info"></i>',verbindungstypen:'<i class="bi bi-diagram-2 text-info"></i>',vlans:'<i class="bi bi-layers text-info"></i>',switches:'<i class="bi bi-router text-info"></i>',accesspoints:'<i class="bi bi-wifi text-info"></i>',ssids:'<i class="bi bi-broadcast-pin text-info"></i>',lizenzstatus:'<i class="bi bi-key text-purple"></i>',updateStatus:'<i class="bi bi-arrow-repeat text-purple"></i>',kritikalitaet:'<i class="bi bi-exclamation-triangle text-warning"></i>',ticketKategorien:'<i class="bi bi-ticket-detailed text-warning"></i>',prioritaeten:'<i class="bi bi-flag text-warning"></i>',ticketStatus:'<i class="bi bi-check2-square text-warning"></i>',notizKategorien:'<i class="bi bi-stickies text-warning"></i>',tags:'<i class="bi bi-tags text-warning"></i>'};
  return map[key]||'<i class="bi bi-list-ul"></i>';
}
function stammCardClass(key){
  if(['assetTypen','hersteller','betriebssysteme'].includes(key)) return 'stamm-hardware';
  if(['lizenzstatus','updateStatus','kritikalitaet'].includes(key)) return 'stamm-software';
  if(['netzwerktypen','adressarten','verbindungstypen','vlans','switches','accesspoints','ssids','domaenen'].includes(key)) return 'stamm-network';
  if(['ticketKategorien','prioritaeten','ticketStatus','notizKategorien','tags'].includes(key)) return 'stamm-support';
  return 'stamm-default';
}
function stammAdd(key){
  const value=prompt('Neuen Stammdatenwert für "'+stammTitle(key)+'" anlegen:');
  if(!value||!value.trim()) return;
  const clean=value.trim();
  if((STAMM[key]||[]).includes(clean)){alert('Dieser Wert existiert bereits.');return;}
  if(!STAMM[key]) STAMM[key]=[];
  STAMM[key].push(clean);
  toast('Stammdatenwert angelegt.');
  render();
}
function stammEdit(key,index){
  const oldValue=STAMM[key][index];
  const value=prompt('Stammdatenwert bearbeiten:', oldValue);
  if(!value||!value.trim()) return;
  const clean=value.trim();
  if(clean!==oldValue&&(STAMM[key]||[]).includes(clean)){alert('Dieser Wert existiert bereits.');return;}
  STAMM[key][index]=clean;
  toast('Stammdatenwert geändert.');
  render();
}
function stammDelete(key,index){
  const value=STAMM[key][index];
  const usage=getStammUsage(value);
  if(usage.length){alert('Löschen nicht möglich. Der Wert wird noch verwendet:\\n\\n'+usage.join('\\n'));return;}
  if(confirm('Stammdatenwert wirklich löschen?\\n\\n'+value)){
    STAMM[key].splice(index,1);
    toast('Stammdatenwert gelöscht.');
    render();
  }
}
function getStammUsage(value){
  const hits=[];
  Object.entries(DB).forEach(([table,rows])=>{
    (rows||[]).forEach(row=>{
      Object.entries(row).forEach(([field,val])=>{
        if(String(val)===String(value)){
          const id=row['Asset-ID']||row['Ticket-ID']||row['Software-ID']||row['Netzwerk-ID']||row['Hardware-ID']||row['Notiz-ID']||row['Knowledge-ID']||'?';
          hits.push(table+' / '+id+' / '+field);
        }
      });
    });
  });
  return hits.slice(0,20);
}
function exportStammdatenJson(){
  const data=JSON.stringify(STAMM,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='stammdaten.json';
  a.click();
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
    return `<div class="alert alert-info py-2 mb-2">Keine Treffer im aktuellen Tab.</div>`;
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
    </div>`;
}

function renderAssets(){
  const rows = filterRows(DB.assets || []);
  const idx = clamp(selectedIndex.assets, rows.length);
  selectedIndex.assets = idx;
  const row = rows[idx] || null;

  const actions = row ? `
    <div class="alert alert-info py-2 mb-2">
      Neue Assets werden weiterhin über <b>+ Neues Gerät erfassen</b> erstellt.
      Bestehende Assets können hier bearbeitet oder gelöscht werden.
    </div>
    <div class="d-flex gap-2 mb-2">
      <button class="btn btn-outline-primary" onclick="openEdit('assets',${idx})">Asset bearbeiten</button>
      <button class="btn btn-outline-danger" onclick="deleteAssetWithReferences(${idx})">Asset löschen</button>
    </div>
  ` : '';

  return actions + renderSplit('assets', rows, assetColumns(), row, renderAssetCard(row, idx, rows.length));
}

// ===== v27 SOFTWARE UI =====
let SOFTWARE_VIEW = localStorage.getItem('softwareView') || 'cards';

function setSoftwareView(view){
  SOFTWARE_VIEW = view;
  localStorage.setItem('softwareView', view);
  render();
}

function softwareStatusClass(row){
  const lic = String(row['Lizenzstatus']||'').toLowerCase();
  const upd = String(row['Update-Status']||'').toLowerCase();
  const crit = String(row['Kritikalität']||'').toLowerCase();
  if(lic.includes('abgelaufen') || upd.includes('veraltet') || crit.includes('hoch')) return 'danger';
  if(lic.includes('prüfen') || upd.includes('prüfen') || crit.includes('mittel')) return 'warning';
  return 'success';
}

function softwareStatusLabel(row){
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
  const rows = filterRows(DB.software || []);
  const idx = clamp(selectedIndex.software, rows.length);
  selectedIndex.software = idx;
  const row = rows[idx] || rows[0];

  return `${contextHeader(mod)}
    <div class="software-ui-toolbar card mb-3">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Software-Verwaltung</h4>
          <div class="text-muted">Wizard-Style Karten, Status-Badges, Knowledge-Hinweise und Asset-Kontext.</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-primary" onclick="openSoftwareProfileCreate()">+ Standardsoftware</button>
          <button class="btn btn-outline-primary" onclick="openReferenceCreate('software')">+ Einzelsoftware</button>
          <button class="btn btn-outline-secondary" onclick="setSoftwareView('${SOFTWARE_VIEW==='cards'?'table':'cards'}')">${SOFTWARE_VIEW==='cards'?'Tabellenansicht':'Kartenansicht'}</button>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      ${softwareStatCard('Gesamt', rows.length, 'primary')}
      ${softwareStatCard('OK', rows.filter(r=>softwareStatusClass(r)==='success').length, 'success')}
      ${softwareStatCard('Hinweise', rows.filter(r=>softwareStatusClass(r)==='warning').length, 'warning')}
      ${softwareStatCard('Prüfen', rows.filter(r=>softwareStatusClass(r)==='danger').length, 'danger')}
    </div>

    ${SOFTWARE_VIEW==='table' ? renderSplit('software',rows,moduleColumns('software'),row,renderModuleCard(mod,row,idx,rows.length)) : renderSoftwareCardsLayout(rows,row,idx,mod)}
  `;
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

function renderSoftwareCardsLayout(rows,row,idx,mod){
  return `<div class="row g-3">
    <div class="col-lg-5">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Software-Karten</span>
          <span class="badge text-bg-secondary">${rows.length}</span>
        </div>
        <div class="card-body software-card-list">
          ${rows.length ? rows.map((r,i)=>renderSoftwareListCard(r,i,idx)).join('') : '<div class="text-muted">Keine Software vorhanden.</div>'}
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      ${row ? renderSoftwareDetailCard(row,idx,rows.length,mod) : '<div class="card"><div class="card-body text-muted">Kein Eintrag ausgewählt.</div></div>'}
    </div>
  </div>`;
}

function renderSoftwareListCard(r,i,idx){
  const cls = softwareStatusClass(r);
  return `<div class="software-list-card ${i===idx?'active':''}" onclick="selectedIndex.software=${i};render();">
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
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" onclick="openEdit('software',${idx})">Bearbeiten</button>
            <button class="btn btn-outline-danger" onclick="deleteRow('software',${idx})">Löschen</button>
          </div>
        </div>
        ${kbHint}
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
          <input type="checkbox" class="profileSoft" value="${safeEscape(item.key)}" data-name="${safeEscape(item.software)}" data-vendor="${safeEscape(item.vendor)}">
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
      'Bemerkung': 'Aus Standardsoftware-Profil erstellt.'
    });
  });
  persist();
  if(typeof maybeSaveDbToServer === 'function') maybeSaveDbToServer(); else saveDbToServer();
  bootstrap.Modal.getInstance(document.getElementById('softwareProfileModal')).hide();
  activeKey='software';
  renderAll();
  toast('Standardsoftware hinzugefügt.');
}

function renderLinkedModule(mod){if(mod.key==='software')return renderSoftwareModern();const rows=filterRows(DB[mod.key]||[]);const idx=clamp(selectedIndex[mod.key],rows.length);selectedIndex[mod.key]=idx;const row=rows[idx]||null;return contextHeader(mod)+toolbar(mod,row,idx)+renderSplit(mod.key,rows,moduleColumns(mod.key),row,renderModuleCard(mod,row,idx,rows.length));}
function renderSimpleModule(mod){const rows=filterRows(DB[mod.key]||[]);const idx=clamp(selectedIndex[mod.key],rows.length);selectedIndex[mod.key]=idx;const row=rows[idx]||null;return toolbar(mod,row,idx)+renderSplit(mod.key,rows,Object.keys((DB[mod.key]||[])[0]||{}).slice(0,6),row,renderGenericCard(mod,row,idx,rows.length));}
function renderSplit(key,rows,cols,row,cardHtml){const empty=rows.length===0?`<tr><td colspan="${Math.max(cols.length,1)}" class="text-muted">Keine Treffer</td></tr>`:'';return `<div class="split"><div><div class="card"><div class="card-header">Liste</div><div class="card-body"><div class="table-wrap"><table class="table table-sm table-hover"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${empty || rows.map((r,i)=>`<tr class="${i===selectedIndex[key]?'active':''}" onclick="selectRow('${key}',${i})">${cols.map(c=>`<td>${val(r,c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div></div><div>${cardHtml}</div></div>`;}
function selectRow(key,idx){selectedIndex[key]=idx;render();} function prevRow(key){selectedIndex[key]--;render();} function nextRow(key){selectedIndex[key]++;render();}
function nav(key,idx,total){return `<div class="card"><div class="card-body d-flex justify-content-between align-items-center"><button class="btn btn-outline-primary" onclick="prevRow('${key}')">←</button><b>${total?idx+1:0} / ${total}</b><button class="btn btn-outline-primary" onclick="nextRow('${key}')">→</button></div></div>`;}
function assetColumns(){return ['Asset-ID','Gerätename','Asset-Typ','Standort','Status','Hauptnutzer','Inventarnummer'];}
function moduleColumns(key){const m={hardware:['Hardware-ID','Asset-ID','Gerätename','CPU','RAM','Speicher'],netzwerk:['Netzwerk-ID','Asset-ID','Gerätename','Adressart','Verbindungstyp','IP-Adresse'],software:['Software-ID','Asset-ID','Gerätename','Softwarename','Version','Lizenzstatus'],tickets:['Ticket-ID','Asset-ID','Gerätename','Titel','Status','Priorität'],notizen:['Notiz-ID','Asset-ID','Gerätename','Titel','Kategorie','Status']};return m[key]||Object.keys((DB[key]||[])[0]||{}).slice(0,6);}

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

function kv(k,v){return `<div class="k">${k}</div><div>${v}</div>`;} function small(title,body){return `<div class="card mini-card"><div class="card-body"><b>${title}</b><div class="preline mt-2">${body||'-'}</div></div></div>`;}
function renderAssetCard(a,idx,total){if(!a)return '<div class="card"><div class="card-body">Keine Daten</div></div>';const id=a['Asset-ID'];const hw=firstByAsset('hardware',id),net=firstByAsset('netzwerk',id),sw=byAsset('software',id),tic=byAsset('tickets',id),note=byAsset('notizen',id);return `${nav('assets',idx,total)}<div class="card mt-3"><div class="card-body"><div class="detail-title">${val(a,'Gerätename')}</div><span class="badge text-bg-primary">${val(a,'Asset-Typ')}</span> <span class="badge text-bg-success">${val(a,'Status')}</span><div class="row mt-3"><div class="col"><div class="kv">${kv('Asset-ID',id)}${kv('Standort',val(a,'Standort'))}${kv('Raum',val(a,'Raum'))}${kv('Hauptnutzer',val(a,'Hauptnutzer'))}</div></div><div class="col"><div class="kv">${kv('Hersteller',val(a,'Hersteller'))}${kv('Modell',val(a,'Modell'))}${kv('Betriebssystem',val(a,'Betriebssystem'))}${kv('Inventar',val(a,'Inventarnummer'))}</div></div></div></div></div><div class="row g-2 mt-1"><div class="col-md-4">${small('Hardware ('+(hw?1:0)+')',hw?`CPU: ${hw.CPU}\nRAM: ${hw.RAM}\nSpeicher: ${hw.Speicher}`:'-')}</div><div class="col-md-4">${small('Netzwerk ('+(net?1:0)+')',net?`Adressart: ${net.Adressart}\nIP: ${net['IP-Adresse']||'(DHCP)'}\n${net.Verbindungstyp}`:'-')}</div><div class="col-md-4">${small('Software ('+sw.length+')',sw.map(s=>s.Softwarename).join('\n'))}</div></div><div class="row g-2 mt-1"><div class="col-md-6">${small('Tickets ('+tic.length+')',tic.map(t=>t.Titel+' ['+t.Status+']').join('\n'))}</div><div class="col-md-6">${small('Notizen ('+note.length+')',note.map(n=>n.Titel).join('\n'))}</div></div>`;}
function renderModuleCard(mod,r,idx,total){if(!r)return '<div class="card"><div class="card-body">Keine Daten</div></div>';const a=assetFor(r);let main='';Object.entries(r).forEach(([k,v])=>main+=kv(displayFieldLabel(mod.key,k),v));return `${nav(mod.key,idx,total)}<div class="card mt-3 card-context-${mod.context||'default'}"><div class="card-body"><div class="detail-title">${r[mod.id]||mod.title}</div><span class="badge text-bg-primary">${mod.title}</span> <span class="badge text-bg-success">zugeordnet zu: ${assetName(r['Asset-ID'])}</span>${logicBadges(mod.key,r)}<div class="row mt-3"><div class="col"><h5>Eintrag</h5><div class="kv">${main}</div></div><div class="col"><h5>Zugeordnetes Asset</h5>${a?assetSummary(a):'<p>Kein Asset zugeordnet.</p>'}</div></div></div></div>`;}
function logicBadges(key,r){let out='';if(key==='tickets'&&r.Status==='Gelöst')out+='<div class="alert alert-success mt-2">Ticket ist gelöst: Knowledge-Erstellung ist sinnvoll.</div>';if(key==='netzwerk'&&r.Adressart==='DHCP')out+='<div class="alert alert-info mt-2">DHCP aktiv: IP-Adresse wird nicht manuell gepflegt.</div>';if(key==='netzwerk'&&r.Verbindungstyp.includes('WLAN'))out+='<div class="alert alert-info mt-2">WLAN aktiv: Access Point und SSID relevant.</div>';return out;}
function renderGenericCard(mod,r,idx,total){if(!r)return '<div class="card"><div class="card-body">Keine Daten</div></div>';let main='';Object.entries(r).forEach(([k,v])=>main+=kv(displayFieldLabel(mod.key,k),v));return `${nav(mod.key,idx,total)}<div class="card mt-3 card-context-${mod.context||'default'}"><div class="card-body"><div class="detail-title">${r[mod.id]||mod.title}</div><div class="kv mt-3">${main}</div></div></div>`;}
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
const SMART_SOFTWARE_PROFILES = {
  windows: [
    {key:'firefox', label:'Firefox installiert', vendor:'Mozilla', software:'Firefox', group:'Browser'},
    {key:'chrome', label:'Chrome installiert', vendor:'Google', software:'Chrome', group:'Browser'},
    {key:'adobe', label:'Adobe Reader installiert', vendor:'Adobe', software:'Acrobat Reader', group:'PDF / Signatur', children:[
      {key:'adobeCertRequired', label:'Signatur-Zertifikat benötigt'},
      {key:'adobeCertInstalled', label:'Signatur-Zertifikat installiert'}
    ], knowledgeTitle:'Adobe Signatur-Zertifikat installieren'},
    {key:'office', label:'Microsoft Office installiert', vendor:'Microsoft', software:'Microsoft Office', group:'Office', children:[
      {key:'officeActivated', label:'Office aktiviert / lizenziert'}
    ]},
    {key:'uniget', label:'UniGet / WinGet installiert', vendor:'Microsoft', software:'UniGet / WinGet', group:'Systemtools'},
    {key:'vcRuntime', label:'Visual C++ Runtime 2015–2022 installiert', vendor:'Microsoft', software:'Visual C++ Redistributable', group:'Runtimes'},
    {key:'dotnetRuntime', label:'.NET Runtime installiert', vendor:'Microsoft', software:'.NET Runtime', group:'Runtimes'},
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
  return (DB.knowledge || []).find(k => String(k.Titel||'').toLowerCase() === String(title||'').toLowerCase());
}
function createKnowledgeForSoftware(title){
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
        'Bemerkung': smartSoftwareRemark(item.key, state)
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

function openDeviceWizard(){wizard={step:0,data:{type:'PC',grund:{Standort:STAMM.standorte?.[0]||'Bibliothek',Raum:STAMM.raeume?.[0]||'',Status:STAMM.status?.[0]||'Aktiv',Hauptnutzer:'',Hersteller:STAMM.hersteller?.[0]||'',Modellserie:'',Modell:'',Seriennummer:'',Inventarnummer:'',Betriebssystem:STAMM.betriebssysteme?.[0]||'Windows 11',Domäne:STAMM.domaenen?.[0]||'EAH',Ausmusterungsdatum:'',Defektbeschreibung:'',Notizen:''},hardware:{CPU:'',RAM:'',Speicher:'',Monitor:'',Dockingstation:'',Druckertyp:'',Toner:'',Zählerstand:'',PoE:'',Controller:'',GarantieBis:'',Bemerkung:''},netzwerk:{Netzwerktyp:STAMM.netzwerktypen?.[0]||'LAN',Adressart:'DHCP',Verbindungstyp:STAMM.verbindungstypen?.[0]||'LAN direkt Wanddose','IP-Adresse':'',DNS:'','MAC-Adresse':'',VLAN:STAMM.vlans?.[0]||'',SwitchPort:STAMM.switches?.[0]||'',Wanddose:'',AccessPoint:STAMM.accesspoints?.[0]||'',SSID:STAMM.ssids?.[0]||'',Bemerkung:''},software:[],smartSoftware:{},notiz:''}};renderWizard();new bootstrap.Modal(document.getElementById('deviceWizardModal')).show();}
function wizardSteps(){return ['Gerätetyp','Grunddaten','Hardware','Netzwerk','Software','Vorschau'];}

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

// ===== v26.5 CORE FORM PATH HELPERS =====
function getPath(obj, path){
  if(!obj || !path) return undefined;
  return String(path).split('.').reduce((acc,key)=>acc ? acc[key] : undefined, obj);
}
function setPath(obj, path, value){
  if(!obj || !path) return;
  const parts = String(path).split('.');
  let cur = obj;
  for(let i=0;i<parts.length-1;i++){
    const key = parts[i];
    if(typeof cur[key] !== 'object' || cur[key] === null){
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[parts[parts.length-1]] = value;
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
function applyWizardLogic(){if(!wizard.data)return;const t=wizard.data.type, status=wizard.data.grund?.Status, addr=wizard.data.netzwerk?.Adressart, conn=wizard.data.netzwerk?.Verbindungstyp||'';if(wizard.step===0){document.getElementById('typeHint').innerHTML=isComputeType(t)?'PC/Notebook/Thin Client: Hardware, Netzwerk und Software werden erfasst.':isPrinterType(t)?'Drucker: Druckerfelder werden aktiv, Software ist optional.':isInfraType(t)?'Infrastrukturgerät: PoE/Controller und Management-Netzwerk sind relevant.':'Monitor: keine Netzwerk- oder Softwarepflicht.';}if(wizard.step===1){setWrap('.logic-compute',isComputeType(t),!isComputeType(t));setWrap('.logic-retired',status==='Ausgemustert');setWrap('.logic-defect',status==='Defekt');const h=document.getElementById('grundHint');if(status==='Defekt'){h.classList.remove('d-none');h.textContent='Status Defekt: Defektbeschreibung ausfüllen und anschließend Ticket anlegen.';}else if(status==='Ausgemustert'){h.classList.remove('d-none');h.textContent='Status Ausgemustert: Netzwerk/Software können später entfernt oder archiviert werden.';}else h.classList.add('d-none');}if(wizard.step===2){setWrap('.logic-compute',isComputeType(t),!isComputeType(t));setWrap('.logic-printer',isPrinterType(t));setWrap('.logic-infra',isInfraType(t));setWrap('.logic-dock',t==='Notebook');setWrap('.logic-monitor-ref',isComputeType(t));document.getElementById('hardwareHint').textContent=isPrinterType(t)?'Drucker: CPU/RAM sind ausgeblendet, Druckertyp/Toner/Zählerstand sind aktiv.':isInfraType(t)?'Access Point/Switch: PoE und Controller sind relevant.':isMonitorType(t)?'Monitor: Hardwaredetails stark reduziert.':'Computergerät: CPU, RAM, Speicher, Monitor und ggf. Dockingstation erfassen.';}if(wizard.step===3){
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

// CRUD modal

function deleteAssetWithReferences(idx){
  const rows = filterRows(DB.assets || []);
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

function openCreate(key){const mod=modules.find(m=>m.key===key);modalState={key,index:null,mode:'create'};const template=(DB[key]&&DB[key][0])?Object.fromEntries(Object.keys(DB[key][0]).map(k=>[k,''])):{};template[mod.id]=nextId(key,mod.id,mod.prefix);if(template['Asset-ID']!==undefined){template['Asset-ID']=DB.assets[0]?.['Asset-ID']||'';template['Gerätename']=DB.assets[0]?.['Gerätename']||'';}buildForm(mod,template,'Neu anlegen');}
function openEdit(key,idx){const rows=filterRows(DB[key]||[]), row=rows[idx], realIdx=DB[key].indexOf(row);modalState={key,index:realIdx,mode:'edit'};buildForm(modules.find(m=>m.key===key),{...row},'Bearbeiten');}
function buildForm(mod,row,title){document.getElementById('editTitle').textContent=`${mod.title} – ${title}`;document.getElementById('editForm').innerHTML=Object.keys(row).map(k=>fieldHtml(k,row[k],mod)).join('');new bootstrap.Modal(document.getElementById('editModal')).show();setTimeout(applyEditLogic,50);}
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
  if(obj['Adressart']==='Statisch'){
    if(!obj['IP-Adresse']) return 'IP-Adresse ist Pflicht bei statischer Konfiguration';
    if(!obj['DNS']) return 'DNS ist Pflicht bei statischer Konfiguration';
  }
  if(obj['Verbindungstyp']?.includes('WLAN')){
    if(!obj['Access Point']) return 'Access Point muss gewählt werden bei WLAN';
    if(!obj['SSID']) return 'SSID muss gewählt werden bei WLAN';
  }
  if(obj['Verbindungstyp']?.includes('LAN')){
    if(!obj['Switch-Port']) return 'Switch-Port muss gesetzt werden bei LAN';
  }
  if(!networkTypeMatchesConnection(obj['Netzwerktyp'], obj['Verbindungstyp'])) return 'Netzwerktyp und Verbindungstyp passen nicht zusammen.';
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
    applyEditLogic();
    let obj={};
    document.querySelectorAll('.edit-field').forEach(el=>{
      obj[el.dataset.key]=el.value;
    });
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
function deleteRow(key,idx){const rows=filterRows(DB[key]||[]), row=rows[idx], realIdx=DB[key].indexOf(row);if(realIdx<0)return;if(!APP_SETTINGS.confirmDelete || confirm('Eintrag wirklich löschen?')){DB[key].splice(realIdx,1);selectedIndex[key]=0;persist();maybeSaveDbToServer();render();toast('Gelöscht.');}}
function createKnowledgeFromTicket(idx){const rows=filterRows(DB.tickets), t=rows[idx];if(!t||t.Status!=='Gelöst'){alert('Knowledge kann erst aus gelöstem Ticket erstellt werden.');return;}const kbId=nextId('knowledge','Knowledge-ID',ID_PREFIXES.knowledge);DB.knowledge.push({'Knowledge-ID':kbId,'Titel':t.Titel,'Kategorie':t.Kategorie,'Tags':t.Tags,'Lösung':t.Lösung});t['Knowledge-ID']=kbId;persist();activeKey='knowledge';selectedIndex.knowledge=DB.knowledge.length-1;renderAll();toast('Knowledge aus Ticket erstellt.');}

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

