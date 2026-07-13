#!/usr/bin/env python3
"""Fail closed when public site material exposes restricted attribution."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable, Iterator


PROJECT_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_ROOTS = (
    "content",
    "data",
    "themes/kilama/layouts",
    "themes/kilama/static",
    "static",
    "assets",
    "prototype-v3",
    "prototype-piie-clone",
)
TEXT_SUFFIXES = {
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".toml",
    ".ts",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}

INSTITUTION = (
    r"(?:MEAE|Minist[èe]re\s+de\s+l['’]Europe\s+et\s+des\s+Affaires\s+"
    r"[ée]trang[èe]res|Quai\s+d['’]Orsay)"
)

BANNED_RULES = (
    (
        "CAPS_PUBLIC_MENTION",
        re.compile(r"\bCAPS\b"),
        "L'acronyme institutionnel ne peut apparaître dans une surface publique.",
    ),
    (
        "CAPS_FULL_NAME",
        re.compile(
            r"Centre\s+d['’]analyse,?\s+de\s+pr[ée]vision\s+et\s+de\s+strat[ée]gie",
            re.IGNORECASE,
        ),
        "Le nom développé du centre ne peut apparaître dans une surface publique.",
    ),
    (
        "CAPS_INTERNAL_IDENTIFIER",
        re.compile(
            r"\bcaps(?:_house|[-_/ ]meae|\s+du\s+Quai\s+d['’]Orsay)\b",
            re.IGNORECASE,
        ),
        "Un identifiant interne ou une variante d'attribution ne peut apparaître publiquement.",
    ),
    (
        "PERSONAL_INSTITUTIONAL_AFFILIATION",
        re.compile(
            rf"(?:mon|ma|mes|son|sa|ses|notre|nos|l['’])\s+"
            rf"(?:exp[ée]rience|parcours|passage|poste|fonction|travail)"
            rf"[^.\n]{{0,180}}{INSTITUTION}",
            re.IGNORECASE,
        ),
        "Une expérience ou affiliation personnelle ne peut être reliée au MEAE ou au Quai d'Orsay.",
    ),
    (
        "PERSONAL_INSTITUTIONAL_CREDENTIAL",
        re.compile(
            rf"(?:ancien(?:ne)?|ex[-\s]|former|conseiller|[ée]conomiste[-\s]conseiller)"
            rf"[^.\n]{{0,140}}{INSTITUTION}",
            re.IGNORECASE,
        ),
        "Un credential personnel ne peut être relié au MEAE ou au Quai d'Orsay.",
    ),
)


@dataclass(frozen=True)
class Violation:
    source: str
    line: int
    column: int
    rule: str
    message: str
    excerpt: str


def _excerpt(text: str, start: int, limit: int = 180) -> str:
    line_start = text.rfind("\n", 0, start) + 1
    line_end = text.find("\n", start)
    if line_end == -1:
        line_end = len(text)
    line = " ".join(text[line_start:line_end].strip().split())
    if len(line) > limit:
        return line[: limit - 3] + "..."
    return line


def scan_text(text: str, source: str = "<memory>") -> list[Violation]:
    """Return all restricted public-attribution matches in ``text``."""
    violations: list[Violation] = []
    for rule, pattern, message in BANNED_RULES:
        for match in pattern.finditer(text):
            line_start = text.rfind("\n", 0, match.start()) + 1
            violations.append(
                Violation(
                    source=source,
                    line=text.count("\n", 0, match.start()) + 1,
                    column=match.start() - line_start + 1,
                    rule=rule,
                    message=message,
                    excerpt=_excerpt(text, match.start()),
                )
            )
    return violations


def _iter_text_files(paths: Iterable[Path]) -> Iterator[Path]:
    seen: set[Path] = set()
    for path in paths:
        candidates = (path,) if path.is_file() else path.rglob("*") if path.is_dir() else ()
        for candidate in candidates:
            if not candidate.is_file() or candidate.suffix.lower() not in TEXT_SUFFIXES:
                continue
            resolved = candidate.resolve()
            if resolved in seen or ".git" in candidate.parts:
                continue
            seen.add(resolved)
            yield candidate


def scan_paths(paths: Iterable[Path]) -> list[Violation]:
    violations: list[Violation] = []
    for path in _iter_text_files(paths):
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            violations.append(
                Violation(
                    source=str(path),
                    line=0,
                    column=0,
                    rule="UNREADABLE_PUBLIC_FILE",
                    message=f"Le fichier public ne peut pas être contrôlé: {exc}",
                    excerpt="",
                )
            )
            continue
        violations.extend(scan_text(text, str(path)))
    return violations


def _resolve_paths(raw_paths: list[str]) -> list[Path]:
    if not raw_paths:
        return [PROJECT_ROOT / root for root in PUBLIC_ROOTS if (PROJECT_ROOT / root).exists()]
    return [Path(item) if Path(item).is_absolute() else PROJECT_ROOT / item for item in raw_paths]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", help="Files or directories to scan; public roots are the default.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable violations.")
    args = parser.parse_args(argv)

    paths = _resolve_paths(args.paths)
    missing = [str(path) for path in paths if not path.exists()]
    if missing:
        for path in missing:
            print(f"ERROR: scan path does not exist: {path}", file=sys.stderr)
        return 2

    violations = scan_paths(paths)
    if args.json:
        print(json.dumps([asdict(item) for item in violations], ensure_ascii=False, indent=2))
    elif violations:
        print("PUBLIC_ATTRIBUTION_GATE: BLOCKED")
        for item in violations:
            print(f"{item.source}:{item.line}:{item.column}: {item.rule}: {item.excerpt}")
        print(f"Violations: {len(violations)}")
    else:
        print("PUBLIC_ATTRIBUTION_GATE: PASS")

    return 2 if violations else 0


if __name__ == "__main__":
    raise SystemExit(main())
