// Admin panel, backup/import, scanner guidance and export helpers.
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
        if(!safetyConfirm('Backup importieren?', 'Aktuelle Browserdaten werden ersetzt und anschließend in CSV geschrieben.')){
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

async function startScanner(mode){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('Scanner starten')) return;
  const labels = {
    normal:'Hardware-Scan',
    software:'Software-Scan',
    software_full:'Full-Software-Scan',
    full:'Full-Software-Scan',
    check:'Scanner-Syntaxcheck'
  };
  const label = labels[mode] || 'Scanner';
  if(!safetyConfirm(label + ' starten?', 'Der lokale Server öffnet dafür eine separate Windows-Konsole.')){
    return;
  }
  try{
    const res = await fetch('/api/scanner/start', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({mode})
    });
    const text = await res.text();
    if(!res.ok) throw new Error(text || 'Scanner konnte nicht gestartet werden.');
    const data = JSON.parse(text);
    notify(`${data.command} wurde gestartet.`, 'success');
  }catch(e){
    console.error(e);
    notify('Scanner-Start fehlgeschlagen: ' + e.message, 'error');
  }
}

function renderScannerStartPanel(){
  return `<div class="card admin-card mb-3">
    <div class="card-header"><b>Scanner-Start</b></div>
    <div class="card-body">
      <div class="alert alert-warning py-2">
        Scanner und Syntaxcheck sind bewusst getrennt. Der Syntaxcheck führt keinen Inventarscan aus.
      </div>
      <div class="admin-risk-row mb-3">
        <span class="admin-risk admin-risk-safe">Sicher: Syntax prüfen</span>
        <span class="admin-risk admin-risk-write">Schreibt Daten: Hardware-/Software-Scan</span>
        <span class="admin-risk admin-risk-artifact">Artefakt: Full-Scan</span>
      </div>
      <div class="admin-action-grid">
        ${scannerCommandTile(
          'Hardware-Scan',
          'Erfasst lokale Asset-, Hardware- und Netzwerkdaten. Software wird in diesem Modus nicht geschrieben.',
          'scripts\\Start-HardwareScan.bat',
          'normal',
          'normal'
        )}
        ${scannerCommandTile(
          'Software-Scan',
          'Erfasst Standardsoftware separat und aktualisiert nur software_standard.csv, wenn ein passendes Asset existiert.',
          'scripts\\Start-SoftwareScan.bat',
          'full',
          'software'
        )}
        ${scannerCommandTile(
          'Full-Software-Scan',
          'Erfasst eine möglichst vollständige Softwareliste aus Registry, Appx/MSIX und Winget als lokales Artefakt software_full.csv.',
          'scripts\\Start-SoftwareScan-Full.bat',
          'full',
          'software_full'
        )}
        ${scannerCommandTile(
          'Nur Syntax prüfen',
          'Prüft ausschließlich die PowerShell-Syntax des Scanners und startet keinen Scan.',
          'scripts\\Check-HardwareScanner-Syntax.bat',
          'check',
          'check'
        )}
      </div>
    </div>
  </div>`;
}

