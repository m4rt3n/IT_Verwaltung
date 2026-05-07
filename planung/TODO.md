# TODO

Stand: 2026-05-07

Aktive Aufgaben aus Validierung und Marktvergleich. Alle Punkte klein, pruefbar und ohne stillen Datenmodellbruch umsetzen.

## Validierung und Stabilitaet

- [x] Portbelegung im Startscreen sichtbar machen: Wenn `8765` belegt ist und der Server auf `8766+` ausweicht, die tatsaechliche URL deutlich anzeigen und dokumentieren.
- [x] Legacy-Pfad `software.csv` pruefen: Server und Scanner duerfen ihn lesen/uebernehmen, aber UI und Doku sollen konsistent `software_standard.csv` nennen.
- [x] Pruefen, ob alte Root-Batchdateien wirklich ersetzt sind oder als Kompatibilitaetsstarter erhalten bleiben muessen.
- [x] Warnung fuer fehlenden Standard-Node.js-Pfad im Admin Panel anzeigen, wenn nur Adobe-Node als Fallback genutzt wird.
- [x] Smoke-Test um `/api/save` mit bewusst unvollstaendiger Payload erweitern, ohne CSV-Dateien zu schreiben.
- [x] Smoke-Test um CSV-Header-Pruefung fuer alle produktiven CSV-Dateien erweitern.
- [x] Smoke-Test um Stammdaten-Ladepruefung erweitern.
- [x] Smoke-Test um Import-Vorschau-Helfer mit Beispiel-CSV erweitern, ohne Browser und ohne Datenuebernahme.
- [x] Check-Script-Ausgabe vereinheitlichen: Python, PowerShell, JavaScript und Smoke-Test in einer klaren Abschlussuebersicht.
- [x] Dokumentieren, welche Checks automatisch sind und welche Browser-/UAC-Schritte manuell bleiben.

## Workflow

- [x] Asset-Detailseite mit Tabs fuer Uebersicht, Hardware, Software, Netzwerk, Tickets, Notizen, Knowledge und Historie konzipieren.
- [x] Asset-Detailseite minimal umsetzen, ohne bestehende Fach-Tabs zu entfernen.
- [x] Gefuehrten Workflow `Neues Geraet vorbereiten` erstellen: Asset, Hardware, Netzwerk, Standardsoftware und Startnotiz in einem Ablauf.
- [x] Workflow `Scannerbefund pruefen` erstellen: Full-Scan-Ergebnis anzeigen, unsichere Werte markieren und manuelle Nacharbeit anbieten.
- [x] Workflow `Ticket aus Asset erstellen` ergaenzen: Asset-ID und Geraetename automatisch uebernehmen.
- [x] Workflow `Knowledge aus geloestem Ticket` ausbauen: Kategorie, Tags, Ursache und Loesung vorbefuellen und Vorschau zeigen.
- [x] Workflow `Asset umziehen` planen: Standort, Raum, Netzwerkbezug und Notiz gemeinsam aktualisieren.
- [x] Workflow `Asset ausmustern` planen: Status, Datum, Notiz, offene Tickets und Software-/Lizenzhinweise pruefen.
- [x] Workflow `Inventur bestaetigen` planen: gesehen am, gesehen von, Standort bestaetigt und Abweichung dokumentieren.
- [x] Rueckgabe-/Ausgabe-Workflow fuer Leihgeraete und Zubehoer konzipieren.

## UI und UX

