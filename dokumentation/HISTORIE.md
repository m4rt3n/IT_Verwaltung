# Historie

Zentrale Übersicht über die gewachsenen Projektstände und Dokumentationsdateien.

## Aktueller Stand

- v43: Safety Guard + Scanner STABLE
- Datenhaltung: CSV mit serverseitigem Backup vor Schreibvorgängen
- Web-App: lokale Bootstrap-Oberfläche mit Admin Panel
- Scanner: PowerShell-Hardware-Scanner mit Syntaxcheck und CSV-Selbstheilung

## Build-Historie

- v43: Scanner STABLE, Self-Healing CSV, Header-Validierung, Sicherheitsabfragen, Payload-Prüfung
- v42: PowerShell-Parserfix für Variablen direkt vor `:`
- v40: DB-Initialisierungsfix und Safe Smart Software Layer
- v37: Notion Export ZIP ohne API
- v33: Clean Core Layer und UX-Stabilisierung
- v31: Admin Backup und Import als JSON-Komplettdatei
- v30.2: JavaScript-Syntaxfix nach fehlerhaftem Regex-Patch
- v28: Dashboard zeigt Topologie und Graph exklusiv
- v27: Software UI mit Kartenansicht und Statusanzeigen
- v26.x: Wizard-, Helper- und Hersteller-Fixes
- v25: Clean UX und Admin Panel
- v24/v23: Netzwerk-Dropdown und Netzwerkfilterung

## Thematische Dokumentation

- `PROJEKTUEBERSICHT.md`: Zweck, Bereiche und Datenmodell
- `SICHERHEIT_UND_ARBEITSWEISE.md`: Schutzregeln, Checks und Arbeitsweise
- `CSV_PERSISTENZ.md`: CSV-Speicherung
- `ASSETS_CRUD.md`: Asset-Erstellung und Bearbeitung
- `BEDINGTE_LOGIK.md`: Feldlogik im Wizard und Bearbeiten-Dialog
- `REFERENZ_ERSTELLUNG.md`: referenzierte Einträge gegen bestehende Assets
- `SOFTWARE_SMART_V26.md`: Software-Erkennung und Standardsoftware
- `TOPOLOGIE_DASHBOARD.md`: Dashboard-Topologie
- `STAMMDATEN_UI_UPGRADE.md`: Stammdatenpflege

## Umgang mit alten Dateien

Die bisherigen Einzeldateien bleiben erhalten, weil sie konkrete Fix-Kontexte enthalten. Neue Dokumentation sollte zuerst in diese zentralen Dateien:

- `README.md` für Einstieg und Betrieb
- `PROJEKTUEBERSICHT.md` für Architektur und Datenmodell
- `SICHERHEIT_UND_ARBEITSWEISE.md` für Schutz- und Testregeln
- `HISTORIE.md` für Build- und Änderungsverlauf

