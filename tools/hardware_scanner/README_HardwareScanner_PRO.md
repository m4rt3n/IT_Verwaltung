# v41 Scanner PRO

## Start

Normal:
`Start-HardwareScan.bat`

Mit vollständiger Softwareliste:
`Start-HardwareScan-FullSoftware.bat`

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
- software.csv: Software-ID, Asset-ID

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
Check-HardwareScanner-Syntax.bat
```
