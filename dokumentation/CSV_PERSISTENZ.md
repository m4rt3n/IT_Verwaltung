# CSV Persistenz

## Start

```text
start.bat
```

## Speichern

Die Weboberfläche sendet Änderungen an:

```text
/api/save
```

Der lokale Python-Server schreibt danach in:

```text
web_ui/data/*.csv
```

## Backup

Vor jedem Speichern wird automatisch ein Backup erstellt:

```text
web_ui/backups/backup_YYYYMMDD_HHMMSS/
```

## Neustart

Beim Neustart werden die CSV-Dateien aus `web_ui/data/` geladen.
Damit bleiben Änderungen erhalten.

## Datenbereiche

Produktive CSV-Dateien, Demo-/Seed-Daten und Scannerartefakte werden bewusst getrennt behandelt:

- Produktive Tabellen: `assets.csv`, `hardware.csv`, `software_standard.csv`, `netzwerk.csv`, `tickets.csv`, `notizen.csv` und `knowledge.csv` unter `web_ui/data/`. Nur diese Dateien werden durch `/api/load`, `/api/save` und `/api/backup` als normaler Arbeitsdatenbestand verwaltet.
- Demo-Daten: `web_ui/demo_data.json` ist eine Vorlage fuer Test- und Beispielzustände. Sie darf nicht still in produktive CSVs gemischt werden.
- Browser-Seed: `SEED` in `web_ui/js/app-config.js` ist ein Fallback fuer lokale Browserdaten, wenn kein gespeicherter Browserzustand vorhanden ist.
- Scannerartefakte: `software_full.csv` und `software_full.json` unter `web_ui/data/` sind Roh-/Diagnoseausgaben des Full-Software-Scans und keine produktiven Tabellen.

Das Admin Panel zeigt diese Bereiche unter `Datenbereiche` sichtbar getrennt an. Diese Anzeige ist rein informativ und schreibt keine Daten.

## Optionale SQLite-Migration

CSV bleibt die aktuelle produktive Persistenz. Ein moeglicher spaeterer SQLite-Wechsel ist nur als kontrollierter Migrationspfad dokumentiert und wird nicht parallel aktiviert. Details stehen in `SQLITE_MIGRATION_KONZEPT.md`.

## Spaltenabgleich

Stand: 2026-05-05

Die produktiven Tabellen aus `app_server.py` stimmen mit den vorhandenen CSV-Headern ueberein:

| Tabelle | Datei | Spalten | Server | Scanner |
| --- | --- | ---: | --- | --- |
| assets | `assets.csv` | 15 | ja | ja |
| hardware | `hardware.csv` | 10 | ja | ja |
| software | `software_standard.csv` | 10 | ja | ja |
| netzwerk | `netzwerk.csv` | 15 | ja | ja |
| tickets | `tickets.csv` | 11 | ja | nein |
| notizen | `notizen.csv` | 7 | ja | nein |
| knowledge | `knowledge.csv` | 5 | ja | nein |

Der Scanner bearbeitet aktuell nur `assets`, `hardware`, `software` und `netzwerk`. Das ist passend, weil Tickets, Notizen und Knowledge manuell bzw. in der Web-App gepflegt werden.

`software_standard.csv` ist die produktive Web-App-Tabelle für planbare Standardsoftware und relevante Softwarezuordnungen.

`software_full.csv` ist ein Scan-Artefakt. Die Datei wird nur beim separaten Full-Software-Scan erzeugt. Die bisherigen Spalten `Name`, `Version`, `Hersteller`, `Quelle`, `Pakettyp`, `PaketId`, `InstallDatum`, `Installationsort`, `Architektur` und `BenutzerKontext` bleiben erhalten. Ergänzt werden technische Inventarfelder wie `DisplayName`, `Publisher`, `InstallDate`, `InstallLocation`, `Source`, `Sources`, `Scope`, `Architecture`, `UserSID`, `PackageType`, `DetectionConfidence`, `RawSourceKey`, `RawPath`, `RawNames`, `RawEntryCount`, `ScanStatus` und `ScanMode`. Sie ist nicht in `app_server.py` als produktive Tabelle eingebunden und wird deshalb nicht durch `/api/load`, `/api/save` oder `/api/backup` verwaltet.

## Entscheidung zu `software_full.csv`

Stand: 2026-05-05

`software_full.csv` bleibt ein lokales Scanner-Artefakt und wird nicht als produktive Web-App-Tabelle behandelt.

Gruende:

