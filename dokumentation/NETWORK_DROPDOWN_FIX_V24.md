# Network Dropdown Fix v24

## Problem

In v23 konnte WLAN nicht mehr sauber gewählt werden und Netzwerk-Bearbeitung war instabil.

## Fix

- robustes Filtern mit Fallback-Werten
- Netzwerktyp-Wechsel setzt Verbindungstyp automatisch auf passenden ersten Wert
- Bearbeiten-Dialog nutzt dieselbe Logik wie Wizard
