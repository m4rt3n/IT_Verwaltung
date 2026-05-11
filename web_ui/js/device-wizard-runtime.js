// Device wizard rendering, navigation and save flow.

function renderWizard(){
  document.getElementById('wizardSteps').innerHTML=wizardSteps().map((s,i)=>`<div class="wizard-step ${i===wizard.step?'active':i<wizard.step?'done':''}">${i+1}. ${s}</div>`).join('');
  const body = document.getElementById('wizardBody');
  if(typeof wizardStepHtml !== 'function'){
    body.innerHTML = '<div class="alert alert-danger">Wizard-Renderer fehlt. Bitte Version prüfen.</div>';
    return;
  }
  body.innerHTML=wizardStepHtml();
  document.getElementById('wizardNextBtn').classList.toggle('d-none',wizard.step===5);
  document.getElementById('wizardSaveBtn').classList.toggle('d-none',wizard.step!==5);
  applyWizardLogic();
}

function wizardBack(){
  saveWizardFields();
  if(wizard.step > 0){
    wizard.step--;
    renderWizard();
  }
}
 function wizardNext(){
  if(!validateWizardStep()) return;
  if(wizard.step < 5){
    wizard.step++;
    renderWizard();
  }
}

function saveWizardFields(){
  if(!wizard || !wizard.data) return;
  document.querySelectorAll('.wiz').forEach(el=>{
    const path = el.dataset ? el.dataset.path : null;
    if(!path) return;
    setPath(wizard.data, path, el.value);
  });

  const sw = document.getElementById('wizSoftware');
  if(sw){
    wizard.data.software = sw.value
      .split('\n')
      .map(x=>x.trim())
      .filter(Boolean);
    if(typeof ensureSmartSoftwareState === 'function') ensureSmartSoftwareState();
  }
}


