# Startdateien

Diese Datei beschreibt die vorgesehenen Einstiegspunkte.

## Web-App

- `start.bat`: Standardstart für Windows per Doppelklick
- `start.ps1`: PowerShell-Variante des Standardstarts
- `Start-Web.bat`: Kompatibilitätsalias für `start.bat`
- `Start-Web.ps1`: PowerShell-Variante für den Webstart

Alle Web-Starts verwenden `app_server.py`. Dadurch sind `/api/load`, `/api/save` und `/api/backup` verfügbar.

## Scanner

- `Start-HardwareScan.bat`: normaler Hardware-Scan
- `Start-HardwareScan-FullSoftware.bat`: Hardware-Scan mit vollständiger Softwareliste
- `Check-HardwareScanner-Syntax.bat`: reine Scanner-Syntaxprüfung ohne Scan

## Gesamter Syntaxcheck

- `Check-WebApp-Syntax.bat`: prüft Python, Scanner und JavaScript, sofern Node.js verfügbar ist

