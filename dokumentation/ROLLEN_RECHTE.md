# Rollen und Rechte

## Status

Aktuell gibt es einen lokalen UI-Rollenmodus:

- `Admin`
- `Normal`

Der Modus wird in den lokalen App-Einstellungen im Browser gespeichert. Standard ist `Admin`, damit bestehende Arbeitsabläufe nicht brechen.

## Admin

Admin sieht alle Bereiche:

- Fachmodule
- Dokumentation und Wissen
- Admin Panel
- Stammdaten

Admin darf Schreibaktionen auslösen:

- neues Gerät erfassen
- Einträge anlegen, bearbeiten und löschen
- Knowledge aus Tickets oder Softwarehinweisen erstellen
- CSV speichern und CSV-Backup anlegen
- JSON-Backup importieren/exportieren
- Scanner starten
- Stammdaten ändern

## Normal

Normal ist als lesende Arbeitsansicht gedacht.

Im Normalmodus:

- Admin- und Stammdaten-Tabs werden ausgeblendet.
- Der Geräte-Wizard wird ausgeblendet.
- Bearbeiten-, Löschen- und Anlegen-Aktionen werden ausgeblendet oder blockiert.
- Direkte Schreibfunktionen prüfen zusätzlich `requireWriteAccess()`.

## Sicherheitsgrenze

Der Rollenmodus ist keine Authentifizierung und keine Zugriffskontrolle gegen absichtliche Umgehung. Er schützt vor versehentlichen Änderungen in der Oberfläche und trennt normale Ansicht von administrativer Pflege.

Echte Sicherheit müsste später serverseitig ergänzt werden, zum Beispiel mit Anmeldung, Rollenprüfung im Server und Auditlog.

## Technische Stellen

- `APP_SETTINGS.role`: lokaler Rollenmodus
- `isAdminRole()`: prüft Adminmodus
- `canWrite()`: Schreibrecht für UI-Aktionen
- `requireWriteAccess(action)`: blockiert Schreibaktionen im Normalmodus
- `visibleModules()`: blendet Admin-Module im Normalmodus aus

## Manuelle Tests

1. App im Adminmodus öffnen.
2. Prüfen, ob Admin Panel und Stammdaten sichtbar sind.
3. Rolle oben rechts auf `Normal` wechseln.
4. Prüfen, ob Admin Panel, Stammdaten und `+ Neues Gerät erfassen` verschwinden.
5. Fachmodule öffnen und prüfen, ob keine Bearbeiten-/Löschen-/Anlegen-Buttons sichtbar sind.
6. Zurück auf `Admin` wechseln und prüfen, ob die Funktionen wieder sichtbar sind.