function adminStoragePanel(){
  return `<div class="card admin-card mb-3">
    <div class="card-header"><b>Backup & Import</b></div>
    <div class="card-body">
      <div class="alert alert-info">
        Normale Sicherungen laufen über <b>eine JSON-Komplettdatei</b>. CSV-Aktionen bleiben für Wartung und direkte Arbeitsdaten reserviert.
      </div>
      <div class="admin-risk-row mb-3">
        <span class="admin-risk admin-risk-safe">Sicher: Export/Vorschau</span>
        <span class="admin-risk admin-risk-write">Schreibt Daten: Import/Speichern</span>
        <span class="admin-risk admin-risk-backup">Backup empfohlen</span>
      </div>
      <div class="admin-action-grid">
        ${adminActionTile(
          'Datensicherung',
          'Erstellt oder lädt eine vollständige Sicherung aller Tabellen als JSON-Datei.',
          adminButton('Alles als eine Datei sichern', 'success', 'exportAllToOneFile()', 'Erstellt eine vollständige JSON-Sicherungsdatei mit allen Tabellen.', '↓') +
          adminButton('Eine Backup-Datei laden', 'outline-primary', 'importAllFromOneFile()', 'Lädt eine vollständige JSON-Sicherung und schreibt sie anschließend in CSV.', '↑')
        )}
        ${adminActionTile(
          'Import-Assistent',
          'Prüft eine CSV-Datei als Vorschau, ohne produktive Daten zu überschreiben.',
          adminButton('CSV prüfen', 'outline-primary', 'openCsvImportAssistant()', 'Öffnet eine CSV-Datei, erkennt Zieltabellen und zeigt Pflichtfelder, Dubletten und Vorschau.')
        )}
        ${adminActionTile(
          'Exporte',
          'Erzeugt Dateien für externe Systeme, ohne die lokalen Arbeitsdaten zu verändern.',
          adminButton('Notion Export ZIP', 'primary', 'exportNotionZip()', 'Erstellt ein ZIP mit Notion-kompatiblen CSV-Dateien für den Import.') +
          adminButton('Excel CSV ZIP', 'outline-primary', 'exportExcelCsvZip()', 'Erstellt ein ZIP mit semikolongetrennten CSV-Dateien für Excel.') +
          adminButton('Archiv ZIP', 'outline-secondary', 'exportArchiveZip()', 'Erstellt ein Archiv-ZIP mit JSON-Sicherung, CSV-Dateien und README.')
        )}
        ${adminActionTile(
          'CSV-Wartung',
          'Speichert den aktuellen Datenbestand oder legt eine direkte Kopie des CSV-Ordners an.',
          adminButton('CSV jetzt speichern', 'outline-success', 'saveDbToServer(true)', 'Speichert alle Tabellen nach Validierung direkt in die lokalen CSV-Dateien.') +
          adminButton('CSV-Ordner-Backup', 'outline-secondary', 'backupCsvServer()', 'Erstellt eine Kopie der aktuellen CSV-Dateien im Backup-Ordner.')
        )}
      </div>
      <div class="text-muted mt-2">
        Empfehlung: Für normale Sicherungen die JSON-Datei nutzen. CSV bleibt intern als Arbeitsdatenbestand erhalten.
      </div>
    </div>
  </div>`;
}

function exportTableDefinitions(){
  return {
    assets: {
      filename: "assets.csv",
      id: "Asset-ID",
      required: ["Asset-ID","Gerätename","Asset-Typ","Status"],
      columns: ["Asset-ID","Gerätename","Asset-Typ","Standort","Raum","Status","Hauptnutzer","Hersteller","Modellserie","Modell","Seriennummer","Inventarnummer","Betriebssystem","Domäne","Notizen"],
      rows: DB.assets || []
    },
    hardware: {
      filename: "hardware.csv",
      id: "Hardware-ID",
      required: ["Hardware-ID","Asset-ID","Gerätename"],
      columns: ["Hardware-ID","Asset-ID","Gerätename","CPU","RAM","Speicher","Monitor","Dockingstation","Garantie bis","Bemerkung"],
      rows: DB.hardware || []
    },
    software: {
      filename: "software_standard.csv",
      id: "Software-ID",
      required: ["Software-ID","Asset-ID","Gerätename","Softwarename"],
      columns: ["Software-ID","Asset-ID","Gerätename","Softwarename","Version","Hersteller","Lizenzstatus","Update-Status","Kritikalität","Bemerkung"],
      rows: DB.software || []
    },
    netzwerk: {
      filename: "netzwerk.csv",
      id: "Netzwerk-ID",
      required: ["Netzwerk-ID","Asset-ID","Gerätename","Netzwerktyp","Adressart"],
      columns: ["Netzwerk-ID","Asset-ID","Gerätename","Netzwerktyp","Adressart","Verbindungstyp","IP-Adresse","MAC-Adresse","DNS","VLAN","Switch-Port","Wanddose","Access Point","SSID","Bemerkung"],
      rows: DB.netzwerk || []
    },
    tickets: {
      filename: "tickets.csv",
      id: "Ticket-ID",
      required: ["Ticket-ID","Asset-ID","Gerätename","Titel","Status"],
      columns: ["Ticket-ID","Asset-ID","Gerätename","Titel","Kategorie","Priorität","Status","Tags","Ursache","Lösung","Knowledge-ID"],
      rows: DB.tickets || []
    },
    notizen: {
      filename: "notizen.csv",
      id: "Notiz-ID",
      required: ["Notiz-ID","Asset-ID","Gerätename","Titel"],
      columns: ["Notiz-ID","Asset-ID","Gerätename","Titel","Kategorie","Status","Inhalt"],
      rows: DB.notizen || []
    },
    knowledge: {
      filename: "knowledge.csv",
      id: "Knowledge-ID",
      required: ["Knowledge-ID","Titel","Lösung"],
      columns: ["Knowledge-ID","Titel","Kategorie","Tags","Lösung"],
      rows: DB.knowledge || []
    }
  };
}

