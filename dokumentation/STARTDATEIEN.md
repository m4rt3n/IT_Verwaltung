# Startdateien

Diese Datei beschreibt die vorgesehenen Einstiegspunkte.

## Web-App

- `start.bat`: Standardstart für Windows per Doppelklick; prüft Administratorrechte und startet sich bei Bedarf per UAC-Abfrage neu
- `start.ps1`: PowerShell-Variante des Standardstarts
- `scripts/Start-Web.bat`: Kompatibilitätsalias für `start.bat`
- `scripts/Start-Web.ps1`: PowerShell-Variante für den Webstart

Im Projektroot bleiben bewusst nur `start.bat` und `start.ps1` als Web-App-Einstiegspunkte vorgesehen. Weitere Startdateien liegen unter `scripts/`, damit alte Verknüpfungen über die Kompatibilitätsaliasse funktionieren, ohne neue Root-Starter zu verteilen.

Alle Web-Starts verwenden `app_server.py`. Dadurch sind `/api/load`, `/api/save` und `/api/backup` verfügbar.
Der Batch-Start mit Administratorrechten ist vor allem für Scanner-Starts aus der Web-App gedacht. Der lokale Rollenmodus bleibt davon unabhängig und ist weiterhin keine echte Authentifizierung.

Der Server bevorzugt Port `8765`. Wenn dieser Port belegt ist, sucht er den naechsten freien Port und zeigt in der Konsole eine hervorgehobene `START-URL`, zum Beispiel `http://localhost:8766`. Diese tatsaechliche URL ist massgeblich.

## Scanner

- `scripts/Start-HardwareScan.bat`: Hardware-, Asset- und Netzwerkdaten scannen
- `scripts/Start-SoftwareScan.bat`: Standardsoftware separat scannen
- `scripts/Start-SoftwareScan-Full.bat`: vollständige Softwareliste separat scannen
- `scripts/Start-HardwareScan-FullSoftware.bat`: alter Kompatibilitätsalias für `scripts/Start-SoftwareScan-Full.bat`
- `scripts/Check-HardwareScanner-Syntax.bat`: reine Scanner-Syntaxprüfung ohne Scan

## Gesamter Syntaxcheck

- `scripts/Check-WebApp-Syntax.bat`: prüft Python, Scanner, JavaScript und ruft anschließend den Smoke-Test auf, sofern Node.js verfügbar ist
