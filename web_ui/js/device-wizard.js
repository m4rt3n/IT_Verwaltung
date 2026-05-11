// Device creation wizard entry points and smart software behavior.

function getOsProfileName(){
  const os = ((wizard && wizard.data && wizard.data.grund && wizard.data.grund.Betriebssystem) || '').toLowerCase();
  if(os.includes('windows')) return 'windows';
  if(os.includes('linux') || os.includes('ubuntu') || os.includes('debian')) return 'linux';
  if(os.includes('mac')) return 'mac';
  return 'generic';
}
function ensureSmartSoftwareState(){
  if(!wizard || !wizard.data) return;
  if(!wizard.data.smartSoftware) wizard.data.smartSoftware = {};
  const profile = SMART_SOFTWARE_PROFILES[getOsProfileName()] || SMART_SOFTWARE_PROFILES.generic;
  profile.forEach(item=>{
    if(typeof wizard.data.smartSoftware[item.key] === 'undefined') wizard.data.smartSoftware[item.key] = false;
    (item.children||[]).forEach(ch=>{
      if(typeof wizard.data.smartSoftware[ch.key] === 'undefined') wizard.data.smartSoftware[ch.key] = false;
    });
  });
}
function smartSoftwareToggle(key, checked){
  ensureSmartSoftwareState();
  wizard.data.smartSoftware[key] = !!checked;
  if(key === 'adobe' && !checked){
    wizard.data.smartSoftware.adobeCertRequired = false;
    wizard.data.smartSoftware.adobeCertInstalled = false;
  }
  if(key === 'adobeCertInstalled' && checked){
    wizard.data.smartSoftware.adobeCertRequired = true;
    wizard.data.smartSoftware.adobe = true;
  }
  renderWizard();
  if(window.jQuery && (!APP_SETTINGS || APP_SETTINGS.animations)){
    $('.software-smart-card').hide().fadeIn(130);
  }
}
function renderSmartSoftwareStep(){
  ensureSmartSoftwareState();
  const profileName = getOsProfileName();
  const profile = SMART_SOFTWARE_PROFILES[profileName] || SMART_SOFTWARE_PROFILES.generic;
  const grouped = {};
  profile.forEach(item=>{ if(!grouped[item.group]) grouped[item.group] = []; grouped[item.group].push(item); });
  return `<h4>Software</h4>
    <div class="alert alert-info software-smart-intro">OS-Profil: <b>${profileName.toUpperCase()}</b> · strukturierte Software-Checkliste statt Freitext.</div>
    <div class="software-smart-grid">
      ${Object.entries(grouped).map(([group,items])=>`
        <div class="software-smart-group">
          <div class="software-smart-group-title">${softwareGroupIcon(group)} ${group}</div>
          ${items.map(renderSmartSoftwareItem).join('')}
        </div>`).join('')}
    </div>
    <div class="software-smart-extra mt-3">
      <label class="form-label">Zusatzsoftware / Bemerkung</label>
      <textarea id="wizSoftware" class="form-control" rows="5" placeholder="Optional: eine Software pro Zeile, z. B. Firefox;125;Mozilla">${(wizard.data.software||[]).join('\n')}</textarea>
    </div>
    ${renderSmartSoftwareWarnings()}`;
}
function renderSmartSoftwareItem(item){
  const state = wizard.data.smartSoftware || {};
  const checked = state[item.key] ? 'checked' : '';
  const childHtml = (item.children||[]).map(ch=>{
    const childChecked = state[ch.key] ? 'checked' : '';
    const disabled = item.key === 'adobe' && !state.adobe ? 'disabled' : '';
    return `<label class="software-child ${disabled}">
      <input type="checkbox" ${childChecked} ${disabled} onchange="smartSoftwareToggle('${ch.key}',this.checked)">
      ${ch.label}
    </label>`;
  }).join('');
  return `<div class="software-smart-card" data-softkey="${item.key}">
    <label class="software-main-toggle">
      <input type="checkbox" ${checked} onchange="smartSoftwareToggle('${item.key}',this.checked)">
      <span>${item.label}</span>
    </label>
    <div class="software-meta">${item.vendor} · ${item.software}</div>
    ${childHtml ? `<div class="software-children">${childHtml}</div>` : ''}
    ${item.knowledgeTitle ? renderKnowledgeAction(item) : ''}
  </div>`;
}
function renderKnowledgeAction(item){
  const state = wizard.data.smartSoftware || {};
  if(item.key === 'adobe' && state.adobe && state.adobeCertRequired && !state.adobeCertInstalled){
    const kb = findKnowledgeByTitle(item.knowledgeTitle);
    if(kb){
      return `<div class="software-warning">⚠ Zertifikat fehlt · Knowledge vorhanden: <b>${kb['Knowledge-ID']}</b></div>`;
    }
    return `<div class="software-warning">⚠ Zertifikat fehlt · <button type="button" class="btn btn-sm btn-outline-warning" onclick="createKnowledgeForSoftware('${item.knowledgeTitle}')">Knowledge erstellen</button></div>`;
  }
  return '';
}
function renderSmartSoftwareWarnings(){
  const state = wizard.data.smartSoftware || {};
  const warnings = [];
  if(state.adobe && state.adobeCertRequired && !state.adobeCertInstalled) warnings.push('Adobe Signatur-Zertifikat wird benötigt, ist aber noch nicht installiert.');
  if(state.office && !state.officeActivated) warnings.push('Office installiert, Aktivierung/Lizenzstatus noch offen.');
  if(!state.vcRuntime && getOsProfileName()==='windows') warnings.push('Visual C++ Runtime fehlt möglicherweise – häufige Ursache für Programmstartfehler.');
  return warnings.length ? `<div class="mt-3">${warnings.map(w=>`<div class="alert alert-warning py-2 software-alert">${w}</div>`).join('')}</div>` : '';
}
function softwareGroupIcon(group){
  const g = group.toLowerCase();
  if(g.includes('browser')) return '🌐';
  if(g.includes('pdf')) return '📄';
  if(g.includes('office')) return '📦';
  if(g.includes('runtime')) return '🧩';
  if(g.includes('system')) return '🛠️';
  if(g.includes('netzwerk')) return '🔐';
  if(g.includes('drucker')) return '🖨️';
  if(g.includes('security')) return '🛡️';
  return '✅';
}
function findKnowledgeByTitle(title){
  const needle = String(title || '').replace(/^AS-\d+\s*-\s*/i, '').trim().toLowerCase();
  return (DB.knowledge || []).find(k => String(k.Titel || '').replace(/^AS-\d+\s*-\s*/i, '').trim().toLowerCase() === needle);
}
function createKnowledgeForSoftware(title){
  if(!requireWriteAccess('Knowledge erstellen')) return;
  if(!DB.knowledge) DB.knowledge = [];
  const existing = findKnowledgeByTitle(title);
  if(existing){ toast('Knowledge existiert bereits.'); renderWizard(); return; }
  const id = nextId('knowledge','Knowledge-ID',ID_PREFIXES.knowledge);
  DB.knowledge.push({
    'Knowledge-ID': id, 'Titel': title, 'Kategorie': 'Software',
    'Tags': 'adobe;zertifikat;signatur;software',
    'Lösung': 'Zertifikat bereitstellen, in Adobe/Windows-Zertifikatsspeicher importieren, Signaturfunktion testen und Benutzer kurz einweisen.'
  });
  persist();
  if(typeof maybeSaveDbToServer === 'function') maybeSaveDbToServer(); else if(typeof saveDbToServer === 'function') saveDbToServer();
  toast('Knowledge-Eintrag erstellt.');
  renderWizard();
}
function smartSoftwareRowsForAsset(assetId, deviceName){
  ensureSmartSoftwareState();
  const state = wizard.data.smartSoftware || {};
  const profile = SMART_SOFTWARE_PROFILES[getOsProfileName()] || SMART_SOFTWARE_PROFILES.generic;
  const rows = [];
  profile.forEach(item=>{
    if(state[item.key]){
      rows.push({
        'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
        'Asset-ID': assetId, 'Gerätename': deviceName,
        'Softwarename': item.software, 'Version': '', 'Hersteller': item.vendor,
        'Lizenzstatus': item.key === 'office' ? (state.officeActivated ? 'Aktiv' : 'Prüfen') : 'Aktiv',
        'Update-Status': item.key === 'windowsUpdates' || item.key === 'updates' ? 'Aktuell' : 'Prüfen',
        'Kritikalität': ['vcRuntime','dotnetRuntime','vpnClient','bitlocker'].includes(item.key) ? 'Hoch' : 'Normal',
        'Bemerkung': smartSoftwareRemark(item.key, state) + (item.packageId ? ' Paket-ID: ' + item.packageId : '')
      });
    }
  });
  return rows;
}
function smartSoftwareRemark(key, state){
  if(key === 'adobe'){
    if(state.adobeCertRequired && state.adobeCertInstalled) return 'Adobe Signatur-Zertifikat installiert.';
    if(state.adobeCertRequired && !state.adobeCertInstalled) return 'Adobe Signatur-Zertifikat fehlt / Knowledge prüfen.';
  }
  if(key === 'office') return state.officeActivated ? 'Office aktiviert.' : 'Office installiert, Aktivierung prüfen.';
  return 'Aus Smart-Software-Checkliste erstellt.';
}

