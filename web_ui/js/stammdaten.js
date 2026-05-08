let STAMM = {};
let STAMM_STATUS = {type:'info', message:'Stammdaten noch nicht geladen.', details:[]};
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

function parseMdList(text){
  return text.split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.startsWith('- '))
    .map(l => l.replace(/^- /,'').trim())
    .filter(Boolean);
}

async function loadStammdaten(){
  const nextStamm = {};
  const failed = [];
  let loaded = 0;
  for(const [key,file] of Object.entries(STAMM_FILES)){
    try{
      const txt = await fetch('stammdaten/' + file + '?v=' + Date.now()).then(r => {
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      });
      const values = parseMdList(txt);
      nextStamm[key] = values;
      loaded++;
    }catch(e){
      nextStamm[key] = FALLBACK_STAMM[key] || [];
      failed.push(`${file}: ${e.message || 'Fallback genutzt'}`);
    }
  }
  STAMM = nextStamm;
  STAMM_STATUS = failed.length
    ? {type:'warning', message:`Stammdaten teilweise geladen: ${loaded} von ${Object.keys(STAMM_FILES).length} Listen, ${failed.length} Fallbacks.`, details:failed}
    : {type:'success', message:`Stammdaten vollständig geladen: ${loaded} Listen aus Markdown-Dateien.`, details:[]};
  return STAMM_STATUS;
}

async function reloadStammdaten(){
  try{
    const status = await loadStammdaten();
    render();
    notify(status.message, status.type === 'success' ? 'success' : 'warning');
  }catch(e){
    console.error(e);
    STAMM_STATUS = {type:'error', message:'Stammdaten konnten nicht neu geladen werden: ' + e.message, details:[]};
    render();
    notify(STAMM_STATUS.message, 'error');
  }
}

function renderStammdatenStatus(){
  const status = STAMM_STATUS || {type:'info', message:'Stammdatenstatus unbekannt.', details:[]};
  const details = status.details && status.details.length
    ? `<ul class="mb-0 mt-2">${status.details.slice(0,6).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`
    : '';
  return `<div class="alert alert-${statusAlertClass(status.type)} py-2 mb-2">
    <b>Reload-Status:</b> ${escapeHtml(status.message)}
    ${details}
  </div>`;
}

function renderStammdaten(){
  return `
    <div class="card mb-3 stammdaten-header-card">
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 class="mb-1"><i class="bi bi-sliders"></i> Stammdaten</h3>
          <div class="text-muted">Zentrale Dropdown-Werte verwalten. Änderungen sind sofort in Formularen verfügbar.</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" onclick="reloadStammdaten()" title="Lädt alle Stammdatenlisten erneut aus den lokalen Markdown-Dateien."><i class="bi bi-arrow-clockwise"></i> aus *.md neu laden</button>
          <button class="btn btn-outline-secondary" onclick="exportStammdatenJson()" title="Exportiert die aktuell geladenen Stammdaten als JSON-Datei."><i class="bi bi-download"></i> Export</button>
          <button class="btn btn-outline-secondary" onclick="importStammdatenJson()" title="Importiert Stammdaten aus einer JSON-Datei in den Browserzustand."><i class="bi bi-upload"></i> Import</button>
        </div>
      </div>
    </div>
    ${renderStammdatenStatus()}
    ${renderStammdatenGuidance()}
    <div class="row g-3">
      ${Object.entries(STAMM).map(([key,arr])=>renderStammCard(key,arr)).join('')}
    </div>`;
}

