# Sicherheit und Arbeitsweise

Diese Regeln sollen Datenverlust, defekte Builds und versehentliche Änderungen vermeiden.

## Sicherheitsabfragen

Die Web-App fragt bei manuellen Schreibaktionen nach, bevor Daten verändert oder exportiert werden:

- CSV jetzt speichern
- CSV-Ordner-Backup
- JSON-Komplettbackup
- Notion ZIP Export
- Neues Gerät final erstellen
- Eintrag anlegen oder bearbeiten
- Eintrag löschen

Diese Schreibbestätigung ist absichtlich nicht abschaltbar.

## Admin Panel als Speicherzentrale

Backup, Import, Export und manuelles CSV-Speichern bleiben im Admin Panel im Bereich `Backup & Import` gebündelt:

- JSON-Komplettbackup
- JSON-Import
- Notion ZIP Export
- CSV jetzt speichern
- CSV-Ordner-Backup

Dashboard, Asset-, Hardware-, Software-, Netzwerk-, Ticket-, Notiz- und Knowledge-Ansichten sollen keine separaten Backup-, Import-, Export- oder CSV-Speicherbuttons erhalten.

## Serverseitiger Schutz

`app_server.py` akzeptiert beim Speichern nur vollständige Datenpakete. Diese Tabellen müssen vorhanden und Listen sein:

- `assets`
- `hardware`
- `software`
- `netzwerk`
- `tickets`
- `notizen`
- `knowledge`

Fehlt eine Tabelle oder ist eine Tabelle kein Array, bricht der Server den Speichervorgang ab. Dadurch werden fehlende Tabellen nicht mehr versehentlich als leere CSV geschrieben.

Vor jedem erfolgreichen CSV-Schreiben wird ein Backup unter `web_ui/backups/backup_YYYYMMDD_HHMMSS/` erstellt.

## Scanner-Regeln

Für reine Syntaxprüfung:

```powershell
Check-HardwareScanner-Syntax.bat
```

Für echten Scan:

```powershell
Start-HardwareScan.bat
```

Für echten Scan mit vollständiger Softwareliste:

```powershell
Start-HardwareScan-FullSoftware.bat
```

Wichtig: Den Scanner nicht mit `-?` starten. Das Script besitzt keinen Hilfe-Modus und würde dadurch trotzdem einen Scan ausführen.

Wenn CIM/WMI-Abfragen fehlschlagen, zum Beispiel durch verweigerten Zugriff, schreibt der Scanner keine leeren Ersatzwerte über bestehende Hardware-, Asset- oder Netzwerkdaten. Der eingeschränkte Scan wird im Log und in den Bemerkungen sichtbar gemacht.

## Änderungsregeln für Code

- Vor Änderungen erst die betroffene Funktion lesen.
- Keine blinden globalen Ersetzungen in `web_ui/js/app.js`.
- Funktionen blockweise ändern.
- Bei JavaScript-Funktionen auf Initialisierungsreihenfolge achten: Top-Level-Code darf nicht auf noch nicht definierte Objekte zugreifen.
- Fehler immer sichtbar machen: `try/catch`, Toast oder Alert, und `console.error(e)`.
- Speicherfunktionen müssen vor dem Schreiben validieren.

## Pflichtprüfungen

Python:

```powershell
python -m py_compile app_server.py
```

PowerShell-Scanner:

```powershell
Check-HardwareScanner-Syntax.bat
```

JavaScript, sobald Node.js verfügbar ist:

```powershell
node --check web_ui/js/app.js
```

Gesammelter Check:

```powershell
Check-WebApp-Syntax.bat
```

Manuelle Smoke-Tests:

- Web-App über `start.bat` starten
- Admin Panel öffnen
- CSV-Backup erstellen
- Testeintrag anlegen und abbrechen
- Testeintrag anlegen und speichern
- Seite neu laden und Daten prüfen