function openDeviceWizard(){if(!requireWriteAccess('Neues Gerät erfassen')) return;wizard={step:0,data:{type:'PC',grund:{Standort:STAMM.standorte?.[0]||'Bibliothek',Raum:STAMM.raeume?.[0]||'',Status:STAMM.status?.[0]||'Aktiv',Hauptnutzer:'',Hersteller:STAMM.hersteller?.[0]||'',Modellserie:'',Modell:'',Seriennummer:'',Inventarnummer:'',Betriebssystem:STAMM.betriebssysteme?.[0]||'Windows 11',Domäne:STAMM.domaenen?.[0]||'EAH',Ausmusterungsdatum:'',Defektbeschreibung:'',Notizen:''},hardware:{CPU:'',RAM:'',Speicher:'',Monitor:'',Dockingstation:'',Druckertyp:'',Toner:'',Zählerstand:'',PoE:'',Controller:'',GarantieBis:'',Bemerkung:''},netzwerk:{Netzwerktyp:STAMM.netzwerktypen?.[0]||'LAN',Adressart:'DHCP',Verbindungstyp:STAMM.verbindungstypen?.[0]||'LAN direkt Wanddose','IP-Adresse':'',DNS:'','MAC-Adresse':'',VLAN:STAMM.vlans?.[0]||'',SwitchPort:STAMM.switches?.[0]||'',Wanddose:'',AccessPoint:STAMM.accesspoints?.[0]||'',SSID:STAMM.ssids?.[0]||'',Bemerkung:''},software:[],smartSoftware:{},notiz:''}};renderWizard();new bootstrap.Modal(document.getElementById('deviceWizardModal')).show();}
function wizardSteps(){return ['Gerätetyp','Grunddaten','Hardware','Netzwerk','Software','Vorschau'];}
