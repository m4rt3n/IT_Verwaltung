// Admin panel rendering. Helper modules provide backup, scanner, import and export actions.
function renderServerStatusNotice(){
  if(typeof SERVER_STATUS === 'undefined' || !SERVER_STATUS.loaded) return '';
  const node = SERVER_STATUS.node || {};
  if(node.warning){
    return `<div class="alert alert-warning mb-3">${escapeHtml(node.warning)}</div>`;
  }
  return '';
}

function renderDataAreaList(title, rows, tone){
  rows = Array.isArray(rows) ? rows : [];
  return `<div class="data-area-section data-area-${tone || 'neutral'}">
    <div class="data-area-title">${escapeHtml(title)}</div>
    ${rows.length ? rows.map(row => `<div class="data-area-row">
      <span>${escapeHtml(row.file || row.key || '-')}</span>
      <span class="badge text-bg-${row.exists ? 'success' : 'secondary'}">${row.exists ? 'vorhanden' : 'fehlt'}</span>
    </div>`).join('') : '<div class="text-muted small">Keine Eintraege gemeldet.</div>'}
  </div>`;
}

function renderDataSeparationCard(){
  const areas = SERVER_STATUS?.data_areas || {};
  return `<div class="card admin-card">
    <div class="card-header"><b>Datenbereiche</b></div>
    <div class="card-body">
      <div class="alert alert-info py-2">
        Produktive CSVs, Scannerartefakte und Demo-/Seed-Daten sind getrennte Datenbereiche. Diese Anzeige schreibt keine Daten und dient nur als Orientierung.
      </div>
      <div class="data-area-grid">
        ${renderDataAreaList('Produktive CSVs', areas.productive, 'productive')}
        ${renderDataAreaList('Scannerartefakte', areas.scanner_artifacts, 'artifact')}
        ${renderDataAreaList('Demo / Seed', areas.demo_seed, 'demo')}
      </div>
      <div class="text-muted mt-2">${escapeHtml(areas.note || 'Serverstatus noch nicht geladen.')}</div>
    </div>
  </div>`;
}

function renderAdminPanel(){
  return `${adminStoragePanel()}${renderScannerStartPanel()}${renderBuildInfoCard()}<div class="row g-3">
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
          ${renderStammdatenStatus()}
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-outline-primary" onclick="reloadStammdaten()" title="Lädt alle Stammdatenlisten aus den lokalen Markdown-Dateien neu." aria-label="Lädt alle Stammdatenlisten aus den lokalen Markdown-Dateien neu.">Stammdaten neu laden</button>
          </div>
          <div class="text-muted mt-2">Backup, Import, Export und manuelles CSV-Speichern sind oben fachlich getrennt in <b>Datensicherung</b>, <b>Exporte</b> und <b>CSV-Wartung</b>.</div>
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
          ${renderServerStatusNotice()}
          <div class="kv">
            ${kv('Version', BUILD_INFO.version || '-')}
            ${kv('Build', BUILD_INFO.buildDate || '-')}
            ${kv('CSV Backend', CSV_BACKEND_AVAILABLE ? 'aktiv' : 'nicht verbunden')}
            ${kv('Start-URL', SERVER_STATUS?.url || '-')}
            ${kv('Node', SERVER_STATUS?.node?.available ? SERVER_STATUS.node.source : 'nicht gefunden')}
            ${kv('POST-Schutz', SERVER_STATUS?.post_token_required ? 'Session-Token aktiv' : 'nur Origin/Host')}
            ${kv('Software-CSV', SERVER_STATUS?.table_files?.software || 'software_standard.csv')}
            ${kv('Legacy-Software-CSV', SERVER_STATUS?.legacy_table_files?.software || 'software.csv')}
            ${kv('Assets', DB.assets.length)}
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      ${renderDataSeparationCard()}
    </div>
  </div>`;
}

function adminSwitch(key,title,desc){
  const checked = APP_SETTINGS[key] ? 'checked' : '';
  return `<div class="form-check form-switch admin-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="set_${key}" ${checked} onchange="setSetting('${key}',this.checked)">
    <label class="form-check-label" for="set_${key}" title="${escapeHtml(desc)}"><b>${title}</b><br><span class="text-muted">${desc}</span></label>
  </div>`;
}
