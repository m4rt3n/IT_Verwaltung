// Dashboard rendering and asset graph interactions.
function renderDashboardModeSwitch(){
  return `<div class="btn-group btn-group-sm" role="group">
    <button class="btn btn-outline-primary" onclick="setDashboardView('graph')">Graph</button>
    <button class="btn btn-outline-primary" onclick="setDashboardView('topology')">Topologie</button>
  </div>`;
}

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
  const assetIssues = dashboardAssetIssues();
  const missingScan = (DB.assets || []).filter(a => !byAsset('hardware', a['Asset-ID']).length || !byAsset('netzwerk', a['Asset-ID']).length).length;
  const warrantyDue = dashboardWarrantyDue();
  const softwareRisks = (DB.software || []).filter(r => softwareStatusClass(r) !== 'success').length;
  const writeButtons = (typeof canWrite === 'function' && canWrite())
    ? '<button class="btn btn-sm btn-outline-warning" onclick="generateRandomTickets()">Tickets generieren</button>'
    : '';
  return `<div class="row g-3">
    ${stat('Offene Tickets',DB.tickets.filter(t=>t.Status==='Offen').length,'danger','Aktive Nacharbeit',"openDashboardList('tickets','open_tickets')")}
    ${stat('Unvollständige Assets',assetIssues,'warning','Pflichtdaten fehlen',"openDashboardList('assets','incomplete')")}
    ${stat('Fehlender Scan',missingScan,'secondary','Hardware oder Netzwerk fehlt',"openDashboardList('assets','scan_unknown')")}
    ${stat('Garantieablauf',warrantyDue,'info','innerhalb 90 Tagen')}
    ${stat('Software-Risiken',softwareRisks,'danger','Lizenz, Update oder Kritikalität prüfen',"openDashboardList('software','incomplete')")}
    ${stat('Assets gesamt',DB.assets.length,'primary','Inventarbestand')}
  </div>

  ${renderDataQualitySummary()}

  <div class="card mt-3">
    <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <span>Asset-Übersicht</span>
        <span class="ms-2">${csvStatusBadge()}</span>
      </div>
      <div class="d-flex gap-2 flex-wrap align-items-center">
        ${renderDashboardModeSwitch()}
        ${writeButtons}
        <button class="btn btn-sm btn-outline-primary" onclick="toggleGraphAnimation()">Animation an/aus</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="exportDashboardReport()">Prüfbericht</button>
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

function openDashboardList(key, savedView){
  activeKey = key;
  listState(key).savedView = savedView;
  saveListState();
  renderAll();
}

function exportDashboardReport(){
  const findings = typeof dataQualityFindings === 'function' ? dataQualityFindings() : [];
  const lines = [
    '# Prüfbericht IT-Verwaltung',
    '',
    `Erstellt: ${new Date().toISOString()}`,
    '',
    `- Assets: ${(DB.assets || []).length}`,
    `- Offene Tickets: ${(DB.tickets || []).filter(t=>t.Status==='Offen').length}`,
    `- Software-Risiken: ${(DB.software || []).filter(r => softwareStatusClass(r) !== 'success').length}`,
    `- Datenqualitätshinweise: ${findings.length}`,
    '',
    '## Datenqualität',
    ...(findings.length ? findings.map(x => '- ' + x) : ['- Keine Hinweise'])
  ];
  downloadBlob(lines.join('\n'), 'pruefbericht-it-verwaltung.md', 'text/markdown');
}

function renderDataQualitySummary(){
  if(typeof dataQualityFindings !== 'function') return '';
  const findings = dataQualityFindings();
  const cls = findings.length ? 'warning' : 'success';
  return `<div class="card mt-3 border-${cls}">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Datenqualität</span>
      <span class="badge text-bg-${cls}">${findings.length ? findings.length + ' Hinweise' : 'OK'}</span>
    </div>
    <div class="card-body">
      ${findings.length ? `<ul class="mb-0">${findings.slice(0,8).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>${findings.length>8?'<div class="text-muted mt-2">Weitere Hinweise gekürzt.</div>':''}` : '<div class="text-muted">Keine doppelten Kernwerte oder Stammdatenabweichungen erkannt.</div>'}
    </div>
  </div>`;
}

function dashboardAssetIssues(){
  return (DB.assets || []).filter(a =>
    !a['Gerätename'] || !a['Asset-Typ'] || !a.Status || !a.Standort || !a.Raum || !a.Hersteller || !a.Seriennummer || !a.Inventarnummer
  ).length;
}

function parseWarrantyDate(value){
  const raw = String(value || '').trim();
  if(!raw) return null;
  const german = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(german) return new Date(Number(german[3]), Number(german[2]) - 1, Number(german[1]));
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  return null;
}

function dashboardWarrantyDue(){
  const now = new Date();
  const limit = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90);
  return (DB.hardware || []).filter(row => {
    const date = parseWarrantyDate(row['Garantie bis']);
    return date && date <= limit;
  }).length;
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

function stat(label,num,color,hint='',action=''){
  const click = action ? ` onclick="${action}" role="button" title="Zur gefilterten Liste öffnen"` : '';
  return `<div class="col-md-4"><div class="card border-${color} dashboard-stat-card"${click}><div class="card-body"><div class="text-muted">${label}</div><div class="display-6 fw-bold">${num}</div>${hint ? `<div class="small text-muted">${hint}</div>` : ''}</div></div></div>`;
}
