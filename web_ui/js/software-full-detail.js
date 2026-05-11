// Software full-scan detail card rendering.

function renderSoftwareFullDetailsMenu(row){
  const details = Array.isArray(row.ComponentDetails) ? row.ComponentDetails : [];
  if(details.length <= 1) return '';
  return `<details class="software-full-details mt-3">
    <summary>${details.length} zusammengeführte Einzelquellen anzeigen</summary>
    <div class="table-wrap mt-2">
      <table class="table table-sm">
        <thead><tr><th>Name</th><th>Version</th><th>Typ</th><th>Quelle</th></tr></thead>
        <tbody>
          ${details.map(item=>`<tr>
            <td>${safeEscape(item.DisplayName || item.Name || '-')}</td>
            <td>${safeEscape(softwareFullVersion(item) || '-')}</td>
            <td>${safeEscape(item.PackageType || item.Pakettyp || '-')}</td>
            <td>${safeEscape(item.Sources || item.Source || item.Quelle || '-')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </details>`;
}

function softwareFullIcon(row){
  const type = String(row.PackageType || row.Pakettyp || '').toLowerCase();
  const name = String(row.DisplayName || row.Name || '').toLowerCase();
  if(type.includes('driver')) return '🛠️';
  if(type.includes('service')) return '⚙️';
  if(type.includes('appx')) return '▣';
  if(type.includes('pip') || type.includes('npm')) return '{}';
  if(name.includes('chrome') || name.includes('firefox') || name.includes('edge')) return '🌐';
  return '◼';
}

function renderSoftwareFullDetailCard(row,idx,total){
  const asset = softwareFullAsset(row);
  const labels = softwareFullLabels(row);
  const risk = softwareFullRisk(row);
  const trust = softwareFullSourceTrust(row);
  const family = softwareFamilyParts(row);
  const riskCls = risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : 'secondary';
  const updateCls = String(row.UpdateAvailable || '').toLowerCase() === 'true' ? 'danger' : 'secondary';
  return `${navCustom(idx,total,'setSoftwareFullSelected')}
    <div class="card software-detail-card mt-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${renderSoftwareFullLogo(row, 'detail')}</div>
            <h3 class="mb-1">${safeEscape(row.DisplayName || softwareFullDisplayName(row))}</h3>
            <span class="badge text-bg-primary">${safeEscape(row.PackageType || row.Pakettyp || 'Scan')}</span>
            <span class="badge text-bg-secondary">${safeEscape(row.Scope || row.BenutzerKontext || '-')}</span>
            <span class="badge text-bg-info">${safeEscape(softwareFullClassLabel(row))}</span>
            <span class="badge text-bg-${riskCls}">Risiko: ${safeEscape(risk)}</span>
            <span class="badge text-bg-${updateCls}">${safeEscape(row.UpdateStatus || 'Update unbekannt')}</span>
            <span class="badge text-bg-dark">${safeEscape(softwareFullProfileStatus(row))}</span>
            <span class="badge text-bg-success">zugeordnet zu: ${safeEscape(asset?.['Gerätename'] || row['Gerätename'] || row['Asset-ID'] || '-')}</span>
          </div>
          <button class="btn btn-outline-warning ${asset ? '' : 'd-none'}" onclick="createScannerReviewNote(${idx})">Nacharbeit notieren</button>
        </div>
        ${labels.length ? `<div class="mt-3 d-flex flex-wrap gap-1">${labels.map(label=>`<span class="badge text-bg-light">${safeEscape(label)}</span>`).join('')}</div>` : ''}
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Software</h5>
            <div class="kv">
              ${kv('Anwendung',row.DisplayName || softwareFullDisplayName(row))}
              ${kv('Produktfamilie',family.family)}
              ${kv('Version',softwareFullVersion(row))}
              ${kv('Hersteller',normalizeManufacturer(row.Publisher || row.Hersteller))}
              ${kv('Klasse',softwareFullClassLabel(row))}
              ${kv('Risiko/Relevanz',risk)}
              ${kv('Quellenvertrauen',trust.level + ' - ' + trust.text)}
              ${kv('Normalisierter Update-Status',normalizeUpdateStatus(row))}
              ${kv('Profil-Abgleich',softwareFullProfileStatus(row))}
              ${kv('Update-Auswertung',softwareFullUpdateAssessment(row))}
              ${kv('Installierte Version',row.InstalledVersion || softwareFullVersion(row))}
              ${kv('Neueste Version',row.LatestVersion || '-')}
              ${kv('Update-Quelle',row.UpdateSource || '-')}
              ${kv('Pakettyp',row.PackageType || row.Pakettyp)}
              ${kv('Quelle',row.Sources || row.Source || row.Quelle)}
              ${kv('Scope',row.Scope || row.BenutzerKontext)}
              ${kv('Zusammengeführt',row.EntryCount > 1 ? row.EntryCount + ' Rohquellen' : 'Nein')}
              ${kv('Confidence',row.DetectionConfidence)}
              ${kv('Status',row.ScanStatus)}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Zugeordnetes Asset</h5>
            <div class="kv">
              ${kv('Asset-ID',asset?.['Asset-ID'] || row['Asset-ID'])}
              ${kv('Gerätename',asset?.['Gerätename'] || row['Gerätename'])}
              ${kv('Typ',asset?.['Asset-Typ'] || '-')}
              ${kv('Standort',asset ? ((asset.Standort || '-') + ' / ' + (asset.Raum || '-')) : '-')}
              ${kv('Nutzer',asset?.Hauptnutzer || '-')}
              ${kv('Status',asset?.Status || '-')}
            </div>
          </div>
        </div>
        ${renderSoftwareFullAssetSummary(row)}
        ${renderSoftwareFullDetailsMenu(row)}
        <div class="software-raw-path mt-3">${safeEscape(row.InstallLocation || row.RawPath || row.RawSourceKey || '')}</div>
      </div>
    </div>`;
}

function renderSoftwareFullAssetSummary(row){
  const asset = softwareFullAsset(row);
  if(!asset) return '';
  const allRows = compactSoftwareFullRows(softwareFullBaseRows().filter(r=>softwareFullAsset(r)?.['Asset-ID'] === asset['Asset-ID'] || softwareFullAsset(r)?.['Gerätename'] === asset['Gerätename']));
  const counts = allRows.reduce((acc,item)=>{
    const swClass = softwareFullClass(item);
    acc[swClass] = (acc[swClass] || 0) + 1;
    return acc;
  }, {});
  return `<div class="alert alert-light mt-3 mb-0">
    <b>Asset-Softwareprofil:</b>
    ${allRows.length} verdichtete Einträge,
    ${(counts.productivity || 0)} Produktiv,
    ${(counts.admin || 0)} Admin/IT,
    ${(counts.development || 0)} Entwicklung,
    ${(counts.security || 0)} Security,
    ${(counts.unclear || 0)} unklar.
  </div>`;
}
