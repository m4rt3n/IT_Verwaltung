# UI/UX-Leitlinie

Stand: 2026-05-07

## Grundsaetze

- Fachansichten bleiben arbeitsorientiert, dicht und scanbar.
- Admin-Funktionen bleiben im Admin Panel gebuendelt.
- Rollenmodus trennt normale Ansicht und Admin-Funktionen sichtbar.
- Such- und Filterverhalten soll je Tab konsistent bleiben.
- Help-Inhalte liegen lokal und werden im Tab `Hilfe` angezeigt.
- Fachansichten zeigen eine kurze Workflow-Leiste mit aktueller Arbeitsphase und Kontext-Hilfe.
- Scan-basierte Softwarearbeit trennt kuratierte Standardsoftware, erkannte Standardsoftware und Full-Scan-Rohdaten sichtbar.
- Riskante Aktionen werden mit Vorschau oder Sicherheitsabfrage bestätigt.

## Begriffe

- `Asset`: verwaltetes Geraet oder IT-Objekt.
- `Hardware`: technische Ausstattung eines Assets.
- `Software`: produktive Standardsoftware in `software_standard.csv`.
- `Full-Scan`: detailliertes Scannerartefakt `software_full.*`.
- `Netzwerk`: IP, MAC, VLAN, Verbindung, Switch-Port, Wanddose, WLAN.
- `Knowledge`: wiederverwendbare Loesungsartikel.

## Navigation

- Dashboard fuer Ueberblick und Kennzahlen.
- Fach-Tabs fuer Datenpflege.
- Admin Panel fuer Backup, Import, Export, Scanner, Stammdaten und Einstellungen.
- Hilfe als eigener Support-Tab.
- Dashboard-Kacheln und Arbeitsqueue springen in vorgefilterte Fachansichten.

## Keine grossen UI-Umbauten

Neue Workflows werden in bestehende Tabs und Komponenten integriert. Es wird keine zweite Frontend-Technologie eingefuehrt.

