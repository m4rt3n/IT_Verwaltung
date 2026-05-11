# Codex Next Prompt

Lies zuerst `AGENTS.md` und `dokumentation/CODEX_ARBEITSKONZEPT.md`.

Arbeite die naechste offene Aufgabe aus `TODO.md` ab:

- Abschnitt: Sicherheit und Betrieb
- Aufgabe: Backup-Retention planen: Anzahl, Alter, manuelles Loeschen, kein automatischer Datenverlust.
- Datei/Zeile: planung/TODO.md:134

Arbeitsregeln:

- Vor Codeaenderungen relevante Dateien lesen.
- Keine parallelen Systeme bauen, wenn bestehende Module erweitert werden koennen.
- Keine bestehenden Nutzerdaten oder Backups loeschen.
- Bei Schreib-/Datenaktionen Sicherheitsabfragen erhalten.
- Nach Aenderungen `scripts\Check-WebApp-Syntax.bat` ausfuehren.
- Danach `python tools/planning/plan_automation.py status` ausfuehren.
- Erledigte Aufgaben in `planung/*.md` markieren.
- Kurze Zusammenfassung mit geaenderten Dateien und Tests liefern.
