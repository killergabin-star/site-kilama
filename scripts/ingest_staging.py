#!/usr/bin/env python3
"""
ingest_staging.py — Convert staging documents into Hugo content pages.

Reads markdown files from staging/for-site/, parses their frontmatter
(Format A: Site-Bridge signal header, Format B: YAML frontmatter),
and writes Hugo-ready content files to the appropriate content/ section.

Usage:
    python3 scripts/ingest_staging.py [--dry-run]
"""

import os
import re
import sys
import yaml
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
STAGING_DIR = PROJECT_ROOT / "staging" / "for-site"
CONTENT_DIR = PROJECT_ROOT / "content"

# type -> Hugo section mapping
TYPE_ROUTING = {
    "policy_note":       "policy/notes",
    "note":              "policy/notes",
    "analytical_report": "policy/reports",
    "rapport":           "policy/reports",
    "executive_summary": "policy/reports",
    "brief":             "policy/briefs",
    "policy_brief":      "policy/briefs",
    "controverse":       "policy/debates",
    "linkedin_post":     "policy/linkedin",
}

# Normalize display type for Hugo frontmatter
TYPE_NORMALIZE = {
    "policy_note":       "note",
    "note":              "note",
    "analytical_report": "report",
    "rapport":           "report",
    "executive_summary": "report",
    "brief":             "brief",
    "policy_brief":      "brief",
    "controverse":       "controverse",
    "linkedin_post":     "linkedin",
}


def route_type(doc_type: str) -> str | None:
    """Return Hugo section path for a given document type, or None if unroutable."""
    doc_type_lower = doc_type.strip().lower()
    # Direct match
    if doc_type_lower in TYPE_ROUTING:
        return TYPE_ROUTING[doc_type_lower]
    # Anything containing 'research'
    if "research" in doc_type_lower:
        return "research/publications"
    return None


def normalize_type(doc_type: str) -> str:
    """Return a clean normalized type label for Hugo frontmatter."""
    doc_type_lower = doc_type.strip().lower()
    return TYPE_NORMALIZE.get(doc_type_lower, doc_type_lower)


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

def parse_signal_header(text: str) -> tuple[dict, str]:
    """
    Parse Format A (Site-Bridge signal header):
        # Signal Site-Bridge
        key: value
        ...
        ---
        [body]

    Returns (metadata_dict, body_text).
    """
    meta = {}
    lines = text.split("\n")
    body_start = 0

    # Skip the "# Signal Site-Bridge" line and any blank lines after it
    i = 0
    if lines and lines[0].strip().startswith("# Signal Site-Bridge"):
        i = 1
    # Skip blank lines
    while i < len(lines) and not lines[i].strip():
        i += 1

    # Read key: value pairs until we hit "---"
    while i < len(lines):
        line = lines[i].strip()
        if line == "---":
            body_start = i + 1
            break
        if ":" in line:
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()
            # Parse YAML-ish values
            if value.startswith("[") and value.endswith("]"):
                # List: parse with yaml for proper handling
                try:
                    meta[key] = yaml.safe_load(value)
                except yaml.YAMLError:
                    meta[key] = value
            elif value.startswith('"') and value.endswith('"'):
                meta[key] = value.strip('"')
            elif value == "null":
                meta[key] = None
            else:
                meta[key] = value
        i += 1

    body = "\n".join(lines[body_start:])
    return meta, body


def parse_yaml_frontmatter(text: str) -> tuple[dict, str]:
    """
    Parse Format B (standard YAML frontmatter):
        ---
        key: value
        ...
        ---
        [body]

    Returns (metadata_dict, body_text).
    """
    # Match opening and closing ---
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", text, re.DOTALL)
    if not match:
        return {}, text

    yaml_block = match.group(1)
    body = match.group(2)

    try:
        meta = yaml.safe_load(yaml_block) or {}
    except yaml.YAMLError:
        return {}, text

    return meta, body


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """
    Detect format and parse frontmatter.
    Returns (metadata_dict, body_text).
    """
    stripped = text.lstrip("\ufeff")  # Handle BOM
    if stripped.startswith("# Signal Site-Bridge"):
        return parse_signal_header(stripped)
    elif stripped.startswith("---"):
        return parse_yaml_frontmatter(stripped)
    else:
        return {}, stripped


