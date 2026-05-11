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

Admin-Schreibaktionen zeigen zusaetzlich eine Vorschau der betroffenen Tabellen oder Dateien. Dadurch ist vor dem Ausloesen sichtbar, ob produktive CSV-Dateien geschrieben, nur in ein Backup kopiert oder Scannerartefakte erzeugt werden.

## Admin Panel als Speicherzentrale

Backup, Import, Export und manuelles CSV-Speichern bleiben im Admin Panel im Bereich `Backup & Import` gebündelt:

- JSON-Komplettbackup
- JSON-Import
- Notion ZIP Export
- CSV jetzt speichern
- CSV-Ordner-Backup

Dashboard, Asset-, Hardware-, Software-, Netzwerk-, Ticket-, Notiz- und Knowledge-Ansichten sollen keine separaten Backup-, Import-, Export- oder CSV-Speicherbuttons erhalten.

Die Admin-Kacheln nennen bei Schreib- und Scanneraktionen die betroffenen Tabellen/Dateien. Die gleiche Liste erscheint in der Sicherheitsabfrage vor dem Ausloesen.

## Rollenmodus

Die Web-App besitzt einen lokalen Rollenmodus `Admin` / `Normal`.

Der Modus ist ein Bedien- und Schreibschutz in der Oberfläche, aber keine echte Authentifizierung. Im Normalmodus werden Admin- und Stammdatenbereiche ausgeblendet und Schreibaktionen durch `requireWriteAccess()` blockiert.

Der lokale Webserver liefert statische App-Dateien mit `Cache-Control: no-store` aus. Dadurch werden JavaScript- und CSS-Korrekturen beim lokalen Betrieb nicht versehentlich durch veraltete Browsercache-Versionen ueberdeckt.

`start.bat` erzwingt Administratorrechte über eine UAC-Abfrage, damit aus der Web-App gestartete lokale Scanner vollständiger arbeiten können. Das erhöht die Windows-Rechte des lokalen Prozesses, ersetzt aber keine Anmeldung, Rechteverwaltung oder Server-Authentifizierung.

Details: [ROLLEN_RECHTE.md](ROLLEN_RECHTE.md).

## Serverseitiger Schutz

Der Server bindet lokal und laesst als Host nur `127.0.0.1` oder `localhost` zu. Schreibende API-Endpunkte unter `/api/` lehnen fremde `Host`-, `Origin`- oder `Referer`-Kontexte ab.

Zusaetzlich erzeugt der Server beim Start ein lokales Session-Token fuer POST-Anfragen. Die Web-App liest dieses Token ueber `/api/status` und sendet es bei schreibenden API-Aufrufen als Header `X-ITV-Session-Token` mit. POST-Anfragen ohne gueltiges Token werden abgelehnt.

Dieses Token ist bewusst keine Anmeldung. Es bindet schreibende Requests an die aktuell geladene lokale App-Sitzung und erschwert fremde Webseiten- oder Formular-POSTs, ersetzt aber keine Benutzerverwaltung.

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

## Lokale Bedrohungsannahme

Die App ist fuer einen lokalen Einzelplatzbetrieb gedacht. Der Schutz richtet sich gegen versehentliche Bedienfehler, fremde Webseiten im Browser und unvollstaendige oder falsche Payloads. Er ersetzt keine Mehrbenutzer-Authentifizierung.

Annahmen:

- Der Server laeuft nur auf `127.0.0.1` oder `localhost`.
- Der Benutzer, der den Server startet, darf die lokalen Projektdateien lesen und schreiben.
- Andere Prozesse desselben Windows-Benutzers koennen grundsaetzlich lokale Dateien und lokale Ports erreichen.
- Der Rollenmodus `Admin` / `Normal` ist UI-Schutz, keine serverseitige Anmeldung.
- Wenn `start.bat` mit Administratorrechten laeuft, gelten diese Rechte auch fuer serverseitig gestartete Scannerprozesse.

### `/api/save`

Bedrohung:

- unvollstaendige Tabellen koennten produktive CSV-Dateien leeren,
- manipulierte Browser- oder Fremdseiten-Requests koennten Daten ueberschreiben,
- fehlerhafte Pflichtfelder koennten spaetere Auswertungen brechen.

Aktiver Schutz:

- fremde `Host`-, `Origin`- und `Referer`-Kontexte werden abgelehnt,
- gueltiges lokales Session-Token im Header `X-ITV-Session-Token` ist erforderlich,
- Payload muss alle produktiven Tabellen als Listen enthalten,
- Pflichtfelder werden serverseitig geprueft,
- vor jedem erfolgreichen Schreiben wird ein Backup erstellt.

