// Admin CSV, Notion, Excel and archive exports.

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

function exportProfiles(){
  return [
    {
      title:'Notion Export ZIP',
      target:'Notion',
      description:'Mehrere CSV-Dateien mit README und empfohlener Importreihenfolge für Notion-Datenbanken.',
      contents:'assets, hardware, software_standard, netzwerk, tickets, notizen, knowledge',
      action:'exportNotionZip()',
      button:'Notion Export ZIP',
      variant:'primary'
    },
    {
      title:'Excel CSV ZIP',
      target:'Microsoft Excel / LibreOffice Calc',
      description:'Semikolongetrennte UTF-8-CSV-Dateien mit BOM für deutschsprachige Tabellenprogramme.',
      contents:'eine CSV je produktiver Tabelle',
      action:'exportExcelCsvZip()',
      button:'Excel CSV ZIP',
      variant:'outline-primary'
    },
    {
      title:'Archiv ZIP',
      target:'Ablage, Revision, Wiederherstellung',
      description:'Vollständiges Archiv mit JSON-Sicherung, CSV-Kopien, Build-Info, Serverstatus und Testbericht.',
      contents:'backup.json, csv/, meta/, TESTBERICHT.md, README.txt',
      action:'exportArchiveZip()',
      button:'Archiv ZIP',
      variant:'outline-secondary'
    }
  ];
}

function zipDependencyStatus(){
  const available = typeof JSZip !== 'undefined';
  return {
    available,
    source:available ? 'JSZip geladen' : 'JSZip fehlt',
    hint:available
      ? 'ZIP-Exporte sind in dieser Sitzung verfügbar.'
      : 'ZIP-Exporte benötigen JSZip. Ohne Internet/CDN oder lokale JSZip-Datei können Notion-, Excel- und Archiv-ZIP nicht erstellt werden.'
  };
}

function zipUnavailableText(label){
  return (label || 'ZIP Export') + ' nicht möglich: JSZip konnte nicht geladen werden. '
    + 'Bei Offline-Betrieb muss JSZip lokal bereitgestellt und in index.html eingebunden werden.';
}

function renderExportProfiles(){
  const zipStatus = zipDependencyStatus();
  return `<div class="export-profile-grid">
    ${exportProfiles().map(profile => `<div class="export-profile-card">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="export-profile-title">${escapeHtml(profile.title)}</div>
          <div class="export-profile-target">${escapeHtml(profile.target)}</div>
        </div>
        <span class="badge text-bg-light">Export</span>
      </div>
      <p>${escapeHtml(profile.description)}</p>
      <div class="small text-muted"><b>Inhalt:</b> ${escapeHtml(profile.contents)}</div>
      ${zipStatus.available ? '' : `<div class="export-profile-warning">${escapeHtml(zipStatus.hint)}</div>`}
      ${adminButton(profile.button, profile.variant, profile.action, profile.description)}
    </div>`).join('')}
    <div class="export-profile-status ${zipStatus.available ? 'export-profile-status-ok' : 'export-profile-status-warn'}">
      <b>${escapeHtml(zipStatus.source)}:</b> ${escapeHtml(zipStatus.hint)}
    </div>
  </div>`;
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
    if(!ensureZipAvailable('Notion Export ZIP')) return;

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
  alert(zipUnavailableText(label));
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
    if(!safetyConfirm('Archiv ZIP erstellen?', 'JSON-Sicherung, CSV-Dateien, Build-Info, Status und Testbericht werden in eine ZIP-Datei geschrieben. Die lokalen Arbeitsdaten bleiben unverändert.')){
      return;
    }
    if(!ensureZipAvailable('Archiv ZIP')) return;
    const zip = new JSZip();
    const defs = exportTableDefinitions();
    zip.file("backup.json", JSON.stringify(createExportPayload(), null, 2));
    Object.values(defs).forEach(def => {
      zip.file("csv/" + def.filename, toExcelCSV(def.rows, def.columns));
    });
    zip.file("meta/build-info.json", JSON.stringify(archiveBuildInfo(), null, 2));
    zip.file("meta/server-status.json", JSON.stringify(archiveServerStatus(), null, 2));
    zip.file("TESTBERICHT.md", archiveTestReportText());
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
- meta/build-info.json: Build- und Versionsinformationen aus der laufenden App
- meta/server-status.json: Serverstatus, Tabellenpfade und Node-Erkennung
- TESTBERICHT.md: Export-Schnappschuss der automatischen und manuellen Prüfhinweise

WICHTIG
- Für Wiederherstellung bevorzugt backup.json verwenden.
- CSV-Dateien dienen Prüfung, Archivierung und Excel-Auswertung.
- software_full.* ist ein Scannerartefakt und nicht Bestandteil dieses produktiven Archivs.
`;
}

function archiveBuildInfo(){
  return {
    exportedAt:new Date().toISOString(),
    buildInfo:BUILD_INFO || {},
    app:'IT-Verwaltung'
  };
}

function archiveServerStatus(){
  return {
    exportedAt:new Date().toISOString(),
    csvBackendAvailable:!!CSV_BACKEND_AVAILABLE,
    status:SERVER_STATUS || {}
  };
}

function archiveTestReportText(){
  const quality = (typeof dataQualityFindings === 'function') ? dataQualityFindings() : [];
  const qualityLines = quality.length
    ? quality.map(item => `- HINWEIS: ${item}`).join('\n')
    : '- OK: Keine Datenqualitäts-Hinweise aus der Browserprüfung.';
  const serverOk = SERVER_STATUS?.loaded && SERVER_STATUS?.ok;
  const node = SERVER_STATUS?.node || {};
  return `# Testbericht Archiv-Export

Erstellt: ${new Date().toLocaleString()}

## Automatischer Export-Schnappschuss

- Build: ${BUILD_INFO?.version || '-'} (${BUILD_INFO?.buildDate || '-'})
- CSV Backend: ${CSV_BACKEND_AVAILABLE ? 'aktiv' : 'nicht aktiv'}
- Serverstatus: ${serverOk ? 'OK' : 'nicht geladen / Hinweis'}
- Start-URL: ${SERVER_STATUS?.url || '-'}
- Node: ${node.available ? node.source : 'nicht gefunden'}
- Software-Tabelle: ${SERVER_STATUS?.table_files?.software || 'software_standard.csv'}

## Datenqualitätsprüfung im Browser

${qualityLines}

## Erwartete externe Checks

- scripts\\Check-WebApp-Syntax.bat
- scripts\\Smoke-Test.bat

Hinweis: Dieser Bericht dokumentiert den Stand beim Archiv-Export. Er ersetzt nicht den bewusst manuell auszuführenden Release-Check.
`;
}