# ---------------------------------------------------------------------------
# Content extraction
# ---------------------------------------------------------------------------

def extract_title(body: str) -> str | None:
    """Extract the first # heading from the body text."""
    for line in body.split("\n"):
        line = line.strip()
        if line.startswith("# ") and not line.startswith("## "):
            return line[2:].strip()
    return None


def strip_title_heading(body: str) -> str:
    """
    Remove ONLY the first # heading from the body.
    The title is already in Hugo frontmatter and rendered by the template.
    Author, date, and separators are preserved as visible content.
    """
    lines = body.split("\n")
    result = []
    found_title = False

    for line in lines:
        stripped = line.strip()

        # Remove only the first H1 heading (not H2+)
        if not found_title and stripped.startswith("# ") and not stripped.startswith("## "):
            found_title = True
            continue

        result.append(line)

    return "\n".join(result)


def extract_summary(body: str, max_chars: int = 200) -> str:
    """
    Extract the first substantive paragraph after the heading.
    Skips blank lines, --- separators, lines starting with ** (author/date lines),
    and lines starting with * (italic lines like date attributions).
    """
    lines = body.split("\n")
    past_title = False
    paragraph_lines = []

    for line in lines:
        stripped = line.strip()

        # Skip until we pass the first # heading
        if not past_title:
            if stripped.startswith("# ") and not stripped.startswith("## "):
                past_title = True
            continue

        # Skip blank lines, separators, and metadata-like lines
        if not stripped:
            if paragraph_lines:
                break  # End of first paragraph
            continue
        if stripped == "---":
            if paragraph_lines:
                break
            continue
        # Skip author/date attribution lines (bold or italic)
        if re.match(r"^\*{1,2}[^*]", stripped) and len(stripped) < 120:
            continue
        # Skip heading lines (subheadings)
        if stripped.startswith("#"):
            if paragraph_lines:
                break
            continue

        paragraph_lines.append(stripped)

    summary = " ".join(paragraph_lines)
    if len(summary) > max_chars:
        # Truncate at word boundary
        summary = summary[:max_chars].rsplit(" ", 1)[0] + "..."
    return summary


def make_slug(filename: str) -> str:
    """
    Generate a clean slug from the staging filename.
    Examples:
        2026-03-29_note_iran-pause-trois-lectures.md -> iran-pause-trois-lectures.md
        controverse_gopinath-pettis-dollar-deficit.md -> gopinath-pettis-dollar-deficit.md
        note_linkedin_eu-trade-geopolitics.md -> eu-trade-geopolitics.md
    """
    stem = Path(filename).stem  # Remove .md

    # Remove date prefix (YYYY-MM-DD_)
    stem = re.sub(r"^\d{4}-\d{2}-\d{2}_", "", stem)

    # Remove type prefixes: note_, brief_, rapport_, controverse_, fiche_rapport_, etc.
    # Match known prefixes (order matters: longer prefixes first)
    prefixes = [
        "fiche_rapport_",
        "note_linkedin_",
        "policy_brief_",
        "analytical_report_",
        "executive_summary_",
        "controverse_",
        "rapport_",
        "brief_",
        "note_",
    ]
    for prefix in prefixes:
        if stem.startswith(prefix):
            stem = stem[len(prefix):]
            break

    return stem + ".md"


# ---------------------------------------------------------------------------
# Main ingestion
# ---------------------------------------------------------------------------

