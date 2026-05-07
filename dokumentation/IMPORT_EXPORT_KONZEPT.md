# Import-/Export-Konzept

Stand: 2026-05-07

## Export

Vorhanden:

- JSON-Komplettsicherung aller Tabellen.
- Notion-kompatibler ZIP-Export mit CSV-Dateien und README.
- Excel-kompatibler ZIP-Export mit semikolongetrennten UTF-8-CSV-Dateien.
- Archiv-ZIP mit `backup.json`, CSV-Kopien und README.
- CSV-Ordner-Backup serverseitig.

Excel wird ueber CSV-Dateien abgedeckt. Ein natives XLSX-Format wird nicht eingefuehrt, weil dafuer eine neue Dependency noetig waere.

## Import

Vorhanden:

- JSON-Komplettimport fuer Sicherungen.
- CSV-Import-Assistent als Vorschau: Datei lesen, Trennzeichen erkennen, Zieltabellen abschaetzen, Pflichtfelder und ID-Dubletten melden.
- CSV-Daten bleiben direkt wartbar, aber produktive Importe sollen nicht ohne Vorschau und Backup automatisch Daten ueberschreiben.

## Ziel fuer einen spaeteren Import-Assistenten

- Datei waehlen. Vorhanden als Vorschau.
- Tabelle erkennen oder auswaehlen. Erkennung vorhanden, manuelle Auswahl noch offen.
- Spaltenmapping pruefen. Pflichtspaltenpruefung vorhanden, freies Mapping noch offen.
- Pflichtfelder anzeigen. Vorhanden.
- Dubletten ueber IDs erkennen. Vorhanden.
- Import erst als Entwurf zeigen.
- Vor Uebernahme Backup erstellen.
- Importprotokoll schreiben.

## Entscheidung

Kein stiller CSV-Massenimport. Der Assistent schreibt bewusst keine Daten, bis Mapping, Backup, Uebernahmeentscheidung und Importprotokoll vollstaendig umgesetzt sind.
