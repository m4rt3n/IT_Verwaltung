#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Reproduzierbarer Smoke-Test fuer die lokale IT-Verwaltung.

Der Test startet den Server im selben Prozess auf einem freien lokalen Port,
fragt zentrale API-Endpunkte ab und prueft Validierung/Sicherheitsgrenzen.
Produktive CSV-Dateien werden nicht geschrieben.
"""

from __future__ import annotations

import json
import csv
import sys
import threading
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app_server

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def get_json(base_url: str, path: str) -> object:
    with urllib.request.urlopen(base_url + path, timeout=10) as response:
        if response.status != 200:
            raise AssertionError(f"{path} antwortet mit HTTP {response.status}")
        return json.load(response)


def post_json(base_url: str, path: str, payload: object, origin: str | None = None) -> tuple[int, str]:
    raw = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        base_url + path,
        data=raw,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    if origin:
        request.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status, response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8")


def check_csv_headers() -> None:
    for key, filename in app_server.TABLE_FILES.items():
        path = app_server.DATA_DIR / filename
        if not path.exists() and key in app_server.LEGACY_TABLE_FILES:
            path = app_server.DATA_DIR / app_server.LEGACY_TABLE_FILES[key]
        if not path.exists():
            continue
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=app_server.sniff_delimiter(path))
            fields = reader.fieldnames or []
        missing = [field for field in app_server.REQUIRED_FIELDS[key] if field not in fields]
        if missing:
            raise AssertionError(f"{path.name} ohne Pflichtspalten: {', '.join(missing)}")


def check_start_files() -> None:
    required = [
        PROJECT_ROOT / "start.bat",
        PROJECT_ROOT / "start.ps1",
        PROJECT_ROOT / "scripts" / "Start-Web.bat",
        PROJECT_ROOT / "scripts" / "Start-Web.ps1",
    ]
    missing = [path.name for path in required if not path.exists()]
    if missing:
        raise AssertionError("Startdateien fehlen: " + ", ".join(missing))


def check_stammdaten_files() -> None:
    stammdaten_dir = PROJECT_ROOT / "web_ui" / "stammdaten"
    files = sorted(stammdaten_dir.glob("*.md"))
    if len(files) < 5:
        raise AssertionError("Zu wenige Stammdaten-Dateien gefunden.")
    empty = [path.name for path in files if not path.read_text(encoding="utf-8-sig").strip()]
    if empty:
        raise AssertionError("Leere Stammdaten-Dateien: " + ", ".join(empty))


def check_import_preview_helper() -> None:
    admin_js = (PROJECT_ROOT / "web_ui" / "js" / "admin.js").read_text(encoding="utf-8-sig")
    required_tokens = [
        "openCsvImportAssistant",
        "analyzeCsvImport",
        "showCsvImportPreview",
        "Diese Vorschau schreibt keine Daten",
    ]
    missing = [token for token in required_tokens if token not in admin_js]
    if missing:
        raise AssertionError("CSV-Import-Vorschau unvollstaendig: " + ", ".join(missing))
    fixture = PROJECT_ROOT / "tools" / "fixtures" / "import_preview_assets.csv"
    with fixture.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        fields = reader.fieldnames or []
        rows = list(reader)
    missing_fields = [field for field in app_server.REQUIRED_FIELDS["assets"] if field not in fields]
    if missing_fields or not rows:
        raise AssertionError("CSV-Import-Beispieldatei ist nicht plausibel.")


def main() -> None:
    app_server.ensure_dirs()
    if app_server.TABLE_FILES.get("software") != "software_standard.csv":
        raise AssertionError("Software-Tabelle nutzt nicht software_standard.csv")
    if app_server.LEGACY_TABLE_FILES.get("software") != "software.csv":
        raise AssertionError("Legacy-Softwarepfad software.csv fehlt")
    check_csv_headers()
    check_start_files()
    check_stammdaten_files()
    check_import_preview_helper()

    config = app_server.load_app_config()
    port = app_server.find_free_port(int(config.get("port", 8765)), int(config.get("port_scan_range", 50)))
    server = app_server.ThreadingHTTPServer(("127.0.0.1", port), app_server.Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{port}"
    try:
        status = get_json(base_url, "/api/status")
        if not isinstance(status, dict) or not status.get("ok"):
            raise AssertionError("/api/status liefert keinen ok-Status")
        if status.get("port") != port or status.get("url") != f"http://localhost:{port}":
            raise AssertionError("/api/status meldet nicht die tatsaechliche Smoke-Test-URL")
        if status.get("table_files", {}).get("software") != "software_standard.csv":
            raise AssertionError("/api/status meldet nicht software_standard.csv als aktive Software-Tabelle")
        if "node" not in status:
            raise AssertionError("/api/status liefert keine Node-Erkennung")

        data = get_json(base_url, "/api/load")
        if not isinstance(data, dict):
            raise AssertionError("/api/load liefert kein Tabellenobjekt")
        missing = [key for key in app_server.TABLE_FILES if key not in data]
        if missing:
            raise AssertionError("/api/load ohne Tabellen: " + ", ".join(missing))

        help_payload = get_json(base_url, "/api/help")
        docs = help_payload.get("docs", []) if isinstance(help_payload, dict) else []
        if len(docs) < 5:
            raise AssertionError("/api/help liefert weniger als fuenf Help-Dokumente")

        software_full = get_json(base_url, "/api/software-full")
        if not isinstance(software_full, dict) or "available" not in software_full:
            raise AssertionError("/api/software-full liefert keinen erwarteten Status")

        app_server.validate_payload(data)

        incomplete_status, incomplete_text = post_json(base_url, "/api/save", {"assets": []})
        if incomplete_status != 500 or "Payload unvollst" not in incomplete_text:
            raise AssertionError(
                f"Unvollstaendige Save-Payload wurde nicht sauber abgelehnt: {incomplete_status} {incomplete_text}"
            )

        rejected_status, rejected_text = post_json(
            base_url,
            "/api/backup",
            {},
            origin="https://example.invalid",
        )
        if rejected_status != 403:
            raise AssertionError(f"Fremder Origin wurde nicht abgelehnt: {rejected_status} {rejected_text}")

        scanner_status, scanner_text = post_json(base_url, "/api/scanner/start", {"mode": "unbekannt"})
        if scanner_status != 400:
            raise AssertionError(f"Ungueltiger Scanner-Modus wurde nicht abgelehnt: {scanner_status} {scanner_text}")

        print("Smoke-Test OK")
        print(f"- Server: {base_url}")
        print(f"- Status-URL: {status.get('url')}")
        print(f"- Tabellen: {', '.join(app_server.TABLE_FILES.keys())}")
        print("- CSV-Header: OK")
        print("- Startdateien: OK")
        print("- Stammdaten: OK")
        print("- Import-Vorschau-Helfer: OK")
        print("- Unvollstaendige Save-Payload: OK")
        print(f"- Hilfeartikel: {len(docs)}")
        print("- Lokale POST-Schutzpruefung: OK")
        print("- Scanner-Startschutz: OK")
    finally:
        server.shutdown()
        thread.join(timeout=5)


if __name__ == "__main__":
    main()
