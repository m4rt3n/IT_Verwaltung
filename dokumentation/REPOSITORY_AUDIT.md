# Repository-Audit

Stand: 2026-05-07

## Ziel

Dieses Audit beschreibt den aktuellen Zielzustand des lokalen Projekts, ohne Dateien zu verschieben oder parallele Systeme aufzubauen.

## Aktuelle Struktur

- `app_server.py`: lokaler Python-Server, CSV-API, Help-API, Scanner-Start und Sicherheitspruefungen.
- `web_ui/`: produktive Web-App mit HTML, CSS, JavaScript, lokalen CSV-Daten, Stammdaten und Konfiguration.
- `web_ui/data/`: produktive CSV-Tabellen fuer Assets, Hardware, Standardsoftware, Netzwerk, Tickets, Notizen und Knowledge.
- `web_ui/config/`: lokale Konfigurationsdateien fuer Server und Klassifikation.
- `web_ui/js/`: schrittweise ausgelagerte JavaScript-Module; `app.js` bleibt vorerst Integrationsdatei.
- `tools/hardware_scanner/`: produktive Scannerlogik; kein zweites Scannersystem.
- `scripts/`: Start-, Scanner- und Check-Batchdateien.
- `dokumentation/`: fuehrende Projekt-, Sicherheits-, Scanner-, Datenmodell- und Help-Dokumentation.
- `planung/`: kurzfristige Arbeitssteuerung; erledigte Roadmap-Punkte werden nach diesem Durchlauf in Dokumentation ueberfuehrt.

## Wichtige Beobachtungen

- Der Git-Worktree enthaelt bereits umfangreiche Umbauten und geloeschte Altpfade. Diese wurden nicht zurueckgesetzt.
- Produktive Daten liegen unter `web_ui/data/`; Demo- und Scannerartefakte duerfen fachlich nicht als Referenzdaten gelten.
- `software_full.csv` und `software_full.json` sind lokale Scannerartefakte und nicht Teil der normalen CSV-Persistenz.
- Externe CDN-Abhaengigkeiten in `index.html` sind bewusst dokumentiert. Ein Offline-Vendor-Bundle ist eine eigene, spaetere Release-Aufgabe.
- Der lokale Rollenmodus ist eine UI-Sperre. Serverseitig sind lokale Host-/Origin-Grenzen, Payloadvalidierung und Backup-before-write aktiv.

## Entscheidung

Der aktuelle Stand bleibt CSV-basiert und lokal. SQLite, vollstaendige Modulzerlegung, Browser-Smoke-Tests mit externen Testframeworks und Offline-Vendor-Bundles werden nicht in diesem Durchlauf erzwungen, weil sie neue Migrations- oder Dependency-Risiken erzeugen wuerden.

