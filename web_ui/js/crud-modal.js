// Generic create/edit/delete modal form rendering.

// CRUD modal

function deleteAssetWithReferences(idx){
  if(!requireWriteAccess('Asset löschen')) return;
  const rows = filterRows(DB.assets || [], 'assets');
  const asset = rows[idx];
  if(!asset) return;

  const assetId = asset['Asset-ID'];
  const name = asset['Gerätename'] || assetId;

  const refs = {
    hardware: byAsset('hardware', assetId).length,
    netzwerk: byAsset('netzwerk', assetId).length,
    software: byAsset('software', assetId).length,
    tickets: byAsset('tickets', assetId).length,
    notizen: byAsset('notizen', assetId).length
  };

  const refText = Object.entries(refs)
    .filter(([k,v])=>v>0)
    .map(([k,v])=>`${k}: ${v}`)
    .join('\n');

  const msg = refText
    ? `Asset wirklich löschen?\n\n${name}\n${assetId}\n\nVerknüpfte Einträge werden ebenfalls gelöscht:\n${refText}`
    : `Asset wirklich löschen?\n\n${name}\n${assetId}`;

  if(APP_SETTINGS.confirmDelete && !confirm(msg)) return;

  const realIdx = DB.assets.indexOf(asset);
  if(realIdx >= 0) DB.assets.splice(realIdx,1);

  ['hardware','netzwerk','software','tickets','notizen'].forEach(table=>{
    DB[table] = (DB[table] || []).filter(row => row['Asset-ID'] !== assetId);
  });

  selectedIndex.assets = 0;
  persist();
  saveDbToServer();
  render();
  toast('Asset inklusive Referenzen gelöscht.');
}

