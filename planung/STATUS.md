# Planungsstatus

Generiert: 2026-05-07 12:07:32

## Fortschritt

- NEXT: 0/0 erledigt (100%)
- TODO: 89/125 erledigt (71%)
- WARTESCHLANGE: 0/0 erledigt (100%)

## Naechster Arbeitsauftrag

- Quelle: `TODO`
- Abschnitt: `UI und UX`
- Zeile: `44`
- Aufgabe: Mobile/kleine Fenster pruefen: Navigation, Admin Panel, Tabellen, Wizard und Help-Tab.

## Offene Aufgaben

### NEXT
- Keine offenen Aufgaben.

### TODO
- `UI und UX`: Mobile/kleine Fenster pruefen: Navigation, Admin Panel, Tabellen, Wizard und Help-Tab.
- `Import, Export und Migration`: CSV-Import-Assistent um manuelle Zieltabellen-Auswahl erweitern.
- `Import, Export und Migration`: CSV-Import-Assistent um Spaltenmapping erweitern.
- `Import, Export und Migration`: CSV-Import-Assistent um Entwurfsmodus mit Uebernehmen/Verwerfen erweitern.
- `Import, Export und Migration`: CSV-Import-Assistent vor Uebernahme zwingend Server-Backup ausloesen lassen.
- `Import, Export und Migration`: Importprotokoll unter `logs/` oder `web_ui/backups/` schreiben.
- `Import, Export und Migration`: Archiv-ZIP um Build-Info, Status und Testbericht erweitern.
- `Import, Export und Migration`: Exportprofile im Admin Panel mit Kurzbeschreibung und erwarteter Zielsoftware anzeigen.
- `Import, Export und Migration`: Offline-Fallback fuer fehlendes JSZip pruefen oder dokumentieren.
- `Import, Export und Migration`: Demo-Daten, Seed-Daten und produktive CSVs sichtbarer voneinander trennen.
- `Import, Export und Migration`: Optionalen SQLite-Migrationspfad als Konzept dokumentieren, ohne parallel umzusetzen.
- `Sicherheit und Betrieb`: Lokale Bedrohungsannahme fuer `/api/save`, `/api/backup`, `/api/scanner/start` konkretisieren.
- `Sicherheit und Betrieb`: API-POST-Schutz um Token aus lokaler Session-Konfiguration pruefen, ohne externe Anmeldung einzufuehren.
- `Sicherheit und Betrieb`: Schreibaktionen im Admin Panel mit genauer Vorschau der betroffenen Tabellen anzeigen.
- `Sicherheit und Betrieb`: Backup-Retention planen: Anzahl, Alter, manuelles Loeschen, kein automatischer Datenverlust.
- `Sicherheit und Betrieb`: Logs strukturieren: Serverstart, Scannerstart, Importpruefung, Backup, Fehler.
- `Sicherheit und Betrieb`: Startskripte einheitlich beschriften und Version v44/v45 klaeren.
- `Sicherheit und Betrieb`: Offline-Betrieb bewerten: Bootstrap, Icons, jQuery und JSZip lokal vendoren oder CDN bewusst erlauben.
- `Sicherheit und Betrieb`: Rollenmodus klar als UI-Schutz kennzeichnen, nicht als Authentifizierung.
- `Sicherheit und Betrieb`: Admin-Start mit UAC als manuellen Pruefschritt dokumentieren und nicht automatisiert erzwingen.
- `Sicherheit und Betrieb`: Datenschutznotiz fuer lokale Inventardaten erstellen: personenbezogene Felder, Speicherort, Backup.
- `Tests und Qualitaetssicherung`: Browser-Smoke-Test ohne neue Dependency pruefen: statische DOM-/HTML-Pruefung als erster Schritt.
- `Tests und Qualitaetssicherung`: Playwright oder vergleichbare Browsertests nur mit Nutzen/Risiko/Alternative entscheiden.
- `Tests und Qualitaetssicherung`: Testdaten fuer Import-Vorschau unter `dokumentation/` oder `tools/fixtures/` anlegen.
- `Tests und Qualitaetssicherung`: CSV-Roundtrip-Test automatisieren, ohne produktive Daten dauerhaft zu veraendern.
- `Tests und Qualitaetssicherung`: Release-Checkliste erstellen: Syntax, Smoke, CSV-Backup, Doku, Status, Archiv-ZIP.
- `Dokumentation und Hilfe`: Help-Artikel `Import-Assistent` schreiben.
- `Dokumentation und Hilfe`: Help-Artikel `Dashboard und Kennzahlen` schreiben.
- `Dokumentation und Hilfe`: Help-Artikel `Datenqualitaet verbessern` schreiben.
- `Dokumentation und Hilfe`: Help-Artikel `Software normalisieren` schreiben.
- `Dokumentation und Hilfe`: Help-Artikel `Netzwerkdaten pflegen` schreiben.
- `Dokumentation und Hilfe`: Help-Artikel `Tickets und Knowledge sauber nutzen` schreiben.
- `Dokumentation und Hilfe`: Help-Artikel `Backup und Wiederherstellung` um Archiv-ZIP erweitern.
- `Dokumentation und Hilfe`: Projektuebersicht um Markt-Paritaetsziele ergaenzen.
- `Dokumentation und Hilfe`: Architektur-Doku um geplante Service-Schicht fuer Validierung und Reporting ergaenzen.
- `Dokumentation und Hilfe`: ROADMAP_ARCHIV als echtes Archiv leer lassen und neue Arbeit in TODO sammeln.

