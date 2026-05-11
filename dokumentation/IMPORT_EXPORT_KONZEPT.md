# Import-/Export-Konzept

Stand: 2026-05-07

## Export

Vorhanden:

- JSON-Komplettsicherung aller Tabellen.
- Notion-kompatibler ZIP-Export mit CSV-Dateien und README.
- Excel-kompatibler ZIP-Export mit semikolongetrennten UTF-8-CSV-Dateien.
- Archiv-ZIP mit `backup.json`, CSV-Kopien und README.
- Archiv-ZIP mit zusaetzlichen Metadaten: Build-Info, Serverstatus und Testbericht.
- Admin Panel zeigt Exportprofile mit Zweck, Zielsoftware und erwarteten Inhalten fuer Notion, Excel/LibreOffice und Archivablage.
- ZIP-Exporte pruefen im Admin Panel, ob JSZip geladen ist. Aktuell wird JSZip per CDN eingebunden; fuer echten Offline-Betrieb muss die Bibliothek lokal bereitgestellt und in `web_ui/index.html` eingebunden werden.
- CSV-Ordner-Backup serverseitig.

Excel wird ueber CSV-Dateien abgedeckt. Ein natives XLSX-Format wird nicht eingefuehrt, weil dafuer eine neue Dependency noetig waere.

## Import

Vorhanden:

- JSON-Komplettimport fuer Sicherungen.
- CSV-Import-Assistent als Vorschau: Datei lesen, Trennzeichen erkennen, Zieltabellen abschaetzen, Pflichtfelder und ID-Dubletten melden.
- CSV-Import-Assistent mit manueller Zieltabellen-Auswahl fuer die Vorschau. Die Auswahl startet die Pruefung neu, schreibt aber weiterhin keine Daten.
- CSV-Import-Assistent mit Spaltenmapping fuer die Vorschau. Zielspalten koennen CSV-Quellspalten zugeordnet oder bewusst leer gelassen werden.
- CSV-Import-Assistent mit temporaerem Entwurfsmodus. Plausible Zeilen koennen in einen schreibgeschuetzten Browser-Entwurf uebernommen und wieder verworfen werden.
- CSV-Import-Assistent mit verpflichtendem Server-Backup-Gate vor einer spaeteren produktiven Uebernahme. Ohne aktiven Entwurf und erfolgreiches `/api/backup` bleibt die Uebernahmebereitschaft gesperrt.
- CSV-Import-Assistent schreibt nach Backup ein Importprotokoll unter `web_ui/backups/import_logs/`. Das Protokoll enthaelt Metadaten, Mapping, Vorschlagszahlen und Backup-Referenz, aber keine produktive Datenuebernahme.
- CSV-Daten bleiben direkt wartbar, aber produktive Importe sollen nicht ohne Vorschau und Backup automatisch Daten ueberschreiben.

## Ziel fuer einen spaeteren Import-Assistenten

- Datei waehlen. Vorhanden als Vorschau.
- Tabelle erkennen oder auswaehlen. Vorhanden als automatische Erkennung plus manuelle Zieltabellen-Auswahl in der Vorschau.
- Spaltenmapping pruefen. Vorhanden als freies Mapping in der Vorschau, ohne Datenuebernahme.
- Pflichtfelder anzeigen. Vorhanden.
- Dubletten ueber IDs erkennen. Vorhanden.
- Import erst als Entwurf zeigen. Vorhanden als temporaerer, schreibgeschuetzter Browser-Entwurf.
- Vor Uebernahme Backup erstellen. Vorhanden als verpflichtender Backup-Gate am Entwurf.
- Importprotokoll schreiben. Vorhanden als JSON-Protokoll unter `web_ui/backups/import_logs/`.

## Entscheidung

Kein stiller CSV-Massenimport. Der Assistent schreibt bewusst keine Daten, bis Mapping, Backup, Uebernahmeentscheidung und Importprotokoll vollstaendig umgesetzt sind.

## Optionaler SQLite-Pfad

Ein spaeterer SQLite-Wechsel ist nur als kontrollierte Migration vorgesehen, nicht als paralleles Importsystem. Massgeblich bleibt [SQLITE_MIGRATION_KONZEPT.md](SQLITE_MIGRATION_KONZEPT.md): CSV-Backup vor Migration, Nur-Lese-Prototyp, Vergleichsbericht, Rueckexport nach CSV und manuelle Umschaltentscheidung.
