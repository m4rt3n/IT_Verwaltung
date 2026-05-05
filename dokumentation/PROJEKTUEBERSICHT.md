# Projektübersicht

## Zweck

IT-Verwaltung ist eine lokale Inventar- und Wissensdatenbank für kleine IT-Umgebungen. Der Fokus liegt auf einfacher Bedienung, CSV-Dateien als nachvollziehbare Datenbasis und lokaler Ausführung ohne zentrale Datenbank.

## Hauptbereiche

- Dashboard: Übersicht, Topologie und Statusinformationen
- Assets: Gerätebasisdaten
- Hardware: technische Ausstattung je Asset
- Software: installierte und erwartete Software
- Netzwerk: IP, MAC, VLAN, Switch-Port, Wanddose, WLAN
- Tickets: Störungen, Aufgaben und Lösungen
- Notizen: freie Betriebsnotizen
- Knowledge: wiederverwendbare Lösungsartikel
- Admin Panel: Backup, Import, Export, Stammdaten und Einstellungen

Backup, Import, Export und manuelles CSV-Speichern sind bewusst im Admin Panel gebündelt. Die Fachansichten bleiben für Bearbeitung und Auswertung zuständig.

## Datenmodell

`Asset-ID` ist der wichtigste Schlüssel. Die Tabellen `hardware`, `software`, `netzwerk`, `tickets` und `notizen` referenzieren Assets über diese ID.

ID-Format: Neue IDs nutzen kurze laufende Präfixe ohne Jahressegment, zum Beispiel `AS-0001`, `HW-0001`, `SW-0001`, `NET-0001`, `TIC-0001`, `NOTE-0001` und `KB-0001`.

CSV-Dateien:

- `web_ui/data/assets.csv`
- `web_ui/data/hardware.csv`
- `web_ui/data/software.csv`
- `web_ui/data/netzwerk.csv`
- `web_ui/data/tickets.csv`
- `web_ui/data/notizen.csv`
- `web_ui/data/knowledge.csv`

`web_ui/data/software_full.csv` ist kein produktiver Web-App-Datenbestand, sondern ein lokales Scanner-Artefakt aus dem Full-Software-Scan. Die Datei wird nicht versioniert und nicht ueber die normale Web-App-Persistenz verwaltet.

## Nächste technische Ziele

1. Versionen in README, UI, Server und Build-Info vereinheitlichen.
2. `web_ui/js/app.js` schrittweise in Module aufteilen.
3. JavaScript-Syntaxcheck dauerhaft verfügbar machen.
4. Scanner-Validierung und CSV-Headerprüfung erneut testen.
5. Dokumentationshistorie in eine kompakte `HISTORIE.md` überführen.

Siehe [HISTORIE.md](HISTORIE.md).
Planungs-Automation: [PLANUNG_AUTOMATION.md](PLANUNG_AUTOMATION.md).
