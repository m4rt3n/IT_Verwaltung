// Global app state, persistence, IDs and list filtering helpers.

let DB = loadDb();
let CSV_BACKEND_AVAILABLE = false;
let SERVER_STATUS = {loaded:false, ok:false, node:null, table_files:{}, legacy_table_files:{}, error:null};
let ASSET_DETAIL_TAB = 'overview';

const APP_SETTINGS_KEY = 'itverwaltung-v25-settings';
let APP_SETTINGS = loadAppSettings();
let BUILD_INFO = {version:null, name:null, buildDate:null, features:[], loaded:false, error:null};
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