function openCreate(key){if(!requireWriteAccess('Eintrag anlegen')) return;const mod=modules.find(m=>m.key===key);modalState={key,index:null,mode:'create'};const template=(DB[key]&&DB[key][0])?Object.fromEntries(Object.keys(DB[key][0]).map(k=>[k,''])):{};template[mod.id]=nextId(key,mod.id,mod.prefix);if(template['Asset-ID']!==undefined){template['Asset-ID']=DB.assets[0]?.['Asset-ID']||'';template['Gerätename']=DB.assets[0]?.['Gerätename']||'';}buildForm(mod,template,'Neu anlegen');}
function openEdit(key,idx){if(!requireWriteAccess('Eintrag bearbeiten')) return;const rows=filterRows(DB[key]||[],key), row=rows[idx], realIdx=DB[key].indexOf(row);modalState={key,index:realIdx,mode:'edit'};buildForm(modules.find(m=>m.key===key),{...row},'Bearbeiten');}
function buildForm(mod,row,title){document.getElementById('editTitle').textContent=`${mod.title} – ${title}`;document.getElementById('editForm').innerHTML=renderModalRequiredSummary(mod.key)+Object.keys(row).map(k=>fieldHtml(k,row[k],mod)).join('');new bootstrap.Modal(document.getElementById('editModal')).show();setTimeout(applyEditLogic,50);}
function renderModalRequiredSummary(key){
  const fields = (typeof REQUIRED_FIELDS !== 'undefined' && REQUIRED_FIELDS[key]) ? REQUIRED_FIELDS[key] : [];
  if(!fields.length) return '';
  return `<div class="alert alert-light modal-required-summary"><b>Pflichtfelder:</b> ${fields.map(safeEscape).join(', ')}</div>`;
}
function fieldHtml(k,v,mod){const readonly=(k===mod.id);if(k==='Asset-ID' && modalState.key==='assets')return `<div><label class="form-label required-label">${displayFieldLabel(modalState.key,k)}</label><input class="form-control edit-field" data-key="${k}" value="${v||''}" readonly><div class="logic-hint">Asset-ID bleibt fest.</div></div>`;
if(k==='Asset-ID')return `<div><label class="form-label required-label">${displayFieldLabel(modalState.key,k)}</label><select class="form-select edit-field" data-key="${k}" onchange="syncAssetName(this.value);applyEditLogic();showReferenceWarning()">${DB.assets.map(a=>`<option value="${a['Asset-ID']}" ${a['Asset-ID']===v?'selected':''}>${a['Asset-ID']} – ${a['Gerätename']}</option>`).join('')}</select><div class="logic-hint">Pflicht: Eintrag wird mit diesem Asset verknüpft.</div></div>`;
if(modalState.key==='software' && k==='Hersteller'){
  return `<div class="context-field-software"><label class="form-label">Softwarehersteller</label>
    <select class="form-select edit-field" data-key="${k}" onchange="applySoftwareManufacturerLogic();applyEditLogic()">
      ${SOFTWARE_HERSTELLER.map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}
    </select>
    <div class="logic-hint">Softwarehersteller, nicht Gerätehersteller.</div>
  </div>`;
}
if(modalState.key==='software' && k==='Softwarename'){
  const currentHersteller = getEditVal('Hersteller') || SOFTWARE_HERSTELLER[0];
  const names = getSoftwareNamesForManufacturer(currentHersteller);
  if(names.length){
    return `<div class="context-field-software"><label class="form-label">Software / Anwendung</label>
      <select class="form-select edit-field" data-key="${k}">
        ${names.map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}
      </select>
      <div class="logic-hint">Gefiltert nach Softwarehersteller.</div>
    </div>`;
  }
}


if(modalState.key==='netzwerk' && k==='Netzwerktyp'){
  return `<div data-editwrap="${k}">
    <label class="form-label">${displayFieldLabel(modalState.key,k)}</label>
    <select class="form-select edit-field" data-key="${k}" onchange="onEditNetworkTypeChanged()">
      ${(STAMM.netzwerktypen||['LAN','WLAN','VPN','Offline']).map(s=>`<option value="${escapeHtml(s)}" ${s===v?'selected':''}>${escapeHtml(s)}</option>`).join('')}
    </select>
  </div>`;
}
if(modalState.key==='netzwerk' && k==='Verbindungstyp'){
  const rowNetType = getEditVal('Netzwerktyp') || (modalState.index!==null && DB.netzwerk[modalState.index] ? DB.netzwerk[modalState.index]['Netzwerktyp'] : 'LAN');
  const allowed = filterConnectionTypes(rowNetType || 'LAN');
  const current = allowed.includes(v) ? v : (allowed[0] || v);
  return `<div data-editwrap="${k}">
    <label class="form-label">${displayFieldLabel(modalState.key,k)}</label>
    <select class="form-select edit-field" data-key="${k}" onchange="onEditConnectionTypeChanged()">
      ${allowed.map(s=>`<option value="${escapeHtml(s)}" ${s===current?'selected':''}>${escapeHtml(s)}</option>`).join('')}
    </select>
    <div class="logic-hint">Gefiltert nach Netzwerktyp.</div>
  </div>`;
}
const stKey=fieldStamm[k];if(stKey)return `<div data-editwrap="${k}"><label class="form-label">${displayFieldLabel(modalState.key,k)}</label><select class="form-select edit-field" data-key="${k}" onchange="applyEditLogic()">${(STAMM[stKey]||[]).map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}</select></div>`;if((v||'').length>80||k==='Inhalt'||k==='Lösung'||k==='Bemerkung'||k==='Notizen'||k==='Ursache')return `<div style="grid-column:1/-1" data-editwrap="${k}"><label class="form-label">${displayFieldLabel(modalState.key,k)}</label><textarea class="form-control edit-field" rows="3" data-key="${k}" ${readonly?'readonly':''} oninput="applyEditLogic()">${v||''}</textarea></div>`;return `<div data-editwrap="${k}"><label class="form-label">${displayFieldLabel(modalState.key,k)}</label><input class="form-control edit-field" data-key="${k}" value="${v||''}" ${readonly?'readonly':''} oninput="applyEditLogic()"></div>`;}
function getEditVal(k){const el=document.querySelector(`.edit-field[data-key="${k}"]`);return el?el.value:'';}
function setEditWrap(k,visible,disabled=false,required=false){document.querySelectorAll(`[data-editwrap="${k}"]`).forEach(w=>{w.classList.toggle('d-none-logic',!visible);w.classList.toggle('disabled-field',disabled);w.querySelectorAll('input,select,textarea').forEach(i=>{i.disabled=disabled;i.required=required;});const l=w.querySelector('label');if(l)l.classList.toggle('required-label',required);});}

