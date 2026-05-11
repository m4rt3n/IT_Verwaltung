// Server-backed CSV loading, saving, backup and build metadata.
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

async function loadServerStatus(){
  try{
    const res = await fetch('/api/status?v=' + Date.now());
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    SERVER_STATUS = {
      ...data,
      loaded: true,
      error: null
    };
    return true;
  }catch(e){
    SERVER_STATUS = {loaded:false, ok:false, node:null, table_files:{}, legacy_table_files:{}, error:e.message};
    return false;
  }
}

function apiPostHeaders(extra={}){
  const headers = {...extra};
  const token = SERVER_STATUS?.post_token || '';
  const tokenHeader = SERVER_STATUS?.post_token_header || 'X-ITV-Session-Token';
  if(token) headers[tokenHeader] = token;
  return headers;
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

async function loadSoftwareFullFromServer(){
  try{
    const res = await fetch('/api/software-full?v=' + Date.now());
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    DB.softwareFull = {
      available: !!data.available,
      scannerContext: data.ScannerContext || {},
      asset: data.Asset || {},
      sourcesStatus: data.SoftwareSourcesStatus || {},
      rows: Array.isArray(data.Software) ? data.Software : []
    };
    return true;
  }catch(e){
    DB.softwareFull = {
      available: false,
      scannerContext: {},
      asset: {},
      sourcesStatus: {},
      rows: []
    };
    return false;
  }
}

async function loadSoftwareClassification(){
  try{
    const res = await fetch('config/software_classification.json?v=' + Date.now());
    if(!res.ok) throw new Error('software_classification.json konnte nicht geladen werden.');
    DB.softwareClassification = await res.json();
    return true;
  }catch(e){
    DB.softwareClassification = {classLabels:{}, standardProfiles:{}, productHints:{}};
    return false;
  }
}

function maybeSaveDbToServer(){
  if(APP_SETTINGS.autosave) return saveDbToServer();
  render();
  return Promise.resolve(false);
}

async function saveDbToServer(manual=false){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('CSV speichern')) return false;
  setSaving(true);
  try{
    const check = validateDbBeforeWrite();
    if(!check.ok) throw new Error(check.message);
    const preview = productiveWritePreview('schreibt');
    if(manual && !safetyConfirm('CSV-Dateien jetzt speichern?', 'Vor dem Schreiben erstellt der Server automatisch ein Backup.\n\nBetroffene Tabellen:\n' + affectedTablesText(preview))){
      return false;
    }
    const res = await fetch('/api/save', {
      method:'POST',
      headers:apiPostHeaders({'Content-Type':'application/json'}),
      body:JSON.stringify(DB)
    });
    if(!res.ok){
      const txt = await res.text();
      throw new Error(txt || 'Speichern fehlgeschlagen');
    }
    CSV_BACKEND_AVAILABLE = true;
    notify('In CSV gespeichert.', 'success');
    render();
    return true;
  }catch(e){
    console.error(e);
    CSV_BACKEND_AVAILABLE = false;
    notify('CSV-Speichern fehlgeschlagen: ' + e.message, 'error');
    render();
    return false;
  }finally{
    setSaving(false);
  }
}

async function backupCsvServer(){
  try{
    if(typeof requireWriteAccess === 'function' && !requireWriteAccess('CSV-Backup erstellen')) return false;
    const preview = csvBackupPreview();
    if(!safetyConfirm('CSV-Ordner-Backup erstellen?', 'Es werden Kopien der aktuellen CSV-Dateien unter web_ui/backups abgelegt.\n\nBetroffene Tabellen:\n' + affectedTablesText(preview))){
      return false;
    }
    const res = await fetch('/api/backup', {method:'POST', headers:apiPostHeaders()});
    if(!res.ok) throw new Error(await res.text());
    notify('CSV-Ordner-Backup wurde erstellt.', 'success');
    return true;
  }catch(e){
    notify('Backup nicht möglich: ' + e.message, 'error');
    return false;
  }
}

function csvStatusBadge(){
  return CSV_BACKEND_AVAILABLE
    ? '<span class="badge text-bg-success">CSV Backend aktiv</span>'
    : '<span class="badge text-bg-warning">Browser-Modus / nicht gespeichert</span>';
}
