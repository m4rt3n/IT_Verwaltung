# Windows Hardware Scanner

## Zweck

Dieses Unterprogramm liest lokale Windows-Hardware aus und schreibt die Daten direkt in die CSV-Dateien des Projekts.

## Start

```text
scripts\Start-HardwareScan.bat
```

## Erfasste Daten

Assets:
- Gerätename
- Gerätetyp
- Hersteller
- Modell
- Seriennummer
- Betriebssystem
- Domäne / Workgroup
- Hauptnutzer

Hardware:
- CPU
- RAM
- Speichergröße
- Bemerkung

Netzwerk:
- IP-Adresse
- MAC-Adresse
- DHCP/Statisch
- DNS

Software:
- Firefox
- Chrome
- Adobe Acrobat Reader
- Microsoft Office / Microsoft 365
- UniGet / WinGet
- Visual C++ Redistributable
- .NET Runtime
- VPN Client

## Ziel-Dateien

```text
web_ui/data/assets.csv
web_ui/data/hardware.csv
web_ui/data/netzwerk.csv
web_ui/data/software_standard.csv
```

## Sicherheit

Vor jeder Änderung wird ein Backup erstellt:

```text
web_ui/backups/scanner_YYYYMMDD_HHMMSS/
```

## Hinweise

- Läuft lokal auf dem Gerät, das inventarisiert werden soll.
- Kein Cloud-Zugriff.
- Keine Notion API.
- Für manche Informationen sind Adminrechte hilfreich, aber nicht zwingend.
- Standort, Raum, Wanddose, Switch-Port müssen weiterhin manuell ergänzt werden.