function setWrap(selector, visible, disabled=false){document.querySelectorAll(selector).forEach(el=>{el.classList.toggle('d-none-logic',!visible);el.classList.toggle('disabled-field',disabled);el.querySelectorAll('input,select,textarea').forEach(i=>i.disabled=disabled);});}
function applyWizardLogic(){if(!wizard || !wizard.data) return;const t=wizard.data.type, status=wizard.data.grund?.Status, addr=wizard.data.netzwerk?.Adressart, conn=wizard.data.netzwerk?.Verbindungstyp||'';if(wizard.step===0){const typeHint=document.getElementById('typeHint');if(typeHint){typeHint.innerHTML=isComputeType(t)?'PC/Notebook/Thin Client: Hardware, Netzwerk und Software werden erfasst.':isPrinterType(t)?'Drucker: Druckerfelder werden aktiv, Software ist optional.':isInfraType(t)?'Infrastrukturgerät: PoE/Controller und Management-Netzwerk sind relevant.':'Monitor: keine Netzwerk- oder Softwarepflicht.';}}if(wizard.step===1){setWrap('.logic-compute',isComputeType(t),!isComputeType(t));setWrap('.logic-retired',status==='Ausgemustert');setWrap('.logic-defect',status==='Defekt');const h=document.getElementById('grundHint');if(h){if(status==='Defekt'){h.classList.remove('d-none');h.textContent='Status Defekt: Defektbeschreibung ausfüllen und anschließend Ticket anlegen.';}else if(status==='Ausgemustert'){h.classList.remove('d-none');h.textContent='Status Ausgemustert: Netzwerk/Software können später entfernt oder archiviert werden.';}else h.classList.add('d-none');}}if(wizard.step===2){setWrap('.logic-compute',isComputeType(t),!isComputeType(t));setWrap('.logic-printer',isPrinterType(t));setWrap('.logic-infra',isInfraType(t));setWrap('.logic-dock',t==='Notebook');setWrap('.logic-monitor-ref',isComputeType(t));const hardwareHint=document.getElementById('hardwareHint');if(hardwareHint){hardwareHint.textContent=isPrinterType(t)?'Drucker: CPU/RAM sind ausgeblendet, Druckertyp/Toner/Zählerstand sind aktiv.':isInfraType(t)?'Access Point/Switch: PoE und Controller sind relevant.':isMonitorType(t)?'Monitor: Hardwaredetails stark reduziert.':'Computergerät: CPU, RAM, Speicher, Monitor und ggf. Dockingstation erfassen.';}}if(wizard.step===3){
  const isStatic=addr==='Statisch';
  const profile=getConnectionProfile(conn);
  const isWlan=profile==='wlan';
  const isLan=profile==='lan';
  const isVpn=profile==='vpn';
  const isOffline=profile==='offline';
  setWrap('.logic-static',true,!isStatic||isOffline,isStatic&&!isOffline);
  setWrap('.logic-wlan',isWlan,!isWlan);
  setWrap('.logic-lan',isLan,!isLan);
  setWrap('.logic-vlan',!isVpn&&!isOffline,isVpn||isOffline);
  const hint=document.getElementById('networkHint');
  if(hint){
    if(isLan) hint.textContent='LAN: Switch-Port ist Pflicht, Wanddose wird empfohlen. Access Point/SSID werden ausgeblendet.';
    else if(isWlan) hint.textContent='WLAN: Access Point und SSID sind Pflicht. Switch-Port/Wanddose werden ausgeblendet.';
    else if(isVpn) hint.textContent='VPN: virtuelle Verbindung ohne Switch-Port, Wanddose, AP oder SSID.';
    else if(isOffline) hint.textContent='Offline: Netzwerkdaten werden nicht gepflegt.';
    else hint.textContent=isStatic?'Statisch: IP-Adresse und DNS sind Pflicht.':'DHCP: IP-Adresse und DNS werden nicht manuell gepflegt.';
  }
  const validation=networkValidationMessages(wizard.data);
  const box=document.getElementById('networkErrors');
  if(box) box.innerHTML=[
    ...validation.errors.map(e=>`<div class="alert alert-danger py-2 mb-2">${e}</div>`),
    ...validation.warnings.map(e=>`<div class="alert alert-warning py-2 mb-2">${e}</div>`)
  ].join('');
}}
function validateWizardStep(){
  saveWizardFields();
  if(wizard.step===3){
    const result=networkValidationMessages(wizard.data);
    if(result.errors.length){
      alert('Bitte Netzwerkangaben prüfen:\n\n' + result.errors.join('\n'));uxShake('#wizardBody .form-control,#wizardBody .form-select');
      return false;
    }
  }
  return true;
}
function wizardPreview(){
  const d = wizard.data;
  const validation = (typeof networkValidationMessages === 'function') ? networkValidationMessages(d) : {errors:[], warnings:[]};

  return `<h4>Vorschau</h4>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><b>Asset</b></div>
          <div class="card-body kv">
            ${kv('Typ',d.type)}
            ${kv('Standort',d.grund.Standort)}
            ${kv('Raum',d.grund.Raum)}
            ${kv('Status',d.grund.Status)}
            ${kv('Hauptnutzer',d.grund.Hauptnutzer)}
            ${kv('Hersteller',d.grund.Hersteller)}
            ${kv('Modellserie',d.grund.Modellserie||'-')}
            ${kv('Modell',d.grund.Modell)}
            ${kv('Betriebssystem',d.grund.Betriebssystem)}
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><b>Netzwerk / Software</b></div>
          <div class="card-body kv">
            ${kv('Netzwerktyp',d.netzwerk.Netzwerktyp)}
            ${kv('Adressart',d.netzwerk.Adressart)}
            ${kv('Verbindungstyp',d.netzwerk.Verbindungstyp)}
            ${kv('IP-Adresse',d.netzwerk['IP-Adresse']||'-')}
            ${kv('Software-Checks',Object.values(d.smartSoftware||{}).filter(Boolean).length+' aktiv')}
            ${kv('Zusatzsoftware',(d.software||[]).join(', ')||'-')}
          </div>
        </div>
      </div>
    </div>
    ${renderValidationSummary ? renderValidationSummary() : ''}
    ${validation.errors.length ? `<div class="alert alert-danger mt-3"><b>Fehler:</b><br>${validation.errors.join('<br>')}</div>` : ''}
    ${validation.warnings.length ? `<div class="alert alert-warning mt-3"><b>Hinweise:</b><br>${validation.warnings.join('<br>')}</div>` : ''}`;
}

