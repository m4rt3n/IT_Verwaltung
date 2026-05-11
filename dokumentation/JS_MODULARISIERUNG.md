# JavaScript-Modularisierung

Ziel: `app.js` wird schrittweise in fachliche Module zerlegt. Der Umbau erfolgt ohne Build-System und ohne ES-Module, damit die bestehende lokale App weiterhin direkt ueber klassische `<script>`-Includes laeuft.

## Aktueller Stand

Aus `app.js` ausgelagert:

- `app-config.js`: statische IDs, Demo-Seed, Kataloge und Modulmetadaten
- `app-settings.js`: UI-Einstellungen und Rollen-/Darstellungsanwendung
- `app-state.js`: globaler Zustand, Persistenz, ID- und Listenfilter-Helfer
- `app-shell.js`: Initialisierung, Tabs, Rollenmodus und Haupt-Rendering
- `workflow-list.js`: Workflow-Leiste, Toolbar und Empty States
- `list-ui.js`: Listenfilter, Navigation und generische Feldformatierung
- `asset-view.js`: Asset-Detailtabs, generische Detailkarten und Asset-Zusammenfassung
- `asset-workflows.js`: referenzierte Anlage, Ticket-aus-Asset und Workflow-Notizen
- `crud-modal.js`: generische Erstellen-/Bearbeiten-Dialoge
- `office-wizard-*.js`: Office Deployment Tool Wizard, Auswahl, XML-/REG-/README-Erzeugung
- `knowledge.js` und `knowledge-commands.js`: Knowledge-Karten, Befehle und Tool-Hooks
- `device-wizard-*.js`: Geraete-Wizard, Profile, Netzwerklogik, Formular-Renderer und Speichern
- `software-full-rules.js`: Full-Scan-Klassifikationsregeln
- `software-full-*.js`: Full-Scan-Status, Klassifikation, Kompaktierung, Inventar- und Detailansicht
- `software-standard-*.js`: Standardsoftware-Abgleich, Karten, Scan-Übernahme und Softwaredetails
- `software-profiles.js`: Standardsoftware-Dialoge und Knowledge-Hinweise
- `layout.js`: generisches Split-Layout für Listen und Detailkarten
- `quality.js`: Datenqualitaets- und Stammdaten-Konsistenzpruefungen
- `admin-*.js`: Backup, Scanner, Export, CSV-Import und Admin-Panel getrennt

`index.html` laedt die Module vor `app.js`. Die bestehenden globalen Funktionsnamen bleiben erhalten, damit keine UI-Handler oder Inline-Buttons brechen.

## Leitlinie

- Zielgroesse fuer neue Logikdateien: ca. 150 bis 250 Zeilen.
- Bestehende grosse Module werden weiter in kleinen Schritten zerlegt.
- Reine Katalog-, Profil- oder Regeldateien duerfen groesser sein, wenn eine Aufteilung die Pflege verschlechtert. Beispiel: Knowledge-Befehlsprofile.
- Jeder Schnitt bleibt verhaltensgleich und wird mit `scripts\Check-WebApp-Syntax.bat` geprueft.

## Naechste sichere Schritte

1. `knowledge-commands.js` bei weiterem Wachstum in thematische Profilkataloge teilen.
2. `stammdaten.js` knapp ueber Zielgroesse weiter bereinigen.
3. `crud-modal.js` und `admin-export.js` liegen nur knapp ueber der Zielgroesse; erst bei fachlicher Aenderung weiter schneiden.
4. `software.js` als Kompatibilitaets-Platzhalter entfernen, sobald keine alten Script-Referenzen mehr gebraucht werden.

## Nicht-Ziel im aktuellen Schritt

Kein Frameworkwechsel, kein Build-System und keine stillen Datenmodell-Aenderungen. Die Modularisierung ist zuerst eine Lesbarkeits- und Wartbarkeitsmassnahme.
