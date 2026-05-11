# SQLite-Migrationspfad

Stand: 2026-05-11

Dieses Dokument beschreibt einen optionalen spaeteren Weg von CSV zu SQLite. Es ist kein Umsetzungsauftrag und fuehrt keine zweite produktive Datenhaltung ein.

## Ausgangslage

Aktuell sind die CSV-Dateien unter `web_ui/data/` die technische Wahrheit fuer produktive Web-App-Daten. Der lokale Server liest und schreibt diese Dateien ueber `/api/load`, `/api/save` und `/api/backup`.

Scannerartefakte wie `software_full.csv` und `software_full.json` bleiben getrennt. Demo- und Seed-Daten bleiben Vorlagen beziehungsweise Browser-Fallbacks.

## Zielbild

SQLite waere nur sinnvoll, wenn CSV an Grenzen kommt:

- groessere Datenmengen mit haeufigen Schreibvorgaengen,
- stabilere Abfragen ueber mehrere Tabellen,
- Historisierung und Auditlog,
- kontrollierte Transaktionen,
- spaetere Berichte ohne viele Browser-Hilfsberechnungen.

Das Ziel waere eine lokale Einzeldatei-Datenbank, keine zentrale Serverdatenbank.

## Nicht-Ziele

- kein paralleler Dauerbetrieb von CSV und SQLite,
- kein stiller Wechsel der produktiven Datenquelle,
- keine automatische Migration ohne Backup und Pruefbericht,
- keine neuen Felder ohne dokumentierte Migration,
- kein Ersatz fuer den vorhandenen CSV-Export.

## Phasen

1. Konzept und Schema

   Die bestehenden CSV-Tabellen werden eins zu eins als SQLite-Tabellen modelliert. Pflichtfelder, ID-Spalten und Asset-Referenzen bleiben unveraendert.

2. Nur-Lese-Prototyp

   Ein einmaliger Import liest CSV-Dateien in eine temporaere SQLite-Datei. Die Web-App schreibt weiterhin CSV. Der Prototyp dient nur zum Pruefen von Schema, Abfragen und Datenqualitaet.

3. Vergleichsbericht

   CSV und SQLite werden zeilenweise verglichen: Tabellenanzahl, IDs, Pflichtfelder, Referenzen und auffaellige Typkonvertierungen. Abweichungen blockieren jede weitere Migration.

4. Export-/Rueckweg

   Vor einem produktiven Wechsel muss SQLite wieder vollstaendig in die bisherigen CSV-Dateien exportierbar sein. CSV bleibt damit Wiederherstellungs- und Austauschformat.

5. Bewusster Umschaltpunkt

   Erst nach Backup, Testbericht, manueller Bestaetigung und dokumentierter Rueckfallstrategie duerfte `app_server.py` eine SQLite-Repository-Schicht nutzen.

## Mindest-Schema

Die erste SQLite-Version wuerde nur die bestehenden produktiven Tabellen enthalten:

- `assets`
- `hardware`
- `software`
- `netzwerk`
- `tickets`
- `notizen`
- `knowledge`

Primaerschluessel bleiben die vorhandenen ID-Spalten. Fremdbeziehungen werden fachlich ueber `Asset-ID` und `Knowledge-ID` dokumentiert und erst nach erfolgreichem Datenabgleich technisch erzwungen.

## Sicherheitsregeln

- Vor jedem Migrationslauf wird ein normales CSV-Backup erstellt.
- Migrationen schreiben nie direkt in produktive CSVs.
- Ein Migrationsprotokoll nennt Quelle, Ziel, Tabellen, Zeilenzahlen, Fehler und Pruefsummen.
- Product Keys, lokale Scannerrohdaten und Demo-/Seed-Daten werden nicht automatisch in die SQLite-Datenbank uebernommen.
- `software_full.*` bleibt ein Scannerartefakt oder bekommt spaeter eine eigene Rohdaten-Tabelle ausserhalb der produktiven Kernpersistenz.

## Entscheidung

SQLite bleibt eine vorbereitete Option. Solange CSV fuer Betrieb, Backup, Import/Export und manuelle Wartung ausreicht, wird keine parallele SQLite-Datenhaltung aufgebaut.