- [x] Dashboard-Kacheln auf echte Arbeitsfragen ausrichten: offene Tickets, unvollstaendige Assets, fehlender Scan, Garantieablauf, Software-Risiken.
- [x] Tabellenansichten mit fester Kopfzeile und kompakter Dichte verbessern.
- [x] Detailkarten so anpassen, dass lange Namen, Seriennummern und Pfade nicht ueberlaufen.
- [x] Einheitliche Empty-States je Tab einbauen: keine Daten, keine Treffer, CSV nicht geladen.
- [x] Einheitliche Fehleranzeigen statt `alert()` fuer nichtkritische UI-Fehler einfuehren.
- [x] Modal-Formulare mit sichtbarer Pflichtfeldliste und Validierungszusammenfassung ausstatten.
- [x] Admin Panel weiter in klare Gruppen gliedern: Datensicherung, Import, Export, Scanner, Stammdaten, System.
- [x] Hilfe-Tab um Kontextlinks aus Fachansichten ergaenzen.
- [x] Tastaturbedienung pruefen: Tab-Reihenfolge, Escape in Modalen, Enter bei Suche.
- [ ] Mobile/kleine Fenster pruefen: Navigation, Admin Panel, Tabellen, Wizard und Help-Tab.

## Erkennung und Normalisierung

- [x] Scannerwerte `Desktop`, `LAN/WLAN`, leere Verbindungstypen und OEM-Platzhalter als unsicher markieren.
- [x] Normalisierungsregel fuer Hersteller anlegen: unterschiedliche Schreibweisen auf Stammdatenwerte mappen.
- [x] Normalisierungsregel fuer Softwarefamilien ausbauen: Produktname, Version und Paketquelle sauber trennen.
- [x] Software-Full-Scan-Quellen bewerten: Registry, Winget, Appx, Dienste, Treiber und Paketmanager mit Vertrauen anzeigen.
- [x] Update-Status normalisieren: `NotChecked`, `Current`, `UpdateAvailable`, `Unknown`, `Error`.
- [x] Netzwerkdaten validieren: IP-Format, MAC-Format, VLAN-Wert, statisch/DHCP-Regeln.
- [x] Doppelte Assets erkennen: gleicher Geraetename, Seriennummer, Inventarnummer oder MAC-Adresse.
- [x] Doppelte Softwareeintraege erkennen: gleicher Name, Version, Hersteller, Asset-ID.
- [x] Stammdaten-Werte aus produktiven CSVs gegen Markdown-Stammdaten pruefen.
- [x] Import-Vorschau um Vorschlag `neu`, `update`, `doppelt`, `unklar` erweitern.

## Sortierung, Filterung, Gruppierung

- [x] Mehrspaltige Sortierung in Listen ergaenzen: primaer Status, sekundar Name oder Datum.
- [x] Filterchips je Tab einfuehren: Status, Standort, Raum, Kategorie, Prioritaet, Hersteller.
- [x] Gespeicherte Filteransichten im Browser speichern, z. B. `Offene Tickets`, `Unvollstaendige Assets`.
- [x] Gruppierung in Asset-Liste nach Standort und Raum anbieten.
- [x] Gruppierung in Softwareansicht nach Hersteller, Produktfamilie, Update-Status und Kritikalitaet anbieten.
- [x] Gruppierung in Tickets nach Status, Kategorie, Prioritaet und Asset anbieten.
- [x] Filter `ohne Asset-Verknuepfung` fuer verwaiste Datensaetze einbauen.
- [x] Filter `fehlende Pflichtfelder` je Tabelle einbauen.
- [x] Filter `letzter Scan unbekannt/alt` vorbereiten.
- [x] Suchtreffer hervorheben, statt nur Listen zu reduzieren.

## Kategorisierung und Stammdaten

- [x] Kategorien fuer Asset-Typen konsolidieren: PC, Notebook, Thin Client, Drucker, Netzwerk, Peripherie, Zubehoer.
- [x] Ticket-Kategorien mit Standardursachen und typischen Loesungen verknuepfen.
- [x] Software-Kategorien definieren: Standardsoftware, Fachanwendung, Runtime, Treiber, Systemkomponente, Update-Tool.
- [x] Kritikalitaetsmodell fuer Software und Assets konkretisieren.
- [x] Statusmodell fuer Assets ausbauen: Lager, Vorbereitung, Aktiv, Reparatur, Ersatzgeraet, Ausgemustert, Entsorgt.
- [x] Netzwerktypen und Verbindungstypen fachlich sauber trennen und in der UI erklaeren.
- [x] Tags vereinheitlichen: Kleinschreibung, Trennzeichen, Dubletten und Vorschlagsliste.
- [x] Stammdaten-Editor um Vorschau `Wert wird verwendet in ...` erweitern.
- [x] Stammdaten-Export und -Import als JSON ergaenzen.
- [x] Stammdaten-Aenderungen in Historie oder Auditnotiz protokollieren.

