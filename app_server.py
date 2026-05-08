#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IT-Verwaltung v44 - Safety Guard CSV Server

Start:
  start.bat

Funktion:
  - startet den lokalen Webserver fuer web_ui
  - stellt /api/load, /api/help, /api/save und /api/backup bereit
  - laedt web_ui/data/*.csv mit Semikolon- oder Komma-Erkennung
  - prueft Save-Payloads vor dem Schreiben auf Vollstaendigkeit
  - erstellt vor jedem CSV-Schreibvorgang ein Backup unter web_ui/backups
"""

from __future__ import annotations

import csv
import json
import os
import shutil
import socket
import subprocess
import sys
import threading
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
SOFTWARE_FULL_JSON = DATA_DIR / "software_full.json"
HELP_DIR = PROJECT_ROOT / "dokumentation" / "help"
CONFIG_DIR = PROJECT_ROOT / "web_ui" / "config"
APP_CONFIG_FILE = CONFIG_DIR / "app_config.json"

DEFAULT_APP_CONFIG = {
    "host": "127.0.0.1",
    "port": 8765,
    "port_scan_range": 50,
    "open_browser": True,
    "backup_retention_note": "Backups werden lokal unter web_ui/backups abgelegt; automatische Loeschung ist nicht aktiv.",
}

NODE_CANDIDATES = [
    ("Standard Node.js unter Program Files", Path(os.environ.get("ProgramFiles", "")) / "nodejs" / "node.exe", False),
    ("Standard Node.js unter Program Files x86", Path(os.environ.get("ProgramFiles(x86)", "")) / "nodejs" / "node.exe", False),
    ("Standard Node.js im Benutzerprofil", Path(os.environ.get("LocalAppData", "")) / "Programs" / "nodejs" / "node.exe", False),
    ("Fallback: Adobe Creative Cloud Node", Path(os.environ.get("ProgramFiles", "")) / "Adobe" / "Adobe Creative Cloud Experience" / "libs" / "node.exe", True),
    ("Fallback: Adobe Creative Cloud Libraries Node", Path(os.environ.get("ProgramFiles", "")) / "Common Files" / "Adobe" / "Creative Cloud Libraries" / "libs" / "node.exe", True),
]


def load_app_config() -> dict[str, object]:
    config = dict(DEFAULT_APP_CONFIG)
    if APP_CONFIG_FILE.exists():
        with APP_CONFIG_FILE.open("r", encoding="utf-8-sig") as f:
            loaded = json.load(f)
        if not isinstance(loaded, dict):
            raise ValueError("web_ui/config/app_config.json muss ein JSON-Objekt sein.")
        config.update(loaded)
    return config

TABLE_FILES = {
    "assets": "assets.csv",
    "hardware": "hardware.csv",
    "software": "software_standard.csv",
    "netzwerk": "netzwerk.csv",
    "tickets": "tickets.csv",
    "notizen": "notizen.csv",
    "knowledge": "knowledge.csv",
}

LEGACY_TABLE_FILES = {
    "software": "software.csv",
}

SCANNER_COMMANDS = {
    "normal": "scripts/Start-HardwareScan.bat",
    "software": "scripts/Start-SoftwareScan.bat",
    "software_full": "scripts/Start-SoftwareScan-Full.bat",
    "full": "scripts/Start-SoftwareScan-Full.bat",
    "check": "scripts/Check-HardwareScanner-Syntax.bat",
}

HELP_FILES = [
    ("schnellstart", "Schnellstart", "SCHNELLSTART.md"),
    ("faq", "FAQ", "FAQ.md"),
    ("fehlerhilfe", "Fehlerhilfe", "FEHLERHILFE.md"),
    ("glossar", "Glossar", "GLOSSAR.md"),
    ("checklisten", "Checklisten", "CHECKLISTEN.md"),
]

DEFAULT_COLUMNS = {
    "assets": ["Asset-ID","Gerätename","Asset-Typ","Standort","Raum","Status","Hauptnutzer","Hersteller","Modellserie","Modell","Seriennummer","Inventarnummer","Betriebssystem","Domäne","Notizen"],
    "hardware": ["Hardware-ID","Asset-ID","Gerätename","CPU","RAM","Speicher","Monitor","Dockingstation","Garantie bis","Bemerkung"],
    "software": ["Software-ID","Asset-ID","Gerätename","Softwarename","Version","Hersteller","Lizenzstatus","Update-Status","Kritikalität","Bemerkung"],
    "netzwerk": ["Netzwerk-ID","Asset-ID","Gerätename","Netzwerktyp","Adressart","Verbindungstyp","IP-Adresse","MAC-Adresse","DNS","VLAN","Switch-Port","Wanddose","Access Point","SSID","Bemerkung"],
    "tickets": ["Ticket-ID","Asset-ID","Gerätename","Titel","Kategorie","Priorität","Status","Tags","Ursache","Lösung","Knowledge-ID"],
    "notizen": ["Notiz-ID","Asset-ID","Gerätename","Titel","Kategorie","Status","Inhalt"],
    "knowledge": ["Knowledge-ID","Titel","Kategorie","Tags","Lösung"],
}

REQUIRED_FIELDS = {
    "assets": ["Asset-ID", "Gerätename", "Asset-Typ", "Status"],
    "hardware": ["Hardware-ID", "Asset-ID", "Gerätename"],
    "software": ["Software-ID", "Asset-ID", "Gerätename", "Softwarename"],
    "netzwerk": ["Netzwerk-ID", "Asset-ID", "Gerätename", "Netzwerktyp", "Adressart"],
    "tickets": ["Ticket-ID", "Asset-ID", "Gerätename", "Titel", "Status"],
    "notizen": ["Notiz-ID", "Asset-ID", "Gerätename", "Titel"],
    "knowledge": ["Knowledge-ID", "Titel", "Lösung"],
}

def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

def find_free_port(start: int, scan_range: int = 50) -> int:
    port = start
    while port < start + scan_range:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                print(f"Port {port} ist belegt. Prüfe nächsten Port ...")
                port += 1
    raise RuntimeError("Kein freier Port gefunden.")

def detect_node_runtime() -> dict[str, object]:
    path_from_path = shutil.which("node")
    if path_from_path:
        return {
            "available": True,
            "path": path_from_path,
            "source": "Standard Node.js aus PATH",
            "fallback": False,
            "warning": "",
        }
    for source, candidate, is_fallback in NODE_CANDIDATES:
        if candidate.exists():
            return {
                "available": True,
                "path": str(candidate),
                "source": source,
                "fallback": is_fallback,
                "warning": "Nur Adobe-Node als Fallback gefunden; fuer reproduzierbare Checks bitte Standard-Node.js installieren." if is_fallback else "",
            }
    return {
        "available": False,
        "path": "",
        "source": "nicht gefunden",
        "fallback": False,
        "warning": "Node.js wurde nicht gefunden; JavaScript-Syntaxchecks koennen lokal nicht ausgefuehrt werden.",
    }

def local_request_allowed(headers) -> bool:
    host = headers.get("Host", "")
    allowed_hosts = {"127.0.0.1", "localhost"}
    host_name = host.split(":", 1)[0].lower()
    if host_name not in allowed_hosts:
        return False
    for header in ("Origin", "Referer"):
        value = headers.get(header, "")
        if not value:
            continue
        parsed = urlparse(value)
        if parsed.hostname and parsed.hostname.lower() not in allowed_hosts:
            return False
    return True

def sniff_delimiter(path: Path) -> str:
    try:
        first = path.read_text(encoding="utf-8-sig").splitlines()[0]
        return ";" if first.count(";") >= first.count(",") else ","
    except Exception:
        return ";"

def read_csv_table(key: str) -> list[dict[str, str]]:
    path = DATA_DIR / TABLE_FILES[key]
    if not path.exists() and key in LEGACY_TABLE_FILES:
        legacy_path = DATA_DIR / LEGACY_TABLE_FILES[key]
        if legacy_path.exists():
            path = legacy_path
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

def load_software_full() -> dict[str, object]:
    ensure_dirs()
    if not SOFTWARE_FULL_JSON.exists():
        return {
            "available": False,
            "ScannerContext": {},
            "SoftwareSourcesStatus": {},
            "Software": [],
        }
    with SOFTWARE_FULL_JSON.open("r", encoding="utf-8-sig") as f:
        payload = json.load(f)
    if not isinstance(payload, dict):
        raise ValueError("software_full.json muss ein JSON-Objekt sein.")
    payload["available"] = True
    payload.setdefault("ScannerContext", {})
    payload.setdefault("Asset", {})
    payload.setdefault("SoftwareSourcesStatus", {})
    payload.setdefault("Software", [])
    if not payload["Asset"]:
        context = payload.get("ScannerContext", {})
        current_user = context.get("CurrentUser", "") if isinstance(context, dict) else ""
        hostname = current_user.split("\\", 1)[0] if "\\" in current_user else ""
        assets = read_csv_table("assets")
        asset = next(
            (
                row for row in assets
                if hostname and row.get("Gerätename", "").lower() == hostname.lower()
            ),
            {},
        )
        if asset:
            payload["Asset"] = {
                "Asset-ID": asset.get("Asset-ID", ""),
                "Gerätename": asset.get("Gerätename", ""),
            }
    asset_info = payload.get("Asset", {})
    if isinstance(asset_info, dict):
        for row in payload.get("Software", []):
            if isinstance(row, dict):
                row.setdefault("Asset-ID", asset_info.get("Asset-ID", ""))
                row.setdefault("Gerätename", asset_info.get("Gerätename", ""))
    return payload

def load_help_docs() -> dict[str, object]:
    docs: list[dict[str, str]] = []
    for slug, title, filename in HELP_FILES:
        path = HELP_DIR / filename
        if not path.exists():
            docs.append({
                "slug": slug,
                "title": title,
                "filename": filename,
                "content": f"# {title}\n\nHilfedatei nicht gefunden: `{filename}`",
            })
            continue
        docs.append({
            "slug": slug,
            "title": title,
            "filename": filename,
            "content": path.read_text(encoding="utf-8-sig"),
        })
    return {"docs": docs}

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

def validate_payload(payload: dict[str, object]) -> None:
    missing = [key for key in TABLE_FILES if key not in payload]
    invalid = [key for key in TABLE_FILES if key in payload and not isinstance(payload[key], list)]
    if missing:
        raise ValueError("Payload unvollständig. Fehlende Tabellen: " + ", ".join(missing))
    if invalid:
        raise ValueError("Payload ungültig. Tabellen müssen Listen sein: " + ", ".join(invalid))
    field_errors: list[str] = []
    for key, required_fields in REQUIRED_FIELDS.items():
        rows = payload.get(key, [])
        if not isinstance(rows, list):
            continue
        for index, row in enumerate(rows, start=1):
            if not isinstance(row, dict):
                field_errors.append(f"{key}[{index}] ist kein Objekt")
                continue
            missing_fields = [
                field for field in required_fields
                if not str(row.get(field, "")).strip()
            ]
            if missing_fields:
                field_errors.append(f"{key}[{index}]: " + ", ".join(missing_fields))
    if field_errors:
        raise ValueError("Pflichtfelder fehlen: " + "; ".join(field_errors[:20]))

def save_all(payload: dict[str, object]) -> None:
    ensure_dirs()
    validate_payload(payload)
    backup_all()
    for key in TABLE_FILES:
        rows = payload[key]
        write_csv_table(key, rows)  # type: ignore[arg-type]

def start_scanner(mode: str) -> dict[str, object]:
    if mode not in SCANNER_COMMANDS:
        raise ValueError("Unbekannter Scanner-Modus.")
    script = PROJECT_ROOT / SCANNER_COMMANDS[mode]
    if not script.exists():
        raise FileNotFoundError(f"Startdatei nicht gefunden: {script.name}")
    if os.name != "nt":
        raise RuntimeError("Scanner-Start ist nur unter Windows verfügbar.")

    creationflags = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)
    process = subprocess.Popen(
        ["cmd.exe", "/c", str(script)],
        cwd=str(PROJECT_ROOT),
        creationflags=creationflags,
    )
    return {"ok": True, "mode": mode, "command": script.name, "pid": process.pid}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def end_headers(self) -> None:
        path = urlparse(self.path).path
        if not path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

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
        if path == "/api/software-full":
            try:
                self.send_json(load_software_full())
            except Exception as e:
                self.send_text(f"Fehler beim Laden der Full-Softwaredaten: {e}", 500)
            return
        if path == "/api/help":
            try:
                self.send_json(load_help_docs())
            except Exception as e:
                self.send_text(f"Fehler beim Laden der Hilfe: {e}", 500)
            return
        if path == "/api/status":
            try:
                config = load_app_config()
                actual_host, actual_port = self.server.server_address[:2]
                configured_port = int(config.get("port", 8765))
                self.send_json({
                    "ok": True,
                    "version": "v44",
                    "host": actual_host,
                    "port": actual_port,
                    "configured_port": configured_port,
                    "port_changed": actual_port != configured_port,
                    "url": f"http://localhost:{actual_port}",
                    "tables": list(TABLE_FILES.keys()),
                    "table_files": TABLE_FILES,
                    "legacy_table_files": LEGACY_TABLE_FILES,
                    "required_fields": REQUIRED_FIELDS,
                    "node": detect_node_runtime(),
                    "help_docs": [title for _, title, _ in HELP_FILES],
                    "scanner_modes": list(SCANNER_COMMANDS.keys()),
                })
            except Exception as e:
                self.send_text(f"Fehler beim Status: {e}", 500)
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path.startswith("/api/") and not local_request_allowed(self.headers):
            self.send_text("Lokale Anfrage abgelehnt.", 403)
            return
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
        if path == "/api/scanner/start":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length).decode("utf-8") if length else "{}"
                payload = json.loads(raw)
                if not isinstance(payload, dict):
                    raise ValueError("Payload muss ein JSON-Objekt sein.")
                mode = str(payload.get("mode", "")).strip()
                self.send_json(start_scanner(mode))
            except ValueError as e:
                self.send_text(str(e), 400)
            except Exception as e:
                self.send_text(f"Scanner konnte nicht gestartet werden: {e}", 500)
            return
        self.send_text("Not found", 404)

def main() -> None:
    ensure_dirs()
    config = load_app_config()
    host = str(config.get("host", "127.0.0.1") or "127.0.0.1")
    if host not in ("127.0.0.1", "localhost"):
        raise RuntimeError("Aus Sicherheitsgruenden sind nur 127.0.0.1 oder localhost als Host erlaubt.")
    preferred_port = int(config.get("port", 8765))
    scan_range = int(config.get("port_scan_range", 50))
    port = find_free_port(preferred_port, scan_range)
    url = f"http://localhost:{port}"
    port_changed = port != preferred_port
    print("")
    print("IT-Verwaltung v44 - Safety Guard CSV Server")
    print(f"Projekt: {PROJECT_ROOT}")
    print(f"Web:     {WEB_ROOT}")
    print(f"CSV:     {DATA_DIR}")
    print(f"Backup:  {BACKUP_DIR}")
    print("")
    print("============================================================")
    print(f"START-URL: {url}")
    if port_changed:
        print(f"HINWEIS: Port {preferred_port} ist belegt. Die App laeuft stattdessen auf Port {port}.")
        print(f"Bitte diese URL verwenden: {url}")
    else:
        print(f"Port:      {port} (Standardport frei)")
    print("============================================================")
    print("")
    print("API:")
    print("  GET  /api/load    CSV-Daten laden")
    print("  GET  /api/help    lokale Help-Dateien laden")
    print("  GET  /api/status  Serverstatus und Konfiguration pruefen")
    print("  POST /api/save    CSV-Daten nach Payload-Pruefung speichern")
    print("  POST /api/backup  CSV-Ordner-Backup erstellen")
    print("  POST /api/scanner/start  lokalen Scanner starten")
    print("")
    print("Schutz:")
    print("  - Save nur mit vollstaendigen Tabellen")
    print("  - Backup vor jedem CSV-Schreibvorgang")
    print("  - Zugriff nur lokal auf 127.0.0.1")
    print("")
    server = ThreadingHTTPServer((host, port), Handler)
    if bool(config.get("open_browser", True)):
        try:
            threading.Thread(target=webbrowser.open, args=(url,), daemon=True).start()
        except Exception:
            pass
    print("Server laeuft. Beenden mit STRG+C.")
    server.serve_forever()

if __name__ == "__main__":
    main()
