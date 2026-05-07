# Testplan

Kompakter Mindesttestplan für Änderungen an der IT-Verwaltung.

## Automatische Checks

```powershell
scripts\Check-WebApp-Syntax.bat
scripts\Smoke-Test.bat
```

Erwartung:

- Python-Syntax OK
- Quality-Check OK fuer vollstaendige CSV-Payload, eindeutige IDs, Asset-Referenzen, Netzwerkwerte, Stammdaten-Dateien und `software_full.json`
- PowerShell-Syntax OK
- JavaScript-Syntax OK fuer alle produktiven Dateien unter `web_ui/js/`, sobald Node.js installiert oder auffindbar ist
- Die Ausgabe `Node-Quelle` zeigt bevorzugt Standard-Node.js aus `PATH`, `Program Files` oder Benutzerprofil; Adobe-Node ist nur als Fallback vorgesehen.
- Smoke-Test OK fuer `/api/status`, `/api/load`, `/api/help`, `/api/software-full`, CSV-Header, Stammdaten, Startdateien, Import-Vorschau-Helfer, Pflichtfeldvalidierung, unvollstaendige Save-Payloads, lokalen POST-Schutz und unbekannte Scanner-Modi.
- `scripts\Check-WebApp-Syntax.bat` gibt am Ende eine Zusammenfassung fuer Python, Quality-Check, PowerShell, JavaScript und Smoke-Test aus.

Automatisch bleiben bewusst ohne Browser, UAC und produktive Datenuebernahme:

- Syntax- und API-Erreichbarkeit
- serverseitige Pflichtfeld- und Payload-Ablehnung
- Tabellen- und Legacy-Pfad-Metadaten, inklusive `software_standard.csv` und `software.csv`
- Stammdaten- und Hilfedatei-Ladefaehigkeit
- statische Import-Vorschau-Pruefung ohne CSV-Uebernahme

Manuell bleiben weiterhin:

- Browser-Darstellung, Klickwege, Modale und Rollenmodus
- UAC-Neustart und echte Scannerstarts
- echter CSV-Roundtrip mit anschliessender Diff-Pruefung
- Abgleich der Full-Software-Inventur mit Windows Apps & Features, Winget, Choco, pip und npm

## Web-App starten

```powershell
start.bat
```

Erwartung:

