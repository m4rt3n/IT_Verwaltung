# Projektübersicht

## Zweck

IT-Verwaltung ist eine lokale Inventar- und Wissensdatenbank für kleine IT-Umgebungen. Der Fokus liegt auf einfacher Bedienung, CSV-Dateien als nachvollziehbare Datenbasis und lokaler Ausführung ohne zentrale Datenbank.

Strategische Leitlinie: [CODEX_ARBEITSKONZEPT.md](CODEX_ARBEITSKONZEPT.md). Das Repository bleibt Source of Truth; das Konzept beschreibt Richtung und Arbeitsweise.

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

## Asset-Detailansicht

Die Asset-Detailseite bleibt Teil des bestehenden Assets-Tabs und ersetzt keine Fachansicht. Sie bündelt die wichtigsten Referenzen eines Assets in internen Registern:

- Übersicht: Stammdaten, Standort, Nutzer, Hersteller, Modell und Inventarbezug
- Hardware: technische Ausstattung aus `hardware.csv`
- Software: Standardsoftware aus `software_standard.csv`
- Netzwerk: IP-, MAC-, VLAN- und Anschlussdaten aus `netzwerk.csv`
- Tickets: offene und gelöste Vorgänge zum Asset
- Notizen: Betriebsnotizen zum Asset
- Knowledge: verknüpfte Wissensartikel über Ticket-Referenzen
- Historie: erste abgeleitete Chronik aus Status, Tickets, Notizen und Software

Dieses Muster ist bewusst minimal gehalten: Es schafft einen zusammenhängenden Arbeitskontext, ohne neue Datenmodelle, neue Speicherformate oder parallele Detailseiten einzuführen.

## Geführte Workflows

Die Workflows bauen auf den vorhandenen CSV-Tabellen und Dialogen auf:

- `Neues Gerät vorbereiten`: Der bestehende Geräte-Wizard legt Asset, Hardware, Netzwerk, Standardsoftware und Startnotiz in einem Ablauf an.
- Die Standardsoftware-Auswahl enthält kuratierte Windows-Paketgruppen für Browser, Office, Paketmanager, Runtimes, Systemtools, Diagnose, Entwicklung sowie Medien/Grafik. Winget-Paket-IDs werden in der Software-Bemerkung dokumentiert. Die Standardkarten arbeiten scan-getrieben: erkannte Standardsoftware wird nur dem eindeutig gescannten Asset zugeordnet, während Roh- und Zusatzfunde im Full-Scan bleiben.
- `Scannerbefund prüfen`: Full-Scan-Details können als Nacharbeitsnotiz am zugeordneten Asset dokumentiert werden.
- `Ticket aus Asset erstellen`: Die Asset-Detailansicht öffnet ein vorausgefülltes Ticket mit `Asset-ID` und `Gerätename`.
- `Knowledge aus gelöstem Ticket`: Gelöste Tickets erzeugen nach Vorschau einen Knowledge-Eintrag mit Kategorie, Tags, Ursache, Lösung und Ticket-Quelle.
- `Asset umziehen`, `Asset ausmustern`, `Inventur bestätigen` und `Ausgabe/Rückgabe`: Die Asset-Detailansicht erzeugt vorbereitete Workflow-Notizen. Status- und Datenänderungen bleiben bewusst manuell prüfbar.

## UI/UX-Stand

- Dashboard-Kacheln zeigen operative Arbeitsfragen statt nur Tabellenmengen: offene Tickets, unvollständige Assets, fehlende Scans, Garantieablauf und Software-Risiken.
- Eine Arbeitsqueue im Dashboard bündelt Scan-Standardsoftware, Software-Risiken und Asset-Pflichtdaten als direkte Sprungpunkte.
- Tabellen nutzen kompakte Darstellung mit festem Kopf und robustem Umbruch für lange Namen, Seriennummern, Pfade und Freitext.
- Fachansichten zeigen eine Workflow-Leiste mit Status, nächster Aktion und Kontext-Hilfe.
- Fachansichten unterscheiden leere Daten, Suchtreffer ohne Ergebnis und fehlendes CSV-Backend.
- Formularmodale zeigen eine Pflichtfeldübersicht, bevor gespeichert wird.
- Fachansichten bieten einen Hilfe-Button mit Kontextsprung in den Hilfe-Tab.
- Die globale Suche kann per `Escape` geleert und per `Enter` erneut angewendet werden.
- Tastatur-Shortcuts: `/` fokussiert die Suche, Pfeiltasten navigieren Listen, `Ctrl+S` speichert ein geöffnetes Bearbeitungsmodal.
- Knowledge-Artikel zeigen Lösungstexte in lesbaren Abschnitten und ergänzen titelbasierte Prüf-/Diagnosebefehle. Diese Befehle werden nur für das jeweilige Knowledge-Thema angezeigt, nicht global nach Kategorie verteilt.
- Knowledge-Titel bleiben assetneutral. Wenn ein Artikel aus einem konkreten Gerät entstanden ist, erfolgt die Zuordnung über Tags, Tickets oder Notizen, nicht über einen Asset-Präfix im Titel.

## Erkennung und Normalisierung

- Scanner- und Full-Scan-Werte markieren unsichere Hinweise wie `Desktop`, `LAN/WLAN`, leere Verbindungstypen und OEM-Platzhalter.
- Hersteller werden über eine einfache Normalisierungsregel auf Stammdatenwerte zurückgeführt, z. B. Microsoft/Dell/HP/Adobe-Schreibweisen.
- Software-Full-Scan-Details zeigen Produktfamilie, extrahierte Version, Paketquelle, Quellenvertrauen und normalisierten Update-Status.
- Netzwerkvalidierung prüft statisch/DHCP-Regeln, IPv4, MAC-Format und VLAN-Bereich.
- Das Dashboard meldet doppelte Asset- und Software-Schlüssel sowie Stammdatenabweichungen.
- Die CSV-Import-Vorschau klassifiziert Zeilen als `neu`, `update`, `doppelt` oder `unklar`, schreibt aber weiterhin keine Daten.

