// Static app configuration, demo seed, catalogs and module metadata.

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
