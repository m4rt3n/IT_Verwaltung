# JavaScript-Modularisierung

Ziel: `app.js` wird schrittweise in fachliche Module zerlegt. Der Umbau erfolgt ohne Build-System und ohne ES-Module, damit die bestehende lokale App weiterhin direkt ueber klassische `<script>`-Includes laeuft.

## Aktueller Stand

Aus `app.js` ausgelagert:

- `office-wizard.js`: Office Deployment Tool Wizard, XML-/REG-/README-Erzeugung
- `knowledge.js`: Knowledge-Karten, Knowledge-Befehle, Knowledge-Tool-Hooks
- `software.js`: Software-Karten, Full-Scan, Standardsoftware-Review
- `device-wizard.js`: Geraete-Wizard und Smart-Software-Checkliste

`index.html` laedt die Module vor `app.js`. Die bestehenden globalen Funktionsnamen bleiben erhalten, damit keine UI-Handler oder Inline-Buttons brechen.

## Leitlinie

- Zielgroesse fuer neue Logikdateien: 150 bis 300 Zeilen.
- Bestehende grosse Module werden weiter in kleinen Schritten zerlegt.
- Reine Katalog- oder Regeldateien duerfen zeitweise groesser sein, wenn eine Aufteilung sonst die Lesbarkeit verschlechtert.
- Jeder Schnitt bleibt verhaltensgleich und wird mit `scripts\Check-WebApp-Syntax.bat` geprueft.

## Naechste sichere Schritte

1. `software.js` weiter teilen:
   - `software-full.js` fuer Full-Scan-Regeln und Full-Scan-Ansichten
   - `software-standard.js` fuer Standardkarten und Uebernahme-Workflow
   - `software-profiles.js` fuer Standardsoftware-Profile
2. `app.js` weiter teilen:
   - `state.js` fuer DB, Listenstatus, IDs und Persistenz
   - `layout.js` fuer Tabs, Toolbar, Split-Layout und generische Karten
   - `asset-view.js` fuer Asset-Detailkarten und Asset-Workflows
   - `crud-modal.js` fuer Bearbeiten-/Anlegen-Modal
   - `quality.js` fuer Datenqualitaetspruefungen
3. `admin.js` in Admin-Aktionen, Scanner-Aktionen und Import/Export trennen.
4. `stammdaten.js` knapp ueber Zielgroesse weiter bereinigen.

## Nicht-Ziel im aktuellen Schritt

Kein Frameworkwechsel, kein Build-System und keine stillen Datenmodell-Aenderungen. Die Modularisierung ist zuerst eine Lesbarkeits- und Wartbarkeitsmassnahme.
