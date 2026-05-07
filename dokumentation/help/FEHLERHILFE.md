# Fehlerhilfe

## Python startet nicht

Pruefe, ob `python` oder `py` installiert ist. `start.bat` versucht zuerst `python app_server.py` und danach `py app_server.py`.

## Port ist belegt

Der Server startet standardmaessig ab Port `8765` und sucht automatisch den naechsten freien Port.

## Node fehlt

`scripts\Check-WebApp-Syntax.bat` sucht Node im PATH und in typischen Installationspfaden. Wenn kein Node gefunden wird, kann JavaScript nicht geprueft werden.

## PowerShell blockiert Scanner

Die Startskripte nutzen `-ExecutionPolicy Bypass` fuer diesen lokalen Lauf. Wenn der Scanner trotzdem blockiert wird, PowerShell als Administrator pruefen und das Log unter `logs/` lesen.

## Pflichtfelder fehlen

Die App und der Server pruefen Pflichtfelder vor dem Speichern. Betroffene Tabelle und Zeile stehen in der Fehlermeldung.

## CDN oder Offline-Probleme

Die Web-App laedt aktuell Bootstrap, Bootstrap Icons, jQuery und JSZip aus CDNs. Ohne Internet koennen UI-Funktionen fehlen. Lokale Vendor-Dateien sind als offene Aufgabe geplant.