### WARTESCHLANGE
- Keine offenen Aufgaben.

## Dokumentation

- `dokumentation/ANIMIERTES_DASHBOARD.md`
- `dokumentation/ARCHITEKTUR.md`
- `dokumentation/ASSETS_CRUD.md`
- `dokumentation/BEDINGTE_LOGIK.md`
- `dokumentation/BUILD_CHECK_V26_5.md`
- `dokumentation/BUILD_CHECK_V26_6.md`
- `dokumentation/BUILD_CHECK_V27.md`
- `dokumentation/BUILD_CHECK_V28.md`
- `dokumentation/BUILD_CHECK_V30_2.md`
- `dokumentation/BUILD_CHECK_V31.md`
- `dokumentation/BUILD_CHECK_V33.md`
- `dokumentation/BUILD_CHECK_V37.md`
- `dokumentation/BUILD_CHECK_V40.md`
- `dokumentation/BUILD_CHECK_V42.md`
- `dokumentation/BUILD_CHECK_V43.md`
- `dokumentation/CODEX_ARBEITSKONZEPT.md`
- `dokumentation/CSV_PERSISTENZ.md`
- `dokumentation/ERLEDIGTE_NEXT_AUFGABEN.md`
- `dokumentation/HARDWARE_TOOLBAR_FIX.md`
- `dokumentation/HELP_BEREICH.md`
- `dokumentation/HERSTELLER_ABHAENGIGKEITEN.md`
- `dokumentation/HISTORIE.md`
- `dokumentation/IMPORT_EXPORT_KONZEPT.md`
- `dokumentation/ITAM_ITSM_MODELL.md`
- `dokumentation/KONTEXTGRUPPEN.md`
- `dokumentation/NETWORK_DROPDOWN_FIX_V24.md`
- `dokumentation/NETWORK_FILTERING_V23.md`
- `dokumentation/PLANUNG_AUTOMATION.md`
- `dokumentation/PROJEKTUEBERSICHT.md`
- `dokumentation/REFERENZ_ERSTELLUNG.md`
- `dokumentation/REPOSITORY_AUDIT.md`
- `dokumentation/ROADMAP_ARCHIV.md`
- `dokumentation/ROLLEN_RECHTE.md`
- `dokumentation/SAFE_UX_LOGIC.md`
- `dokumentation/SCANNER.md`
- `dokumentation/SICHERHEIT_UND_ARBEITSWEISE.md`
- `dokumentation/SICHERHEITS_CHECKS_2026_05_07.md`
- `dokumentation/SOFTWARE_AUSWERTUNG.md`
- `dokumentation/SOFTWARE_FULL_DUPLIKATE.md`
- `dokumentation/SOFTWARE_FULL_PRODUKTFAMILIEN.md`
- `dokumentation/SOFTWARE_SMART_V26.md`
- `dokumentation/STAMMDATEN_UI_UPGRADE.md`
- `dokumentation/STARTDATEIEN.md`
- `dokumentation/TAB_GRUPPEN.md`
- `dokumentation/TESTPLAN.md`
- `dokumentation/TOPOLOGIE_DASHBOARD.md`
- `dokumentation/UI_UX_LEITLINIE.md`
- `dokumentation/V25_CLEAN_UX_ADMIN.md`