Restrisiko:

- Ein lokaler Prozess oder ein Benutzer mit Zugriff auf `localhost` und Projektdateien kann weiterhin bewusst Requests senden oder Dateien direkt veraendern.

### `/api/backup`

Bedrohung:

- fremde Webseiten koennten viele Backups ausloesen,
- Backups koennten Speicherplatz verbrauchen,
- ein Backup koennte faelschlich als Schreibschutz verstanden werden.

Aktiver Schutz:

- fremde `Host`-, `Origin`- und `Referer`-Kontexte werden abgelehnt,
- gueltiges lokales Session-Token im Header `X-ITV-Session-Token` ist erforderlich,
- Backups schreiben nur in `web_ui/backups/`,
- produktive CSV-Dateien werden dabei nicht veraendert.

Restrisiko:

- Backup-Retention ist noch nicht automatisiert. Viele bewusste lokale Backup-Aufrufe koennen Speicher belegen.

### `/api/scanner/start`

Bedrohung:

- ein fremder Request koennte lokale Batchdateien starten,
- ein falscher Scanner-Modus koennte unerwartete Daten schreiben,
- bei Administratorstart laufen Scanner mit hoeheren Rechten.

Aktiver Schutz:

- fremde `Host`-, `Origin`- und `Referer`-Kontexte werden abgelehnt,
- gueltiges lokales Session-Token im Header `X-ITV-Session-Token` ist erforderlich,
- nur Modi aus der festen Allowlist in `SCANNER_COMMANDS` sind erlaubt,
- der Scannerstart bleibt an vorhandene Batchdateien im Repository gebunden,
- unbekannte Modi werden mit HTTP 400 abgelehnt.

Restrisiko:

- Ein bewusst handelnder lokaler Benutzer kann Scannerstarts ausloesen. Echte Zugriffskontrolle waere erst mit serverseitigem Token, Anmeldung oder Betriebssystem-Rechtekonzept erreicht.

## Scanner-Regeln

Für reine Syntaxprüfung:

```powershell
scripts\Check-HardwareScanner-Syntax.bat
```

Für echten Hardware-Scan:

```powershell
scripts\Start-HardwareScan.bat
```

Für separaten Software-Scan der Standardsoftware:

```powershell
scripts\Start-SoftwareScan.bat
```

Für separaten Software-Scan mit vollständiger Softwareliste:

```powershell
scripts\Start-SoftwareScan-Full.bat
```

`scripts\Start-HardwareScan-FullSoftware.bat` bleibt nur als alter Kompatibilitätsalias bestehen.

Der Full-Software-Scan erzeugt `web_ui/data/software_full.csv` mit möglichst vielen lokal erkennbaren Programmen und Paketen. Diese Datei bleibt ein lokales Artefakt und wird nicht automatisch als produktive Web-App-Tabelle importiert.

Wichtig: Den Scanner nicht mit `-?` starten. Das Script besitzt keinen Hilfe-Modus und würde dadurch trotzdem einen Scan ausführen.

Wenn CIM/WMI-Abfragen fehlschlagen, zum Beispiel durch verweigerten Zugriff, schreibt der Scanner keine leeren Ersatzwerte über bestehende Hardware-, Asset- oder Netzwerkdaten. Der eingeschränkte Scan wird im Log und in den Bemerkungen sichtbar gemacht.

## Änderungsregeln für Code

- `AGENTS.md` und `CODEX_ARBEITSKONZEPT.md` gelten als Arbeitsleitlinie für Codex.
- Das Repository ist wichtiger als Konzeptdokumente: erst Code lesen, dann ändern.
- Keine parallelen Systeme aufbauen, wenn ein vorhandenes Modul erweitert werden kann.
- Keine Datenmodell-, Import-/Export- oder Scanner-Änderung ohne Erhalt der bestehenden Funktionen.
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
scripts\Check-HardwareScanner-Syntax.bat
```

JavaScript, sobald Node.js verfügbar ist:

```powershell
scripts\Check-WebApp-Syntax.bat
```

Gesammelter Check:

```powershell
scripts\Check-WebApp-Syntax.bat
scripts\Smoke-Test.bat
```

Manuelle Smoke-Tests:

- Web-App über `start.bat` starten
- Admin Panel öffnen
- CSV-Backup erstellen
- Testeintrag anlegen und abbrechen
- Testeintrag anlegen und speichern
- Seite neu laden und Daten prüfen
