# Scanner

## Grundsatz

Der Windows-Scanner bleibt ein lokales PowerShell-Werkzeug unter `tools/hardware_scanner/`.
Er ersetzt keine Web-App-Persistenz und schreibt keine produktiven Tabellen außer den bekannten CSV-Dateien.

## Startdateien

- `scripts\Start-HardwareScan.bat`: schreibt `assets.csv`, `hardware.csv`, `netzwerk.csv`
- `scripts\Start-SoftwareScan.bat`: schreibt erkannte Standardsoftware nach `software_standard.csv`
- `scripts\Start-SoftwareScan-Full.bat`: schreibt vollständige Softwareinventur nach `software_full.csv` und `software_full.json`

## ScannerContext

Beim Start erkennt der Scanner:

- `USER`: normaler Benutzer
- `ADMIN`: erhöhte Administratorrechte
- `SYSTEM`: SYSTEM-Kontext über SID `S-1-5-18`

Der Scanner erzwingt keine Administratorrechte. Nicht verfügbare Quellen werden als `SKIPPED` oder `WARN` geloggt.

## Softwarequellen

Der Full-Software-Scan prüft, jeweils einzeln abgesichert:

- Registry `HKLM` 64-bit
- Registry `HKLM` 32-bit über `WOW6432Node`
- Registry `HKCU`
- geladene Benutzerprofile unter `HKEY_USERS`
- Appx/MSIX für aktuellen Benutzer
- Appx/MSIX `-AllUsers` nur bei `ADMIN` oder `SYSTEM`
- `winget list`, falls vorhanden
- Chocolatey, falls vorhanden
- Scoop, falls vorhanden
- pip und pipx, falls vorhanden
- globales npm, falls vorhanden
- `winget upgrade`, falls Winget vorhanden ist
- `choco outdated`, falls Chocolatey vorhanden ist
- `pip list --outdated --format=json`, falls Python/pip vorhanden ist
- `npm outdated -g --json`, falls npm vorhanden ist
- begrenzte Portable-Erkennung in sicheren Standardpfaden
- Dienste nur bei `ADMIN` oder `SYSTEM`
- Treiber via `pnputil /enum-drivers` nur bei `ADMIN` oder `SYSTEM`

Nicht verwendet wird `Win32_Product`, weil diese WMI-Klasse Reparaturaktionen auslösen kann.

## Datenfelder

`software_full.csv` behält die bisherigen Spalten:

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

Zusätzlich werden technische Felder ergänzt:

- `DisplayName`
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
- `RawNames`
- `RawEntryCount`
- `ScanStatus`
- `ScanMode`
- `UpdateStatus`
- `UpdateAvailable`
- `InstalledVersion`
- `LatestVersion`
- `UpdateSource`
- `UpdateRaw`
- `UpdateCheckedAt`

`software_full.json` enthält zusätzlich `ScannerContext` und `SoftwareSourcesStatus`.
Neu erzeugte Full-Scan-Einträge enthalten außerdem `Asset-ID` und `Gerätename`, damit die Web-App sie kompakt einem Asset zuordnen kann.

## Update-Erkennung

Der Full-Software-Scan erfasst optional verfügbare Updates aus Paketmanager-Quellen.

Unterstützt:

- `winget upgrade`
- `choco outdated --limit-output`
- `python -m pip list --outdated --format=json`
- `npm outdated -g --json`

Jede Quelle wird einzeln in `SoftwareSourcesStatus` protokolliert:

- `WingetUpgrade`
- `ChocoOutdated`
- `PipOutdated`
- `NpmOutdated`

Fehlende Tools oder fehlende Rechte führen nur zu `SKIPPED`/`WARN`.
Der Scanner bricht dadurch nicht ab.
Gefundene Updates werden auf vorhandene Full-Scan-Einträge gemappt und in den neuen Update-Feldern gespeichert.

## Anzeige in der Web-App

Die normale Softwareverwaltung nutzt weiterhin `software_standard.csv` und bleibt kuratiert.
Das Full-Software-Inventar wird separat über `/api/software-full` geladen und im Software-Tab als eigene Ansicht `Full-Scan` angezeigt.

Diese Ansicht ist bewusst kompakt und in vier Bereiche getrennt:

- `Anwendungen`: eigentliche installierte Programme, stark zusammengeführt
- `Komponenten`: Runtimes, Updater, Helper, WebView, Redistributables und ähnliche Abhängigkeiten
- `System`: Windows-Komponenten, Dienste, Treiber und System-Appx-Pakete
- `Alle`: vollständiges Full-Scan-Inventar zur Kontrolle

Darstellungsregeln:

- Liste links mit Anwendung, Version, Quelle und Confidence
- Detailbereich rechts mit Softwaredaten
- Asset-Kontext rechts daneben
- doppelte Rohquellen werden nach Anzeigename und Version zusammengeführt
- Beispiel: `Appx/MSIX` und `Winget` für WhatsApp erscheinen als ein Eintrag mit mehreren Quellen
- in `Anwendungen` werden gleiche Programme über mehrere Versionen/Quellen als eine Anwendung verdichtet
- bekannte Aliase wie `7zFM`, `soffice`, `Code`, `AcroRd32` werden auf sprechende Programmnamen normalisiert
- Produktfamilien wie `Chocolatey`, `Visual Studio Code`, `Python`, `Microsoft Office` und `LibreOffice` werden in der Anwendungsliste zusammengeführt
- Adobe-Acrobat-nahe Appx-/Registry-/Winget-Funde werden zu `Adobe Acrobat` zusammengeführt, während Updater/Helper unter `Komponenten` landen
- zusammengeführte Einzelquellen bleiben im Detailbereich über ein aufklappbares Untermenü sichtbar
- keine direkte Bearbeitung des Rohinventars
- keine Übernahme in `software_standard.csv` ohne bewussten späteren Import-/Mapping-Schritt

## Grenzen

Portable Software wird absichtlich nur begrenzt erkannt. Der Scanner durchsucht keine Downloads und keine beliebig tiefen Dateisystempfade.
Browser-Erweiterungen sind vorbereitet als späteres Thema, aber aktuell nicht aktiv umgesetzt.
