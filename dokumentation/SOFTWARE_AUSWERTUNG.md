# Software-Erfassung und Auswertung

Stand: 2026-05-06

## Ziel

`software_full.json` bleibt der vollstaendige technische Scanbefund.
Die Web-App erzeugt daraus eine kuratierte, assetbezogene Inventaransicht.

## Umgesetzte Auswertungsschicht

- Software-Klassen: Produktivsoftware, Admin-/IT-Tools, Entwicklung, Sicherheit, Treiber & Geraete, Runtimes & Frameworks, Windows-Bordmittel, Dienste und unklare Funde.
- Kuratiertes Regelwerk: `web_ui/config/software_classification.json`.
- Produkt-Metadaten: Klasse, Risiko/Relevanz, Labels und kompakte Logo-/Produktkennzeichen.
- Asset-Kontext: Full-Scan-Eintraege werden dem passenden Asset zugeordnet und im Detail zusammengefasst.
- Standardprofil-Abgleich: je Asset-Typ wird zwischen Standardprofil und Zusatzsoftware unterschieden.
- Update-Auswertung: Quellen wie Winget, Chocolatey, Pip und Npm werden fuer spaetere Upgrade-Pruefung markiert.
- Unklare Funde: Eintraege ohne klare Klasse oder mit niedriger Erkennungssicherheit koennen separat gefiltert werden.
- Rohdaten bleiben erhalten: verdichtete Familien zeigen Einzelquellen im Aufklappbereich.

## Logo-Hinweise

Bekannte Produkte koennen lokale SVG-Logos aus `web_ui/img/logos/` nutzen.
Die Zuordnung erfolgt ueber `logoPath` in `web_ui/config/software_classification.json`.

Die Web-App laedt keine externen Logos zur Laufzeit.
Wenn fuer ein Produkt kein lokales SVG vorhanden ist, nutzt sie automatisch ein kurzes Textkennzeichen, z. B. `Office`, `Chrome`, `Py`, `Git`, `VS`, `PDF` oder `Sophos`.

Die geladenen Marken-Icons stammen aus dem Simple-Icons-CDN.
Marken und Logos bleiben Eigentum der jeweiligen Markeninhaber.

## Naechste sinnvolle Ausbaustufe

- Historie zwischen zwei Scans berechnen: neu, entfernt, Version geaendert.
- `winget upgrade` optional erfassen und als Update-Status anzeigen.
- UI-Aktion fuer unklare Funde: "als Produktivsoftware markieren", "als Windows-Bordmittel ausblenden", "zu Familie hinzufuegen".
- Standardprofile pro Standort/Raum/Geraetetyp pflegbar machen.
