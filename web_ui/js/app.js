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


// ===== v26 SOFTWARE SMART CHECKLIST =====

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
