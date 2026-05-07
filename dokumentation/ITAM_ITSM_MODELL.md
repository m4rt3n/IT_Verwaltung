# ITAM/ITSM-Modell

Dieses Dokument beschreibt marktnahe Erweiterungen, ohne die produktiven CSV-Dateien still zu verändern.

## Lizenzverwaltung

Vorgeschlagene Felder: `Lizenz-ID`, `Software-ID`, `Asset-ID`, `Lizenztyp`, `Anzahl`, `Zugewiesen`, `Ablaufdatum`, `Kostenstelle`, `Bemerkung`.

Abdeckung: Installationen aus `software_standard.csv` werden gegen erlaubte Anzahl geprüft. Ergebnis: `unterdeckt`, `passend`, `überdeckt`, `unbekannt`.

## Verträge und Lieferanten

Vertragsfelder: `Vertrag-ID`, `Lieferant`, `Start`, `Ende`, `Kündigungsfrist`, `Kostenstelle`, `Dokumentlink`, `Status`.

Lieferanten-Stammdaten: Name, Kontakt, Supportweg, Vertragsart, Notiz.

## Beschaffung und Garantie

Erweiterbare Felder je Asset/Hardware: Kaufdatum, Lieferant, Preis, Rechnungshinweis, Garantie bis, Ersatzdatum.

## SLA und wiederkehrende Tickets

Ticket-Erweiterungen: Reaktionszeit, Zielzeit, Eskalationsstufe, SLA-Verletzung, Fälligkeit.

Wiederkehrende Vorlagen: Backupprüfung, Monatsinventur, Zertifikatscheck, Lizenzprüfung, Garantieprüfung.

## Benachrichtigungen

Lokale Erinnerungstypen: Garantieablauf, Lizenzablauf, überfällige Tickets, Reservierungsende.

Ohne externen Dienst zunächst als Dashboard-Hinweis und Bericht.

## Reservierungen

Reservierbare Objekte: Leihgeräte, Räume, Zubehör. Felder: Objekt, Person/Team, Zeitraum, Status, Rückgabezustand.

## Komponenten und Verbrauchsmaterial

Komponenten: RAM, Datenträger, Akku, Dockingstation, Monitor, Netzteil.

Verbrauchsmaterial: Toner, Kabel, Adapter, Maus, Tastatur, Headset.

## Dokumentanhänge

Konzept: Dateien werden nicht in CSV eingebettet. CSV speichert nur `Dokumentlink`, `Typ`, `Beschreibung`, `Prüfdatum`.

## Beziehungen, IPAM und Compliance

Beziehungsansicht: Asset hängt an Switch, VLAN, Ticket, Vertrag und Software.

IPAM-light: Subnetze, freie IPs, doppelte IPs, DHCP-Bereiche, Reservierungen.

Compliance: Pflichtsoftware, Betriebssystemstand, Verschlüsselung, Update-Risiko.
