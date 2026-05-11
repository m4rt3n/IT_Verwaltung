// Standard software cards and detail rendering.

function renderSoftwareCardsLayout(rows,row,idx,mod){
  const sectionedRows = renderSoftwareCardSections(rows, idx);
  return `<div class="row g-3">
    <div class="col-lg-5">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Software-Karten</span>
          <span class="badge text-bg-secondary">${rows.length}</span>
        </div>
        <div class="card-body software-card-list">
          ${rows.length ? sectionedRows : '<div class="text-muted">Keine Software vorhanden.</div>'}
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      ${row ? renderSoftwareDetailCard(row,idx,rows.length,mod) : '<div class="card"><div class="card-body text-muted">Kein Eintrag ausgewählt.</div></div>'}
    </div>
  </div>`;
}

function renderSoftwareCardSections(rows, idx){
  const curated = rows.map((row,index)=>({row,index})).filter(item => !item.row.__scanStandard && !item.row.__profileMissing);
  const scan = rows.map((row,index)=>({row,index})).filter(item => item.row.__scanStandard);
  const missing = rows.map((row,index)=>({row,index})).filter(item => item.row.__profileMissing);
  return [
    renderSoftwareCardSection('Kuratierte Standardsoftware', curated, idx, 'Bereits in software_standard.csv'),
    renderSoftwareCardSection('Aus Full-Scan erkannt', scan, idx, 'Noch nicht kuratiert'),
    renderSoftwareCardSection('Erwartet, aber nicht zugeordnet', missing, idx, 'Profilhinweis')
  ].filter(Boolean).join('');
}

function renderSoftwareCardSection(title, items, idx, subtitle){
  if(!items.length) return '';
  return `<div class="software-card-section">
    <div class="software-card-section-title">${safeEscape(title)} <span>${items.length}</span><small>${safeEscape(subtitle)}</small></div>
    ${items.map(item=>renderSoftwareListCard(item.row,item.index,idx)).join('')}
  </div>`;
}

function renderSoftwareListCard(r,i,idx){
  const cls = softwareStatusClass(r);
  return `<div class="software-list-card ${r.__profileMissing || r.__scanStandard ? 'software-profile-missing' : ''} ${i===idx?'active':''}" onclick="selectedIndex.software=${i};render();">
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
  if(row.__scanStandard) return renderSoftwareScanStandardDetailCard(row,idx,total);
  if(row.__profileMissing) return renderSoftwareProfileDetailCard(row,idx,total);
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
          <div class="d-flex gap-2 ${canWrite() ? '' : 'd-none'}">
            <button class="btn btn-outline-primary" onclick="openEdit('software',${idx})">Bearbeiten</button>
            <button class="btn btn-outline-danger" onclick="deleteRow('software',${idx})">Löschen</button>
          </div>
        </div>
        ${kbHint}
        ${renderSoftwareInstalledElsewhere(row)}
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