function csvEscapeValue(value){
  if(value === null || typeof value === 'undefined') return '';
  return '"' + String(value).replace(/"/g,'""').replace(/\r?\n/g,' ') + '"';
}

function toDelimitedCSV(rows, preferredColumns, delimiter){
  rows = Array.isArray(rows) ? rows : [];
  delimiter = delimiter || ',';
  let columns = [];
  (preferredColumns || []).forEach(c => { if(!columns.includes(c)) columns.push(c); });
  rows.forEach(row => {
    Object.keys(row || {}).forEach(k => { if(!columns.includes(k)) columns.push(k); });
  });
  if(!columns.length) return '';
  const lines = [];
  lines.push(columns.map(csvEscapeValue).join(delimiter));
  rows.forEach(row => {
    lines.push(columns.map(c => csvEscapeValue(row ? row[c] : '')).join(delimiter));
  });
  return lines.join('\n');
}

function toNotionCSV(rows, preferredColumns){
  return toDelimitedCSV(rows, preferredColumns, ',');
}

function toExcelCSV(rows, preferredColumns){
  return '\ufeff' + toDelimitedCSV(rows, preferredColumns, ';');
}

function notionExportTables(){
  const defs = exportTableDefinitions();
  return Object.fromEntries(Object.values(defs).map(def => [def.filename, {rows:def.rows, columns:def.columns}]));
}

function notionReadmeText(){
  return `NOTION IMPORT ANLEITUNG

Export erstellt: ${new Date().toLocaleString()}

INHALT
- assets.csv
- hardware.csv
- software_standard.csv
- netzwerk.csv
- tickets.csv
- notizen.csv
- knowledge.csv

EMPFOHLENE IMPORT-REIHENFOLGE
1. assets.csv zuerst importieren
2. hardware.csv importieren
3. software_standard.csv importieren
4. netzwerk.csv importieren
5. tickets.csv importieren
6. notizen.csv importieren
7. knowledge.csv importieren

WICHTIG
- Asset-ID ist der gemeinsame Schlüssel.
- Notion erstellt Relationen nicht automatisch aus CSV.
- Nach dem Import kannst du in Notion Relation-Felder anlegen.

EMPFOHLENE RELATIONEN
- hardware.Asset-ID -> assets.Asset-ID
- software_standard.Asset-ID -> assets.Asset-ID
- netzwerk.Asset-ID -> assets.Asset-ID
- tickets.Asset-ID -> assets.Asset-ID
- notizen.Asset-ID -> assets.Asset-ID
- tickets.Knowledge-ID -> knowledge.Knowledge-ID

HINWEIS
Diese ZIP ist ohne Notion API nutzbar.
Jede CSV wird in Notion als eigene Datenbank importiert.
`;
}

function exportNotionZip(){
  try{
    if(!safetyConfirm('Notion Export ZIP erstellen?', 'Alle Tabellen werden als Notion-kompatible CSV-Dateien in eine ZIP geschrieben.')){
      return;
    }
    if(typeof JSZip === 'undefined'){
      alert('JSZip konnte nicht geladen werden. Bitte Internetverbindung/CDN prüfen oder lokale JSZip-Datei einbinden.');
      return;
    }

    const zip = new JSZip();
    const tables = notionExportTables();
    Object.entries(tables).forEach(([filename, cfg]) => {
      zip.file(filename, toNotionCSV(cfg.rows, cfg.columns));
    });
    zip.file("README.txt", notionReadmeText());

    const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    zip.generateAsync({type:"blob"}).then(content => {
      downloadBlob(content, `notion_export_${stamp}.zip`);
      showToast('Notion Export ZIP erstellt.', 'success');
    }).catch(err => {
      console.error(err);
      alert('Notion ZIP Export fehlgeschlagen: ' + err.message);
    });
  }catch(e){
    console.error(e);
    alert('Notion Export Fehler: ' + e.message);
  }
}

function ensureZipAvailable(label){
  if(typeof JSZip !== 'undefined') return true;
  alert((label || 'ZIP Export') + ' nicht möglich: JSZip konnte nicht geladen werden. Bitte Internetverbindung/CDN prüfen oder lokale JSZip-Datei einbinden.');
  return false;
}

function exportExcelCsvZip(){
  try{
    if(!safetyConfirm('Excel CSV ZIP erstellen?', 'Alle Tabellen werden als semikolongetrennte UTF-8-CSV-Dateien exportiert. Die lokalen Arbeitsdaten bleiben unverändert.')){
      return;
    }
    if(!ensureZipAvailable('Excel CSV ZIP')) return;
    const zip = new JSZip();
    const defs = exportTableDefinitions();
    Object.values(defs).forEach(def => {
      zip.file(def.filename, toExcelCSV(def.rows, def.columns));
    });
    zip.file("README.txt", excelReadmeText());
    const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    zip.generateAsync({type:"blob"}).then(content => {
      downloadBlob(content, `excel_csv_export_${stamp}.zip`);
      showToast('Excel CSV ZIP erstellt.', 'success');
    }).catch(err => {
      console.error(err);
      alert('Excel CSV ZIP fehlgeschlagen: ' + err.message);
    });
  }catch(e){
    console.error(e);
    alert('Excel CSV Export Fehler: ' + e.message);
  }
}

function excelReadmeText(){
  return `EXCEL CSV EXPORT

Export erstellt: ${new Date().toLocaleString()}

INHALT
- Semikolongetrennte CSV-Dateien mit UTF-8-BOM
- Eine Datei je produktiver Tabelle

HINWEIS
- In Excel kann jede CSV direkt geöffnet oder über Daten > Aus Text/CSV importiert werden.
- Asset-ID ist der gemeinsame Schlüssel.
- Dieser Export verändert keine lokalen Daten.
`;
}

function exportArchiveZip(){
  try{
    if(!safetyConfirm('Archiv ZIP erstellen?', 'JSON-Sicherung, CSV-Dateien und README werden in eine ZIP-Datei geschrieben. Die lokalen Arbeitsdaten bleiben unverändert.')){
      return;
    }
    if(!ensureZipAvailable('Archiv ZIP')) return;
    const zip = new JSZip();
    const defs = exportTableDefinitions();
    zip.file("backup.json", JSON.stringify(createExportPayload(), null, 2));
    Object.values(defs).forEach(def => {
      zip.file("csv/" + def.filename, toExcelCSV(def.rows, def.columns));
    });
    zip.file("README.txt", archiveReadmeText());
    const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    zip.generateAsync({type:"blob"}).then(content => {
      downloadBlob(content, `it_verwaltung_archiv_${stamp}.zip`);
      showToast('Archiv ZIP erstellt.', 'success');
    }).catch(err => {
      console.error(err);
      alert('Archiv ZIP fehlgeschlagen: ' + err.message);
    });
  }catch(e){
    console.error(e);
    alert('Archiv Export Fehler: ' + e.message);
  }
}

function archiveReadmeText(){
  return `IT-VERWALTUNG ARCHIV

Archiv erstellt: ${new Date().toLocaleString()}

INHALT
- backup.json: vollständige JSON-Sicherung für den Re-Import
- csv/: menschenlesbare CSV-Kopien der produktiven Tabellen

WICHTIG
- Für Wiederherstellung bevorzugt backup.json verwenden.
- CSV-Dateien dienen Prüfung, Archivierung und Excel-Auswertung.
- software_full.* ist ein Scannerartefakt und nicht Bestandteil dieses produktiven Archivs.
`;
}

function openCsvImportAssistant(){
  if(typeof requireWriteAccess === 'function' && !requireWriteAccess('CSV-Import prüfen')) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.onchange = e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const result = analyzeCsvImport(String(reader.result || ''), file.name);
        showCsvImportPreview(result);
      }catch(err){
        console.error(err);
        notify('CSV-Prüfung fehlgeschlagen: ' + err.message, 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
  };
  input.click();
}

function detectDelimiter(text){
  const firstLine = String(text || '').split(/\r?\n/).find(line => line.trim()) || '';
  const semicolons = firstLine.split(';').length;
  const commas = firstLine.split(',').length;
  return semicolons >= commas ? ';' : ',';
}

function parseCsvLine(line, delimiter){
  const cells = [];
  let current = '';
  let quoted = false;
  for(let i=0;i<line.length;i++){
    const ch = line[i];
    if(ch === '"'){
      if(quoted && line[i+1] === '"'){
        current += '"';
        i++;
      }else{
        quoted = !quoted;
      }
      continue;
    }
    if(ch === delimiter && !quoted){
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function parseCsvText(text){
  const delimiter = detectDelimiter(text);
  const lines = String(text || '').replace(/^\ufeff/, '').split(/\r?\n/).filter(line => line.trim());
  if(!lines.length) throw new Error('CSV-Datei ist leer.');
  const headers = parseCsvLine(lines[0], delimiter).map(h => h.trim());
  if(!headers.length || headers.every(h => !h)) throw new Error('CSV-Datei hat keine Kopfzeile.');
  const rows = lines.slice(1).map(line => {
    const cells = parseCsvLine(line, delimiter);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = typeof cells[index] === 'undefined' ? '' : cells[index].trim();
    });
    return row;
  });
  return {delimiter, headers, rows};
}

function guessImportTarget(headers, filename){
  const defs = exportTableDefinitions();
  const lowerName = String(filename || '').toLowerCase();
  const byName = Object.entries(defs).find(([key, def]) => lowerName === def.filename.toLowerCase() || lowerName.includes(key));
  if(byName) return byName[0];
  let best = {key:'assets', score:-1};
  Object.entries(defs).forEach(([key, def]) => {
    const score = def.required.filter(col => headers.includes(col)).length + def.columns.filter(col => headers.includes(col)).length / 10;
    if(score > best.score) best = {key, score};
  });
  return best.key;
}

function analyzeCsvImport(text, filename){
  const parsed = parseCsvText(text);
  const target = guessImportTarget(parsed.headers, filename);
  const def = exportTableDefinitions()[target];
  const missingColumns = def.required.filter(col => !parsed.headers.includes(col));
  const existingIds = new Set((def.rows || []).map(row => String(row[def.id] || '').trim()).filter(Boolean));
  const seenIds = new Set();
  const rowIssues = [];
  const suggestions = {neu:0, update:0, doppelt:0, unklar:0};
  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const missingRequired = def.required.filter(col => !String(row[col] || '').trim());
    def.required.forEach(col => {
      if(!String(row[col] || '').trim()) rowIssues.push(`Zeile ${rowNumber}: Pflichtfeld ${col} fehlt`);
    });
    const id = String(row[def.id] || '').trim();
    let suggestion = missingRequired.length ? 'unklar' : 'neu';
    if(id){
      if(existingIds.has(id)){
        rowIssues.push(`Zeile ${rowNumber}: ${def.id} ${id} existiert bereits`);
        suggestion = 'update';
      }
      if(seenIds.has(id)){
        rowIssues.push(`Zeile ${rowNumber}: ${def.id} ${id} kommt mehrfach in der Importdatei vor`);
        suggestion = 'doppelt';
      }
      seenIds.add(id);
    }else{
      suggestion = 'unklar';
    }
    row.__vorschlag = suggestion;
    suggestions[suggestion] = (suggestions[suggestion] || 0) + 1;
  });
  return {
    filename,
    target,
    tableTitle: target,
    delimiter: parsed.delimiter,
    headers: parsed.headers,
    rows: parsed.rows,
    missingColumns,
    rowIssues,
    suggestions,
    previewRows: parsed.rows.slice(0, 8)
  };
}

