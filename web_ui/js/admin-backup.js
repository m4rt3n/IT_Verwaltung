// Admin backup and full JSON import/export.

function createExportPayload(){
  return {
    meta:{
      app:'IT-Verwaltung',
      version:(typeof BUILD_INFO !== 'undefined' && BUILD_INFO.version) ? BUILD_INFO.version : 'unknown',
      exportedAt:new Date().toISOString(),
      format:'itverwaltung-full-backup-json-v1'
    },
    data:{
      assets:DB.assets||[],
      hardware:DB.hardware||[],
      software:DB.software||[],
      netzwerk:DB.netzwerk||[],
      tickets:DB.tickets||[],
      notizen:DB.notizen||[],
      knowledge:DB.knowledge||[]
    }
  };
}

function backupImportPreviewRows(data){
  return ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'].map(key => {
    const defs = (typeof exportTableDefinitions === 'function') ? exportTableDefinitions() : {};
    const filename = defs[key]?.filename || (key + '.csv');
    return {
      action:'ersetzt nach Import',
      file:filename,
      rows:Array.isArray(data?.[key]) ? data[key].length : 0
    };
  });
}

function exportAllToOneFile(){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Backup erstellen')) return;
  if(!safetyConfirm('Backup-Datei erstellen?', 'Alle Tabellen werden als JSON-Datei exportiert.')){
    return;
  }
  const payload = createExportPayload();
  const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const filename = `IT-Verwaltung_Backup_${stamp}.json`;
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json;charset=utf-8'});
  downloadBlob(blob, filename);
  notify('Backup-Datei wurde erstellt.', 'success');
}

function importAllFromOneFile(){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Backup importieren')) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(reader.result);
        const data = parsed.data || parsed;
        const keys = ['assets','hardware','software','netzwerk','tickets','notizen','knowledge'];
        const missing = keys.filter(k=>!Array.isArray(data[k]));
        if(missing.length){
          throw new Error('Ungültige Backup-Datei. Fehlende Tabellen: ' + missing.join(', '));
        }
        const preview = backupImportPreviewRows(data);
        if(!safetyConfirm('Backup importieren?', 'Aktuelle Browserdaten werden ersetzt und anschließend in CSV geschrieben.\n\nBetroffene Tabellen:\n' + affectedTablesText(preview))){
          return;
        }
        keys.forEach(k=>DB[k] = data[k] || []);
        persist();
        if(typeof saveDbToServer === 'function') saveDbToServer();
        renderAll();
        notify('Backup wurde importiert.', 'success');
      }catch(err){
        console.error(err);
        notify('Import fehlgeschlagen: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
