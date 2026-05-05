# IT-Verwaltung Web Bootstrap v37 Notion Ready

Start:
`start.bat`

Neu in v37:
- Admin Panel Button: Notion Export ZIP
- Export ohne Notion API
- ZIP mit mehreren Notion-kompatiblen CSV-Dateien
- README.txt im Export mit Import-Reihenfolge und Relations-Hinweisen

# IT-Verwaltung Web Bootstrap v33 Clean Core + UX

Start:
`start.bat`

Neu in v33:
- Clean CORE Layer
- stabile Helper-Funktionen
- Fallback für alte Module
- UX-Feedback per Toast
- Admin Backup bleibt enthalten
- Dashboard Single View bleibt erhalten
- Software UI bleibt enthalten
- CSV-Persistenz bleibt erhalten

# IT-Verwaltung Web Bootstrap v31 Admin Backup

Start:
`start.bat`

Neu in v31:
- Dashboard von CSV-Speicherbuttons bereinigt.
- Backup/Import unter Admin Panel verschoben.
- Ein-Klick-Backup in eine einzige JSON-Datei.
- Ein-Klick-Import aus einer JSON-Datei.
- CSV-Speichern bleibt unter Admin Panel verfügbar.
- CSV-Persistenz bleibt erhalten.

# IT-Verwaltung Web Bootstrap v30.2 Syntax Fix

Start:
`start.bat`

Fix in v30.2:
- `Unexpected token ';'` behoben.
- `OpenDeviceWizard is not defined` als Folgefehler behoben.
- Save-UX sauber eingebaut.
- Kein destruktiver Regex-Patch mehr.
- CSV-Persistenz bleibt erhalten.

# IT-Verwaltung Web Bootstrap v28 Dashboard Single View Fix

Start:
`start.bat`

Fix in v28:
- Unter der Topologie wird die alte Asset-/Graph-Ansicht nicht mehr zusätzlich angezeigt.
- Dashboard zeigt jetzt exklusiv entweder Topologie oder Graph.
- Software UI aus v27 bleibt erhalten.
- CSV-Persistenz bleibt erhalten.

# IT-Verwaltung Web Bootstrap v27 Software UI

Start:
`start.bat`

Neu in v27:
- Software-Verwaltung im Wizard-/Card-Stil
- Software-Karten statt nur Tabelle
- Status-Kacheln: Gesamt / OK / Hinweise / Prüfen
- Detailkarte mit Asset-Kontext
- Standardsoftware-Profil hinzufügen
- Knowledge-Hinweis bei Adobe/Signatur/Zertifikat
- Umschalten zwischen Kartenansicht und Tabelle
- CSV-Persistenz bleibt erhalten

# IT-Verwaltung Web Bootstrap v26.6 Manufacturer Helper Fix

Start:
`start.bat`

Fix in v26.6:
- `ReferenceError: manufacturerSelect is not defined` behoben.
- Hersteller- und Modellserien-Helfer wiederhergestellt.
- Fallback-Stammdaten für Hersteller/Gerätetypen ergänzt.
- Core-Selbsttest erweitert.
- Software Smart und CSV-Persistenz bleiben erhalten.

# IT-Verwaltung Web Bootstrap v26.5 Core Helper Fix

Start:
`start.bat`

Fix in v26.5:
- `ReferenceError: setPath is not defined` behoben.
- `setPath()` und `getPath()` als Core Helper stabil ergänzt.
- `saveWizardFields()` abgesichert.
- Core-Selbsttest für wichtige Wizard-Funktionen ergänzt.
- Software Smart und CSV-Persistenz bleiben erhalten.

# IT-Verwaltung Web Bootstrap v26.4 Stack Fix

Start:
`start.bat`

Fix in v26.4:
- `Maximum call stack size exceeded` behoben.
- Render-/Speicher-Schleife im Wizard entfernt.
- `saveWizardFields()` rendert nicht mehr.
- `wizardPreview()` speichert nicht mehr.
- Software Smart und CSV-Persistenz bleiben erhalten.

# IT-Verwaltung Web Bootstrap v26.3 Stable Wizard Helper Fix

Start:
`start.bat`

Fix in v26.3:
- `ReferenceError: sel is not defined` behoben.
- Wizard-Hilfsfunktion `sel()` wiederhergestellt.
- Sicherheitsregel für Formular-Hilfsfunktionen in README ergänzt.
- Software Smart und CSV-Persistenz bleiben erhalten.