function showCsvImportPreview(result){
  const issues = [...result.missingColumns.map(c => `Pflichtspalte fehlt: ${c}`), ...result.rowIssues];
  const columns = ['__vorschlag', ...result.headers.slice(0, 8)];
  const preview = result.previewRows.map(row => `<tr>${columns.map(col => `<td>${escapeHtml(col === '__vorschlag' ? row.__vorschlag : row[col])}</td>`).join('')}</tr>`).join('');
  const html = `<div class="modal fade" id="csvImportPreviewModal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">CSV-Import prüfen</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-info">
          Diese Vorschau schreibt keine Daten. Übernahme bleibt gesperrt, bis Spaltenmapping, Backup und Importprotokoll vollständig umgesetzt sind.
        </div>
        <div class="kv mb-3">
          ${kv('Datei', result.filename)}
          ${kv('Erkannte Tabelle', result.target)}
          ${kv('Trennzeichen', result.delimiter === ';' ? 'Semikolon' : 'Komma')}
          ${kv('Zeilen', result.rows.length)}
          ${kv('Vorschläge', `neu: ${result.suggestions.neu || 0}, update: ${result.suggestions.update || 0}, doppelt: ${result.suggestions.doppelt || 0}, unklar: ${result.suggestions.unklar || 0}`)}
        </div>
        ${issues.length ? `<div class="alert alert-warning"><b>Prüfhinweise</b><ul class="mb-0">${issues.slice(0,20).map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}</ul>${issues.length>20?'<div>Weitere Hinweise gekürzt.</div>':''}</div>` : '<div class="alert alert-success">Pflichtfelder und IDs sehen in der Vorschau plausibel aus.</div>'}
        <div class="table-responsive">
          <table class="table table-sm table-striped">
            <thead><tr>${columns.map(col => `<th>${escapeHtml(col === '__vorschlag' ? 'Vorschlag' : col)}</th>`).join('')}</tr></thead>
            <tbody>${preview || '<tr><td>Keine Datenzeilen vorhanden.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
      </div>
    </div></div>
  </div>`;
  const old = document.getElementById('csvImportPreviewModal');
  if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend', html);
  const modalEl = document.getElementById('csvImportPreviewModal');
  const modal = new bootstrap.Modal(modalEl);
  modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove(), {once:true});
  modal.show();
}