- lokaler Server startet
- URL wird angezeigt
- wenn Port `8765` belegt ist, wird die tatsaechliche `START-URL` mit Ausweichport sichtbar angezeigt
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
scripts\Check-HardwareScanner-Syntax.bat
```

Echter Hardware-Scan nur bewusst:

```powershell
scripts\Start-HardwareScan.bat
```

Separater Software-Scan nur bewusst:

```powershell
scripts\Start-SoftwareScan.bat
```

Vollständige Softwareinventur nur bewusst:

```powershell
scripts\Start-SoftwareScan-Full.bat
```

Erwartung:

- Backup wird vor Änderung erstellt
- Log wird unter `logs/` geschrieben
- Validierung meldet keine fehlenden Pflichtspalten
- Hardware-Scan schreibt `assets.csv`, `hardware.csv` und `netzwerk.csv`, aber keine Softwaredaten
- Software-Scan schreibt `software_standard.csv`, aber keine Hardware- oder Netzwerkdaten
- Full-Software-Scan erzeugt `web_ui/data/software_full.csv`
- Full-Software-Scan erzeugt zusätzlich `web_ui/data/software_full.json`
- `software_full.csv` enthält weiterhin die Spalten `Name`, `Version`, `Hersteller`, `Quelle`, `Pakettyp`, `PaketId`, `InstallDatum`, `Installationsort`, `Architektur`, `BenutzerKontext`
- `software_full.csv` enthält zusätzlich die Inventarfelder `Publisher`, `InstallDate`, `InstallLocation`, `Source`, `Sources`, `Scope`, `Architecture`, `UserSID`, `PackageType`, `DetectionConfidence`, `RawSourceKey`, `RawPath`, `ScanStatus`, `ScanMode`
- `software_full.csv` enthält zusätzlich die Updatefelder `UpdateStatus`, `UpdateAvailable`, `InstalledVersion`, `LatestVersion`, `UpdateSource`, `UpdateRaw`, `UpdateCheckedAt`
- Log enthält beim Start `ScannerContext` mit User, IsAdmin, IsSystem und ScanMode
- Jede Softwarequelle wird einzeln als `OK`, `WARN`, `SKIPPED` oder spezifische Variante wie `SKIPPED_NOT_ADMIN` protokolliert
- Updatequellen `WingetUpgrade`, `ChocoOutdated`, `PipOutdated` und `NpmOutdated` werden einzeln als `OK`, `OK_EMPTY`, `WARN` oder `SKIPPED_NOT_FOUND` protokolliert
- `Get-AppxPackage -AllUsers`, Dienste und Treiber werden als normaler Benutzer nicht erzwungen, sondern sauber übersprungen
- `Win32_Product` wird nicht verwendet

Manuelle Software-Scanner-Prüfung:

- Scan als normaler Benutzer ausführen
- Scan als Administrator ausführen
- installierte Programme mit Windows `Apps & Features` vergleichen
- Ergebnis mit `winget list` vergleichen, falls Winget vorhanden ist
- Ergebnis mit `winget upgrade` vergleichen, falls Winget vorhanden ist
- Ergebnis mit `choco outdated` vergleichen, falls Chocolatey vorhanden ist
- Ergebnis mit `python -m pip list --outdated --format=json` vergleichen, falls pip vorhanden ist
- Ergebnis mit `npm outdated -g --json` vergleichen, falls npm vorhanden ist
- JSON/CSV Export prüfen
- Web-App laden und prüfen, dass `software_standard.csv` unverändert produktiv bleibt
- Software-Tab öffnen und Ansicht `Full-Scan` wählen
- Erwartung: `software_full.json` wird kompakt als Kartenliste mit Detailbereich angezeigt
- Erwartung: vorhandene Asset-ID/Gerätename werden im Detailbereich als Asset-Kontext angezeigt
- Erwartung: Mehrfachquellen wie `Appx/MSIX` und `Winget` für dieselbe Anwendung/Version werden als ein kompakter Eintrag mit Quellenliste angezeigt
- Erwartung: Ansicht `Anwendungen` zeigt nur eigentliche Programme und verdichtet gleiche Programme über Quellen/Versionen
- Erwartung: Produktfamilien wie Chocolatey werden als ein Eintrag angezeigt
- Erwartung: zusammengeführte Rohquellen sind im Detailbereich über ein Untermenü sichtbar
- Erwartung: Ansicht `Komponenten` zeigt Runtimes, Helper, Updater und ähnliche Abhängigkeiten
- Erwartung: Ansicht `System` zeigt Windows-Komponenten, Dienste, Treiber und System-Appx-Pakete
- Erwartung: Ansicht `Alle` zeigt das vollständige Full-Scan-Inventar wieder an
- Erwartung: Full-Scan-Detail zeigt `Update-Auswertung`, `Installierte Version`, `Neueste Version` und `Update-Quelle`
- Erwartung: Einträge mit `UpdateAvailable=True` werden in der Liste als `Update` markiert

## CSV-Roundtrip

- App laden
- Daten über API laden
- unverändert per API speichern
- App/API erneut laden
- Git-Diff auf `web_ui/data` prüfen

Erwartung:

- keine unerwarteten Änderungen an CSV-Daten
- Backup-Verzeichnisse bleiben ignoriert

## Import und Export

Manuell im Browser:

- Admin Panel öffnen.
- `Notion Export ZIP`, `Excel CSV ZIP` und `Archiv ZIP` starten.
- Erwartung: Sicherheitsabfrage erscheint und danach wird eine ZIP-Datei erzeugt.
- `CSV prüfen` mit einer produktiven CSV-Kopie öffnen.
- Erwartung: Vorschau zeigt erkannte Tabelle, Trennzeichen, Zeilenzahl, Pflichtfeldprüfung und ID-Dublettenhinweise.
- Erwartung: Die CSV-Prüfung schreibt keine Daten und bietet keine direkte Übernahme an.

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

## Rollenmodus prüfen

Manuell im Browser:

- Oben rechts Rolle `Admin` wählen.
- Erwartung: Admin Panel, Stammdaten und `+ Neues Gerät erfassen` sind sichtbar.
- Rolle `Normal` wählen.
- Erwartung: Admin Panel und Stammdaten sind ausgeblendet.
- Erwartung: Schreibaktionen wie Anlegen, Bearbeiten, Löschen, CSV-Speichern und Scannerstart sind nicht erreichbar oder werden mit Hinweis blockiert.
- Zurück auf `Admin` wechseln.
- Erwartung: Admin-Funktionen sind wieder sichtbar.