function renderStammdatenGuidance(){
  return `<div class="card mb-3"><div class="card-body">
    <div class="row g-3">
      <div class="col-md-3"><b>Asset-Typen</b><br><span class="text-muted">PC, Notebook, Thin Client, Drucker, Netzwerk, Peripherie, Zubehör.</span></div>
      <div class="col-md-3"><b>Ticket-Kategorien</b><br><span class="text-muted">Kategorie führt typische Ursache und Lösung im Ticket/Knowledge-Kontext.</span></div>
      <div class="col-md-3"><b>Software</b><br><span class="text-muted">Standardsoftware, Fachanwendung, Runtime, Treiber, Systemkomponente, Update-Tool.</span></div>
      <div class="col-md-3"><b>Status/Kritikalität</b><br><span class="text-muted">Vorbereitung, Aktiv, Reparatur, Ersatzgerät, Ausgemustert, Entsorgt; Kritikalität steuert Prüfpriorität.</span></div>
    </div>
  </div></div>`;
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
  const usage = getStammUsage(item);
  return `<div class="stamm-item">
    <span class="stamm-value">${escapeHtml(item)} ${usage.length ? `<span class="badge text-bg-light">${usage.length} Verwendung(en)</span>` : ''}</span>
    <span class="stamm-actions">
      <button class="btn btn-sm btn-outline-primary" title="Bearbeiten" onclick="stammEdit('${key}',${i})"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-outline-danger" title="Löschen" onclick="stammDelete('${key}',${i})"><i class="bi bi-trash"></i></button>
    </span>
  </div>`;
}

function stammTitle(key){
  const map = {assetTypen:'Gerätetypen',status:'Status',standorte:'Standorte',raeume:'Räume',hersteller:'Hersteller',betriebssysteme:'Betriebssysteme',domaenen:'Domänen',netzwerktypen:'Netzwerktypen',adressarten:'Adressarten',verbindungstypen:'Verbindungstypen',vlans:'VLANs',switches:'Switch/Ports',accesspoints:'Access Points',ssids:'SSIDs',lizenzstatus:'Lizenzstatus',updateStatus:'Update-Status',kritikalitaet:'Kritikalität',ticketKategorien:'Ticket-Kategorien',prioritaeten:'Prioritäten',ticketStatus:'Ticket-Status',notizKategorien:'Notiz-Kategorien',tags:'Tags'};
  return map[key] || key;
}

function stammIcon(key){
  const map = {assetTypen:'<i class="bi bi-pc-display-horizontal text-primary"></i>',status:'<i class="bi bi-toggles text-secondary"></i>',standorte:'<i class="bi bi-building text-success"></i>',raeume:'<i class="bi bi-door-open text-success"></i>',hersteller:'<i class="bi bi-tools text-success"></i>',betriebssysteme:'<i class="bi bi-window text-primary"></i>',domaenen:'<i class="bi bi-diagram-3 text-primary"></i>',netzwerktypen:'<i class="bi bi-hdd-network text-info"></i>',adressarten:'<i class="bi bi-ethernet text-info"></i>',verbindungstypen:'<i class="bi bi-diagram-2 text-info"></i>',vlans:'<i class="bi bi-layers text-info"></i>',switches:'<i class="bi bi-router text-info"></i>',accesspoints:'<i class="bi bi-wifi text-info"></i>',ssids:'<i class="bi bi-broadcast-pin text-info"></i>',lizenzstatus:'<i class="bi bi-key text-purple"></i>',updateStatus:'<i class="bi bi-arrow-repeat text-purple"></i>',kritikalitaet:'<i class="bi bi-exclamation-triangle text-warning"></i>',ticketKategorien:'<i class="bi bi-ticket-detailed text-warning"></i>',prioritaeten:'<i class="bi bi-flag text-warning"></i>',ticketStatus:'<i class="bi bi-check2-square text-warning"></i>',notizKategorien:'<i class="bi bi-stickies text-warning"></i>',tags:'<i class="bi bi-tags text-warning"></i>'};
  return map[key] || '<i class="bi bi-list-ul"></i>';
}

function stammCardClass(key){
  if(['assetTypen','hersteller','betriebssysteme'].includes(key)) return 'stamm-hardware';
  if(['lizenzstatus','updateStatus','kritikalitaet'].includes(key)) return 'stamm-software';
  if(['netzwerktypen','adressarten','verbindungstypen','vlans','switches','accesspoints','ssids','domaenen'].includes(key)) return 'stamm-network';
  if(['ticketKategorien','prioritaeten','ticketStatus','notizKategorien','tags'].includes(key)) return 'stamm-support';
  return 'stamm-default';
}

