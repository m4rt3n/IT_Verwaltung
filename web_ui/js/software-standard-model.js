// Standard software scan matching and placeholder helpers.

function softwareStatCard(title,value,color){
  return `<div class="col-md-3">
    <div class="card software-stat software-stat-${color}">
      <div class="card-body">
        <div class="software-stat-label">${title}</div>
        <div class="software-stat-value">${value}</div>
      </div>
    </div>
  </div>`;
}

function softwareStandardCardRows(rows){
  const asset = softwareExactScanAsset();
  if(!asset) return rows.map(row => ({...row, __profileMissing:false}));
  const installedRows = rows
    .filter(row => String(row['Asset-ID'] || '') === String(asset['Asset-ID']))
    .map(row => ({...row, __profileMissing:false}));
  const existing = new Set(installedRows.map(row => softwareProfileMatchKey(row)));
  const scanRows = softwareFullStandardRowsForAsset(asset)
    .filter(row => !softwareStandardExistsForFullRow(row, existing))
    .map(row => softwareScanStandardPlaceholder(row, asset));
  return installedRows.concat(scanRows);
}

function softwareExactScanAsset(){
  const full = DB.softwareFull || {};
  const assetInfo = full.asset || {};
  const rows = Array.isArray(full.rows) ? full.rows : [];
  const assetId = assetInfo['Asset-ID'] || singleNonEmptyValue(rows, 'Asset-ID');
  const deviceName = assetInfo['Gerätename'] || singleNonEmptyValue(rows, 'Gerätename');
  if(assetId){
    return CORE.findAsset(assetId) || {['Asset-ID']:assetId, ['Gerätename']:deviceName || assetId};
  }
  if(deviceName){
    return (DB.assets || []).find(a => String(a['Gerätename'] || '').toLowerCase() === String(deviceName).toLowerCase()) || {['Asset-ID']:'', ['Gerätename']:deviceName};
  }
  return null;
}

function singleNonEmptyValue(rows, field){
  const values = Array.from(new Set((rows || []).map(row => String(row?.[field] || '').trim()).filter(Boolean)));
  return values.length === 1 ? values[0] : '';
}

function softwareProfileMatchKey(row){
  const packageId = String(row.Bemerkung || '').match(/Paket-ID:\s*([^;]+)/i)?.[1] || row.PaketId || row.PackageId || row.PackageIdentifier || '';
  const name = softwareComparableName(row['Softwarename'] || row.DisplayName || row.Name || softwareFullDisplayName(row));
  return packageId ? 'pkg:' + String(packageId).toLowerCase() : 'name:' + name;
}

function softwareProfileItemMatchKey(item){
  return item.packageId ? 'pkg:' + String(item.packageId).toLowerCase() : 'name:' + softwareComparableName(item.software);
}

function softwareProfileItemNameKey(item){
  return 'name:' + softwareComparableName(item.software);
}

function softwareProfileItemExists(item, existingKeys){
  return existingKeys.has(softwareProfileItemMatchKey(item)) || existingKeys.has(softwareProfileItemNameKey(item));
}

function softwareComparableName(value){
  return String(value || '')
    .toLowerCase()
    .replace(/^microsoft\s+/, '')
    .replace(/^adobe\s+/, '')
    .replace(/\s+reader$/, ' reader')
    .replace(/\s+/g,' ')
    .trim();
}

function softwareFullStandardRowsForAsset(asset){
  if(!asset || !DB.softwareFull?.available) return [];
  return compactSoftwareFullRows(softwareFullBaseRows().filter(row =>
    (asset['Asset-ID'] && String(row['Asset-ID'] || '') === String(asset['Asset-ID'])) ||
    (asset['Gerätename'] && String(row['Gerätename'] || '').toLowerCase() === String(asset['Gerätename']).toLowerCase())
  )).filter(row => softwareStandardCatalogItemForFullRow(row));
}

function softwareStandardCatalogItemForFullRow(row){
  const profile = SMART_SOFTWARE_PROFILES.windows || [];
  const packageId = String(row.PaketId || row.PackageId || row.PackageIdentifier || row.RawSourceKey || '').toLowerCase();
  const name = softwareComparableName(row.DisplayName || softwareFullDisplayName(row) || row.Name);
  return profile.find(item => {
    if(!item || !item.software) return false;
    if(item.packageId && packageId && packageId.includes(String(item.packageId).toLowerCase())) return true;
    return softwareComparableName(item.software) === name;
  }) || null;
}

function softwareStandardExistsForFullRow(row, existingKeys){
  const item = softwareStandardCatalogItemForFullRow(row);
  if(item && softwareProfileItemExists(item, existingKeys)) return true;
  return existingKeys.has('name:' + softwareComparableName(row.DisplayName || softwareFullDisplayName(row) || row.Name));
}

function softwareScanStandardPlaceholder(row, asset){
  const item = softwareStandardCatalogItemForFullRow(row) || {};
  const packageId = item.packageId || row.PaketId || row.PackageId || row.RawSourceKey || '';
  return {
    'Software-ID': '',
    'Asset-ID': asset['Asset-ID'] || row['Asset-ID'] || '',
    'Gerätename': asset['Gerätename'] || row['Gerätename'] || '',
    'Softwarename': item.software || row.DisplayName || softwareFullDisplayName(row),
    'Version': softwareFullVersion(row) || row.Version || '',
    'Hersteller': item.vendor || normalizeManufacturer(row.Publisher || row.Hersteller || ''),
    'Lizenzstatus': 'Prüfen',
    'Update-Status': normalizeUpdateStatus(row) === 'Current' ? 'Aktuell' : 'Prüfen',
    'Kritikalität': ['runtime','security'].includes(softwareFullClass(row)) ? 'Hoch' : 'Normal',
    'Bemerkung': 'Aus Full-Scan als Standardsoftware erkannt.' + (packageId ? ' Paket-ID: ' + packageId : ''),
    __scanStandard: true,
    __fullRow: row,
    __profileItem: item
  };
}

function softwareProfilePlaceholder(item, assetId, deviceName){
  return {
    'Software-ID': '',
    'Asset-ID': assetId,
    'Gerätename': deviceName,
    'Softwarename': item.software,
    'Version': '',
    'Hersteller': item.vendor,
    'Lizenzstatus': 'Nicht zugeordnet',
    'Update-Status': 'Profil',
    'Kritikalität': ['vcRuntime','dotnetRuntime','dotnetSdk10','directx','bitlocker','windowsUpdates'].includes(item.key) ? 'Hoch' : 'Normal',
    'Bemerkung': 'Aus Standardsoftware-Profil erwartet.' + (item.packageId ? ' Paket-ID: ' + item.packageId : ''),
    __profileMissing: true,
    __profileItem: item
  };
}
