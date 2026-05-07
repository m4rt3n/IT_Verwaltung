# IT-Verwaltung

Lokale Windows-Web-App zur Verwaltung von IT-Assets, Hardware, Software, Netzwerkdaten, Tickets, Notizen und Knowledge-Einträgen.

Die Anwendung bleibt bewusst einfach: ein lokaler Python-Server, CSV-Dateien als nachvollziehbarer Datenbestand und ein PowerShell-Hardware-Scanner.

## Start

```powershell
start.bat
```

`start.bat` fragt bei Bedarf per Windows-UAC Administratorrechte an. Der Webserver startet standardmäßig ab Port `8765` und sucht automatisch den nächsten freien Port, falls dieser belegt ist. Die Konsole zeigt immer die tatsaechliche `START-URL`; wenn `8765` belegt ist, steht dort der Ausweichport, z. B. `http://localhost:8766`.

Weitere Einstiege:

- `scripts/Start-Web.bat` / `scripts/Start-Web.ps1`: Web-App starten
- `scripts/Start-HardwareScan.bat`: Hardware-, Asset- und Netzwerkdaten scannen
- `scripts/Start-SoftwareScan.bat`: Standardsoftware separat scannen
- `scripts/Start-SoftwareScan-Full.bat`: vollständige Softwareliste aus Registry, Appx/MSIX und Winget scannen, soweit lokal verfügbar
- `scripts/Start-HardwareScan-FullSoftware.bat`: alter Kompatibilitätsalias für `scripts/Start-SoftwareScan-Full.bat`
- `scripts/Check-HardwareScanner-Syntax.bat`: nur Scanner-Syntax prüfen, ohne Scan
- `scripts/Check-WebApp-Syntax.bat`: Python-, PowerShell- und JavaScript-Syntax prüfen, soweit lokal verfügbar

## Struktur

```text
app_server.py                  lokaler CSV-Webserver
web_ui/index.html              Web-Oberfläche
web_ui/js/app.js               App-Logik
web_ui/css/app.css             Styling
web_ui/data/*.csv              produktive CSV-Daten
web_ui/stammdaten/*.md         Auswahllisten und Stammdaten
tools/hardware_scanner/*.ps1   Windows-Hardware-Scanner
scripts/*.bat, scripts/*.ps1   Hilfsstarts und Checks
dokumentation/                 Projekt- und Build-Dokumentation
planung/                       NEXT, TODO, Status und Warteschlange
```

## Daten und Backups

Produktive Daten liegen in `web_ui/data/`.

Der Server erstellt vor CSV-Schreibvorgängen ein Backup unter `web_ui/backups/`. Im Admin Panel sind die Aktionen fachlich getrennt:

- Datensicherung: JSON-Komplettbackup erstellen oder laden
- Exporte: Notion Export ZIP
- CSV-Wartung: CSV jetzt speichern oder CSV-Ordner-Backup erstellen

`software_standard.csv` ist die produktive Tabelle für planbare Software. `software_full.csv` ist nur ein lokales Scanner-Artefakt für vollständige Softwareinventuren.

`logs/`, `web_ui/backups/` und `web_ui/data/software_full.csv` sind lokale Laufzeitdaten und werden nicht versioniert.

## Scanner

Die Scanner-Starts sind getrennt:

```powershell
scripts\Start-HardwareScan.bat
scripts\Start-SoftwareScan.bat
scripts\Start-SoftwareScan-Full.bat
scripts\Check-HardwareScanner-Syntax.bat
```

Den Scanner nicht mit `-?` starten. Für reine Prüfung immer `scripts\Check-HardwareScanner-Syntax.bat` verwenden.

## Entwicklerregeln

- Für Codex und Agenten gilt zusätzlich [AGENTS.md](AGENTS.md) und [dokumentation/CODEX_ARBEITSKONZEPT.md](dokumentation/CODEX_ARBEITSKONZEPT.md).
- Keine globalen Regex-Patches über große JavaScript-Blöcke.
- Vor Codeänderungen die betroffene Funktion lesen.
- Speicherfunktionen müssen vor dem Schreiben validieren.
- Nach JavaScript-Änderungen `scripts\Check-WebApp-Syntax.bat` ausführen; der Check prüft alle produktiven Dateien unter `web_ui/js/`, sobald Node verfügbar ist.
- Nach Python-Änderungen `python -m py_compile app_server.py` ausführen.
- Gesamtcheck: `scripts\Check-WebApp-Syntax.bat`

Weitere Details:

- [dokumentation/SICHERHEIT_UND_ARBEITSWEISE.md](dokumentation/SICHERHEIT_UND_ARBEITSWEISE.md)
- [dokumentation/ROLLEN_RECHTE.md](dokumentation/ROLLEN_RECHTE.md)
- [dokumentation/CODEX_ARBEITSKONZEPT.md](dokumentation/CODEX_ARBEITSKONZEPT.md)
- [dokumentation/HISTORIE.md](dokumentation/HISTORIE.md)
- [dokumentation/HELP_BEREICH.md](dokumentation/HELP_BEREICH.md)
- [dokumentation/TESTPLAN.md](dokumentation/TESTPLAN.md)
- [planung/NEXT.md](planung/NEXT.md)
- [planung/TODO.md](planung/TODO.md)
