// Standard software profile dialogs and software knowledge hints.

function addSoftwareProfileItemToAsset(itemKey, assetId){
  if(!requireWriteAccess('Standardsoftware hinzufügen')) return;
  const item = (SMART_SOFTWARE_PROFILES.windows || []).find(x => x.key === itemKey);
  const asset = CORE.findAsset(assetId);
  if(!item || !asset){
    notify('Profilpaket oder Asset nicht gefunden.', 'warning');
    return;
  }
  if(!DB.software) DB.software = [];
  const exists = DB.software.some(row => String(row['Asset-ID'] || '') === String(assetId) && softwareProfileMatchKey(row) === softwareProfileItemMatchKey(item));
  if(exists){
    notify('Dieses Paket ist für das Asset bereits zugeordnet.', 'info');
    return;
  }
  DB.software.push({
    'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
    'Asset-ID': assetId,
    'Gerätename': asset['Gerätename'] || '',
    'Softwarename': item.software,
    'Version': '',
    'Hersteller': item.vendor,
    'Lizenzstatus': 'Prüfen',
    'Update-Status': 'Prüfen',
    'Kritikalität': ['vcRuntime','dotnetRuntime','dotnetSdk10','directx','bitlocker','windowsUpdates'].includes(item.key) ? 'Hoch' : 'Normal',
    'Bemerkung': 'Aus Standardsoftware-Profil erstellt.' + (item.packageId ? ' Paket-ID: ' + item.packageId : '')
  });
  persist();
  maybeSaveDbToServer();
  selectedIndex.software = DB.software.length - 1;
  render();
  toast('Standardsoftware zugeordnet.');
}

function softwareKnowledgeHint(row){
  const text = String((row['Softwarename']||'') + ' ' + (row['Bemerkung']||'')).toLowerCase();
  if(text.includes('adobe') && (text.includes('zertifikat') || text.includes('signatur') || text.includes('fehlt'))){
    const kb = findKnowledgeByTitle('Adobe Signatur-Zertifikat installieren');
    if(kb){
      return `<div class="alert alert-warning mt-3">⚠ Signatur/Zertifikat relevant · Knowledge vorhanden: <b>${kb['Knowledge-ID']}</b> – ${safeEscape(kb.Titel)}</div>`;
    }
    return `<div class="alert alert-warning mt-3">⚠ Signatur/Zertifikat relevant · <button class="btn btn-sm btn-outline-warning" onclick="createKnowledgeForSoftware('Adobe Signatur-Zertifikat installieren')">Knowledge erstellen</button></div>`;
  }
  return '';
}

function openSoftwareProfileCreate(){
  if(!requireWriteAccess('Standardsoftware hinzufügen')) return;
  const assets = DB.assets || [];
  const html = `<div class="modal fade" id="softwareProfileModal" tabindex="-1"><div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Standardsoftware hinzufügen</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <label class="form-label">Asset</label>
      <select id="profileAsset" class="form-select mb-3">
        ${assets.map(a=>`<option value="${safeEscape(a['Asset-ID'])}">${safeEscape(a['Asset-ID'])} – ${safeEscape(a['Gerätename'])}</option>`).join('')}
      </select>
      <div class="alert alert-info">Wähle typische Software aus. Beim Speichern werden einzelne Software-Einträge erzeugt.</div>
      <div class="software-smart-grid">
        ${SMART_SOFTWARE_PROFILES.windows.map(item=>`<label class="software-smart-card">
          <input type="checkbox" class="profileSoft" value="${safeEscape(item.key)}" data-name="${safeEscape(item.software)}" data-vendor="${safeEscape(item.vendor)}" data-package-id="${safeEscape(item.packageId || '')}">
          <b>${softwareGroupIcon(item.group)} ${safeEscape(item.label)}</b><br>
          <span class="software-meta">${safeEscape(item.vendor)} · ${safeEscape(item.software)}</span>
        </label>`).join('')}
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button><button class="btn btn-primary" onclick="saveSoftwareProfile()">Speichern</button></div>
  </div></div></div>`;
  document.getElementById('dynamicModalHost')?.remove();
  const host=document.createElement('div');host.id='dynamicModalHost';host.innerHTML=html;document.body.appendChild(host);
  new bootstrap.Modal(document.getElementById('softwareProfileModal')).show();
}

function saveSoftwareProfile(){
  if(!requireWriteAccess('Standardsoftware speichern')) return;
  const assetId = document.getElementById('profileAsset').value;
  const asset = CORE.findAsset(assetId);
  document.querySelectorAll('.profileSoft:checked').forEach(el=>{
    DB.software.push({
      'Software-ID': nextId('software','Software-ID',ID_PREFIXES.software),
      'Asset-ID': assetId,
      'Gerätename': asset?.['Gerätename'] || '',
      'Softwarename': el.dataset.name || el.value,
      'Version': '',
      'Hersteller': el.dataset.vendor || '',
      'Lizenzstatus': 'Aktiv',
      'Update-Status': 'Prüfen',
      'Kritikalität': ['vcRuntime','dotnetRuntime','vpnClient','bitlocker'].includes(el.value) ? 'Hoch' : 'Normal',
       'Bemerkung': 'Aus Standardsoftware-Profil erstellt.' + (el.dataset.packageId ? ' Paket-ID: ' + el.dataset.packageId : '')
    });
  });
  persist();
  if(typeof maybeSaveDbToServer === 'function') maybeSaveDbToServer(); else saveDbToServer();
  bootstrap.Modal.getInstance(document.getElementById('softwareProfileModal')).hide();
  activeKey='software';
  renderAll();
  toast('Standardsoftware hinzugefügt.');
}