function showReferenceWarning(){
  const key = modalState.key;
  const assetId = getEditVal('Asset-ID');
  const warnings = [];
  if(isAssetLinkedModule(key) && !assetId) warnings.push('Asset-ID ist Pflicht.');
  if(key === 'hardware' && assetId && hasExistingAssetLink('hardware', assetId) && modalState.mode === 'create'){
    warnings.push('Für dieses Asset existiert bereits ein Hardware-Eintrag. Dies wird als Ergänzung/Austausch dokumentiert.');
  }
  const box = document.getElementById('editWarnings');
  if(box && warnings.length) box.innerHTML = warnings.map(w=>`<div class="alert alert-info">${w}</div>`).join('');
}

function applySoftwareManufacturerLogic(){
  if(modalState.key!=='software') return;
  const manufacturer = getEditVal('Hersteller');
  const softwareField = document.querySelector('.edit-field[data-key="Softwarename"]');
  if(!softwareField) return;
  const names = getSoftwareNamesForManufacturer(manufacturer);
  if(names.length && !names.includes(softwareField.value)){
    softwareField.value = names[0];
  }
}

function onEditNetworkTypeChanged(){
  const nt = getEditVal('Netzwerktyp');
  const connEl = document.querySelector('.edit-field[data-key="Verbindungstyp"]');
  const allowed = filterConnectionTypes(nt);
  if(connEl){
    connEl.innerHTML = allowed.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    connEl.value = allowed[0] || '';
  }
  onEditConnectionTypeChanged();
}
function onEditConnectionTypeChanged(){
  const conn = getEditVal('Verbindungstyp');
  const ntEl = document.querySelector('.edit-field[data-key="Netzwerktyp"]');
  if(ntEl){
    ntEl.value = getNetworkTypeFromConnection(conn);
  }
  const profile = getConnectionProfile(conn);
  if(profile === 'lan'){
    setEditValue('Access Point','-'); setEditValue('SSID','-');
  }
  if(profile === 'wlan'){
    setEditValue('Switch-Port',''); setEditValue('Wanddose','');
  }
  if(profile === 'vpn' || profile === 'offline'){
    setEditValue('Switch-Port',''); setEditValue('Wanddose','');
    setEditValue('Access Point','-'); setEditValue('SSID','-');
  }
  if(profile === 'offline'){
    setEditValue('IP-Adresse',''); setEditValue('DNS',''); setEditValue('MAC-Adresse',''); setEditValue('VLAN','');
  }
  applyEditLogic();
}
function setEditValue(key,value){
  const el = document.querySelector(`.edit-field[data-key="${key}"]`);
  if(el) el.value = value;
}
function applyEditLogic(){const key=modalState.key;const warn=[];if(isAssetLinkedModule(key)){const assetId=getEditVal('Asset-ID');if(!assetId)warn.push('Asset-ID ist Pflicht.');if(key==='hardware'&&assetId&&hasExistingAssetLink('hardware',assetId)&&modalState.mode==='create')warn.push('Für dieses Asset existiert bereits Hardware. Der neue Eintrag wird als Ergänzung/Austausch geführt.');}if(key==='netzwerk'){
  const addr=getEditVal('Adressart'), conn=getEditVal('Verbindungstyp');
  const profile=getConnectionProfile(conn);
  const isStatic=addr==='Statisch', isWlan=profile==='wlan', isLan=profile==='lan', isVpn=profile==='vpn', isOffline=profile==='offline';
  setEditWrap('IP-Adresse',true,!isStatic||isOffline,isStatic&&!isOffline);
  setEditWrap('DNS',true,!isStatic||isOffline,isStatic&&!isOffline);
  setEditWrap('Access Point',isWlan,!isWlan);
  setEditWrap('SSID',isWlan,!isWlan);
  setEditWrap('Switch-Port',isLan,!isLan,isLan);
  setEditWrap('Wanddose',isLan,!isLan,false);
  setEditWrap('VLAN',!isVpn&&!isOffline,isVpn||isOffline,false);
  if(isLan) warn.push('LAN: Switch-Port Pflicht, Wanddose empfohlen.');
  if(isWlan) warn.push('WLAN: Access Point und SSID Pflicht.');
  if(isVpn) warn.push('VPN: keine physische Infrastruktur erforderlich.');
  if(isOffline) warn.push('Offline: Netzwerkfelder werden nicht gepflegt.');
}if(key==='tickets'){const status=getEditVal('Status');setEditWrap('Ursache',true,false,status==='Gelöst');setEditWrap('Lösung',true,false,status==='Gelöst');if(status==='Gelöst')warn.push('Gelöst: Ursache und Lösung pflegen. Knowledge-Erstellung ist sinnvoll.');else warn.push('Knowledge-Erstellung erst bei Status „Gelöst“ sinnvoll.');}if(key==='software'){
  const liz=getEditVal('Lizenzstatus');
  if(liz==='Abgelaufen')warn.push('Lizenz abgelaufen: Ticket/Aufgabe zur Lizenzprüfung anlegen.');
  warn.push('Kontext: Feld „Softwarehersteller“ beschreibt den Hersteller der Anwendung, nicht den Gerätehersteller.');
}document.getElementById('editWarnings').innerHTML=warn.map(w=>`<div class="alert alert-warning">${w}</div>`).join('');}
function syncAssetName(assetId){const a=DB.assets.find(x=>x['Asset-ID']===assetId);if(!a)return;document.querySelectorAll('.edit-field').forEach(el=>{if(el.dataset.key==='Gerätename')el.value=a['Gerätename'];});}

