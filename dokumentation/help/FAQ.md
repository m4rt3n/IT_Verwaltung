# FAQ

## Warum sehe ich nach einem Reload alte Daten?

Wenn `CSV Backend aktiv` nicht angezeigt wird, arbeitet die App im Browser-Modus. Dann sind Aenderungen nur im Browser-Speicher vorhanden. Starte die App ueber `start.bat` und speichere im Admin Panel.

## Wo liegen Backups?

Automatische CSV-Backups liegen unter `web_ui/backups/backup_YYYYMMDD_HHMMSS/`.

## Was ist der Unterschied zwischen `software_standard.csv` und `software_full.csv`?

`software_standard.csv` ist die produktive, kuratierte Softwaretabelle der Web-App. `software_full.csv` und `software_full.json` sind lokale Scanner-Artefakte fuer vollstaendige Softwareinventuren.

## Warum ist im Normalmodus Speichern gesperrt?

Der Rollenmodus ist ein lokaler Bedien- und Schreibschutz. Im Normalmodus werden Admin-Bereiche ausgeblendet und Schreibaktionen blockiert.

## Warum steht bei Netzwerk `LAN/WLAN`?

Das ist ein unsicherer Scannerwert. Der konkrete Verbindungstyp sollte manuell geklaert werden, zum Beispiel `LAN direkt Wanddose` oder `WLAN ueber Access Point`.

