# Architektur

Stand: 2026-05-07

## Schichten

Die Anwendung bleibt bewusst klein und lokal:

- UI: `web_ui/index.html`, `web_ui/css/app.css`, `web_ui/js/*.js`
- Controller/API: `app_server.py`
- Service-Logik: Validierung, Backup, Help-Laden, Scanner-Start und Software-Full-Laden in `app_server.py`
- Persistenz: CSV-Dateien unter `web_ui/data/`
- Artefakte: Scanner-Full-Scan unter `web_ui/data/software_full.*`

## JavaScript-Module

Die Modulaufteilung ist begonnen:

- `ui.js`: UI-Helfer, Toasts, Dialoge
- `core.js`: Daten- und Suchhelper
- `data-api.js`: Serverkommunikation
- `admin.js`: Admin Panel, Backup, Import/Export, Scannerstart
- `dashboard.js`: Dashboard und Visualisierung
- `stammdaten.js`: Stammdaten-Laden
- `help.js`: Help-Tab und Markdown-Light-Rendering
- `app.js`: Integrationsdatei fuer bestehende Fachansichten, Wizard, CRUD und Speziallogik

`app.js` wird nicht in einem grossen Umbau zerlegt. Weitere Extraktion erfolgt nur in kleinen, geprueften Schritten.

## Konfiguration

`web_ui/config/app_config.json` steuert lokale Serverparameter:

- `host`: nur `127.0.0.1` oder `localhost`
- `port`
- `port_scan_range`
- `open_browser`
- `backup_retention_note`

## Sicherheitsgrenzen

- Der Server bindet lokal.
- Schreibende API-Endpunkte lehnen fremde `Host`-, `Origin`- oder `Referer`-Kontexte ab.
- `/api/save` validiert Tabellen und Pflichtfelder.
- Vor CSV-Schreibvorgaengen wird ein Backup angelegt.
- Scannerstart bleibt an vorhandene Batchdateien gebunden.

## Datenmodell

CSV bleibt Source of Truth. SQLite ist nur eine spaetere Option und wird nicht parallel eingefuehrt.

