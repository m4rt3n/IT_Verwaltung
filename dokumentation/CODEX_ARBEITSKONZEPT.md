# Codex-Arbeitskonzept

Version: 2.0
Status: Arbeitsgrundlage

## Zweck

Dieses Dokument nimmt das Masterkonzept für das Projekt auf, ohne eine zweite Projektstruktur neben `dokumentation/`, `planung/`, `web_ui/` und `tools/` aufzubauen.

Das bestehende Repository bleibt die technische Wahrheit. Dieses Konzept beschreibt Richtung, Arbeitsweise und Qualitätsmaßstab.

## Projektvision

Die IT-Verwaltung soll langfristig ein modulares IT-System für Asset Management, Hardware- und Softwareinventarisierung, Netzwerkdokumentation, Scanner, Tickets, Wissensdatenbank, Installationsroutinen, Prüfberichte und Langzeitdokumentation werden.

Das System soll nicht nur Tabellen speichern, sondern Zusammenhänge sichtbar machen:

- welches Gerät wo steht,
- welche Software darauf läuft,
- welche Netzwerkbeziehungen bestehen,
- welche Probleme aufgetreten sind,
- welche Lösungen funktioniert haben,
- welche Installations- oder Prüfprozesse abgeschlossen wurden.

## Projektkontext

Der fachliche Rahmen ist IT-Unterstützung im Bibliotheks- und Hochschulumfeld, unter anderem mit Ausleihtheke, Fernleihe, Magazin, Erwerbung, Zeitschriftenstelle, Discovery-Systemen, Informationskompetenz, Hochschulverlag, Normen, Patent-Informations-Zentrum, Hochschularchiv, Sekretariat, IT Ref. 3, PC/IGEL, Software/Hardware und WWW/TYPO3.

Daraus folgt: Das System muss technische und organisatorische Informationen abbilden können.

## Nicht verhandelbare Regeln

- Repository zuerst lesen; Dokumente sind Leitlinie, nicht Ersatz für Codeanalyse.
- Keine Breaking Changes ohne ausdrücklichen Auftrag.
- Keine parallelen Systeme für Assetmodell, Scanner, UI, Stammdaten oder Import/Export.
- Kleine, prüfbare und rückrollbare Änderungen bevorzugen.
- Keine neuen Abhängigkeiten ohne Begründung.
- Datenmodelle nur kontrolliert und mit Backup-/Migrationshinweis ändern.
- Sicherheitsmechanismen und Schreibbestätigungen erhalten.
- Relevante Änderungen dokumentieren.

## Arbeitsmodus

Standardablauf:

1. Aufgabenstellung lesen.
2. Relevante Dateien suchen.
3. Bestehende Implementierung kurz einordnen.
4. Risiken und Annahmen erkennen.
5. Kleine Änderung durchführen.
6. Tests oder Checks ausführen.
7. Dokumentation und Planung aktualisieren.
8. Ergebnis mit geänderten Dateien, Tests und Restrisiken zusammenfassen.

Bei Unsicherheit gilt: minimal-invasive Lösung wählen und Unsicherheit offen nennen.

## Zielarchitektur

Langfristig soll eine klare Schichtung entstehen:

```text
UI Layer
Controller / API
Service Layer
Repository / Persistence
Data Storage
```

Diese Zielarchitektur ist kein Auftrag für einen großen Umbau. Sie dient als Orientierung für künftige kleine Refactorings.

## Module

- Asset: Gerätebasisdaten, Inventarnummern, Standort, Lebenszyklus, Historie
- Scanner: PowerShell-Scans, Windows-Inventory, Prüfergebnisse, CSV/JSON-Ausgabe
- Knowledge: Wissensartikel, Fehlerlösungen, Anleitungen, Installationsroutinen
- Tickets: Vorfälle, Aufgaben, Problemhistorie, Prioritäten, Asset-Zuordnung
- Netzwerk: VLANs, IP/MAC, Switchports, Portdosen, Standortnetz
- Installationen: strukturierte Routinen, Checklisten und Abschlussprüfungen
- Stammdaten: zentrale Auswahllisten ohne zweite Stammdatenlogik

## UI/UX-Leitlinie

Die UI soll professionell, konsistent und langlebig bleiben. Bestehende Komponenten, Dark Mode, Admin-Panel-Struktur und Fachansichten haben Vorrang. Neue UI-Arbeit soll Navigation, Detailseiten, Filter, Karten, Tabellen und Statushinweise verbessern, aber keine neue Frontend-Technologie einführen.

Langfristige Ideen:

- Asset-Detailseite mit Tabs
- Raumansicht
- Netzwerkgraph
- Lebenszyklus-Timeline
- Fehler-Hotspots
- Scanner-Gesundheitsstatus
- Audit-Modus

## Scanner-Leitlinie

Der PowerShell-Scanner soll robust bleiben und schrittweise verbessert werden. Einzelne Checks dürfen nicht den gesamten Scan abbrechen. Ergebnisse sollen langfristig Statuswerte wie `OK`, `WARN`, `FAIL`, `UNKNOWN` und `SKIPPED` tragen können.

Aktuelle produktive CSV-Strukturen müssen erhalten bleiben. `software_full.csv` bleibt ein lokales Scanner-Artefakt.

## Datenmodell-Leitlinie

Das aktuelle CSV-Datenmodell ist in `dokumentation/CSV_PERSISTENZ.md` beschrieben und bleibt Source of Truth. Neue Felder oder Beziehungen sollen Historisierung, Scannerimporte und spätere Auswertungen ermöglichen, aber nicht unkontrolliert bestehende Daten verändern.

Langfristig wichtige Konzepte:

- Asset
- HardwareScan
- KnowledgeArticle
- Ticket
- NetworkPort
- InstallationRoutine
- HistoryEntry

## Entwicklungsphasen

Phase 1: Stabilisierung, Audit, Architektur dokumentieren, Startskripte und Scanner festigen, UI-Struktur vereinheitlichen.

Phase 2: Kernsystem mit robustem Assetmodell, Stammdaten, Import/Export, Dashboard, Detailseiten, Scannerimport und Knowledge-Basis.

Phase 3: Erweiterung um Tickets, Installationsroutinen, Netzwerkdokumentation, Historie, Berichte und Rollenmodell.

Phase 4: Intelligenz und Visualisierung mit Vorschlägen, Fehlerclustern, Graphen, Raum-/Netzwerkvisualisierung, Digital Twin und Auditmodus.

## Nächste Dokumentationsziele

Die vorhandene Dokumentation soll erweitert statt dupliziert werden:

- Repository-Audit: `dokumentation/REPOSITORY_AUDIT.md`
- Architektur: bestehende `dokumentation/PROJEKTUEBERSICHT.md` ausbauen oder später gezielt `dokumentation/ARCHITEKTUR.md` anlegen
- Datenmodell: `dokumentation/CSV_PERSISTENZ.md` ausbauen
- UI/UX: neue oder bestehende UI-Dokumente bündeln
- Scanner: vorhandene Scanner-Dokumentation konsolidieren
- Testplan: `dokumentation/TESTPLAN.md` pflegen

## Kurzfassung

Bestehender Code ist Source of Truth. Keine Breaking Changes. Keine parallelen Systeme. Kleine prüfbare Änderungen. Scanner robust halten. Datenmodell kontrolliert entwickeln. UI konsistent halten. Dokumentation und Tests gehören zur Aufgabe.
