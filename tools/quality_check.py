#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lokaler Qualitaetscheck ohne Schreibzugriff auf produktive CSV-Dateien.

Prueft Datenmodell, Referenzen, Dubletten, Netzwerkfelder, Stammdaten und
software_full.json als erweiterte Vorstufe fuer Release-Checks.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app_server


ASSET_REF_TABLES = ["hardware", "software", "netzwerk", "tickets", "notizen"]


def fail(message: str) -> None:
    raise AssertionError(message)


def assert_unique_ids(data: dict[str, list[dict[str, str]]]) -> None:
    id_fields = {
        "assets": "Asset-ID",
        "hardware": "Hardware-ID",
        "software": "Software-ID",
        "netzwerk": "Netzwerk-ID",
        "tickets": "Ticket-ID",
        "notizen": "Notiz-ID",
        "knowledge": "Knowledge-ID",
    }
    for table, field in id_fields.items():
        seen: set[str] = set()
        for row in data.get(table, []):
            value = row.get(field, "").strip()
            if not value:
                fail(f"{table}: leere ID in {field}")
            if value in seen:
                fail(f"{table}: doppelte ID {value}")
            seen.add(value)


def assert_asset_refs(data: dict[str, list[dict[str, str]]]) -> None:
    asset_ids = {row.get("Asset-ID", "") for row in data.get("assets", [])}
    for table in ASSET_REF_TABLES:
        for row in data.get(table, []):
            asset_id = row.get("Asset-ID", "").strip()
            if asset_id and asset_id not in asset_ids:
                fail(f"{table}: verwaiste Asset-ID {asset_id}")


def assert_network_values(data: dict[str, list[dict[str, str]]]) -> None:
    ip_re = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")
    mac_re = re.compile(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$")
    for row in data.get("netzwerk", []):
        if row.get("Adressart") == "Statisch":
            ip = row.get("IP-Adresse", "").strip()
            if not ip_re.match(ip) or any(int(part) > 255 for part in ip.split(".")):
                fail(f"netzwerk: ungueltige statische IP {ip}")
            if not row.get("DNS", "").strip():
                fail("netzwerk: statische Adresse ohne DNS")
        mac = row.get("MAC-Adresse", "").strip()
        if mac and not mac_re.match(mac):
            fail(f"netzwerk: ungueltige MAC-Adresse {mac}")
        vlan = row.get("VLAN", "").strip()
        if vlan and vlan != "-" and vlan.isdigit() and not (1 <= int(vlan) <= 4094):
            fail(f"netzwerk: VLAN ausserhalb 1-4094: {vlan}")


def assert_stammdaten_files() -> None:
    stamm_dir = app_server.WEB_ROOT / "stammdaten"
    files = sorted(stamm_dir.glob("*.md"))
    if len(files) < 10:
        fail("zu wenige Stammdaten-Dateien")
    for path in files:
        values = [line for line in path.read_text(encoding="utf-8-sig").splitlines() if line.startswith("- ")]
        if not values:
            fail(f"Stammdaten ohne Werte: {path.name}")


def assert_software_full_json() -> None:
    path = app_server.SOFTWARE_FULL_JSON
    if not path.exists():
        return
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        fail("software_full.json ist kein Objekt")
    if "Software" in payload and not isinstance(payload["Software"], list):
        fail("software_full.json: Software ist keine Liste")


def main() -> None:
    app_server.ensure_dirs()
    data = app_server.load_all()
    app_server.validate_payload(data)
    assert_unique_ids(data)
    assert_asset_refs(data)
    assert_network_values(data)
    assert_stammdaten_files()
    assert_software_full_json()
    print("Quality-Check OK")
    print("- CSV-Payload vollstaendig")
    print("- IDs eindeutig")
    print("- Asset-Referenzen plausibel")
    print("- Netzwerkwerte plausibel")
    print("- Stammdaten-Dateien plausibel")
    print("- software_full.json plausibel oder nicht vorhanden")


if __name__ == "__main__":
    main()
