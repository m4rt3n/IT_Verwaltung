// Workflow bar, list controls and generic module list rendering.

let DASHBOARD_VIEW = localStorage.getItem('dashboardView') || APP_SETTINGS.startView || 'topology';

function renderWorkflowBar(mod){
  if(!mod || mod.mode === 'help') return '';
  const steps = workflowStepsFor(mod);
  const active = workflowActiveStep(mod);
  const help = contextHelpButton(mod.key);
  return `<div class="workflow-bar mb-3">
    <div class="workflow-steps" aria-label="Workflow">
      ${steps.map((step,index)=>`<span class="workflow-step ${index<=active?'active':''}">${index+1}. ${safeEscape(step)}</span>`).join('')}
    </div>
    <div class="workflow-actions">
      ${workflowPrimaryAction(mod)}
      ${help}
    </div>
  </div>`;
}

function workflowStepsFor(mod){
  if(mod.key === 'software') return ['Scan laden','Asset prüfen','Standard abgleichen','Full-Scan nacharbeiten'];
  if(mod.key === 'assets') return ['Asset wählen','Details prüfen','Nacharbeit starten','Dokumentieren'];
  if(mod.key === 'tickets') return ['Ticket wählen','Ursache klären','Lösung dokumentieren','Knowledge erstellen'];
  if(mod.key === 'knowledge') return ['Thema wählen','Lösung lesen','Befehl prüfen','Anwenden'];
  if(mod.key === 'adminpanel') return ['Backup prüfen','Scanner wählen','Aktion bestätigen','Ergebnis prüfen'];
  if(mod.key === 'stammdaten') return ['Liste wählen','Verwendung prüfen','Ändern','Reload'];
  if(mod.key === 'dashboard') return ['Überblick','Hinweis öffnen','Nacharbeit','Bericht'];
  return ['Eintrag wählen','Kontext prüfen','Bearbeiten','Speichern'];
}

function workflowActiveStep(mod){
  if(mod.key === 'software'){
    if(SOFTWARE_VIEW === 'full') return 3;
    if(DB.softwareFull?.available && softwareExactScanAsset()) return 2;
    if(DB.softwareFull?.available) return 1;
    return 0;
  }
  if(String(searchText || '').trim()) return 1;
  return 0;
}

function workflowPrimaryAction(mod){
  if(mod.key === 'software'){
    if(!DB.softwareFull?.available) return '<button class="btn btn-sm btn-outline-primary" onclick="activeKey=\'adminpanel\';renderAll()">Scanner öffnen</button>';
    if(SOFTWARE_VIEW !== 'full') return '<button class="btn btn-sm btn-outline-primary" onclick="setSoftwareView(\'full\')">Full-Scan</button>';
  }
  if(mod.key === 'dashboard') return '<button class="btn btn-sm btn-outline-secondary" onclick="exportDashboardReport()">Prüfbericht</button>';
  if(mod.key === 'assets' && canWrite()) return '<button class="btn btn-sm btn-primary" onclick="openDeviceWizard()">Neues Gerät</button>';
  return '';
}

function contextHeader(mod){
  if(!mod.context) return '';
  const data = {
    hardware: {
      cls:'context-hardware',
      title:'Hardware-Kontext',
      text:'Hier geht es um physische Geräteinformationen: Gerätehersteller, Modellserie, Seriennummer, CPU, RAM, Speicher, Monitor, Garantie.'
    },
    software: {
      cls:'context-software',
      title:'Software-Kontext',
      text:'Hier geht es um Softwareinformationen: Softwarehersteller, Version, Lizenzstatus, Update-Status und Kritikalität. Nicht mit Gerätehersteller verwechseln.'
    },
    network: {
      cls:'context-network',
      title:'Netzwerk-Kontext',
      text:'Hier geht es um Netzwerkanbindung: LAN/WLAN, DHCP/Statisch, IP, MAC, DNS, VLAN, Switch-Port, Wanddose, Access Point und SSID.'
    }
  }[mod.context];
  return `<div class="context-banner ${data.cls}">
    <div class="context-title">${data.title}</div>
    <div>${data.text}</div>
  </div>`;
}

