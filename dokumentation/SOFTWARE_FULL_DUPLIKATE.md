# Software-Full-Dubletten

Stand: 2026-05-06 14:40:58

## Ergebnis

- Rohzeilen vorher: 855
- Einträge nach Komprimierung: 851
- Dubletten-Gruppen: 4
- Entfernte Mehrfachzeilen: 4
- Backup: `web_ui\backups\software_full_compact_20260506_144058`

## Komprimierte Gruppen

| Anzahl | Anwendung | Version | Pakettypen | Quellen |
| ---: | --- | --- | --- | --- |
| 2 | `Macrium Reflect Free` | `8.0.7783` | `Registry, Winget` | `RegistryHKLM64, Winget` |
| 2 | `UI.Xaml.2.7` | `7.2409.9001.0` | `Appx/MSIX, Winget` | `AppxAllUsers, AppxCurrentUser, Winget` |
| 2 | `UI.Xaml.2.8` | `8.2501.31001.0` | `Appx/MSIX, Winget` | `AppxAllUsers, AppxCurrentUser, Winget` |
| 2 | `UI.Xaml.2.8` | `8.2511.26001.0` | `Appx/MSIX, Winget` | `AppxAllUsers, AppxCurrentUser, Winget` |

## Regel

- Komprimiert wird nur bei gleichem bereinigtem Anzeigenamen und gleicher normalisierter Version.
- Unterschiedliche Versionen bleiben getrennte Einträge.
- Quellen, Pakettypen und Rohnamen bleiben in `Sources`, `PackageType`, `RawNames` und `RawEntryCount` nachvollziehbar.
