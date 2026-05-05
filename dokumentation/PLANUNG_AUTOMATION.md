# Planungs-Automation

Die Planungs-Automation hilft Codex und dir, den naechsten Arbeitsschritt schnell zu erkennen.

## Dateien

- `planung/NEXT.md`: unmittelbare Aufgaben
- `planung/TODO.md`: aktive, konkrete Aufgaben
- `planung/WARTESCHLANGE.md`: spaetere Ideen
- `planung/STATUS.md`: automatisch erzeugter Statusbericht
- `planung/CODEX_NEXT_PROMPT.md`: automatisch erzeugter Prompt fuer den naechsten Codex-Lauf

## Nutzung

Alles aktualisieren:

```powershell
Update-Planung.bat
```

Dieser Ablauf macht automatisch:

1. erledigte Aufgaben aus `NEXT.md` nach `dokumentation/ERLEDIGTE_NEXT_AUFGABEN.md` schreiben
2. erledigte Aufgaben aus `NEXT.md` entfernen
3. falls keine offene NEXT-Aufgabe existiert, die erste offene Aufgabe aus `TODO.md` nach `NEXT.md` uebernehmen
4. `planung/STATUS.md` und `planung/CODEX_NEXT_PROMPT.md` neu erzeugen

Nur Status und Prompt erzeugen:

```powershell
python tools/planning/plan_automation.py status
```

Erledigte NEXT-Aufgaben dokumentieren und aus `NEXT.md` entfernen:

```powershell
python tools/planning/plan_automation.py cleanup
```

Wenn `NEXT.md` keine offenen Aufgaben mehr enthaelt, erste offene TODO-Aufgabe nach `NEXT.md` uebernehmen:

```powershell
python tools/planning/plan_automation.py promote
```

## Arbeitsweise

1. `Update-Planung.bat` ausfuehren.
2. `planung/CODEX_NEXT_PROMPT.md` lesen.
3. Naechste Aufgabe abarbeiten.
4. Tests ausfuehren.
5. Erledigte Checkbox in `NEXT.md` und bei uebernommenen Aufgaben auch in `TODO.md` markieren.
6. `Update-Planung.bat` erneut ausfuehren.
7. Die erledigte NEXT-Aufgabe steht danach in `dokumentation/ERLEDIGTE_NEXT_AUFGABEN.md`, und `NEXT.md` enthaelt wieder nur den naechsten offenen Schritt.