function stammAdd(key){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Stammdatenwert anlegen')) return;
  const value = prompt('Neuen Stammdatenwert für "' + stammTitle(key) + '" anlegen:');
  if(!value || !value.trim()) return;
  const clean = value.trim();
  if((STAMM[key] || []).includes(clean)){
    notify('Dieser Wert existiert bereits.', 'warning');
    return;
  }
  if(!STAMM[key]) STAMM[key] = [];
  STAMM[key].push(clean);
  recordStammAudit('add', key, clean);
  toast('Stammdatenwert angelegt.');
  render();
}

function stammEdit(key,index){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Stammdatenwert bearbeiten')) return;
  const oldValue = STAMM[key][index];
  const value = prompt('Stammdatenwert bearbeiten:', oldValue);
  if(!value || !value.trim()) return;
  const clean = value.trim();
  if(clean !== oldValue && (STAMM[key] || []).includes(clean)){
    notify('Dieser Wert existiert bereits.', 'warning');
    return;
  }
  const usage = getStammUsage(oldValue);
  if(usage.length && !confirm('Dieser Wert wird verwendet in:\\n\\n' + usage.join('\\n') + '\\n\\nTrotzdem umbenennen?')) return;
  STAMM[key][index] = clean;
  recordStammAudit('edit', key, oldValue + ' -> ' + clean);
  toast('Stammdatenwert geändert.');
  render();
}

function stammDelete(key,index){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Stammdatenwert löschen')) return;
  const value = STAMM[key][index];
  const usage = getStammUsage(value);
  if(usage.length){
    alert('Löschen nicht möglich. Der Wert wird noch verwendet:\\n\\n' + usage.join('\\n'));
    return;
  }
  if(confirm('Stammdatenwert wirklich löschen?\\n\\n' + value)){
    STAMM[key].splice(index,1);
    recordStammAudit('delete', key, value);
    toast('Stammdatenwert gelöscht.');
    render();
  }
}

function getStammUsage(value){
  const hits = [];
  const tables = ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'];
  if(typeof DB === 'undefined' || !DB) return hits;
  tables.forEach(table=>{
    const rows = DB[table];
    if(!Array.isArray(rows)) return;
    rows.forEach(row=>{
      if(!row || typeof row !== 'object') return;
      Object.entries(row).forEach(([field,val])=>{
        if(String(val) === String(value)){
          const id = row['Asset-ID'] || row['Ticket-ID'] || row['Software-ID'] || row['Netzwerk-ID'] || row['Hardware-ID'] || row['Notiz-ID'] || row['Knowledge-ID'] || '?';
          hits.push(table + ' / ' + id + ' / ' + field);
        }
      });
    });
  });
  return hits.slice(0,20);
}

function exportStammdatenJson(){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Stammdaten exportieren')) return;
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  downloadBlob(JSON.stringify({exportedAt:new Date().toISOString(), stammdaten:STAMM, audit:stammAudit()},null,2), 'stammdaten-' + stamp + '.json', 'application/json');
}

function importStammdatenJson(){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Stammdaten importieren')) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if(!file) return;
    file.text().then(text => {
      const parsed = JSON.parse(text);
      const next = parsed.stammdaten || parsed;
      if(!next || typeof next !== 'object') throw new Error('JSON enthaelt kein Stammdatenobjekt.');
      STAMM = {...STAMM, ...next};
      recordStammAudit('import', 'json', file.name);
      toast('Stammdaten importiert.');
      render();
    }).catch(e => notify('Stammdaten-Import fehlgeschlagen: ' + e.message, 'error'));
  };
  input.click();
}

function stammAudit(){
  try{return JSON.parse(localStorage.getItem('itverwaltung-v44-stammdaten-audit')) || [];}catch{return [];}
}

function recordStammAudit(action, key, value){
  const rows = stammAudit();
  rows.unshift({time:new Date().toISOString(), action, key, value});
  localStorage.setItem('itverwaltung-v44-stammdaten-audit', JSON.stringify(rows.slice(0,100)));
}