function toolbar(mod,row,idx){
  if(!row){
    return emptyStateFor(mod?.key || activeKey);
  }
  if(!canWrite()){
    return `<div class="alert alert-secondary py-2 mb-2">Normalmodus: Daten können angesehen, aber nicht geändert werden.</div>`;
  }

  // v14: Hardware darf nicht separat neu angelegt werden.
  // Hardware entsteht ausschließlich über den Wizard „+ Neues Gerät erfassen“.
  if(mod && mod.key === 'hardware'){
    return `
      <div class="alert alert-info py-2 mb-2">
        Hardware wird ausschließlich über <b>+ Neues Gerät erfassen</b> erstellt.
      </div>
      <div class="d-flex gap-2 mb-2">
        <button class="btn btn-outline-primary" onclick="openEdit('${mod.key}',${idx})">Bearbeiten</button>
        <button class="btn btn-outline-danger" onclick="deleteRow('${mod.key}',${idx})">Löschen</button>
      </div>
    `;
  }

  if(!mod.editable) return '';

  let extra = '';
  if(mod.key === 'tickets' && row && row.Status === 'Gelöst'){
    extra = `<button class="btn btn-success" onclick="createKnowledgeFromTicket(${idx})">Knowledge erstellen</button>`;
  }

  const createAction = isAssetLinkedModule(mod.key) ? `openReferenceCreate('${mod.key}')` : `openCreate('${mod.key}')`;
  const createLabel = isAssetLinkedModule(mod.key) ? `+ ${getModuleLabel(mod.key)} zu Asset` : 'Neu anlegen';
  const hint = isAssetLinkedModule(mod.key)
    ? `<div class="alert alert-info py-2 mb-2">Neue ${getModuleLabel(mod.key)}-Einträge werden immer gegen ein bestehendes Asset referenziert.</div>`
    : '';

  return `${hint}
    <div class="d-flex gap-2 mb-2">
      <button class="btn btn-primary" onclick="${createAction}">${createLabel}</button>
      <button class="btn btn-outline-primary" onclick="openEdit('${mod.key}',${idx})">Bearbeiten</button>
      <button class="btn btn-outline-danger" onclick="deleteRow('${mod.key}',${idx})">Löschen</button>
      ${extra}
      ${contextHelpButton(mod.key)}
    </div>`;
}

function emptyStateFor(key){
  if(!CSV_BACKEND_AVAILABLE){
    return `<div class="alert alert-warning py-2 mb-2">CSV Backend nicht verbunden. Starte die App über <b>start.bat</b>, damit lokale Daten geladen und gespeichert werden können.</div>`;
  }
  if(String(searchText || '').trim()){
    return `<div class="alert alert-info py-2 mb-2">Keine Treffer für die aktuelle Suche im Tab <b>${safeEscape(key || 'Daten')}</b>. <button class="btn btn-sm btn-outline-primary ms-2" onclick="clearSearch()">Suche löschen</button></div>`;
  }
  const actions = {
    software:'<button class="btn btn-sm btn-outline-primary" onclick="setSoftwareView(\'full\')">Full-Scan prüfen</button> <button class="btn btn-sm btn-primary" onclick="openSoftwareProfileCreate()">Standardsoftware hinzufügen</button>',
    assets:'<button class="btn btn-sm btn-primary" onclick="openDeviceWizard()">Neues Gerät erfassen</button>',
    tickets:'<button class="btn btn-sm btn-primary" onclick="openReferenceCreate(\'tickets\')">Ticket zu Asset</button>',
    knowledge:'<button class="btn btn-sm btn-outline-primary" onclick="openContextHelp(\'faq\')">Hilfe öffnen</button>'
  }[key] || '';
  return `<div class="alert alert-secondary py-2 mb-2">Noch keine Daten im Tab <b>${safeEscape(key || 'Daten')}</b> vorhanden. ${actions}</div>`;
}

function contextHelpButton(key){
  const slug = {
    assets:'schnellstart',
    hardware:'checklisten',
    software:'checklisten',
    netzwerk:'checklisten',
    tickets:'faq',
    notizen:'schnellstart',
    knowledge:'faq'
  }[key] || 'schnellstart';
  return `<button class="btn btn-outline-secondary" onclick="openContextHelp('${slug}')">Hilfe</button>`;
}