## Markt-Paritaet ITAM/ITSM

- [x] Lizenzverwaltung modellieren: Lizenztyp, Anzahl, Ablaufdatum, Softwarebezug, Asset-Zuweisung.
- [x] Lizenz-Ueber-/Unterdeckung anzeigen: Installationen gegen erlaubte Anzahl pruefen.
- [x] Vertragsverwaltung planen: Lieferant, Laufzeit, Kuendigungsfrist, Kostenstelle, Dokumentlink.
- [x] Garantie- und Beschaffungsdaten erweitern: Kaufdatum, Lieferant, Preis, Rechnungshinweis, Ersatzdatum.
- [x] Lieferantenverwaltung als Stammdatenbereich konzipieren.
- [x] SLA-Felder fuer Tickets vorbereiten: Reaktionszeit, Zielzeit, Eskalation, Verletzung.
- [x] Wiederkehrende Tickets planen, z. B. Backuppruefung, Monatsinventur, Zertifikatscheck.
- [x] Benachrichtigungen/Erinnerungen lokal planen: Garantieablauf, Lizenzablauf, ueberfaellige Tickets.
- [x] Reservierungsfunktion fuer Leihgeraete und Raeume/Zubehoer konzipieren.
- [x] Komponentenmodell planen: RAM, Datentraeger, Akku, Dockingstation, Monitor, Netzteil als eigene Objekte.
- [x] Verbrauchsmaterialien modellieren: Toner, Kabel, Adapter, Maus, Tastatur, Headset.
- [x] Dokumentanhaenge konzipieren: Rechnung, Foto, Vertrag, Screenshot, Pruefprotokoll.
- [x] Impact-/Beziehungsansicht planen: Asset haengt an Switch, VLAN, Ticket, Vertrag, Software.
- [x] IPAM-light planen: Subnetze, freie IPs, doppelte IPs, DHCP-Bereiche, Reservierungen.
- [x] Compliance-Ansicht planen: Pflichtsoftware, Betriebssystemstand, Verschluesselung, Update-Risiko.

## Dashboard und Reporting

- [x] Datenqualitaets-Dashboard erstellen: fehlende Seriennummer, Standort, Raum, Netzwerkdaten, Pflichtsoftware.
- [x] Ticket-Kennzahlen erweitern: offen, geloest, ueberfaellig, nach Kategorie, nach Asset.
- [x] Software-Risiko-Kennzahlen anzeigen: Updates verfuegbar, unbekannter Status, kritische Software fehlt.
- [x] Netzwerk-Kennzahlen anzeigen: doppelte IP/MAC, fehlender Switch-Port, unklare VLANs.
- [x] Garantie-/Vertrags-Kennzahlen vorbereiten: bald ablaufend, abgelaufen, unbekannt.
- [x] Exportierbaren Pruefbericht als HTML oder Markdown erzeugen.
- [x] Dashboard-Zeitraumfilter vorbereiten: heute, 7 Tage, 30 Tage, Jahr.
- [x] Drilldown von Dashboard-Kachel direkt zur gefilterten Liste einbauen.
- [x] Heatmap nach Standort/Raum fuer Tickets und Datenqualitaet ausbauen.
- [x] Bericht `Inventurstatus pro Raum` konzipieren.

## Import, Export und Migration

