// Software full-scan inventory rendering.

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