def ingest_file(filepath: Path, dry_run: bool = False) -> dict | None:
    """
    Process a single staging file. Returns a result dict or None if skipped.
    """
    filename = filepath.name

    # Skip internal files (starting with _)
    if filename.startswith("_"):
        return None

    # Skip non-markdown
    if not filename.endswith(".md"):
        return None

    text = filepath.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)

    # Must have a type
    doc_type = meta.get("type")
    if not doc_type:
        return {"file": filename, "status": "skipped", "reason": "no type"}

    # Must have status=ready (skip draft or missing status)
    status = meta.get("status", "").strip().lower() if meta.get("status") else ""
    if status != "ready":
        return {"file": filename, "status": "skipped", "reason": f"status={status or 'missing'}"}

    # Route to Hugo section
    section = route_type(doc_type)
    if section is None:
        return {"file": filename, "status": "skipped", "reason": f"unroutable type={doc_type}"}

    # Extract content elements
    title = extract_title(body)
    if not title:
        return {"file": filename, "status": "skipped", "reason": "no title heading found"}

    summary = extract_summary(body)
    slug = make_slug(filename)

    # Build Hugo frontmatter
    date_val = meta.get("date", "")
    if isinstance(date_val, str):
        date_val = date_val.strip('"').strip("'")

    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",")]

    hugo_meta = {
        "title": title,
        "date": date_val,
        "type": normalize_type(doc_type),
        "tags": tags,
        "summary": summary,
        "status": "ready",
        "draft": False,
    }

    # Optional fields
    theme = meta.get("theme")
    if theme:
        hugo_meta["theme"] = theme

    author = meta.get("author")
    if author:
        hugo_meta["author"] = author

    # Build output path
    out_dir = CONTENT_DIR / section
    out_path = out_dir / slug

    # Strip only the H1 title heading from body (already in Hugo frontmatter)
    # Author, date, and separators are kept as visible content
    clean_body = strip_title_heading(body).lstrip("\n")

    # Build the output content
    hugo_yaml = yaml.dump(
        hugo_meta,
        default_flow_style=False,
        allow_unicode=True,
        sort_keys=False,
        width=120,
    ).strip()

    output = f"---\n{hugo_yaml}\n---\n\n{clean_body}"

    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output, encoding="utf-8")

    return {
        "file": filename,
        "status": "ingested",
        "type": normalize_type(doc_type),
        "section": section,
        "slug": slug,
        "title": title,
        "output": str(out_path),
    }


def main():
    dry_run = "--dry-run" in sys.argv

    if not STAGING_DIR.is_dir():
        print(f"ERROR: staging directory not found: {STAGING_DIR}")
        sys.exit(1)

    # Collect markdown files (not in subdirectories)
    files = sorted(
        f for f in STAGING_DIR.iterdir()
        if f.is_file() and f.suffix == ".md" and not f.name.startswith("_")
    )

    if not files:
        print("No eligible files found in staging directory.")
        return

    results = []
    for f in files:
        result = ingest_file(f, dry_run=dry_run)
        if result:
            results.append(result)

    # Summary
    ingested = [r for r in results if r["status"] == "ingested"]
    skipped = [r for r in results if r["status"] == "skipped"]

    mode_label = "[DRY RUN] " if dry_run else ""

    print(f"\n{mode_label}Ingestion summary")
    print("=" * 60)
    print(f"  Files scanned:  {len(files)}")
    print(f"  Ingested:       {len(ingested)}")
    print(f"  Skipped:        {len(skipped)}")
    print()

    if ingested:
        # Group by section
        sections: dict[str, list] = {}
        for r in ingested:
            sections.setdefault(r["section"], []).append(r)

        for section, items in sorted(sections.items()):
            print(f"  content/{section}/ ({len(items)} files)")
            for item in items:
                print(f"    -> {item['slug']}  [{item['type']}]")
                if not dry_run:
                    print(f"       {item['output']}")
        print()

    if skipped:
        print("  Skipped:")
        for r in skipped:
            print(f"    {r['file']}: {r['reason']}")
        print()

    if dry_run:
        print("  (No files written — dry run mode)")
    else:
        print(f"  Done. {len(ingested)} files written to content/.")


if __name__ == "__main__":
    main()
