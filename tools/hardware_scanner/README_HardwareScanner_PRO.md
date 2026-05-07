# v41 Scanner PRO

## Start

Normal:
`scripts\Start-HardwareScan.bat`

Standardsoftware separat:
`scripts\Start-SoftwareScan.bat`

Mit vollständiger Softwareliste separat:
`scripts\Start-SoftwareScan-Full.bat`

Alter Kompatibilitätsalias:
`scripts\Start-HardwareScan-FullSoftware.bat`

Der Full-Software-Scan erzeugt `web_ui/data/software_full.csv` als lokales Scanner-Artefakt. Diese Datei ist kein produktiver Web-App-Datenbestand, wird nicht versioniert und nicht ueber `/api/load`, `/api/save` oder `/api/backup` verwaltet.

## Software-Erfassung

Normaler Scan:

- `scripts\Start-HardwareScan.bat` schreibt nur Asset-, Hardware- und Netzwerkdaten
- `scripts\Start-SoftwareScan.bat` liest installierte Software aus den klassischen Windows-Uninstall-Registry-Pfaden
- `scripts\Start-SoftwareScan.bat` nutzt diese Liste zur Erkennung der definierten Standardsoftware
- `scripts\Start-SoftwareScan.bat` schreibt nur planbare Standardsoftware nach `web_ui/data/software_standard.csv`, wenn ein passendes Asset existiert

Full-Software-Scan:

- schreibt eine vollständige lokale Inventarliste nach `web_ui/data/software_full.csv`
- schreibt zusätzlich `web_ui/data/software_full.json` mit ScannerContext und Quellenstatus
- nutzt Registry-Uninstall-Pfade aus `HKLM`, `WOW6432Node`, `HKCU` und, soweit geladen, `HKEY_USERS`
- ergänzt Appx/MSIX-Pakete über `Get-AppxPackage`; `-AllUsers` nur bei Admin- oder SYSTEM-Kontext
- ergänzt Paketmanagerdaten aus `winget list`, Chocolatey, Scoop, pip/pipx und npm, falls vorhanden
- ergänzt begrenzte Portable-Erkennung über sichere Standardpfade mit Tiefen- und Dateilimit
- ergänzt Dienste und Treiber nur bei Admin- oder SYSTEM-Kontext
- protokolliert jede Quelle separat als `OK`, `WARN`, `FAIL`, `SKIPPED` oder Varianten wie `SKIPPED_NOT_ADMIN`

Spalten in `software_full.csv`:

- `Name`
- `Version`
- `Hersteller`
- `Quelle`
- `Pakettyp`
- `PaketId`
- `InstallDatum`
- `Installationsort`
- `Architektur`
- `BenutzerKontext`
- `Publisher`
- `InstallDate`
- `InstallLocation`
- `Source`
- `Sources`
- `Scope`
- `Architecture`
- `UserSID`
- `PackageType`
- `DetectionConfidence`
- `RawSourceKey`
- `RawPath`
- `ScanStatus`
- `ScanMode`

Wichtig: Der Scanner nutzt bewusst nicht `Win32_Product`, weil diese WMI-Klasse Installationsreparaturen auslösen kann und auf produktiven Windows-Systemen zu Seiteneffekten führen kann.

## ScannerContext

Beim Start erkennt der Scanner automatisch:

- normalen Benutzerkontext: `USER`
- erhöhten Administratorkontext: `ADMIN`
- SYSTEM-Kontext über SID `S-1-5-18`: `SYSTEM`

Der Scanner erzwingt keine erhöhten Rechte. Quellen, die im aktuellen Kontext nicht sicher ausführbar sind, werden übersprungen und sauber geloggt.

## Fix

Der alte Fehler `op_Addition` wurde beseitigt.

Regel:
Keine `+=` Operation auf PSCustomObject.  
Der Scanner nutzt jetzt `System.Collections.Generic.List[object]`.

## Prüfung

Nach dem Schreiben werden CSV-Dateien geprüft:
- assets.csv: Asset-ID, Gerätename
- hardware.csv: Hardware-ID, Asset-ID
- netzwerk.csv: Netzwerk-ID, Asset-ID
- software_standard.csv: Software-ID, Asset-ID

## Logs

`logs/hardware_scan_YYYYMMDD_HHMMSS.log`

## Backup

`web_ui/backups/scanner_YYYYMMDD_HHMMSS/`


## v42 Parser-Fix

PowerShell-Strings mit Variablen vor Doppelpunkt wurden korrigiert:

```powershell
"${Path}: ..."
```

Syntax prüfen:

```text
scripts\Check-HardwareScanner-Syntax.bat
```
