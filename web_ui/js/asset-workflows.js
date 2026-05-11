// Asset-linked creation and workflow note actions.

// Referenzierte Erstellung: Hardware/Netzwerk/Software/Notizen werden gegen ein bestehendes Asset referenziert.
// Dadurch entstehen keine losen Hardware-Einträge ohne Asset-Bezug.
function isAssetLinkedModule(key){
  return ['netzwerk','software','notizen','tickets'].includes(key);
}
function getModuleLabel(key){
  return ({hardware:'Hardware',netzwerk:'Netzwerk',software:'Software',notizen:'Notiz',tickets:'Ticket'}[key] || key);
}
function hasExistingAssetLink(key, assetId){
  return (DB[key]||[]).some(x => x['Asset-ID'] === assetId);
}
function openReferenceCreate(key){
  if(!requireWriteAccess('Eintrag anlegen')) return;
  const mod = modules.find(m => m.key === key);
  if(!mod) return;
  const assets = DB.assets || [];
  if(assets.length === 0){
    alert('Es existiert noch kein Asset. Bitte zuerst über „+ Neues Gerät erfassen“ ein Asset erstellen.');
    return;
  }
  modalState = {key, index:null, mode:'create'};
  const template = (DB[key] && DB[key][0]) ? Object.fromEntries(Object.keys(DB[key][0]).map(k => [k,''])) : {};
  template[mod.id] = nextId(key, mod.id, mod.prefix);
  template['Asset-ID'] = assets[0]['Asset-ID'];
  template['Gerätename'] = assets[0]['Gerätename'];

  if(key === 'hardware' && hasExistingAssetLink('hardware', template['Asset-ID'])){
    template['Bemerkung'] = 'Zusätzliche Hardware / Austausch / Ergänzung';
  }
  buildForm(mod, template, 'Neu anlegen – Asset referenzieren');
}

function openTicketFromAsset(assetId){
  if(!requireWriteAccess('Ticket aus Asset erstellen')) return;
  const asset = CORE.findAsset(assetId);
  if(!asset){
    notify('Asset nicht gefunden.', 'error');
    return;
  }
  const mod = modules.find(m => m.key === 'tickets');
  modalState = {key:'tickets', index:null, mode:'create'};
  const template = {
    'Ticket-ID': nextId('tickets','Ticket-ID',ID_PREFIXES.tickets),
    'Asset-ID': asset['Asset-ID'],
    'Gerätename': asset['Gerätename'],
    'Titel': '',
    'Kategorie': (STAMM.ticketKategorien || ['Allgemein'])[0] || 'Allgemein',
    'Priorität': (STAMM.prioritaeten || ['Normal']).includes('Normal') ? 'Normal' : ((STAMM.prioritaeten || ['Normal'])[0] || 'Normal'),
    'Status': 'Offen',
    'Tags': 'asset;nacharbeit',
    'Ursache': '',
    'Lösung': '',
    'Knowledge-ID': ''
  };
  buildForm(mod, template, 'Ticket aus Asset erstellen');
}

function createAssetNote(asset, title, content){
  if(!asset) return false;
  if(!safetyConfirm(title + '?', asset['Gerätename'] || asset['Asset-ID'])) return false;
  if(!Array.isArray(DB.notizen)) DB.notizen = [];
  DB.notizen.push({
    'Notiz-ID': nextId('notizen','Notiz-ID',ID_PREFIXES.notizen),
    'Asset-ID': asset['Asset-ID'],
    'Gerätename': asset['Gerätename'],
    'Titel': title,
    'Kategorie': 'Workflow',
    'Status': 'Aktiv',
    'Inhalt': content
  });
  persist();
  maybeSaveDbToServer();
  ASSET_DETAIL_TAB = 'notes';
  renderAll();
  toast('Workflow-Notiz erstellt.');
  return true;
}

function createAssetWorkflowNote(assetId, type){
  if(!requireWriteAccess('Workflow-Notiz erstellen')) return;
  const asset = CORE.findAsset(assetId);
  if(!asset){
    notify('Asset nicht gefunden.', 'error');
    return;
  }
  const today = new Date().toISOString().slice(0,10);
  const workflows = {
    move: {
      title: 'Workflow: Asset umziehen',
      content: `Umzug vorbereiten (${today})\n\nNeuer Standort/Raum:\nNetzwerkbezug prüfen: VLAN, Switch-Port, Wanddose, Access Point, SSID\nBetroffene Tickets/Notizen prüfen:\nAbschlussnotiz ergänzen:`
    },
    retire: {
      title: 'Workflow: Asset ausmustern',
      content: `Ausmusterung vorbereiten (${today})\n\nStatus auf Ausgemustert setzen\nOffene Tickets prüfen\nSoftware-/Lizenzhinweise prüfen\nDatenträger-/Datenschutzschritt dokumentieren\nRückgabe, Lager oder Entsorgung festlegen:`
    },
    inventory: {
      title: 'Inventur bestätigt',
      content: `Inventur bestätigt am ${today}\n\nStandort/Raum geprüft:\nSeriennummer/Inventarnummer geprüft:\nAbweichungen:\nGesehen von:`
    },
    loan: {
      title: 'Workflow: Ausgabe/Rückgabe',
      content: `Ausgabe/Rückgabe vorbereiten (${today})\n\nPerson/Team:\nZubehör:\nZustand bei Ausgabe/Rückgabe:\nFrist/Rückgabedatum:\nUnterschrift/Bestätigung:`
    }
  };
  const workflow = workflows[type] || workflows.inventory;
  createAssetNote(asset, workflow.title, workflow.content);
}

function createScannerReviewNote(idx){
  if(!requireWriteAccess('Scannerbefund notieren')) return;
  const row = softwareFullRows()[idx] || softwareFullRows()[SOFTWARE_FULL_SELECTED];
  if(!row){
    notify('Kein Scannerbefund ausgewählt.', 'warning');
    return;
  }
  const asset = softwareFullAsset(row);
  if(!asset){
    notify('Der Scannerbefund ist keinem Asset zugeordnet. Bitte zuerst Asset-Kontext prüfen.', 'warning');
    return;
  }
  const name = row.DisplayName || softwareFullDisplayName(row);
  const content = [
    'Scannerbefund prüfen',
    '',
    `Software: ${name || '-'}`,
    `Version: ${softwareFullVersion(row) || '-'}`,
    `Hersteller: ${row.Publisher || row.Hersteller || '-'}`,
    `Quelle: ${row.Sources || row.Source || row.Quelle || '-'}`,
    `Confidence: ${row.DetectionConfidence || '-'}`,
    `Update-Auswertung: ${softwareFullUpdateAssessment(row)}`,
    '',
    'Nacharbeit:',
    '- Anwendung fachlich einordnen',
    '- Update-/Lizenzstatus prüfen',
    '- Standardsoftware oder Ausnahme dokumentieren'
  ].join('\n');
  createAssetNote(asset, 'Scannerbefund prüfen: ' + (name || 'Software'), content);
}
