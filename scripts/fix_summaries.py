#!/usr/bin/env python3
"""
fix_summaries.py — Regenerate truncated summaries in policy content files.

Finds summaries ending with "..." and regenerates them from the body text
with a higher character limit (400 chars).

Usage:
    python3 scripts/fix_summaries.py [--dry-run]
"""

import re
import sys
import yaml
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "content" / "policy"
MAX_CHARS = 400
DRY_RUN = "--dry-run" in sys.argv


def extract_summary_from_body(body: str) -> str:
    """Extract first substantive paragraph from body markdown."""
    lines = body.split("\n")
    paragraph_lines = []

    for line in lines:
        stripped = line.strip()

        # Skip blank lines before first paragraph
        if not stripped:
            if paragraph_lines:
                break  # End of first paragraph
            continue

        # Skip separators
        if stripped == "---":
            if paragraph_lines:
                break
            continue

        # Skip headings
        if stripped.startswith("#"):
            if paragraph_lines:
                break
            continue

        # Skip bold/italic metadata lines (short)
        if re.match(r"^\*{1,2}[^*]", stripped) and len(stripped) < 120:
            continue

        # Skip footnote references on their own
        if re.match(r"^\[\^", stripped):
            continue

        paragraph_lines.append(stripped)

    summary = " ".join(paragraph_lines)
    # Clean markdown artifacts
    summary = re.sub(r"\[\^(\d+)\]", "", summary)  # Remove footnote refs
    summary = summary.strip()

    if len(summary) > MAX_CHARS:
        # Truncate at sentence boundary if possible
        truncated = summary[:MAX_CHARS]
        # Try to end at a sentence
        last_period = truncated.rfind(".")
        last_semicolon = truncated.rfind(";")
        best_break = max(last_period, last_semicolon)
        if best_break > MAX_CHARS * 0.6:  # Only if we keep >60% of content
            summary = truncated[:best_break + 1]
        else:
            summary = truncated.rsplit(" ", 1)[0] + "..."

    return summary


def process_file(filepath: Path) -> dict | None:
    """Fix truncated summary in a single file."""
    text = filepath.read_text(encoding="utf-8")

    # Split frontmatter
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None

    fm_text = text[4:end]
    body = text[end + 4:]

    try:
        meta = yaml.safe_load(fm_text) or {}
    except yaml.YAMLError:
        return None

    summary = meta.get("summary", "")
    if not isinstance(summary, str) or not summary.endswith("..."):
        return None

    # Generate new summary from body
    new_summary = extract_summary_from_body(body)
    if not new_summary or new_summary == summary:
        return None

    # Update frontmatter
    meta["summary"] = new_summary
    new_fm = yaml.dump(
        meta,
        default_flow_style=False,
        allow_unicode=True,
        sort_keys=False,
        width=120,
    ).strip()

    new_text = f"---\n{new_fm}\n---{body}"

    if not DRY_RUN:
        filepath.write_text(new_text, encoding="utf-8")

    return {
        "file": str(filepath.relative_to(PROJECT_ROOT)),
        "old": summary[:80] + "..." if len(summary) > 80 else summary,
        "new": new_summary[:80] + "..." if len(new_summary) > 80 else new_summary,
    }


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
    print(f"\n{label}Summary fix")
    print("=" * 50)
    print(f"  Files scanned: {len(files)}")
    print(f"  Summaries fixed: {len(results)}")

    if results:
        print()
        for r in results:
            print(f"  {r['file']}")
            print(f"    OLD: {r['old']}")
            print(f"    NEW: {r['new']}")
            print()

    if DRY_RUN:
        print("  (No files written — dry run)")
    else:
        print(f"  Done. {len(results)} summaries regenerated.")


if __name__ == "__main__":
    main()