# IT-Verwaltung Web Bootstrap v26.2 Stable Wizard Fix

Start:
`start.bat`

Fix in v26.2:
- `wizardStepHtml is not defined` behoben.
- Wizard-Renderer wieder fest integriert.
- Software Smart bleibt enthalten.
- CSV-Persistenz bleibt erhalten.
- Stabilitätsregeln für künftige Versionen ergänzt.


## Entwicklungsregel: Stabilität vor neuen Funktionen

Bei zukünftigen Änderungen gilt:

```text
1. Fehler zuerst gezielt prüfen
2. keine globale Blind-Ersetzung im JavaScript
3. bestehende Funktionen nicht löschen, sondern nur gezielt reparieren
4. Wizard, Bearbeiten-Dialog, CSV-Speicherung und Navigation nach jeder Änderung prüfen
5. neue Funktionen nur ergänzen, wenn bestehende Workflows weiterlaufen
6. bei JS-Fehlern zuerst Ursache isolieren, dann minimalen Fix setzen
7. Readme/Build-Info mit jeder Version aktualisieren
```

Pflichttests vor einer neuen ZIP-Version:

```text
+ Neues Gerät erfassen öffnet
Wizard Steps 1–6 funktionieren
Netzwerk LAN/WLAN Auswahl funktioniert
Software-Step öffnet
Bearbeiten-Dialog öffnet
CSV-Speichern funktioniert
Konsole ohne kritische ReferenceError/SyntaxError
```



## Bekannter Fix v26.3

Fehler aus Konsole:

```text
ReferenceError: sel is not defined
```

Ursache:
Der Wizard nutzt Hilfsfunktionen wie `sel()` und `f()` zum Rendern von Formularfeldern.  
Diese dürfen bei Umbauten nicht entfernt oder umbenannt werden.

Regel für weitere Versionen:

```text
Formular-Hilfsfunktionen sel(), f(), saveWizardFields(), renderWizard(), wizardStepHtml() sind Kernfunktionen.
Vor jedem ZIP-Build prüfen, ob diese Funktionen vorhanden sind.
Keine Funktion löschen, wenn sie noch von Wizard oder Bearbeiten-Dialog genutzt wird.
```



## Bekannter Fix v26.4

Fehler aus Konsole:

```text
RangeError: Maximum call stack size exceeded
```

Ursache:
Eine Render-/Speicher-Schleife im Wizard:
`wizardPreview()` und `saveWizardFields()` dürfen sich nicht gegenseitig auslösen.

Regel für weitere Versionen:

```text
Render-Funktionen dürfen keine Speicher- oder Navigationsfunktionen aufrufen, die erneut rendern.
saveWizardFields() darf nur Daten aus Formularfeldern lesen.
wizardPreview() darf nur HTML erzeugen.
wizardNext()/wizardBack() steuern die Navigation.
```



## Bekannter Fix v26.5

Fehler aus Konsole:

```text
ReferenceError: setPath is not defined
```

Ursache:
`saveWizardFields()` liest Formularwerte über `data-path` und schreibt sie in `wizard.data`.
Dafür sind die Kern-Hilfsfunktionen `setPath()` und `getPath()` zwingend notwendig.

Regel für weitere Versionen:

```text
setPath() und getPath() sind Kernfunktionen.
Sie dürfen nicht gelöscht, umbenannt oder durch globale Ersetzungen beschädigt werden.
saveWizardFields() darf nur Werte lesen und über setPath() schreiben.
```

Pflichttest erweitert:

```text
Konsole darf keine ReferenceError enthalten:
- setPath is not defined
- sel is not defined
- wizardStepHtml is not defined
- Maximum call stack size exceeded
```



## Bekannter Fix v26.6

Fehler aus Konsole:

```text
ReferenceError: manufacturerSelect is not defined
```

Ursache:
`wizardStepHtml()` nutzt im Schritt Grunddaten die Hersteller-/Modellserien-Helfer:
`manufacturerSelect()` und `modelSeriesSelect()`.
Diese Funktionen gehören zum Geräte-Wizard und dürfen bei Umbauten nicht entfernt werden.

Regel für weitere Versionen:

