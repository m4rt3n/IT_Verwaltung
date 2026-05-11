// Software full-scan state, filtering, classification and compaction.

// ===== v27 SOFTWARE UI =====
let SOFTWARE_VIEW = localStorage.getItem('softwareView') || 'cards';
let SOFTWARE_FULL_SELECTED = 0;
const SOFTWARE_FULL_SCOPES = ['apps','productivity','admin','development','security','drivers','runtimes','windows','services','unknown','components','system','all'];
const STORED_SOFTWARE_FULL_SCOPE = localStorage.getItem('softwareFullScope') || 'apps';
let SOFTWARE_FULL_SCOPE = SOFTWARE_FULL_SCOPES.includes(STORED_SOFTWARE_FULL_SCOPE) ? STORED_SOFTWARE_FULL_SCOPE : 'apps';

function setSoftwareView(view){
  SOFTWARE_VIEW = view;
  localStorage.setItem('softwareView', view);
  render();
}

function setSoftwareFullSelected(i){
  SOFTWARE_FULL_SELECTED = i;
  render();
}

function setSoftwareFullScope(scope){
  SOFTWARE_FULL_SCOPE = SOFTWARE_FULL_SCOPES.includes(scope) ? scope : 'apps';
  SOFTWARE_FULL_SELECTED = 0;
  localStorage.setItem('softwareFullScope', SOFTWARE_FULL_SCOPE);
  render();
}

function softwareFullBaseRows(){
  const full = DB.softwareFull || {};
  const rows = Array.isArray(full.rows) ? full.rows : [];
  const q = searchText.trim().toLowerCase();
  return rows
    .filter(r=>!q || Object.values(r).join(' ').toLowerCase().includes(q))
    .filter(r=>String(r.Name || '').trim() && String(r.Name || '').trim() !== '-');
}

function softwareFullRows(){
  const filtered = softwareFullBaseRows()
    .filter(r=>{
      const category = softwareFullCategory(r);
      const swClass = softwareFullClass(r);
      if(SOFTWARE_FULL_SCOPE === 'all') return true;
      if(SOFTWARE_FULL_SCOPE === 'apps') return category === 'app';
      if(SOFTWARE_FULL_SCOPE === 'productivity') return swClass === 'productivity';
      if(SOFTWARE_FULL_SCOPE === 'admin') return swClass === 'admin';
      if(SOFTWARE_FULL_SCOPE === 'development') return swClass === 'development';
      if(SOFTWARE_FULL_SCOPE === 'security') return swClass === 'security';
      if(SOFTWARE_FULL_SCOPE === 'drivers') return swClass === 'driver';
      if(SOFTWARE_FULL_SCOPE === 'runtimes') return swClass === 'runtime';
      if(SOFTWARE_FULL_SCOPE === 'windows') return swClass === 'windows';
      if(SOFTWARE_FULL_SCOPE === 'services') return swClass === 'service';
      if(SOFTWARE_FULL_SCOPE === 'unknown') return swClass === 'unclear';
      if(SOFTWARE_FULL_SCOPE === 'components') return category === 'component';
      if(SOFTWARE_FULL_SCOPE === 'system') return category === 'system';
      return category === 'app';
    });
  return compactSoftwareFullRows(filtered);
}

function softwareFullCategory(row){
  const family = softwareFullFamily(row);
  if(family?.category) return family.category;
  if(isWindowsSystemSoftware(row)) return 'system';
  if(isSoftwareComponent(row)) return 'component';
  return 'app';
}

function isWindowsSystemSoftware(row){
  const name = String(row.DisplayName || row.Name || '').trim();
  const publisher = String(row.Publisher || row.Hersteller || '');
  const packageType = String(row.PackageType || row.Pakettyp || '');
  const path = String(row.InstallLocation || row.RawPath || row.RawSourceKey || '');
  const normalizedPath = path.replaceAll('/', '\\').toLowerCase();
  const source = String(row.Sources || row.Source || row.Quelle || '');

  if(/\b(Service|Driver)\b/i.test(packageType)) return true;
  if(/CN=Microsoft Windows/i.test(publisher)) return true;
  if(SOFTWARE_FULL_SYSTEM_PATTERNS.some(pattern=>pattern.test(name))) return true;
  if(/CN=Microsoft Corporation/i.test(publisher) && /Appx\/MSIX/i.test(packageType) && SOFTWARE_FULL_SYSTEM_PATTERNS.some(pattern=>pattern.test(name))) return true;
  if(['\\windows\\systemapps\\','\\windows\\winsxs\\','\\windows\\system32\\','\\windows\\syswow64\\'].some(part=>normalizedPath.includes(part))) return true;
  if(/^(Microsoft\.Windows|Windows\.|Microsoft\.UI\.Xaml|UI\.Xaml|Microsoft\.VCLibs|Microsoft\.NET\.Native|Microsoft\.Services\.Store)/i.test(name)) return true;
  if(/^Microsoft\.(AAD|AccountsControl|AsyncTextService|BioEnrollment|CredentialDialogHost|LockApp|SecHealthUI|WindowsStore)/i.test(name)) return true;
  if(/HKEY_USERS_S-1-5-(18|19|20)/i.test(source)) return true;
  return false;
}

function isSoftwareComponent(row){
  const name = String(row.DisplayName || row.Name || '').trim();
  const publisher = String(row.Publisher || row.Hersteller || '');
  const packageType = String(row.PackageType || row.Pakettyp || '');
  const blob = `${name} ${publisher} ${packageType}`.toLowerCase();
  if(/\b(runtime|redistributable|webview|vclibs|framework|sdk|dependency|library|driver package|hosting bundle|shared framework|desktop runtime|native runtime)\b/i.test(blob)) return true;
  if(/\b(update service|updater|notification client|refresh manager|helper|maintenance service|crash reporter|telemetry|licensing service|scheduler service)\b/i.test(blob)) return true;
  if(/^(adobe(acrobaticondccoreapp|notificationclient)|acrobat notification client|adobe notification client|adobe refresh manager)$/i.test(name.replace(/\s+/g, ' ').trim())) return true;
  return false;
}

function softwareFullCategoryCounts(rows){
  return rows.reduce((acc,row)=>{
    const category = softwareFullCategory(row);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {app:0, component:0, system:0});
}

function softwareFullClassCounts(rows){
  return rows.reduce((acc,row)=>{
    const swClass = softwareFullClass(row);
    acc[swClass] = (acc[swClass] || 0) + 1;
    return acc;
  }, {});
}
