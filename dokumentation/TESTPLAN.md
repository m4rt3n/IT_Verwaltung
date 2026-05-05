# Testplan

Kompakter Mindesttestplan für Änderungen an der IT-Verwaltung.

## Automatische Checks

```powershell
Check-WebApp-Syntax.bat
```

Erwartung:

- Python-Syntax OK
- PowerShell-Syntax OK
- JavaScript-Syntax OK, sobald Node.js installiert oder im PATH ist

## Web-App starten

```powershell
start.bat
```

Erwartung:

- lokaler Server startet
- URL wird angezeigt
- `/api/load` antwortet mit HTTP 200

## API prüfen

Minimal:

- `GET /api/load`
- `POST /api/save`
- `POST /api/backup`

Erwartung:

- alle drei Endpunkte antworten mit HTTP 200
- bei `/api/save` wird vorher serverseitig ein Backup erstellt
- unvollständige Payloads werden abgelehnt

## Wizard prüfen

Manuell im Browser:

- `+ Neues Gerät erfassen` öffnen
- Schritte 1 bis 6 durchgehen
- Pflichtfelder leer lassen und Validierung prüfen
- finalen Speichern-Dialog abbrechen
- Testgerät final speichern
- nach Reload prüfen, ob Asset, Hardware, Netzwerk und Notiz vorhanden sind

## Scanner prüfen

Syntax ohne Scan:

```powershell
Check-HardwareScanner-Syntax.bat
```

Echter Scan nur bewusst:

```powershell
Start-HardwareScan.bat
```

Erwartung:

- Backup wird vor Änderung erstellt
- Log wird unter `logs/` geschrieben
- Validierung meldet keine fehlenden Pflichtspalten

## CSV-Roundtrip

- App laden
- Daten über API laden
- unverändert per API speichern
- App/API erneut laden
- Git-Diff auf `web_ui/data` prüfen

Erwartung:

- keine unerwarteten Änderungen an CSV-Daten
- Backup-Verzeichnisse bleiben ignoriert

## Suche und Filter je Tab

Manuell im Browser:

- In jedem Fach-Tab einen vorhandenen Begriff suchen, z. B. Gerätename, ID, Software- oder Tickettitel.
- Danach einen nicht vorhandenen Begriff suchen.
- Erwartung bei Treffern: Liste und Detailkarte zeigen nur passende Einträge.
- Erwartung ohne Treffer: Liste zeigt `Keine Treffer` und rechts wird kein ungefilterter Datensatz angezeigt.
- `Suche löschen` setzt die Ansicht wieder auf die normale Tab-Liste zurück.

Zu prüfen:

- Assets
- Hardware
- Software Kartenansicht
- Software Tabellenansicht
- Netzwerk
- Tickets
- Notizen
- Knowledge
