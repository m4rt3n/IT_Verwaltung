// App startup, role handling and main navigation.

function runCoreSelfTest(){
  const missing = [];
  ['setPath','getPath','sel','f','manufacturerSelect','modelSeriesSelect','saveWizardFields','renderWizard','wizardStepHtml'].forEach(name=>{
    if(typeof window[name] !== 'function') missing.push(name);
  });
  if(missing.length){
    console.error('Core helper missing:', missing.join(', '));
    return false;
  }
  return true;
}


// ===== v44 SAFE SMART SOFTWARE LAYER =====
function renderSoftwareStatus(assetId){
  ensureSmartSoftwareDefaults();
  if(typeof DB === 'undefined' || !DB || !DB.stammdaten || !Array.isArray(DB.stammdaten.software)) return "";
  return DB.stammdaten.software.map(sw=>{
    const installed = isSoftwareInstalled(assetId, sw.name);
    const badge = installed ? '<span class="badge bg-success ms-2">installiert</span>' :
      sw.required ? '<span class="badge bg-danger ms-2">Pflicht fehlt</span>' :
      '<span class="badge bg-warning ms-2">fehlt</span>';
    return `<div class="software-status-row">${sw.name} ${badge}</div>`;
  }).join("");
}

async function init(){runCoreSelfTest();await loadBuildInfo();await loadServerStatus();await loadDbFromServer();await loadSoftwareFullFromServer();await loadSoftwareClassification();await loadStammdaten();if(typeof loadHelpDocs === 'function') await loadHelpDocs();const search=document.getElementById('globalSearch');search.addEventListener('input',e=>{searchText=e.target.value;render();});search.addEventListener('keydown',e=>{if(e.key==='Escape'){clearSearch();}else if(e.key==='Enter'){render();}});installKeyboardShortcuts();renderAll();}

function installKeyboardShortcuts(){
  if(window.__itverwaltungShortcutsInstalled) return;
  window.__itverwaltungShortcutsInstalled = true;
  document.addEventListener('keydown', event => {
    const tag = String(event.target?.tagName || '').toLowerCase();
    const typing = ['input','textarea','select'].includes(tag);
    if(event.key === '/' && !typing){
      event.preventDefault();
      document.getElementById('globalSearch')?.focus();
      return;
    }
    if(event.key === 'ArrowDown' && !typing){
      event.preventDefault();
      nextRow(activeKey);
      return;
    }
    if(event.key === 'ArrowUp' && !typing){
      event.preventDefault();
      prevRow(activeKey);
      return;
    }
    if(event.ctrlKey && String(event.key).toLowerCase() === 's'){
      event.preventDefault();
      const modal = document.getElementById('editModal');
      if(modal && modal.classList.contains('show')) saveModal();
    }
  });
}
function isAdminRole(){
  return (APP_SETTINGS.role || 'admin') === 'admin';
}
function canWrite(){
  return isAdminRole();
}
function requireWriteAccess(action='Diese Aktion'){
  if(canWrite()) return true;
  notify(`${action} ist im Normalmodus gesperrt.`, 'warning');
  return false;
}
function visibleModules(){
  return modules.filter(m => isAdminRole() || m.group !== 'admin');
}
function roleLabel(){
  return isAdminRole() ? 'Admin' : 'Normal';
}
function renderRoleControl(){
  return `<div class="role-control" title="Lokaler UI-Modus: Normal blendet Admin-Funktionen aus und sperrt Schreibaktionen.">
    <span class="role-label">${roleLabel()}</span>
    <select class="form-select form-select-sm role-select" onchange="setRole(this.value)" aria-label="Rollenmodus wechseln">
      <option value="admin" ${isAdminRole()?'selected':''}>Admin</option>
      <option value="normal" ${!isAdminRole()?'selected':''}>Normal</option>
    </select>
  </div>`;
}
function applyRoleUi(){
  const roleTarget = document.getElementById('roleControl');
  if(roleTarget) roleTarget.innerHTML = renderRoleControl();
  const newDeviceBtn = document.getElementById('newDeviceBtn');
  if(newDeviceBtn){
    newDeviceBtn.classList.toggle('d-none', !canWrite());
    newDeviceBtn.title = canWrite() ? 'Neues Gerät über den Wizard erfassen.' : 'Im Normalmodus sind Schreibaktionen gesperrt.';
  }
}
function setRole(role){
  APP_SETTINGS.role = role === 'normal' ? 'normal' : 'admin';
  saveAppSettings();
  renderAll();
  notify(`Rollenmodus: ${roleLabel()}`, 'info');
}
function tabButton(m){
  const cls = [
    'nav-link',
    m.key===activeKey ? 'active' : '',
    m.group==='support' ? 'nav-link-support' : '',
    m.group==='admin' ? 'nav-link-admin' : '',
    m.group==='main' ? 'nav-link-main' : ''
  ].join(' ');
  return `<li class="nav-item"><button class="${cls}" onclick="openTab('${m.key}')">${m.title}</button></li>`;
}
function navGroup(title, groupKey){
  const groupModules = visibleModules().filter(m=>m.group===groupKey);
  if(!groupModules.length) return '';
  return `<div class="nav-group nav-group-${groupKey}">
    <div class="nav-group-label">${title}</div>
    <ul class="nav nav-tabs grouped-tabs">${groupModules.map(tabButton).join('')}</ul>
  </div>`;
}
function renderAll(){
  if(!visibleModules().some(m=>m.key===activeKey)) activeKey='dashboard';
  applyRoleUi();
  document.getElementById('tabs').innerHTML =
    navGroup('IT-Verwaltung', 'main') +
    navGroup('Dokumentation & Wissen', 'support') +
    navGroup('Konfiguration', 'admin');
  render();
}
function openTab(key){if(!visibleModules().some(m=>m.key===key))key='dashboard';activeKey=key;renderAll();}
function render(){
  const mod=visibleModules().find(m=>m.key===activeKey)||visibleModules()[0];
  const c=document.getElementById('tabContent');
  c.className='pt-3 page-group-'+(mod?.group||'main');
  let html='';
  if(mod.mode==='dashboard')html=renderDashboard();
  else if(mod.mode==='asset')html=renderAssets();
  else if(mod.mode==='module')html=renderLinkedModule(mod);
  else if(mod.mode==='adminpanel')html=renderAdminPanel();
  else if(mod.mode==='stammdaten')html=renderStammdaten();
  else if(mod.mode==='help')html=renderHelp();
  else html=renderSimpleModule(mod);
  c.innerHTML=renderWorkflowBar(mod)+html;
  uxAnimateContent();
}