```text
Hersteller-/Modellserien-Funktionen sind Wizard-Kernfunktionen:
- getManufacturersForType()
- getModelSeriesFor()
- manufacturerSelect()
- modelSeriesSelect()
- addManufacturerForCurrentType()
- addModelSeriesForCurrentSelection()

Vor jedem ZIP-Build prüfen, ob diese Funktionen vorhanden sind.
```




## Fix v28

Problem:
Im Dashboard wurde unter der Topologie zusätzlich noch die alte animierte Graph-/Asset-Ansicht angezeigt.

Ursache:
Alte Dashboard-Renderblöcke wurden nicht vollständig ersetzt. Dadurch wurden Topologie und Graph gleichzeitig gerendert.

Regel:
Dashboard-Visualisierungen müssen exklusiv sein:

```text
DASHBOARD_VIEW = topology → nur Topologie anzeigen
DASHBOARD_VIEW = graph    → nur Graph anzeigen
```



## Bekannter Fix v30.2

Fehler aus Konsole:

```text
Uncaught SyntaxError: Unexpected token ';'
OpenDeviceWizard is not defined
```

Ursache:
Ein fehlerhafter automatischer Regex-Patch hat JavaScript-Funktionen beschädigt. Dadurch wurde `app.js` nicht mehr geladen und nachgelagerte Funktionen wie `OpenDeviceWizard` standen nicht zur Verfügung.

Regel für weitere Versionen:

```text
Keine globalen Regex-Ersetzungen über komplette Funktionen.
Funktionen immer blockweise ersetzen:
- Start der Funktion suchen
- geschweifte Klammern zählen
- nur diesen Funktionsblock ersetzen
Nach jedem Build zwingend JS-Syntaxcheck ausführen.
```

Pflichttest:

```text
node --check web_ui/js/app.js
```

Erst wenn dieser Test OK ist, wird eine ZIP ausgeliefert.



## v31 Backup-/Import-Regel

Dashboard bleibt für Übersicht und Topologie.

Speichern, Backup und Import gehören ins Admin Panel:

```text
Dashboard:
- Anzeigen
- Topologie / Graph
- Statistik

Admin Panel:
- Alles als eine Datei sichern
- Eine Backup-Datei laden
- CSV jetzt speichern
- CSV-Ordner-Backup
```

Standard-Backup ist eine einzelne JSON-Datei:

```text
IT-Verwaltung_Backup_YYYY-MM-DDTHH-MM-SS.json
```

Diese Datei enthält:

```text
assets
hardware
software
netzwerk
tickets
notizen
knowledge
```



## v33 Clean Core + UX Architektur

### Ziel
v33 stabilisiert die Struktur, ohne bestehende UI-Funktionen unnötig umzubauen.

### Neue Core-Regeln

```text
CORE ist die zentrale Hilfsschicht.
UI-Funktionen greifen auf CORE zu.
Alte globale Funktionsnamen bleiben als Fallback erhalten.
```

### Zentrale Funktionen

```text
CORE.findAsset(assetId)
CORE.byAsset(table, assetId)
CORE.safeGet(obj, path, fallback)
CORE.setPath(obj, path, value)
```

### Fallback-Kompatibilität

```text
findAsset(assetId) → CORE.findAsset(assetId)
byAsset(table,id)  → CORE.byAsset(table,id)
setPath(...)       → CORE.setPath(...)
getPath(...)       → CORE.safeGet(...)
```

### Aufgenommener Fehler

```text
Uncaught SyntaxError: Unexpected token '.'
```

Ursache:
Fehlerhafte Core- oder Objekt-Syntax im oberen Bereich der app.js stoppt die gesamte Anwendung.

Regel:
- Core-Code nur mit Syntaxcheck ausliefern
- keine Objektmethoden mit falscher `.`- oder `=`-Syntax
- nach jedem Build `node --check web_ui/js/app.js`

### Pflichttest v33

```text
node --check web_ui/js/app.js
typeof CORE
typeof CORE.findAsset
typeof findAsset
typeof openDeviceWizard
```



## v35 Modern UI
- Card Hover
- Button Feedback
- Fade Transitions
- Pulse Feedback


## v37 Notion Ready Export

Ohne Notion API.

Admin Panel:

```text
[ Notion Export ZIP ]
```

Der Button erzeugt eine ZIP-Datei:

```text
notion_export_YYYY-MM-DDTHH-MM-SS.zip
├── assets.csv
├── hardware.csv
├── software.csv
├── netzwerk.csv
├── tickets.csv
├── notizen.csv
├── knowledge.csv
└── README.txt
```

