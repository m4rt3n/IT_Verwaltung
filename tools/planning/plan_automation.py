#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PLAN_DIR = ROOT / "planung"
DOC_DIR = ROOT / "dokumentation"
DONE_LOG = DOC_DIR / "ERLEDIGTE_NEXT_AUFGABEN.md"

PLAN_FILES = {
    "NEXT": PLAN_DIR / "NEXT.md",
    "TODO": PLAN_DIR / "TODO.md",
    "WARTESCHLANGE": PLAN_DIR / "WARTESCHLANGE.md",
}

TASK_RE = re.compile(r"^(?P<prefix>\s*-\s+\[(?P<mark>[ xX])\]\s+)(?P<title>.+?)\s*$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


@dataclass
class Task:
    source: str
    section: str
    line_no: int
    done: bool
    title: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig") if path.exists() else ""


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def parse_tasks(source: str, path: Path) -> list[Task]:
    tasks: list[Task] = []
    section = "Allgemein"
    for idx, line in enumerate(read_text(path).splitlines(), start=1):
        heading = HEADING_RE.match(line)
        if heading:
            section = heading.group(2)
            continue
        match = TASK_RE.match(line)
        if match:
            tasks.append(
                Task(
                    source=source,
                    section=section,
                    line_no=idx,
                    done=match.group("mark").lower() == "x",
                    title=match.group("title"),
                )
            )
    return tasks


def all_tasks() -> list[Task]:
    tasks: list[Task] = []
    for source, path in PLAN_FILES.items():
        tasks.extend(parse_tasks(source, path))
    return tasks


def first_open(tasks: list[Task], source: str) -> Task | None:
    return next((task for task in tasks if task.source == source and not task.done), None)


def docs_index() -> list[str]:
    if not DOC_DIR.exists():
        return []
    return [path.name for path in sorted(DOC_DIR.glob("*.md"))]


def append_done_log(tasks: list[Task]) -> None:
    done_next = [task for task in tasks if task.source == "NEXT" and task.done]
    if not done_next:
        return

    existing = read_text(DONE_LOG).rstrip()
    lines: list[str] = []
    if not existing:
        lines.extend(
            [
                "# Erledigte NEXT-Aufgaben",
                "",
                "Automatisch gepflegter Verlauf erledigter Aufgaben aus `planung/NEXT.md`.",
                "",
            ]
        )

    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines.extend([f"## {stamp}", ""])
    for task in done_next:
        lines.append(f"- `{task.section}`: {task.title}")
    lines.append("")

    write_text(DONE_LOG, (existing + "\n\n" if existing else "") + "\n".join(lines).rstrip() + "\n")


def cleanup_done_next() -> bool:
    next_path = PLAN_FILES["NEXT"]
    text = read_text(next_path)
    if not text:
        return False

    tasks = parse_tasks("NEXT", next_path)
    done_lines = {task.line_no for task in tasks if task.done}
    if not done_lines:
        normalize_next_file()
        return False

    append_done_log(tasks)

    kept: list[str] = []
    removed = False
    for line_no, line in enumerate(text.splitlines(), start=1):
        if line_no in done_lines:
            removed = True
            continue
        kept.append(line)

    cleaned = prune_empty_auto_sections(kept)
    write_text(next_path, "\n".join(cleaned).rstrip() + "\n")
    normalize_next_file()
    return removed


def prune_empty_auto_sections(lines: list[str]) -> list[str]:
    return prune_empty_sections(lines, only_auto=True)


def normalize_next_file() -> None:
    next_path = PLAN_FILES["NEXT"]
    lines = read_text(next_path).splitlines()
    cleaned = prune_empty_sections(lines, only_auto=False)
    write_text(next_path, "\n".join(cleaned).rstrip() + "\n")


def prune_empty_sections(lines: list[str], only_auto: bool) -> list[str]:
    result: list[str] = []
    i = 0
    while i < len(lines):
        is_section = lines[i].startswith("## ")
        is_auto = lines[i].strip() == "## Automatisch aus TODO uebernommen"
        if is_section and (is_auto or not only_auto):
            section: list[str] = [lines[i]]
            i += 1
            while i < len(lines) and not lines[i].startswith("## "):
                section.append(lines[i])
                i += 1
            has_task = any(TASK_RE.match(line) for line in section)
            if has_task:
                result.extend(section)
            continue
        result.append(lines[i])
        i += 1
    return result


def task_stats(tasks: list[Task], source: str) -> tuple[int, int]:
    scoped = [task for task in tasks if task.source == source]
    done = len([task for task in scoped if task.done])
    return done, len(scoped)


def next_work_item(tasks: list[Task]) -> Task | None:
    return first_open(tasks, "NEXT") or first_open(tasks, "TODO") or first_open(tasks, "WARTESCHLANGE")


def status_report() -> str:
    tasks = all_tasks()
    next_task = next_work_item(tasks)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines = [
        "# Planungsstatus",
        "",
        f"Generiert: {now}",
        "",
        "## Fortschritt",
        "",
    ]

    for source in PLAN_FILES:
        done, total = task_stats(tasks, source)
        percent = int((done / total) * 100) if total else 100
        lines.append(f"- {source}: {done}/{total} erledigt ({percent}%)")

    lines.extend(["", "## Naechster Arbeitsauftrag", ""])
    if next_task:
        lines.extend(
            [
                f"- Quelle: `{next_task.source}`",
                f"- Abschnitt: `{next_task.section}`",
                f"- Zeile: `{next_task.line_no}`",
                f"- Aufgabe: {next_task.title}",
            ]
        )
    else:
        lines.append("- Keine offenen Aufgaben gefunden.")

    lines.extend(["", "## Offene Aufgaben", ""])
    for source in PLAN_FILES:
        open_tasks = [task for task in tasks if task.source == source and not task.done]
        lines.append(f"### {source}")
        if open_tasks:
            for task in open_tasks:
                lines.append(f"- `{task.section}`: {task.title}")
        else:
            lines.append("- Keine offenen Aufgaben.")
        lines.append("")

    lines.extend(["## Dokumentation", ""])
    for name in docs_index():
        lines.append(f"- `dokumentation/{name}`")

    return "\n".join(lines).rstrip() + "\n"


def codex_prompt() -> str:
    tasks = all_tasks()
    next_task = next_work_item(tasks)
    if not next_task:
        task_text = "Es gibt aktuell keine offenen Aufgaben in NEXT, TODO oder WARTESCHLANGE."
    else:
        task_text = (
            f"Arbeite die naechste offene Aufgabe aus `{next_task.source}.md` ab:\n\n"
            f"- Abschnitt: {next_task.section}\n"
            f"- Aufgabe: {next_task.title}\n"
            f"- Datei/Zeile: planung/{next_task.source}.md:{next_task.line_no}"
        )

    return f"""# Codex Next Prompt

{task_text}

Arbeitsregeln:

- Vor Codeaenderungen relevante Dateien lesen.
- Keine bestehenden Nutzerdaten oder Backups loeschen.
- Bei Schreib-/Datenaktionen Sicherheitsabfragen erhalten.
- Nach Aenderungen `Check-WebApp-Syntax.bat` ausfuehren.
- Danach `python tools/planning/plan_automation.py status` ausfuehren.
- Erledigte Aufgaben in `planung/*.md` markieren.
- Kurze Zusammenfassung mit geaenderten Dateien und Tests liefern.
"""


def promote_from_todo() -> bool:
    tasks = all_tasks()
    if first_open(tasks, "NEXT"):
        return False
    todo = first_open(tasks, "TODO")
    if not todo:
        return False

    next_path = PLAN_FILES["NEXT"]
    current = read_text(next_path).rstrip()
    if todo.title in current:
        return False
    block = [
        "",
        "## Automatisch aus TODO uebernommen",
        "",
        f"- [ ] {todo.title}",
        "",
    ]
    write_text(next_path, current + "\n" + "\n".join(block))
    return True


def generate() -> None:
    write_text(PLAN_DIR / "STATUS.md", status_report())
    write_text(PLAN_DIR / "CODEX_NEXT_PROMPT.md", codex_prompt())


def main() -> int:
    parser = argparse.ArgumentParser(description="IT-Verwaltung planning automation")
    parser.add_argument(
        "command",
        nargs="?",
        default="status",
        choices=["status", "promote", "cleanup", "all"],
        help="status: reports, cleanup: erledigte NEXT archivieren/entfernen, promote: TODO nach NEXT, all: cleanup + promote + reports",
    )
    args = parser.parse_args()

    cleaned = False
    promoted = False
    if args.command in {"cleanup", "all"}:
        cleaned = cleanup_done_next()
    if args.command in {"promote", "all"}:
        promoted = promote_from_todo()

    if args.command in {"status", "all", "promote", "cleanup"}:
        generate()

    if cleaned:
        print("Erledigte NEXT-Aufgaben wurden dokumentiert und aus NEXT entfernt.")
    if promoted:
        print("TODO-Aufgabe wurde nach NEXT uebernommen.")
    print("Planungsstatus aktualisiert.")
    print(f"- {PLAN_DIR / 'STATUS.md'}")
    print(f"- {PLAN_DIR / 'CODEX_NEXT_PROMPT.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
