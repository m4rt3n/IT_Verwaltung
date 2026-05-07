# Help-Bereich

Stand: 2026-05-07

Der Help-Bereich ist als lokaler Support-Tab geplant. Inhalte liegen unter `dokumentation/help/` und werden durch den lokalen Python-Server bereitgestellt.

## Ziele

- Schnellstart direkt in der Web-App verfuegbar machen
- FAQ und Fehlerhilfe fuer typische Betriebsprobleme bereitstellen
- Begriffe und Arbeitsablaeufe konsistent erklaeren
- Checklisten fuer Erfassung, Scannerlauf, Rueckgabe und Ausmusterung anbieten

## Erste Inhalte

- `SCHNELLSTART.md`
- `FAQ.md`
- `FEHLERHILFE.md`
- `GLOSSAR.md`
- `CHECKLISTEN.md`

## Technischer Ansatz

- `app_server.py` liest Markdown-Dateien aus `dokumentation/help/`.
- Die Web-App zeigt sie im Tab `Hilfe` an.
- Die erste Version rendert bewusst nur einfache Markdown-Strukturen wie Ueberschriften, Listen, Code und Absatze.

