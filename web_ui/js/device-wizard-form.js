// Device wizard form field rendering.

// ===== v26.3 SAFE FORM HELPER FIX =====
function safeEscape(value){
  if(typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function sel(path,label,value,items,cls='',onchange='saveWizardFields();renderWizard();'){
  const safeItems = Array.isArray(items) ? items : [];
  return `<div class="${cls}" data-fieldwrap="${safeEscape(path)}">
    <label class="form-label">${safeEscape(label)}</label>
    <select class="form-select wiz" data-path="${safeEscape(path)}" onchange="${onchange}">
      ${safeItems.map(x=>`<option value="${safeEscape(x)}" ${x===value?'selected':''}>${safeEscape(x)}</option>`).join('')}
    </select>
  </div>`;
}

function f(path,label,value='',type='text',cls=''){
  return `<div class="${cls}" data-fieldwrap="${safeEscape(path)}">
    <label class="form-label">${safeEscape(label)}</label>
    <input type="${safeEscape(type)}" class="form-control wiz" data-path="${safeEscape(path)}" value="${safeEscape(value||'')}" oninput="applyWizardLogic()" onchange="applyWizardLogic()">
  </div>`;
}

function manufacturerSelect(type, value){
  const items = getManufacturersForType(type);
  const current = items.includes(value) ? value : (items[0] || value || '');
  if(wizard && wizard.data && wizard.data.grund && wizard.data.grund.Hersteller !== current){
    wizard.data.grund.Hersteller = current;
  }
  return `<div>
    <label class="form-label">Hersteller</label>
    <div class="input-group">
      <select class="form-select wiz" data-path="grund.Hersteller" onchange="saveWizardFields();wizard.data.grund.Modellserie='';renderWizard();">
        ${items.map(x=>`<option value="${safeEscape(x)}" ${x===current?'selected':''}>${safeEscape(x)}</option>`).join('')}
      </select>
      <button class="btn btn-outline-primary" type="button" onclick="saveWizardFields();addManufacturerForCurrentType()">+ Hersteller</button>
    </div>
    <div class="logic-hint">Gefiltert nach Gerätetyp: ${safeEscape(type)}</div>
  </div>`;
}
function modelSeriesSelect(type, manufacturer, value){
  const items = getModelSeriesFor(type, manufacturer);
  if(!items.length){
    return `<div>
      <label class="form-label">Modellserie</label>
      <div class="input-group">
        <input class="form-control wiz" data-path="grund.Modellserie" value="${safeEscape(value||'')}" placeholder="optional, z. B. Lifebook">
        <button class="btn btn-outline-primary" type="button" onclick="saveWizardFields();addModelSeriesForCurrentSelection()">+ Serie</button>
      </div>
      <div class="logic-hint">Keine Serien für diese Hersteller/Gerätetyp-Kombination hinterlegt.</div>
    </div>`;
  }
  const current = items.includes(value) ? value : '';
  return `<div>
    <label class="form-label">Modellserie</label>
    <div class="input-group">
      <select class="form-select wiz" data-path="grund.Modellserie">
        <option value="">-</option>
        ${items.map(x=>`<option value="${safeEscape(x)}" ${x===current?'selected':''}>${safeEscape(x)}</option>`).join('')}
      </select>
      <button class="btn btn-outline-primary" type="button" onclick="saveWizardFields();addModelSeriesForCurrentSelection()">+ Serie</button>
    </div>
    <div class="logic-hint">${safeEscape(manufacturer)}: Serien passend für ${safeEscape(type)}</div>
  </div>`;
}
function wizardStepHtml(){
  const d = wizard.data;

  if(wizard.step===0){
    return `<h4>Gerätetyp auswählen</h4>
      ${sel('type','Gerätetyp',d.type,STAMM.assetTypen)}
      <div class="alert alert-info mt-3" id="typeHint"></div>`;
  }

  if(wizard.step===1){
    return `<h4>Grunddaten</h4>
      <div class="form-grid">
        ${sel('grund.Standort','Standort',d.grund.Standort,STAMM.standorte)}
        ${sel('grund.Raum','Raum',d.grund.Raum,STAMM.raeume)}
        ${sel('grund.Status','Status',d.grund.Status,STAMM.status)}
        ${f('grund.Hauptnutzer','Hauptnutzer',d.grund.Hauptnutzer)}
        ${manufacturerSelect(d.type,d.grund.Hersteller)}
        ${modelSeriesSelect(d.type,d.grund.Hersteller,d.grund.Modellserie)}
        ${f('grund.Modell','Modell / genaue Bezeichnung',d.grund.Modell)}
        ${f('grund.Seriennummer','Seriennummer',d.grund.Seriennummer)}
        ${f('grund.Inventarnummer','Inventarnummer',d.grund.Inventarnummer)}
        ${sel('grund.Betriebssystem','Betriebssystem',d.grund.Betriebssystem,STAMM.betriebssysteme,'logic-compute')}
        ${sel('grund.Domäne','Domäne',d.grund.Domäne,STAMM.domaenen,'logic-compute')}
        ${f('grund.Ausmusterungsdatum','Ausmusterungsdatum',d.grund.Ausmusterungsdatum,'date','logic-retired')}
        ${f('grund.Defektbeschreibung','Defektbeschreibung',d.grund.Defektbeschreibung,'text','logic-defect')}
        <div style="grid-column:1/-1">
          <label class="form-label">Notizen</label>
          <textarea class="form-control wiz" data-path="grund.Notizen">${d.grund.Notizen}</textarea>
        </div>
      </div>
      <div id="grundHint" class="alert alert-warning mt-3 d-none"></div>`;
  }

  if(wizard.step===2){
    return `<h4>Hardware</h4>
      <div class="form-grid">
        ${f('hardware.CPU','CPU',d.hardware.CPU,'text','logic-compute')}
        ${f('hardware.RAM','RAM',d.hardware.RAM,'text','logic-compute')}
        ${f('hardware.Speicher','Speicher',d.hardware.Speicher,'text','logic-compute')}
        ${f('hardware.Monitor','Monitor',d.hardware.Monitor,'text','logic-compute logic-monitor-ref')}
        ${f('hardware.Dockingstation','Dockingstation',d.hardware.Dockingstation,'text','logic-dock')}
        ${f('hardware.Druckertyp','Druckertyp',d.hardware.Druckertyp,'text','logic-printer')}
        ${f('hardware.Toner','Toner',d.hardware.Toner,'text','logic-printer')}
        ${f('hardware.Zählerstand','Zählerstand',d.hardware.Zählerstand,'text','logic-printer')}
        ${f('hardware.PoE','PoE',d.hardware.PoE,'text','logic-infra')}
        ${f('hardware.Controller','Controller',d.hardware.Controller,'text','logic-infra')}
        ${f('hardware.GarantieBis','Garantie bis',d.hardware.GarantieBis,'date')}
        <div style="grid-column:1/-1">
          <label class="form-label">Bemerkung</label>
          <textarea class="form-control wiz" data-path="hardware.Bemerkung">${d.hardware.Bemerkung}</textarea>
        </div>
      </div>
      <div id="hardwareHint" class="alert alert-info mt-3"></div>`;
  }

  if(wizard.step===3){
    const connItems = filterConnectionTypes(d.netzwerk.Netzwerktyp);
    if(connItems.length && !connItems.includes(d.netzwerk.Verbindungstyp)){
      d.netzwerk.Verbindungstyp = connItems[0];
    }
    resetNetworkFieldsForProfile();
    return `<h4>Netzwerk</h4>
      ${wizardSafeNotice()}
      <div class="form-grid">
        ${sel('netzwerk.Netzwerktyp','Netzwerktyp',d.netzwerk.Netzwerktyp,STAMM.netzwerktypen || ['LAN','WLAN','VPN','Offline'],'','onWizardNetworkTypeChanged()')}
        ${sel('netzwerk.Adressart','Adressart',d.netzwerk.Adressart,STAMM.adressarten || ['DHCP','Statisch'],'','saveWizardFields();resetNetworkFieldsForProfile();renderWizard();')}
        ${sel('netzwerk.Verbindungstyp','Verbindungstyp',d.netzwerk.Verbindungstyp,connItems,'','onWizardConnectionTypeChanged()')}
        ${f('netzwerk.IP-Adresse','IP-Adresse',d.netzwerk['IP-Adresse'],'text','logic-static')}
        ${f('netzwerk.DNS','DNS',d.netzwerk.DNS,'text','logic-static')}
        ${f('netzwerk.MAC-Adresse','MAC-Adresse',d.netzwerk['MAC-Adresse'])}
        ${sel('netzwerk.VLAN','VLAN',d.netzwerk.VLAN,STAMM.vlans || ['110','120','130'],'logic-vlan')}
        ${sel('netzwerk.SwitchPort','Switch-Port',d.netzwerk.SwitchPort,STAMM.switches || [],'logic-lan')}
        ${f('netzwerk.Wanddose','Wanddose',d.netzwerk.Wanddose,'text','logic-lan')}
        ${sel('netzwerk.AccessPoint','Access Point',d.netzwerk.AccessPoint,STAMM.accesspoints || ['-'],'logic-wlan')}
        ${sel('netzwerk.SSID','SSID',d.netzwerk.SSID,STAMM.ssids || ['EAH-Intern','eduroam','-'],'logic-wlan')}
        <div style="grid-column:1/-1">
          <label class="form-label">Bemerkung</label>
          <textarea class="form-control wiz" data-path="netzwerk.Bemerkung">${d.netzwerk.Bemerkung}</textarea>
        </div>
      </div>
      <div id="networkHint" class="alert alert-info mt-3"></div>
      <div id="networkErrors" class="mt-2"></div>`;
  }

  if(wizard.step===4){
    const disabled = !isComputeType(d.type);
    if(disabled){
      return `<h4>Software / Firmware</h4>
        <div class="alert alert-warning">
          Für diesen Gerätetyp ist klassische Software-Erfassung optional. Nutze das Feld für Firmware, Treiber oder Controller-Hinweise.
        </div>
        <textarea id="wizSoftware" class="form-control" rows="6">${(d.software||[]).join('\n')}</textarea>`;
    }
    return renderSmartSoftwareStep();
  }

  return wizardPreview();
}
