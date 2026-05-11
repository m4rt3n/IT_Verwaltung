// Software full-scan row compaction and asset/status helpers.

function compactSoftwareFullRows(rows){
  const groups = new Map();
  rows.forEach(row=>{
    const displayName = softwareFullDisplayName(row);
    const version = softwareFullVersion(row);
    const category = softwareFullCategory(row);
    const key = softwareFullGroupKey(row, displayName, version, category);
    if(!groups.has(key)){
      groups.set(key, {...row, DisplayName:displayName, Version:version, EntryCount:1, SoftwareCategory:category, RawNames:[row.Name].filter(Boolean), ComponentDetails:[row]});
      const created = groups.get(key);
      created.UpdateStatus = created.UpdateStatus || "NoUpdateKnown";
      created.UpdateAvailable = created.UpdateAvailable || "False";
      created.InstalledVersion = created.InstalledVersion || version || "";
      created.LatestVersion = created.LatestVersion || "";
      created.UpdateSource = created.UpdateSource || "";
      created.UpdateRaw = created.UpdateRaw || "";
      created.UpdateCheckedAt = created.UpdateCheckedAt || "";
      return;
    }
    const existing = groups.get(key);
    existing.EntryCount += 1;
    existing.ComponentDetails.push(row);
    if(row.Name && !existing.RawNames.includes(row.Name)) existing.RawNames.push(row.Name);
    existing.Sources = mergeCsvValues(existing.Sources || existing.Source || existing.Quelle, row.Sources || row.Source || row.Quelle);
    existing.Quelle = existing.Sources;
    existing.PackageType = mergeCsvValues(existing.PackageType || existing.Pakettyp, row.PackageType || row.Pakettyp);
    existing.Pakettyp = existing.PackageType;
    existing.Scope = mergeCsvValues(existing.Scope || existing.BenutzerKontext, row.Scope || row.BenutzerKontext);
    existing.BenutzerKontext = existing.Scope;
    if(!existing.Publisher && (row.Publisher || row.Hersteller)) existing.Publisher = row.Publisher || row.Hersteller;
    if(!existing.Hersteller && (row.Hersteller || row.Publisher)) existing.Hersteller = row.Hersteller || row.Publisher;
    if(!existing.InstallLocation && row.InstallLocation) existing.InstallLocation = row.InstallLocation;
    if(!existing.RawPath && row.RawPath) existing.RawPath = row.RawPath;
    if(!existing.RawSourceKey && row.RawSourceKey) existing.RawSourceKey = row.RawSourceKey;
    existing.Version = mergeVersionValues(existing.Version, version);
    if(String(row.UpdateAvailable || '').toLowerCase() === 'true'){
      existing.UpdateStatus = row.UpdateStatus || 'UpdateAvailable';
      existing.UpdateAvailable = row.UpdateAvailable;
      existing.InstalledVersion = row.InstalledVersion || row.Version || existing.InstalledVersion;
      existing.LatestVersion = row.LatestVersion || existing.LatestVersion;
      existing.UpdateSource = mergeCsvValues(existing.UpdateSource, row.UpdateSource);
      existing.UpdateRaw = row.UpdateRaw || existing.UpdateRaw;
      existing.UpdateCheckedAt = row.UpdateCheckedAt || existing.UpdateCheckedAt;
    }else{
      existing.UpdateStatus = existing.UpdateStatus || row.UpdateStatus || 'NoUpdateKnown';
      existing.UpdateAvailable = existing.UpdateAvailable || row.UpdateAvailable || 'False';
      existing.InstalledVersion = existing.InstalledVersion || row.InstalledVersion || version || '';
      existing.LatestVersion = existing.LatestVersion || row.LatestVersion || '';
      existing.UpdateSource = existing.UpdateSource || row.UpdateSource || '';
      existing.UpdateCheckedAt = existing.UpdateCheckedAt || row.UpdateCheckedAt || '';
    }
    existing.SoftwareCategory = existing.SoftwareCategory || category;
  });
  return Array.from(groups.values()).sort((a,b)=>softwareFullDisplayName(a).localeCompare(softwareFullDisplayName(b), 'de'));
}

function softwareFullGroupKey(row, displayName, version, category){
  const nameKey = displayName.toLowerCase();
  const family = softwareFullFamily(row);
  if(family) return `${category}|family|${family.family.toLowerCase()}`;
  if(SOFTWARE_FULL_SCOPE === 'apps' && category === 'app') return `app|${nameKey}`;
  if(/^(Adobe Acrobat|Microsoft Visual C\+\+ Redistributable|Microsoft Edge WebView2|\.NET Runtime|Windows App Runtime|Microsoft VCLibs|Sophos Endpoint Security|Brother Drucker\/Scanner Suite)$/i.test(displayName)) return `${category}|${nameKey}`;
  return `${category}|${nameKey}|${version.toLowerCase()}`;
}

function mergeVersionValues(a,b){
  const values = new Set();
  String(a || '').split(/\s*,\s*/).forEach(v=>{ if(v) values.add(v); });
  String(b || '').split(/\s*,\s*/).forEach(v=>{ if(v) values.add(v); });
  const list = Array.from(values).filter(Boolean).sort();
  if(list.length > 4) return `${list[0]} ... ${list[list.length - 1]} (${list.length} Versionen)`;
  return list.join(', ');
}

function mergeCsvValues(a,b){
  const parts = new Set();
  String(a || '').split(/\s*,\s*/).forEach(v=>{ if(v) parts.add(v); });
  String(b || '').split(/\s*,\s*/).forEach(v=>{ if(v) parts.add(v); });
  return Array.from(parts).sort().join(', ');
}

function softwareFullAsset(row){
  const full = DB.softwareFull || {};
  const assetId = row?.['Asset-ID'] || full.asset?.['Asset-ID'] || '';
  const host = row?.['Gerätename'] || full.asset?.['Gerätename'] || '';
  return (DB.assets || []).find(a =>
    (assetId && a['Asset-ID'] === assetId) ||
    (host && String(a['Gerätename']).toLowerCase() === String(host).toLowerCase())
  ) || null;
}

function softwareStatusClass(row){
  if(row && (row.__profileMissing || row.__scanStandard)) return 'info';
  const lic = String(row['Lizenzstatus']||'').toLowerCase();
  const upd = String(row['Update-Status']||'').toLowerCase();
  const crit = String(row['Kritikalität']||'').toLowerCase();
  if(lic.includes('abgelaufen') || upd.includes('veraltet') || crit.includes('hoch')) return 'danger';
  if(lic.includes('prüfen') || upd.includes('prüfen') || crit.includes('mittel')) return 'warning';
  return 'success';
}

function softwareStatusLabel(row){
  if(row && row.__scanStandard) return 'Scan';
  if(row && row.__profileMissing) return 'Profil';
  const cls = softwareStatusClass(row);
  if(cls === 'danger') return 'Prüfen';
  if(cls === 'warning') return 'Hinweis';
  return 'OK';
}

function softwareIcon(row){
  const name = String(row['Softwarename']||'').toLowerCase();
  if(name.includes('firefox') || name.includes('chrome') || name.includes('edge')) return '🌐';
  if(name.includes('adobe') || name.includes('pdf')) return '📄';
  if(name.includes('office') || name.includes('teams')) return '📦';
  if(name.includes('visual c') || name.includes('.net') || name.includes('runtime')) return '🧩';
  if(name.includes('vpn')) return '🔐';
  if(name.includes('druck')) return '🖨️';
  if(name.includes('bitlocker') || name.includes('update')) return '🛡️';
  return '💜';
}
