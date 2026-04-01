#!/usr/bin/env python3
"""
strip_author_lines.py — Remove hardcoded author/date lines from policy content.

These lines are redundant with the Hugo template's hero + byline sections.

Patterns handled:
  1. **Eric Gabin Kilama** | Mars 2026\n\n---
  2. **Eric Gabin Kilama** | 31 mars 2026 | erickilama.com
  3. **Eric Gabin Kilama**\n**Mars 2026**\n\n---
  4. **Eric Gabin Kilama** | 15 novembre 2024 | erickilama.com\n\n---
  5. * (italic author line)

Usage:
    python3 scripts/strip_author_lines.py [--dry-run]
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "content" / "policy"

DRY_RUN = "--dry-run" in sys.argv


def split_frontmatter(text: str) -> tuple[str, str]:
    """Split YAML frontmatter from body. Returns (frontmatter_block, body)."""
    if not text.startswith("---"):
        return "", text
    # Find second ---
    end = text.find("\n---", 3)
    if end == -1:
        return "", text
    fm_end = end + 4  # include the \n---
    return text[:fm_end], text[fm_end:]


def strip_author_block(body: str) -> tuple[str, bool]:
    """
    Remove author/date lines from the start of body text.
    Returns (cleaned_body, was_modified).
    """
    lines = body.split("\n")
    i = 0

    # Skip leading blank lines
    while i < len(lines) and not lines[i].strip():
        i += 1

    modified = False
    removed = []

    # Pattern: lines starting with **Eric or *Eric (bold or italic author)
    while i < len(lines):
        line = lines[i].strip()

        # Bold author line: **Eric Gabin Kilama** | ...
        if re.match(r"^\*\*Eric\s+Gabin\s+Kilama\*\*", line):
            removed.append(line)
            i += 1
            modified = True
            continue

        # Italic author: *Eric Gabin Kilama*
        if re.match(r"^\*Eric\s+Gabin\s+Kilama\*", line):
            removed.append(line)
            i += 1
            modified = True
            continue

        # Bold date on its own line: **Mars 2026** or **Janvier 2025**
        if re.match(r"^\*\*[A-ZÉé][a-zéû]+ \d{4}\*\*$", line):
            removed.append(line)
            i += 1
            modified = True
            continue

        # Blank line between author elements
        if not line and modified:
            i += 1
            continue

        # Horizontal rule after author block
        if line == "---" and modified:
            removed.append("---")
            i += 1
            # Skip blank line after ---
            if i < len(lines) and not lines[i].strip():
                i += 1
            break

        # If we hit real content and already removed something, stop
        break

    if not modified:
        return body, False

    # Rebuild: skip consumed lines, preserve rest
    cleaned = "\n".join(lines[i:])
    # Ensure single leading newline
    cleaned = "\n" + cleaned.lstrip("\n")

    return cleaned, True


def process_file(filepath: Path) -> dict | None:
    """Process a single file. Returns result dict."""
    text = filepath.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)

    if not fm:
        return None

    cleaned_body, was_modified = strip_author_block(body)

    if not was_modified:
        return None

    if not DRY_RUN:
        filepath.write_text(fm + cleaned_body, encoding="utf-8")

    return {"file": str(filepath.relative_to(PROJECT_ROOT)), "modified": True}


def main():
    files = sorted(CONTENT_DIR.rglob("*.md"))
    results = []

    for f in files:
        if f.name.startswith("_"):
            continue
        result = process_file(f)
        if result:
            results.append(result)

    label = "[DRY RUN] " if DRY_RUN else ""
    print(f"\n{label}Author line cleanup")
    print("=" * 50)
    print(f"  Files scanned: {len(files)}")
    print(f"  Files modified: {len(results)}")

    if results:
        print()
        for r in results:
            print(f"  ✓ {r['file']}")

    if DRY_RUN:
        print(f"\n  (No files written — dry run)")
    else:
        print(f"\n  Done. {len(results)} files cleaned.")


if __name__ == "__main__":
    main()
