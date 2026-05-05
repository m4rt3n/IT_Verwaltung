# TODO

Aktive Aufgaben, die abarbeitbar und konkret genug sind.

## Stabilitaet

- [x] Manuelle Schreibaktionen mit Sicherheitsabfrage versehen.
- [x] CSV-Speichern serverseitig gegen unvollstaendige Payloads absichern.
- [x] Doppelte `renderSoftwareStatus()`-Definition entfernen.
- [x] Scanner-CSV-Headerpruefung gegen BOM und Anfuehrungszeichen absichern.
- [x] `CORE.isSoftwareInstalled` sauber in den Core-Layer verschieben oder alle Aufrufe auf `isSoftwareInstalled()` umstellen.
- [x] Top-Level-Code in `app.js` pruefen: keine Funktion darf beim Laden auf noch nicht initialisierte Objekte zugreifen.
- [x] `BUILD_INFO` nicht doppelt pflegen: Quelle sollte `web_ui/build-info.json` sein.
- [x] Server-Kommentar und Konsolenausgabe in `app_server.py` auf aktuellen Stand bringen.
- [x] Fehlerbehandlung im Scanner verbessern, wenn CIM/WMI-Zugriff verweigert wird.

## Datenmodell

- [x] CSV-Spalten zwischen `app_server.py`, Scanner und bestehenden CSV-Dateien vergleichen.
- [x] Entscheiden, ob `software_full.csv` produktive Daten oder nur Scan-Artefakt ist.
- [x] IDs vereinheitlichen: aktueller Datenbestand nutzt teils `AS-0003`, Seed-Daten nutzen `AS-2026-0001`.
- [x] Pflichtfelder je Tabelle definieren.

## Bedienung

- [x] Admin Panel als zentralen Ort fuer Backup, Import, Export und CSV-Speichern beibehalten.
- [x] Such- und Filterlogik je Tab testen.
- [ ] Stammdaten-Reload mit sichtbarer Erfolg-/Fehlermeldung versehen.
- [ ] Scanner-Start deutlicher trennen: normaler Scan, Full-Software-Scan, reiner Syntaxcheck.

## Dokumentation

- [ ] `README.md` kuerzen: aktueller Start, Zweck, Datenordner, Backup-Konzept, Scanner.
- [ ] Alte Build-Abschnitte aus `README.md` in Historie verschieben.
- [ ] Kurze Entwicklerregel beibehalten: keine globalen Regex-Patches, Syntaxcheck vor Build.
