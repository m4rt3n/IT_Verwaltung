# Software Smart v26

Der Software-Step ist eine OS-abhängige Checkliste.

Windows Checks:
- Firefox
- Chrome
- Microsoft Edge
- Brave
- Adobe Reader
- Adobe Signatur-Zertifikat
- Microsoft Office
- Office aktiviert
- LibreOffice / HelpPack
- Thunderbird
- Notepad++
- UniGet / WinGet
- Chocolatey / Chocolatey GUI
- PowerShell / Windows Terminal / PowerToys / Sysinternals
- Visual C++ Redistributable
- .NET Runtime
- DirectX
- 7-Zip
- Diagnosewerkzeuge wie CrystalDiskInfo, CPU-Z und HWiNFO
- Entwicklungspakete wie Visual Studio Code, Anaconda, RStudio, MySQL Workbench, Python Launcher, JDK, WSL, Windows ADK und AutoIt
- Medien- und Grafiktools wie VLC, Paint.NET, GIMP, Screenpresso und OBS Studio
- VPN Client
- Druckertreiber
- BitLocker
- Windows Updates

Winget-Paket-IDs aus der Standardsoftware-Auswahl werden beim Erzeugen von Softwareeinträgen in der Bemerkung dokumentiert. Die produktive Tabelle `software_standard.csv` bleibt dadurch unverändert kompatibel.

Die Standardkartenansicht ist scan-getrieben: Wenn ein Full-Software-Scan geladen ist, zeigt sie nur den eindeutigen Scan-Kontext, z. B. `AS-0004 / GOLDENZOPF`. Vorhandene kuratierte Einträge aus `software_standard.csv` werden mit erkannter Standardsoftware aus dem Full-Scan ergänzt. Noch nicht kuratierte, aber als Standard erkannte Scan-Treffer können direkt in `software_standard.csv` übernommen werden. Der Reiter `Full-Scan` bleibt für alle Roh- und Zusatzfunde zuständig.

Bei ausgewählter Software wird dynamisch angezeigt, auf welchen anderen Assets dieselbe Anwendung ebenfalls vorkommt. Diese Information wird nicht als redundantes Datenfeld gespeichert, sondern aus `software_standard.csv` und dem geladenen Full-Scan berechnet.

Wenn Adobe installiert ist und ein Signatur-Zertifikat benötigt wird, aber fehlt, kann direkt ein Knowledge-Eintrag erstellt werden.

Office-Betrieb:
- `KB-0103` dokumentiert Office Deployment Tool, ADMX/ADML-Vorlagen, Office-Update-Richtlinien und Click-to-Run-Updatebefehle assetneutral.
- Der Artikel enthält einen 1-Klick-Ablauf für lokale Office-Paketordner mit Download-/Install-BAT, Signaturprüfung und Nachlaufkontrolle.
- Eine Profilmatrix beschreibt Paket- und Versionsauswahl für Microsoft 365 Current, Office LTSC 2024/2021, Standard, ProPlus, Project, Visio, LanguagePack und ProofingTools.
- Ein Wizard-Konzept beschreibt, wie Lizenzmodell, Version, Pakete, Sprachen, Updatekanal und Sicherheitsoptionen zur passenden ODT-XML-Konfiguration führen.
- Die Knowledge-Karte `KB-0103` bietet ein integriertes Auswahltool: Schrittweise Ziel, Version, Pakete, Sprachen, Optionen und Vorschau wählen; danach kann eine bereinigte `configuration.xml` kopiert oder heruntergeladen werden.
- Der Wizard erzeugt zusätzlich eine passende `MSO-Config.reg` und `README.txt`; Lizenzmodell, Updatekanal und Policy-Werte werden aus derselben Auswahl wie die ODT-XML abgeleitet.
- Für Volumenlizenz-Produkte bietet die Vorschau temporäre Product-Key-Felder. Diese Werte werden nicht persistiert und nur in die aktuell kopierte oder heruntergeladene XML übernommen.
- Product Keys, Tenantdaten, interne Updatepfade und Lizenzdetails werden nicht in Knowledge oder Repository gespeichert; Beispiele verwenden Platzhalter.
