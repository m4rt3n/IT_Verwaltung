# Historie

Zentrale Übersicht über die gewachsenen Projektstände und Dokumentationsdateien.

## Aktueller Stand

- v44: Admin-Aufbau geklärt, Stammdaten-Reload sichtbar, Scanner-Start getrennt dokumentiert, Stammdaten-Verwendungsprüfung gegen Objektbereiche abgesichert, statische App-Dateien gegen Browsercache abgesichert, Knowledge-Titel assetneutral bereinigt, Standardsoftware-Paketliste erweitert, Workflow-/UX-Leiste ergänzt
- Datenhaltung: CSV mit serverseitigem Backup vor Schreibvorgängen
- Web-App: lokale Bootstrap-Oberfläche mit Admin Panel
- Scanner: PowerShell-Hardware-Scanner mit Syntaxcheck und CSV-Selbstheilung

## Build-Historie

- v44: Admin-Kacheln für Datensicherung, Exporte und CSV-Wartung; sichtbarer Stammdaten-Reload-Status; getrennte Scanner-Befehlsübersicht; doppelte Helper bereinigt; Stammdaten-Verwendungsprüfung auf produktive CSV-Tabellen begrenzt; lokale JS/CSS-Dateien mit Cache-Busting; Winget/Chocolatey-Update-Knowledge ergänzt; Windows-Standardsoftwareprofil um Winget-Paketgruppen erweitert; Dashboard-Arbeitsqueue, Software-Review-Abschnitte und Tastaturfluss ergänzt
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

Aktuelle Knowledge-Erweiterung:
- `KB-0103` ergänzt Office Deployment Tool, Office ADMX/ADML, Office-Update-Richtlinien und Click-to-Run-Updatebefehle in bereinigter Form ohne Product Keys oder interne Lizenzwerte.
- `KB-0103` beschreibt zusätzlich einen 1-Klick-Installationsablauf für lokale Office-Paketordner; produktive XML/REG-Dateien bleiben außerhalb des Repositorys.
- `KB-0103` enthält eine Profilmatrix für Microsoft 365 Current, Office LTSC 2024/2021, Standard, ProPlus, Project, Visio, LanguagePack und ProofingTools.
- `KB-0103` beschreibt ein Wizard-Konzept zur Auswahl von Lizenzmodell, Version, Paketen, Sprachen, Updatekanal und Sicherheitsoptionen mit daraus abgeleiteter ODT-XML.
- Die Knowledge-Karte `KB-0103` enthält nun ein integriertes Office-Auswahltool mit Schrittleiste und generierter, keyfreier `configuration.xml`.
- Der Office-Wizard erzeugt zusätzlich `MSO-Config.reg` und `README.txt`; Registry-/Policy-Importe erfordern eine eigene Bestätigung.
- Die Office-Wizard-Vorschau bietet temporäre Product-Key-Felder für Volumenlizenz-Produkte; diese werden nicht gespeichert und nur in die aktuelle XML-Ausgabe übernommen.
- JavaScript wurde in erste fachliche Module zerlegt: `office-wizard.js`, `knowledge.js`, `software.js` und `device-wizard.js`; Details und weitere Schritte stehen in `JS_MODULARISIERUNG.md`.

## Umgang mit alten Dateien

Ältere Build-Hinweise aus Einstiegstexten gehören in diese Historie. Die bisherigen Einzeldateien bleiben erhalten, weil sie konkrete Fix-Kontexte enthalten. Neue Dokumentation sollte zuerst in diese zentralen Dateien:

- `README.md` für Einstieg und Betrieb
- `PROJEKTUEBERSICHT.md` für Architektur und Datenmodell
- `SICHERHEIT_UND_ARBEITSWEISE.md` für Schutz- und Testregeln
- `HISTORIE.md` für Build- und Änderungsverlauf