Notion Import:

```text
1. assets.csv zuerst importieren
2. danach hardware/software/netzwerk/tickets/notizen/knowledge
3. Relationen in Notion über Asset-ID manuell anlegen
```

Regel:

```text
JSON = Backup für dieses Tool
CSV  = Importformat für Notion
ZIP  = Ein-Klick-Export mit allen Notion-CSV-Dateien
```



## v38 Smart Software
- Standardsoftware erkannt
- Pflichtsoftware Check
- Statusanzeige integriert


## v39 Windows Hardware Scanner

Neu:

```text
Start-HardwareScan.bat
```

Dieses Unterprogramm liest lokale Windows-Hardware aus und schreibt die Daten direkt in die CSV-Dateien:

```text
web_ui/data/assets.csv
web_ui/data/hardware.csv
web_ui/data/netzwerk.csv
web_ui/data/software.csv
```

Vor jeder Änderung wird ein Backup erstellt:

```text
web_ui/backups/scanner_YYYYMMDD_HHMMSS/
```

### Erfasste Bereiche

```text
Asset-Grunddaten
Hardware
Netzwerk
ausgewählte Standardsoftware
```

### Wichtig

Der Browser selbst darf aus Sicherheitsgründen keine Hardware auslesen.  
Dafür gibt es dieses lokale PowerShell-Unterprogramm.


## v40 Fix: DB before initialization

Fehlerbild:

```text
Uncaught ReferenceError: Cannot access 'DB' before initialization
```

Ursache:
Ein Smart-Software-Block hat direkt beim Laden der app.js auf `DB` zugegriffen, bevor `DB` initialisiert war.

Regel:
Top-Level-Code darf nicht direkt auf `DB` zugreifen.

Richtig:

```text
Funktionen definieren → später nach DB-Init ausführen
```

Beispiel:

```js
function ensureSmartSoftwareDefaults(){
  if(typeof DB === 'undefined' || !DB) return;
  // erst hier DB nutzen
}
```

## Hardwaredaten automatisch auslesen

Der Browser darf Hardware aus Sicherheitsgründen nicht direkt auslesen.  
Da du Admin bist und die Erlaubnis hast, wird das lokal über PowerShell gemacht:

```text
Start-HardwareScan.bat
```

Das liest lokal aus:

```text
Gerätename
Hersteller
Modell
Seriennummer
CPU
RAM
Speicher
Monitor
IP
MAC
DNS
Betriebssystem
Domäne
ausgewählte Standardsoftware
```

Empfehlung für nächste Ausbaustufe:

```text
v41 Scanner Pro
- Monitor genauer über EDID auslesen
- BIOS/UEFI Daten
- BitLocker Status
- TPM Status
- Windows Aktivierung
- Lokale Administratoren
- Laufwerke einzeln
- Netzwerkadapter einzeln
- Softwareliste als eigene CSV
```


## v41 Scanner PRO

Neu:
- op_Addition Fehler behoben
- keine `+=` Operationen auf PSCustomObject
- strukturierte CSV-Prüfung nach dem Schreiben
- Logdatei pro Scan
- Backup vor jeder Änderung
- optional vollständige Softwareliste

Start:
```text
Start-HardwareScan.bat
Start-HardwareScan-FullSoftware.bat
```


## v42 Scanner Parser Fix

Behobener PowerShell-Fehler:

```text
Ungültiger Variablenverweis. Nach ":" folgte kein Zeichen, das für einen Variablennamen gültig ist.
```

Ursache:
In PowerShell darf ein Variablenname in einem String nicht direkt vor `:` stehen.

Falsch:

```powershell
"$Path: Fehler"
```

Richtig:

```powershell
"${Path}: Fehler"
```

Zusätzlich enthalten:

```text
Check-HardwareScanner-Syntax.bat
```

Damit kann der Scanner vor dem Start auf PowerShell-Syntax geprüft werden.


## v43 Scanner STABLE / Self-Healing CSV

Neu:
- Auto CSV Repair
- fehlende Header werden automatisch ergänzt
- leere CSVs werden initialisiert
- CSV-Delimiter wird auf Semikolon normalisiert
- Validierung prüft nach Reparatur
- Backup wird vor Änderungen erstellt

Start:

```text
Start-HardwareScan.bat
Start-HardwareScan-FullSoftware.bat
Check-HardwareScanner-Syntax.bat
```