// ===== v9 NETWORK VALIDATION & AUTOFILL =====
function validateNetworkStrict(obj){
  const check = networkValidationMessages(obj || {});
  if(check.errors.length) return check.errors[0];
  return null;
}

function autoFillNetwork(obj){
  if(obj['Verbindungstyp']?.includes('WLAN') && !obj['VLAN']){
    obj['VLAN'] = 'WLAN';
  }
  if(obj['Adressart']==='DHCP'){
    obj['IP-Adresse'] = '';
    obj['DNS'] = '';
  }
  return obj;
}

function saveModal(){
  try{
    if(!requireWriteAccess('Speichern')) return;
    applyEditLogic();
    let obj={};
    document.querySelectorAll('.edit-field').forEach(el=>{
      obj[el.dataset.key]=el.value;
    });
    if(obj.Tags) obj.Tags = normalizeTags(obj.Tags);
    if(isAssetLinkedModule(modalState.key)&&!obj['Asset-ID']){
      alert('Bitte ein Asset auswählen.');
      return;
    }
    if(modalState.key==='netzwerk'){
      if(!networkTypeMatchesConnection(obj['Netzwerktyp'], obj['Verbindungstyp'])){
        alert('Netzwerktyp und Verbindungstyp passen nicht zusammen.');
        return;
      }
      obj = autoFillNetwork(obj);
      const check = networkValidationMessages(obj);
      if(check.errors.length){
        alert(check.errors.join('\n'));
        return;
      }
    }
    if(modalState.key==='netzwerk'&&obj.Adressart==='Statisch'&&!obj['IP-Adresse']){
      alert('Bei statischer Adressierung ist eine IP-Adresse Pflicht.');
      return;
    }
    if(modalState.key==='tickets'&&obj.Status==='Gelöst'&&(!obj.Ursache||!obj.Lösung)){
      alert('Bei gelöstem Ticket sind Ursache und Lösung Pflicht.');
      return;
    }
    const action = modalState.mode==='create' ? 'Eintrag anlegen?' : 'Änderungen speichern?';
    const detail = `${getModuleLabel(modalState.key)}: ${obj['Gerätename'] || obj.Titel || obj[modules.find(m=>m.key===modalState.key)?.id] || ''}`;
    if(!safetyConfirm(action, detail)){
      return;
    }
    if(modalState.mode==='create'){
      DB[modalState.key].push(obj);
      selectedIndex[modalState.key]=DB[modalState.key].length-1;
    }else{
      DB[modalState.key][modalState.index]=obj;
    }
    persist();
    maybeSaveDbToServer();
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    render();
    toast('Gespeichert.');
  }catch(e){
    console.error(e);
    alert('Speichern fehlgeschlagen:\n' + e.message);
  }
}
