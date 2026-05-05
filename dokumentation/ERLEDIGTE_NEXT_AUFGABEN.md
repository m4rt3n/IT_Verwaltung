# Erledigte NEXT-Aufgaben

Automatisch gepflegter Verlauf erledigter Aufgaben aus `planung/NEXT.md`.

## 2026-05-05 21:58:55

- `1. Projektstand stabilisieren`: Sicherheitsabfragen fuer manuelle Schreib-, Backup-, Export- und Anlagevorgaenge ergaenzen.
- `1. Projektstand stabilisieren`: Serverseitige Payload-Pruefung vor CSV-Schreibvorgaengen ergaenzen.
- `1. Projektstand stabilisieren`: README aktualisieren und Sicherheitsdokumentation anlegen.
- `1. Projektstand stabilisieren`: Versionsstand vereinheitlichen: `README.md`, `web_ui/index.html`, `web_ui/build-info.json`, `app_server.py` und `web_ui/js/app.js` zeigen aktuell unterschiedliche Versionsstaende.
- `1. Projektstand stabilisieren`: JavaScript-Syntaxcheck wieder nutzbar machen: `Check-WebApp-Syntax.bat` ist angelegt und Node.js LTS wurde installiert.
- `1. Projektstand stabilisieren`: `web_ui/js/app.js` auf Ladefehler pruefen: Am Dateianfang wird `CORE` genutzt, bevor `CORE` definiert ist.
- `1. Projektstand stabilisieren`: Doppelte Funktion `renderSoftwareStatus()` bereinigen und nur eine eindeutige Version behalten.
- `1. Projektstand stabilisieren`: Scanner-Validierung klaeren: Der Scanner meldete fehlende CSV-Spalten, obwohl die CSV-Dateien Spalten enthalten sollten.
- `2. Repo aufraeumen`: Generierte Laufzeitdaten nicht versionieren: `logs/`, `web_ui/backups/` und `web_ui/data/software_full.csv` bleiben lokal.
- `2. Repo aufraeumen`: Dokumentation konsolidieren: die vielen Build-Check-Dateien in eine aktuelle `CHANGELOG.md` oder `dokumentation/HISTORIE.md` ueberfuehren.
- `2. Repo aufraeumen`: Startdateien pruefen und reduzieren: `start.bat`, `start.ps1`, `Start-Web.*`, `Start-HardwareScan.*` klar benennen und doppelte Einstiege vermeiden.
- `3. Mindesttests definieren`: Web-App starten: `start.bat`
- `3. Mindesttests definieren`: API pruefen: `/api/load`, `/api/save`, `/api/backup`
- `3. Mindesttests definieren`: Wizard pruefen: neues Geraet erfassen, bearbeiten, speichern
- `3. Mindesttests definieren`: Scanner pruefen: Syntaxcheck getrennt vom echten Scan ausfuehren
- `3. Mindesttests definieren`: CSV-Roundtrip pruefen: Laden, Bearbeiten, Speichern, Reload
- `Automatisch aus TODO uebernommen`: `CORE.isSoftwareInstalled` sauber in den Core-Layer verschieben oder alle Aufrufe auf `isSoftwareInstalled()` umstellen.

## 2026-05-05 22:03:49

- `Automatisch aus TODO uebernommen`: Top-Level-Code in `app.js` pruefen: keine Funktion darf beim Laden auf noch nicht initialisierte Objekte zugreifen.

## 2026-05-05 22:06:27

- `Automatisch aus TODO uebernommen`: `BUILD_INFO` nicht doppelt pflegen: Quelle sollte `web_ui/build-info.json` sein.
- `Automatisch aus TODO uebernommen`: `BUILD_INFO` nicht imDashboard, dafür im admin Panel.

## 2026-05-05 22:09:26

- `Automatisch aus TODO uebernommen`: Server-Kommentar und Konsolenausgabe in `app_server.py` auf aktuellen Stand bringen.

## 2026-05-05 22:24:36

- `Automatisch aus TODO uebernommen`: Fehlerbehandlung im Scanner verbessern, wenn CIM/WMI-Zugriff verweigert wird.

## 2026-05-05 22:27:09

- `Automatisch aus TODO uebernommen`: CSV-Spalten zwischen `app_server.py`, Scanner und bestehenden CSV-Dateien vergleichen.

## 2026-05-05 22:28:47

- `Automatisch aus TODO uebernommen`: Entscheiden, ob `software_full.csv` produktive Daten oder nur Scan-Artefakt ist.

## 2026-05-05 22:33:52

- `Automatisch aus TODO uebernommen`: IDs vereinheitlichen: aktueller Datenbestand nutzt teils `AS-0003`, Seed-Daten nutzen `AS-2026-0001`.

## 2026-05-05 22:36:31

- `Automatisch aus TODO uebernommen`: Pflichtfelder je Tabelle definieren.

## 2026-05-05 22:39:33

- `Automatisch aus TODO uebernommen`: Admin Panel als zentralen Ort fuer Backup, Import, Export und CSV-Speichern beibehalten.

## 2026-05-05 22:47:58

- `Automatisch aus TODO uebernommen`: Such- und Filterlogik je Tab testen.
