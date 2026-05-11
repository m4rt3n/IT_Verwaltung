// Admin scanner start panel and scanner actions.

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
  const preview = affectedTablesText(scannerAffectedPreview(mode));
  if(!safetyConfirm(label + ' starten?', 'Der lokale Server öffnet dafür eine separate Windows-Konsole.\n\nBetroffene Dateien:\n' + preview)){
    return;
  }
  try{
    const res = await fetch('/api/scanner/start', {
      method:'POST',
      headers:apiPostHeaders({'Content-Type':'application/json'}),
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
          adminButton('Eine Backup-Datei laden', 'outline-primary', 'importAllFromOneFile()', 'Lädt eine vollständige JSON-Sicherung und schreibt sie anschließend in CSV.', '↑') +
          renderAffectedTablesPreview('Schreibvorschau beim Import', productiveWritePreview('ersetzt'))
        )}
        ${adminActionTile(
          'Import-Assistent',
          'Prüft eine CSV-Datei als Vorschau, ohne produktive Daten zu überschreiben.',
          adminButton('CSV prüfen', 'outline-primary', 'openCsvImportAssistant()', 'Öffnet eine CSV-Datei, erkennt Zieltabellen und zeigt Pflichtfelder, Dubletten und Vorschau.')
        )}
        ${adminActionTile(
          'Exporte',
          'Erzeugt Dateien für externe Systeme, ohne die lokalen Arbeitsdaten zu verändern.',
          renderExportProfiles()
        )}
        ${adminActionTile(
          'CSV-Wartung',
          'Speichert den aktuellen Datenbestand oder legt eine direkte Kopie des CSV-Ordners an.',
          adminButton('CSV jetzt speichern', 'outline-success', 'saveDbToServer(true)', 'Speichert alle Tabellen nach Validierung direkt in die lokalen CSV-Dateien.') +
          adminButton('CSV-Ordner-Backup', 'outline-secondary', 'backupCsvServer()', 'Erstellt eine Kopie der aktuellen CSV-Dateien im Backup-Ordner.') +
          renderAffectedTablesPreview('CSV speichern', productiveWritePreview('schreibt')) +
          renderAffectedTablesPreview('CSV-Backup', csvBackupPreview())
        )}
      </div>
      <div class="text-muted mt-2">
        Empfehlung: Für normale Sicherungen die JSON-Datei nutzen. CSV bleibt intern als Arbeitsdatenbestand erhalten.
      </div>
    </div>
  </div>`;
}
