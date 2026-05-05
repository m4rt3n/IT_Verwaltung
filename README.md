# IT-Verwaltung

Lokale Web-App zur Verwaltung von IT-Assets, Hardware, Software, Netzwerkdaten, Tickets, Notizen und Knowledge-Einträgen.

Die Anwendung läuft lokal auf Windows, nutzt CSV-Dateien als Datenbestand und bringt einen PowerShell-Hardware-Scanner mit.

## Start

```powershell
start.bat
```

Der Start öffnet einen lokalen Python-Webserver. Die App läuft standardmäßig ab Port `8765`; falls der Port belegt ist, sucht der Server automatisch den nächsten freien Port.

Wichtige Einstiege:

- `start.bat`: Web-App starten
- `Start-Web.bat` / `Start-Web.ps1`: alternative Web-Starts
- `Start-HardwareScan.bat`: lokalen Hardware-Scan starten
- `Start-HardwareScan-FullSoftware.bat`: Hardware-Scan mit vollständiger Softwareliste
- `Check-HardwareScanner-Syntax.bat`: Scanner-Syntax prüfen, ohne Scan auszuführen
- `Check-WebApp-Syntax.bat`: Python, Scanner und JavaScript-Syntax prüfen

Details zu allen Startdateien stehen in [dokumentation/STARTDATEIEN.md](dokumentation/STARTDATEIEN.md).

## Projektstruktur

```text
app_server.py                  Lokaler Python-CSV-Server
web_ui/index.html              Web-Oberfläche
web_ui/js/app.js               App-Logik
web_ui/css/app.css             Styling
web_ui/data/*.csv              Produktive CSV-Daten
web_ui/stammdaten/*.md         Auswahllisten/Stammdaten
tools/hardware_scanner/*.ps1   Windows-Hardware-Scanner
dokumentation/                 Projektdokumentation
planung/                       NEXT, TODO und Warteschlange
```

## Daten und Backups

Produktive Daten liegen unter `web_ui/data/`.

Der Server erstellt vor CSV-Schreibvorgängen automatisch ein Backup unter `web_ui/backups/`. Zusätzlich gibt es im Admin Panel:

- JSON-Komplettbackup
- JSON-Import
- CSV jetzt speichern
- CSV-Ordner-Backup
- Notion Export ZIP

`logs/`, `web_ui/backups/` und `web_ui/data/software_full.csv` sind lokale Laufzeitdaten und werden über `.gitignore` nicht versioniert. `software_full.csv` ist bewusst nur ein Scanner-Artefakt, keine produktive Web-App-Tabelle.

## Sicherheitsregeln

- Manuelle Speicher-, Backup-, Export- und Anlagevorgänge fragen vor dem Schreiben nach.
- Der Python-Server speichert nur vollständige Payloads mit allen erwarteten Tabellen.
- Vor jedem CSV-Schreiben wird serverseitig ein Backup erstellt.
- Der Scanner-Syntaxcheck muss über `Check-HardwareScanner-Syntax.bat` laufen, nicht über einen normalen Scanner-Start.
- Keine globalen Regex-Patches über große JavaScript-Blöcke.
- Nach JavaScript-Änderungen soll `node --check web_ui/js/app.js` laufen, sobald Node.js verfügbar ist.
- Nach Python-Änderungen:

```powershell
python -m py_compile app_server.py
```

Gesammelter Check:

```powershell
Check-WebApp-Syntax.bat
```

Mehr Details stehen in [dokumentation/SICHERHEIT_UND_ARBEITSWEISE.md](dokumentation/SICHERHEIT_UND_ARBEITSWEISE.md).
Die Build- und Änderungshistorie steht in [dokumentation/HISTORIE.md](dokumentation/HISTORIE.md).
Der Mindesttestplan steht in [dokumentation/TESTPLAN.md](dokumentation/TESTPLAN.md).

## Aktueller Stand

Aktueller Build laut `web_ui/build-info.json`: v43, Scanner STABLE / Self-Healing CSV.

Bekannte technische Schulden:

- `web_ui/js/app.js` ist zu groß und sollte mittelfristig modularisiert werden.
- Versionshinweise in älteren Dateien sind historisch gewachsen.
- Node.js ist installiert; neue Terminals sollten `node` automatisch im PATH haben. `Check-WebApp-Syntax.bat` prüft zusätzlich den Standardpfad.

## Planung

Die Aufgabenplanung liegt in:

- [planung/NEXT.md](planung/NEXT.md)
- [planung/TODO.md](planung/TODO.md)
- [planung/WARTESCHLANGE.md](planung/WARTESCHLANGE.md)
- [planung/STATUS.md](planung/STATUS.md)
- [planung/CODEX_NEXT_PROMPT.md](planung/CODEX_NEXT_PROMPT.md)

Empfohlene Reihenfolge: erst `NEXT.md`, dann `TODO.md`, später `WARTESCHLANGE.md`.
Automatisierung: `Update-Planung.bat`, siehe [dokumentation/PLANUNG_AUTOMATION.md](dokumentation/PLANUNG_AUTOMATION.md).