function renderServerStatusNotice(){
  if(typeof SERVER_STATUS === 'undefined' || !SERVER_STATUS.loaded) return '';
  const node = SERVER_STATUS.node || {};
  if(node.warning){
    return `<div class="alert alert-warning mb-3">${escapeHtml(node.warning)}</div>`;
  }
  return '';
}

function renderAdminPanel(){
  return `${adminStoragePanel()}${renderScannerStartPanel()}${renderBuildInfoCard()}<div class="row g-3">
    <div class="col-lg-5">
      <div class="card admin-card">
        <div class="card-header"><b>Darstellung</b></div>
        <div class="card-body">
          ${adminSwitch('darkMode','Dark Mode','Dunkle Oberfläche aktivieren')}
          ${adminSwitch('animations','Animationen','dezente jQuery Effekte aktivieren')}
          ${adminSwitch('compactMode','Kompaktmodus','weniger Abstände in Tabellen/Karten')}
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      <div class="card admin-card">
        <div class="card-header"><b>Speicherung & Sicherheit</b></div>
        <div class="card-body">
          ${adminSwitch('autosave','Auto-Save','nach Änderungen automatisch CSV speichern')}
          ${adminSwitch('confirmDelete','Löschbestätigung','vor Löschvorgängen Sicherheitsabfrage anzeigen')}
          <hr>
          ${renderStammdatenStatus()}
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-outline-primary" onclick="reloadStammdaten()" title="Lädt alle Stammdatenlisten aus den lokalen Markdown-Dateien neu." aria-label="Lädt alle Stammdatenlisten aus den lokalen Markdown-Dateien neu.">Stammdaten neu laden</button>
          </div>
          <div class="text-muted mt-2">Backup, Import, Export und manuelles CSV-Speichern sind oben fachlich getrennt in <b>Datensicherung</b>, <b>Exporte</b> und <b>CSV-Wartung</b>.</div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card admin-card">
        <div class="card-header"><b>Dashboard</b></div>
        <div class="card-body">
          <label class="form-label">Standardansicht</label>
          <select class="form-select" onchange="setSetting('startView',this.value);DASHBOARD_VIEW=this.value;localStorage.setItem('dashboardView',this.value)">
            <option value="topology" ${APP_SETTINGS.startView==='topology'?'selected':''}>Topologie</option>
            <option value="graph" ${APP_SETTINGS.startView==='graph'?'selected':''}>Graph</option>
          </select>
          <div class="text-muted mt-2">Legt fest, welche Dashboard-Visualisierung bevorzugt wird.</div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card admin-card">
        <div class="card-header"><b>System</b></div>
        <div class="card-body">
          ${renderServerStatusNotice()}
          <div class="kv">
            ${kv('Version', BUILD_INFO.version || '-')}
            ${kv('Build', BUILD_INFO.buildDate || '-')}
            ${kv('CSV Backend', CSV_BACKEND_AVAILABLE ? 'aktiv' : 'nicht verbunden')}
            ${kv('Start-URL', SERVER_STATUS?.url || '-')}
            ${kv('Node', SERVER_STATUS?.node?.available ? SERVER_STATUS.node.source : 'nicht gefunden')}
            ${kv('Software-CSV', SERVER_STATUS?.table_files?.software || 'software_standard.csv')}
            ${kv('Legacy-Software-CSV', SERVER_STATUS?.legacy_table_files?.software || 'software.csv')}
            ${kv('Assets', DB.assets.length)}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function adminSwitch(key,title,desc){
  const checked = APP_SETTINGS[key] ? 'checked' : '';
  return `<div class="form-check form-switch admin-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="set_${key}" ${checked} onchange="setSetting('${key}',this.checked)">
    <label class="form-check-label" for="set_${key}" title="${escapeHtml(desc)}"><b>${title}</b><br><span class="text-muted">${desc}</span></label>
  </div>`;
}