- Die Datei kann sehr gross werden und ist eher Diagnose-/Inventar-Rohmaterial als kuratierter Datenbestand.
- Die Web-App nutzt fuer planbare Softwareverwaltung `software_standard.csv`.
- `software_full.csv` wird bei Full-Software-Scans neu erzeugt und soll keine manuell gepflegten Daten enthalten.
- Die Datei bleibt in `.gitignore`, damit lokale Softwareinventare nicht versehentlich versioniert werden.
- Der Full-Software-Scan darf deutlich mehr Quellen erfassen als die Web-App-Tabelle `software_standard.csv`: Registry-Uninstall, geladene Benutzerprofile, Appx/MSIX, Winget, Chocolatey, Scoop, pip/pipx, npm, begrenzte Portable-Erkennung, Dienste und Treiber.
- `software_full.json` enthält dieselben Softwaredaten plus `ScannerContext` und Quellenstatus. Auch diese Datei ist ein lokales Scan-Artefakt.
- Hardware- und Software-Scan sind getrennt: `scripts\Start-HardwareScan.bat` schreibt keine Softwaredaten, `scripts\Start-SoftwareScan*.bat` schreibt keine Hardware- oder Netzwerkdaten.

Konsequenz:

- `software_full.csv` bleibt aus `TABLE_FILES` in `app_server.py` heraus.
- `software.csv` ist nur noch ein Legacy-Name. Server und Scanner können ihn lesen/übernehmen, schreiben aber aktiv nach `software_standard.csv`.
- `/api/load`, `/api/save` und `/api/backup` verwalten nur die produktiven Tabellen.
- Wenn spaeter eine UI-Auswertung fuer vollstaendige Softwarelisten gebaut wird, sollte dafuer eine separate Import-/Analysefunktion entstehen, nicht dieselbe Persistenzlogik wie fuer Stammdaten.

## Bewertung

- Kein akuter Spaltenkonflikt zwischen Server, Scanner und produktiven CSV-Dateien.
- `software_full.csv` ist bewusst als Scan-Artefakt festgelegt.
- Weitere UI- oder Serverlogik fuer vollstaendige Softwarelisten sollte diese Trennung beibehalten.

## ID-Standard

Stand: 2026-05-05

Neue IDs verwenden das kurze laufende Format ohne Jahressegment:

| Tabelle | ID-Spalte | Praefix | Beispiel |
| --- | --- | --- | --- |
| assets | `Asset-ID` | `AS-` | `AS-0001` |
| hardware | `Hardware-ID` | `HW-` | `HW-0001` |
| software | `Software-ID` | `SW-` | `SW-0001` |
| netzwerk | `Netzwerk-ID` | `NET-` | `NET-0001` |
| tickets | `Ticket-ID` | `TIC-` | `TIC-0001` |
| notizen | `Notiz-ID` | `NOTE-` | `NOTE-0001` |
| knowledge | `Knowledge-ID` | `KB-` | `KB-0001` |

Die Web-App normalisiert alte Jahres-IDs wie `AS-2026-0001` beim Laden in das kurze Format `AS-0001`. Bestehende produktive CSV-Dateien werden dadurch nicht automatisch umgeschrieben; eine Speicherung ueber die Web-App wuerde die aktuell geladenen, normalisierten IDs schreiben.

## Pflichtfelder

Stand: 2026-05-05

Pflichtfelder sind bewusst minimal definiert. Sie sichern Identitaet, Referenzen und Anzeige, ohne Scanner-Teilergebnisse oder optionale fachliche Details zu blockieren.

| Tabelle | Pflichtfelder |
| --- | --- |
| assets | `Asset-ID`, `Gerätename`, `Asset-Typ`, `Status` |
| hardware | `Hardware-ID`, `Asset-ID`, `Gerätename` |
| software | `Software-ID`, `Asset-ID`, `Gerätename`, `Softwarename` |
| netzwerk | `Netzwerk-ID`, `Asset-ID`, `Gerätename`, `Netzwerktyp`, `Adressart` |
| tickets | `Ticket-ID`, `Asset-ID`, `Gerätename`, `Titel`, `Status` |
| notizen | `Notiz-ID`, `Asset-ID`, `Gerätename`, `Titel` |
| knowledge | `Knowledge-ID`, `Titel`, `Lösung` |

Die Web-App prueft diese Felder vor dem CSV-Speichern. Der Python-Server prueft dieselbe Matrix vor dem Schreiben und bricht den Speichervorgang ab, wenn Pflichtfelder fehlen.
