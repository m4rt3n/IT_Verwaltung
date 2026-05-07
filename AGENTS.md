# AGENTS.md

## Rolle von Codex

Du arbeitest in einem bestehenden lokalen IT-/Asset-/Wissensmanagement-Projekt.
Das Repository ist die technische Wahrheit. Dokumente beschreiben Ziele, aber ersetzen nicht den aktuellen Code.

## Grundregeln

- Analysiere zuerst die betroffenen Dateien und vorhandenen Datenflüsse.
- Baue keine parallelen Systeme, wenn bestehende Module erweitert werden können.
- Vermeide Breaking Changes und entferne keine bestehenden Startdateien, APIs oder Datenfelder ohne ausdrücklichen Auftrag.
- Arbeite in kleinen, prüfbaren Schritten.
- Füge keine neuen Dependencies ohne Begründung, Nutzen, Risiko und Alternative hinzu.
- Ändere Datenmodelle nur mit Backup- und Migrationshinweis.
- Halte UI, Naming und Struktur konsistent.
- Dokumentiere relevante Änderungen in `dokumentation/` oder `planung/`.
- Nenne am Ende Tests, nicht getestete Punkte und Restrisiken.

## Wichtige Dokumente

- `dokumentation/CODEX_ARBEITSKONZEPT.md`: strategische Leitlinie und Arbeitsmodus
- `dokumentation/PROJEKTUEBERSICHT.md`: tatsächlicher Projektstand und Hauptbereiche
- `dokumentation/CSV_PERSISTENZ.md`: Datenmodell, CSV-Dateien und Persistenz
- `dokumentation/SICHERHEIT_UND_ARBEITSWEISE.md`: Sicherheitsregeln und Pflichtprüfungen
- `dokumentation/TESTPLAN.md`: Mindesttests
- `planung/NEXT.md`, `planung/TODO.md`, `planung/WARTESCHLANGE.md`: Aufgabensteuerung

## Definition of Done

Eine Aufgabe ist erst fertig, wenn:

- die Änderung klein und nachvollziehbar ist,
- bestehende Funktionen absichtlich nicht gebrochen wurden,
- verfügbare Tests oder Checks ausgeführt oder begründet ausgelassen wurden,
- relevante Dokumentation aktualisiert wurde,
- offene Risiken oder manuelle Prüfschritte genannt wurden.

## Verboten ohne expliziten Auftrag

- komplettes Rewrite
- Frameworkwechsel
- Datenverlust riskieren
- bestehende Pfade unnötig verschieben
- produktive CSV-Daten mit Demo-Daten vermischen
- Scannerlogik durch ein zweites Scannersystem ersetzen
- Import-/Exportformate stillschweigend ändern
- Sicherheitsmechanismen abschwächen
