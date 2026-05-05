# CSV Persistenz

## Start

```text
start.bat
```

## Speichern

Die Weboberfläche sendet Änderungen an:

```text
/api/save
```

Der lokale Python-Server schreibt danach in:

```text
web_ui/data/*.csv
```

## Backup

Vor jedem Speichern wird automatisch ein Backup erstellt:

```text
web_ui/backups/backup_YYYYMMDD_HHMMSS/
```

## Neustart

Beim Neustart werden die CSV-Dateien aus `web_ui/data/` geladen.
Damit bleiben Änderungen erhalten.
