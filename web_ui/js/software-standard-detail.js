// Standard software scan adoption and profile detail cards.

function renderSoftwareScanStandardDetailCard(row,idx,total){
  const asset = CORE.findAsset(row['Asset-ID']);
  const packageId = row.__profileItem?.packageId || String(row.Bemerkung || '').match(/Paket-ID:\s*([^;]+)/i)?.[1] || '';
  return `${nav('software',idx,total)}
    <div class="card software-detail-card mt-3 software-profile-detail">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${softwareIcon(row)}</div>
            <h3 class="mb-1">${safeEscape(row['Softwarename'] || 'Software')}</h3>
            <span class="badge text-bg-info">Aus Full-Scan erkannt</span>
            <span class="badge text-bg-secondary">${safeEscape(row.__profileItem?.group || 'Standardsoftware')}</span>
            <span class="badge text-bg-success">Scan-Asset: ${safeEscape(row['Gerätename'] || row['Asset-ID'] || '-')}</span>
          </div>
          <button class="btn btn-primary ${canWrite() ? '' : 'd-none'}" onclick="acceptScannedStandardSoftware(${idx})">In Standardsoftware übernehmen</button>
        </div>
        ${renderSoftwareInstalledElsewhere(row)}
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Erkannte Standardsoftware</h5>
            <div class="kv">
              ${kv('Anwendung',row['Softwarename'])}
              ${kv('Version',row['Version'])}
              ${kv('Hersteller',row['Hersteller'])}
              ${kv('Rubrik',row.__profileItem?.group || '-')}
              ${kv('Winget-Paket-ID',packageId || '-')}
              ${kv('Update-Status',row['Update-Status'])}
              ${kv('Kritikalität',row['Kritikalität'])}
              ${kv('Bemerkung',row['Bemerkung'])}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Exaktes Scan-Asset</h5>
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

function acceptScannedStandardSoftware(cardIndex){
  if(!requireWriteAccess('Standardsoftware aus Scan übernehmen')) return;
  const rows = softwareStandardCardRows(filterRows(DB.software || [], 'software'));
  const row = rows[cardIndex];
  if(!row || !row.__scanStandard){
    notify('Kein übernehmbarer Scan-Standard ausgewählt.', 'warning');
    return;
  }
  if(!DB.software) DB.software = [];
  const exists = DB.software.some(existing =>
    String(existing['Asset-ID'] || '') === String(row['Asset-ID'] || '') &&
    softwareProfileMatchKey(existing) === softwareProfileMatchKey(row)
  );
  if(exists){
    notify('Diese Standardsoftware ist für das Asset bereits vorhanden.', 'info');
    return;
  }
  const preview = [
    'Scan-Standardsoftware übernehmen?',
    '',
    `Asset: ${row['Asset-ID'] || '-'} / ${row['Gerätename'] || '-'}`,
    `Software: ${row['Softwarename'] || '-'}`,
    `Version: ${row['Version'] || '-'}`,
    `Hersteller: ${row['Hersteller'] || '-'}`,
    '',
    'Es wird ein kuratierter Eintrag in software_standard.csv vorbereitet.'
  ].join('\n');
  if(!safetyConfirm('Standardsoftware aus Full-Scan übernehmen?', preview)) return;
  DB.software.push({
    'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
    'Asset-ID': row['Asset-ID'],
    'Gerätename': row['Gerätename'],
    'Softwarename': row['Softwarename'],
    'Version': row['Version'],
    'Hersteller': row['Hersteller'],
    'Lizenzstatus': row['Lizenzstatus'],
    'Update-Status': row['Update-Status'],
    'Kritikalität': row['Kritikalität'],
    'Bemerkung': row['Bemerkung']
  });
  persist();
  maybeSaveDbToServer();
  render();
  toast('Scan-Standardsoftware übernommen.');
}

function renderSoftwareProfileDetailCard(row,idx,total){
  const asset = CORE.findAsset(row['Asset-ID']);
  const item = row.__profileItem || {};
  const packageId = item.packageId || String(row.Bemerkung || '').match(/Paket-ID:\s*([^;]+)/i)?.[1] || '';
  return `${nav('software',idx,total)}
    <div class="card software-detail-card mt-3 software-profile-detail">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="software-detail-icon">${softwareIcon(row)}</div>
            <h3 class="mb-1">${safeEscape(row['Softwarename'] || 'Software')}</h3>
            <span class="badge text-bg-info">Standardsoftware-Profil</span>
            <span class="badge text-bg-secondary">${safeEscape(item.group || 'Standardsoftware')}</span>
            <span class="badge text-bg-warning">noch nicht zugeordnet</span>
            <span class="badge text-bg-success">für: ${safeEscape(row['Gerätename'] || row['Asset-ID'] || '-')}</span>
          </div>
          <button class="btn btn-primary ${canWrite() ? '' : 'd-none'}" onclick="addSoftwareProfileItemToAsset('${safeEscape(item.key || '')}','${safeEscape(row['Asset-ID'] || '')}')">Zu Standardsoftware hinzufügen</button>
        </div>
        <div class="row mt-4">
          <div class="col-md-6">
            <h5>Profilpaket</h5>
            <div class="kv">
              ${kv('Anwendung',row['Softwarename'])}
              ${kv('Hersteller',row['Hersteller'])}
              ${kv('Rubrik',item.group || '-')}
              ${kv('Winget-Paket-ID',packageId || '-')}
              ${kv('Kritikalität',row['Kritikalität'])}
              ${kv('Bemerkung',row['Bemerkung'])}
            </div>
          </div>
          <div class="col-md-6">
            <h5>Ziel-Asset</h5>
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

function renderSoftwareInstalledElsewhere(row){
  const currentAsset = String(row['Asset-ID'] || '');
  const needle = softwareComparableName(row['Softwarename'] || row.DisplayName || row.Name || '');
  if(!needle) return '';
  const standardHits = (DB.software || [])
    .filter(item => softwareComparableName(item['Softwarename']) === needle)
    .filter(item => String(item['Asset-ID'] || '') !== currentAsset)
    .map(item => ({assetId:item['Asset-ID'] || '', deviceName:item['Gerätename'] || '', version:item.Version || '-', source:'Standard'}));
  const fullHits = DB.softwareFull?.available ? compactSoftwareFullRows(softwareFullBaseRows())
    .filter(item => softwareComparableName(item.DisplayName || softwareFullDisplayName(item) || item.Name) === needle)
    .filter(item => String(item['Asset-ID'] || '') !== currentAsset)
    .map(item => ({assetId:item['Asset-ID'] || '', deviceName:item['Gerätename'] || '', version:softwareFullVersion(item) || '-', source:'Full-Scan'})) : [];
  const merged = new Map();
  standardHits.concat(fullHits).forEach(hit => {
    const key = (hit.assetId || '') + '|' + (hit.deviceName || '');
    if(key.replace('|','').trim() && !merged.has(key)) merged.set(key, hit);
  });
  const hits = Array.from(merged.values()).slice(0, 12);
  if(!hits.length) return '';
  return `<div class="alert alert-light mt-3">
    <b>Auch installiert auf:</b>
    <div class="d-flex flex-wrap gap-1 mt-2">
      ${hits.map(hit => `<span class="badge text-bg-secondary">${safeEscape(hit.assetId || '-')} / ${safeEscape(hit.deviceName || '-')} · ${safeEscape(hit.version)} · ${safeEscape(hit.source)}</span>`).join('')}
    </div>
  </div>`;
}