function wizardSave(){
  try{
    if(!requireWriteAccess('Gerät erstellen')) return;
    saveWizardFields();
    const validation=networkValidationMessages(wizard.data);
    if(validation.errors.length){
      alert('Speichern nicht möglich:\n\n'+validation.errors.join('\n'));
      uxShake('#wizardBody .form-control,#wizardBody .form-select');
      return;
    }
    if(!safetyConfirm('Neues Gerät final erstellen?', 'Asset, Hardware, Netzwerk und Notiz werden angelegt.')){
      return;
    }
    const d=wizard.data, assetId=nextId('assets','Asset-ID',ID_PREFIXES.assets), hwId=nextId('hardware','Hardware-ID',ID_PREFIXES.hardware), netId=nextId('netzwerk','Netzwerk-ID',ID_PREFIXES.netzwerk), noteId=nextId('notizen','Notiz-ID',ID_PREFIXES.notizen), name=nextDeviceName(wizard.data.type);
    DB.assets.push({'Asset-ID':assetId,'Gerätename':name,'Asset-Typ':wizard.data.type,'Standort':wizard.data.grund.Standort,'Raum':wizard.data.grund.Raum,'Status':wizard.data.grund.Status,'Hauptnutzer':wizard.data.grund.Hauptnutzer,'Hersteller':wizard.data.grund.Hersteller,'Modellserie':wizard.data.grund.Modellserie,'Modell':wizard.data.grund.Modell,'Seriennummer':wizard.data.grund.Seriennummer,'Inventarnummer':wizard.data.grund.Inventarnummer,'Betriebssystem':wizard.data.grund.Betriebssystem,'Domäne':wizard.data.grund.Domäne,'Notizen':wizard.data.grund.Notizen});
    DB.hardware.push({'Hardware-ID':hwId,'Asset-ID':assetId,'Gerätename':name,'CPU':wizard.data.hardware.CPU,'RAM':wizard.data.hardware.RAM,'Speicher':wizard.data.hardware.Speicher,'Monitor':wizard.data.hardware.Monitor,'Dockingstation':wizard.data.hardware.Dockingstation,'Garantie bis':wizard.data.hardware.GarantieBis,'Bemerkung':wizard.data.hardware.Bemerkung||wizard.data.hardware.Druckertyp||wizard.data.hardware.Controller});
    DB.netzwerk.push({'Netzwerk-ID':netId,'Asset-ID':assetId,'Gerätename':name,'Netzwerktyp':wizard.data.netzwerk.Netzwerktyp,'Adressart':wizard.data.netzwerk.Adressart,'Verbindungstyp':wizard.data.netzwerk.Verbindungstyp,'IP-Adresse':wizard.data.netzwerk['IP-Adresse'],'MAC-Adresse':wizard.data.netzwerk['MAC-Adresse'],'DNS':wizard.data.netzwerk.DNS,'VLAN':wizard.data.netzwerk.VLAN,'Switch-Port':wizard.data.netzwerk.SwitchPort,'Wanddose':wizard.data.netzwerk.Wanddose,'Access Point':wizard.data.netzwerk.AccessPoint,'SSID':wizard.data.netzwerk.SSID,'Bemerkung':wizard.data.netzwerk.Bemerkung});
    if(isComputeType(wizard.data.type)){
      wizard.data.software.forEach(line=>{
        const p=line.split(';');
        DB.software.push({'Software-ID':nextId('software','Software-ID',ID_PREFIXES.software),'Asset-ID':assetId,'Gerätename':name,'Softwarename':p[0]||line,'Version':p[1]||'','Hersteller':p[2]||'','Lizenzstatus':STAMM.lizenzstatus?.[0]||'Aktiv','Update-Status':STAMM.updateStatus?.[0]||'Prüfen','Kritikalität':STAMM.kritikalitaet?.[1]||'Normal','Bemerkung':'Aus Wizard erstellt'});
      });
    }
    DB.notizen.push({'Notiz-ID':noteId,'Asset-ID':assetId,'Gerätename':name,'Titel':'Geräteanlage','Kategorie':'Erfassung','Status':'Aktiv','Inhalt':'Über Wizard erfasst. '+(wizard.data.grund.Notizen||'')});
    persist();
    maybeSaveDbToServer();
    selectedIndex.assets=DB.assets.length-1;
    activeKey='assets';
    bootstrap.Modal.getInstance(document.getElementById('deviceWizardModal')).hide();
    renderAll();
    toast('Gerät vollständig erstellt.');
  }catch(e){
    console.error(e);
    alert('Gerät konnte nicht erstellt werden:\n' + e.message);
  }
}