- [ ] CSV-Import-Assistent um manuelle Zieltabellen-Auswahl erweitern.
- [ ] CSV-Import-Assistent um Spaltenmapping erweitern.
- [ ] CSV-Import-Assistent um Entwurfsmodus mit Uebernehmen/Verwerfen erweitern.
- [ ] CSV-Import-Assistent vor Uebernahme zwingend Server-Backup ausloesen lassen.
- [ ] Importprotokoll unter `logs/` oder `web_ui/backups/` schreiben.
- [ ] Archiv-ZIP um Build-Info, Status und Testbericht erweitern.
- [ ] Exportprofile im Admin Panel mit Kurzbeschreibung und erwarteter Zielsoftware anzeigen.
- [ ] Offline-Fallback fuer fehlendes JSZip pruefen oder dokumentieren.
- [ ] Demo-Daten, Seed-Daten und produktive CSVs sichtbarer voneinander trennen.
- [ ] Optionalen SQLite-Migrationspfad als Konzept dokumentieren, ohne parallel umzusetzen.

## Sicherheit und Betrieb

- [ ] Lokale Bedrohungsannahme fuer `/api/save`, `/api/backup`, `/api/scanner/start` konkretisieren.
- [ ] API-POST-Schutz um Token aus lokaler Session-Konfiguration pruefen, ohne externe Anmeldung einzufuehren.
- [ ] Schreibaktionen im Admin Panel mit genauer Vorschau der betroffenen Tabellen anzeigen.
- [ ] Backup-Retention planen: Anzahl, Alter, manuelles Loeschen, kein automatischer Datenverlust.
- [ ] Logs strukturieren: Serverstart, Scannerstart, Importpruefung, Backup, Fehler.
- [ ] Startskripte einheitlich beschriften und Version v44/v45 klaeren.
- [ ] Offline-Betrieb bewerten: Bootstrap, Icons, jQuery und JSZip lokal vendoren oder CDN bewusst erlauben.
- [ ] Rollenmodus klar als UI-Schutz kennzeichnen, nicht als Authentifizierung.
- [ ] Admin-Start mit UAC als manuellen Pruefschritt dokumentieren und nicht automatisiert erzwingen.
- [ ] Datenschutznotiz fuer lokale Inventardaten erstellen: personenbezogene Felder, Speicherort, Backup.

## Tests und Qualitaetssicherung

- [ ] Browser-Smoke-Test ohne neue Dependency pruefen: statische DOM-/HTML-Pruefung als erster Schritt.
- [ ] Playwright oder vergleichbare Browsertests nur mit Nutzen/Risiko/Alternative entscheiden.
- [ ] Testdaten fuer Import-Vorschau unter `dokumentation/` oder `tools/fixtures/` anlegen.
- [ ] CSV-Roundtrip-Test automatisieren, ohne produktive Daten dauerhaft zu veraendern.
- [x] Stammdaten-Validierung als CLI-Check bauen.
- [x] Netzwerkvalidierung als CLI-Check bauen.
- [x] Software-Full-JSON-Struktur als CLI-Check bauen.
- [x] Check auf verwaiste Asset-Referenzen in allen Tabellen bauen.
- [x] Check auf doppelte IDs in allen Tabellen bauen.
- [ ] Release-Checkliste erstellen: Syntax, Smoke, CSV-Backup, Doku, Status, Archiv-ZIP.

## Dokumentation und Hilfe

- [ ] Help-Artikel `Import-Assistent` schreiben.
- [ ] Help-Artikel `Dashboard und Kennzahlen` schreiben.
- [ ] Help-Artikel `Datenqualitaet verbessern` schreiben.
- [ ] Help-Artikel `Software normalisieren` schreiben.
- [ ] Help-Artikel `Netzwerkdaten pflegen` schreiben.
- [ ] Help-Artikel `Tickets und Knowledge sauber nutzen` schreiben.
- [ ] Help-Artikel `Backup und Wiederherstellung` um Archiv-ZIP erweitern.
- [ ] Projektuebersicht um Markt-Paritaetsziele ergaenzen.
- [ ] Architektur-Doku um geplante Service-Schicht fuer Validierung und Reporting ergaenzen.
- [ ] ROADMAP_ARCHIV als echtes Archiv leer lassen und neue Arbeit in TODO sammeln.