## Sortierung, Filterung und Gruppierung

- Fachlisten nutzen eine gemeinsame Listensteuerung mit Sortierung nach Status/Name oder Datum.
- Filterfelder werden pro Tab angeboten, z. B. Status, Standort, Raum, Kategorie, Priorität, Hersteller, Update-Status und Kritikalität.
- Gespeicherte Browser-Ansichten decken offene Tickets, fehlende Pflichtfelder, verwaiste Datensätze und Assets ohne Full-Scan-Kontext ab.
- Assets können nach Standort oder Raum gruppiert werden, Software nach Hersteller, Produktfamilie, Update-Status oder Kritikalität, Tickets nach Status, Kategorie, Priorität oder Asset.
- Suchtreffer werden in Tabellenzellen hervorgehoben.

## Kategorisierung und Stammdaten

- Asset-Typen sind fachlich auf Geräte, Netzwerk, Peripherie und Zubehör ausgerichtet; `Access Point`, `Switch` und `Monitor` bleiben als konkrete Werte erhalten.
- Ticket-, Software-, Status- und Kritikalitätsmodelle werden im Stammdatenbereich als fachliche Leitplanken angezeigt.
- Netzwerktyp und Verbindungstyp bleiben getrennt: Netzwerktyp beschreibt die Klasse, Verbindungstyp die konkrete Anbindung.
- Tags werden beim Speichern vereinheitlicht: Kleinschreibung, Semikolon-Trennung und Dublettenentfernung.
- Der Stammdaten-Editor zeigt, ob Werte in produktiven CSV-Daten verwendet werden, warnt vor Umbenennung genutzter Werte und verhindert Löschung genutzter Werte. Interne Objektbereiche wie Full-Software-Kontext oder Klassifikationskonfiguration werden dabei bewusst nicht als CSV-Zeilentabellen behandelt.
- Stammdaten können als gestempeltes JSON exportiert und aus JSON importiert werden. Änderungen werden lokal im Browser-Audit (`localStorage`) protokolliert.

## Markt-Parität

Marktnahe ITAM/ITSM-Erweiterungen sind in [ITAM_ITSM_MODELL.md](ITAM_ITSM_MODELL.md) als vorbereitete Daten- und Prozessmodelle beschrieben. Sie werden erst nach Backup- und Migrationsentscheidung in produktive CSV-Strukturen übernommen.

## Reporting

Das Dashboard zeigt Datenqualität, Ticket-, Software-, Netzwerk- und Garantiehinweise. Kacheln führen per Drilldown in gefilterte Listen. Ein Markdown-Prüfbericht kann lokal exportiert werden.

Berichtsidee `Inventurstatus pro Raum`: Assets je Raum, fehlende Serien-/Inventarnummer, fehlende Netzwerkdaten, offene Tickets und letzte Inventurnotiz.

## Datenmodell

`Asset-ID` ist der wichtigste Schlüssel. Die Tabellen `hardware`, `software`, `netzwerk`, `tickets` und `notizen` referenzieren Assets über diese ID.

ID-Format: Neue IDs nutzen kurze laufende Präfixe ohne Jahressegment, zum Beispiel `AS-0001`, `HW-0001`, `SW-0001`, `NET-0001`, `TIC-0001`, `NOTE-0001` und `KB-0001`.

CSV-Dateien:

- `web_ui/data/assets.csv`
- `web_ui/data/hardware.csv`
- `web_ui/data/software_standard.csv`
- `web_ui/data/netzwerk.csv`
- `web_ui/data/tickets.csv`
- `web_ui/data/notizen.csv`
- `web_ui/data/knowledge.csv`

`web_ui/data/software_full.csv` ist kein produktiver Web-App-Datenbestand, sondern ein lokales Scanner-Artefakt aus dem Full-Software-Scan. Die Datei wird nicht versioniert und nicht ueber die normale Web-App-Persistenz verwaltet.

Demo- und Seed-Daten sind davon getrennt: `web_ui/demo_data.json` dient als Beispiel-/Testvorlage, `SEED` in `web_ui/js/app-config.js` als Browser-Fallback. Das Admin Panel zeigt produktive CSVs, Scannerartefakte und Demo/Seed im Bereich `Datenbereiche` getrennt an.

## Nächste technische Ziele

Die kurzfristige Queue wurde am 2026-05-07 in fuehrende Dokumentation ueberfuehrt. Neue Arbeit soll wieder als kleine, konkrete Aufgabe begonnen werden und nicht als zweite Roadmap neben der Dokumentation wachsen.

Fuehrende Dokumente:

- [ARCHITEKTUR.md](ARCHITEKTUR.md)
- [REPOSITORY_AUDIT.md](REPOSITORY_AUDIT.md)
- [UI_UX_LEITLINIE.md](UI_UX_LEITLINIE.md)
- [JS_MODULARISIERUNG.md](JS_MODULARISIERUNG.md)
- [IMPORT_EXPORT_KONZEPT.md](IMPORT_EXPORT_KONZEPT.md)
- [ROADMAP_ARCHIV.md](ROADMAP_ARCHIV.md)
- [SICHERHEITS_CHECKS_2026_05_07.md](SICHERHEITS_CHECKS_2026_05_07.md)

Siehe [HISTORIE.md](HISTORIE.md).
Planungs-Automation: [PLANUNG_AUTOMATION.md](PLANUNG_AUTOMATION.md).
