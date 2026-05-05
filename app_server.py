#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IT-Verwaltung v20 - Portabler CSV Server

Start:
  start.bat

Funktion:
  - startet lokalen HTTP Server
  - lädt web_ui/data/*.csv
  - schreibt Änderungen zurück in CSV
  - erstellt Backups unter web_ui/backups
"""

from __future__ import annotations

import csv
import json
import os
import shutil
import socket
import sys
import time
import webbrowser
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).resolve().parent
WEB_ROOT = PROJECT_ROOT / "web_ui"
DATA_DIR = WEB_ROOT / "data"
BACKUP_DIR = WEB_ROOT / "backups"
PREFERRED_PORT = 8765

TABLE_FILES = {
    "assets": "assets.csv",
    "hardware": "hardware.csv",
    "software": "software.csv",
    "netzwerk": "netzwerk.csv",
    "tickets": "tickets.csv",
    "notizen": "notizen.csv",
    "knowledge": "knowledge.csv",
}

DEFAULT_COLUMNS = {
    "assets": ["Asset-ID","Gerätename","Asset-Typ","Standort","Raum","Status","Hauptnutzer","Hersteller","Modellserie","Modell","Seriennummer","Inventarnummer","Betriebssystem","Domäne","Notizen"],
    "hardware": ["Hardware-ID","Asset-ID","Gerätename","CPU","RAM","Speicher","Monitor","Dockingstation","Garantie bis","Bemerkung"],
    "software": ["Software-ID","Asset-ID","Gerätename","Softwarename","Version","Hersteller","Lizenzstatus","Update-Status","Kritikalität","Bemerkung"],
    "netzwerk": ["Netzwerk-ID","Asset-ID","Gerätename","Netzwerktyp","Adressart","Verbindungstyp","IP-Adresse","MAC-Adresse","DNS","VLAN","Switch-Port","Wanddose","Access Point","SSID","Bemerkung"],
    "tickets": ["Ticket-ID","Asset-ID","Gerätename","Titel","Kategorie","Priorität","Status","Tags","Ursache","Lösung","Knowledge-ID"],
    "notizen": ["Notiz-ID","Asset-ID","Gerätename","Titel","Kategorie","Status","Inhalt"],
    "knowledge": ["Knowledge-ID","Titel","Kategorie","Tags","Lösung"],
}

def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def find_free_port(start: int) -> int:
    port = start
    while port < start + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                print(f"Port {port} ist belegt. Prüfe nächsten Port ...")
                port += 1
    raise RuntimeError("Kein freier Port gefunden.")

def sniff_delimiter(path: Path) -> str:
    try:
        first = path.read_text(encoding="utf-8-sig").splitlines()[0]
        return ";" if first.count(";") >= first.count(",") else ","
    except Exception:
        return ";"

def read_csv_table(key: str) -> list[dict[str, str]]:
    path = DATA_DIR / TABLE_FILES[key]
    if not path.exists():
        return []
    delimiter = sniff_delimiter(path)
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=delimiter)
        return [dict(row) for row in reader]

def columns_for(key: str, rows: list[dict[str, object]]) -> list[str]:
    cols: list[str] = []
    for c in DEFAULT_COLUMNS.get(key, []):
        if c not in cols:
            cols.append(c)
    for row in rows:
        for c in row.keys():
            if c not in cols:
                cols.append(c)
    return cols

def write_csv_table(key: str, rows: list[dict[str, object]]) -> None:
    path = DATA_DIR / TABLE_FILES[key]
    cols = columns_for(key, rows)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=cols, delimiter=";", extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            clean = {c: "" if row.get(c) is None else str(row.get(c, "")) for c in cols}
            writer.writerow(clean)

def load_all() -> dict[str, list[dict[str, str]]]:
    ensure_dirs()
    return {key: read_csv_table(key) for key in TABLE_FILES}

def backup_all() -> Path:
    ensure_dirs()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target = BACKUP_DIR / f"backup_{stamp}"
    target.mkdir(parents=True, exist_ok=True)
    for filename in TABLE_FILES.values():
        src = DATA_DIR / filename
        if src.exists():
            shutil.copy2(src, target / filename)
    return target

def save_all(payload: dict[str, object]) -> None:
    ensure_dirs()
    backup_all()
    for key in TABLE_FILES:
        rows = payload.get(key, [])
        if not isinstance(rows, list):
            rows = []
        write_csv_table(key, rows)  # type: ignore[arg-type]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def send_json(self, data: object, status: int = 200) -> None:
        raw = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def send_text(self, text: str, status: int = 200) -> None:
        raw = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/load":
            try:
                self.send_json(load_all())
            except Exception as e:
                self.send_text(f"Fehler beim Laden: {e}", 500)
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/save":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length).decode("utf-8")
                payload = json.loads(raw)
                if not isinstance(payload, dict):
                    raise ValueError("Payload muss ein JSON-Objekt sein.")
                save_all(payload)
                self.send_json({"ok": True, "saved": list(TABLE_FILES.keys())})
            except Exception as e:
                self.send_text(f"Fehler beim Speichern: {e}", 500)
            return
        if path == "/api/backup":
            try:
                target = backup_all()
                self.send_json({"ok": True, "backup": str(target.name)})
            except Exception as e:
                self.send_text(f"Fehler beim Backup: {e}", 500)
            return
        self.send_text("Not found", 404)

def main() -> None:
    ensure_dirs()
    port = find_free_port(PREFERRED_PORT)
    url = f"http://localhost:{port}"
    print("")
    print("IT-Verwaltung Bootstrap v20 - CSV Persistenz")
    print(f"Projekt: {PROJECT_ROOT}")
    print(f"Web:     {WEB_ROOT}")
    print(f"CSV:     {DATA_DIR}")
    print(f"Backup:  {BACKUP_DIR}")
    print(f"URL:     {url}")
    print("")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("Server läuft. Beenden mit STRG+C.")
    server.serve_forever()

if __name__ == "__main__":
    main()
