#!/usr/bin/env python3
"""
Chart of the Week automation — scans recent publications for charts
and updates the Policy page template with the latest one.

Usage:
  python3 scripts/update_chart_of_the_week.py          # auto-select latest
  python3 scripts/update_chart_of_the_week.py --chart /path/to/img --note /policy/briefs/xxx/

Called by sync_and_deploy.sh or manually.
"""

import argparse
import re
import sys
from pathlib import Path
from datetime import datetime

SITE_DIR = Path(__file__).parent.parent
LAYOUT = SITE_DIR / "themes" / "kilama" / "layouts" / "policy" / "list.html"
STATIC_CHARTS = SITE_DIR / "static" / "uploads" / "charts"
CONTENT_DIR = SITE_DIR / "content"

# Sections to scan for chart-eligible publications (newest first)
SCAN_SECTIONS = [
    "policy/briefs",
    "policy/reports",
    "policy/notes",
    "foresight",
]


def find_latest_chart_publication():
    """Scan content sections for the most recent post with an image field."""
    candidates = []
    for section in SCAN_SECTIONS:
        section_dir = CONTENT_DIR / section
        if not section_dir.exists():
            continue
        for md_file in section_dir.glob("*.md"):
            text = md_file.read_text(encoding="utf-8")
            # Extract frontmatter
            m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
            if not m:
                continue
            front = m.group(1)
            # Check for image field
            img_match = re.search(r"^image:\s*(.+)$", front, re.MULTILINE)
            if not img_match:
                continue
            # Get date
            date_match = re.search(r"^date:\s*['\"]?(\d{4}-\d{2}-\d{2})", front, re.MULTILINE)
            if not date_match:
                continue
            # Get title
            title_match = re.search(r"^title:\s*['\"]?(.+?)['\"]?\s*$", front, re.MULTILINE)
            # Get summary
            summary_match = re.search(r"^summary:\s*>?\s*\n?\s*(.+?)$", front, re.MULTILINE)
            # Get theme
            theme_match = re.search(r"^theme:\s*(.+)$", front, re.MULTILINE)

            candidates.append({
                "date": date_match.group(1),
                "image": img_match.group(1).strip().strip("'\""),
                "title": title_match.group(1).strip("'\"") if title_match else md_file.stem,
                "summary": summary_match.group(1).strip() if summary_match else "",
                "theme": theme_match.group(1).strip() if theme_match else "Analyse",
                "url": f"/{section}/{md_file.stem}/",
            })

    if not candidates:
        return None
    # Sort by date descending
    candidates.sort(key=lambda c: c["date"], reverse=True)
    return candidates[0]


def update_policy_layout(chart_img: str, note_url: str, title: str,
                         summary: str, theme: str, date_str: str):
    """Replace the graphic-chart and graphic-body in policy/list.html."""
    content = LAYOUT.read_text(encoding="utf-8")

    # Pattern: from <div class="graphic-chart"> to closing </div> of graphic-body
    pattern = (
        r'(<div class="graphic-chart">)\s*'
        r'.*?'
        r'(</div>\s*<div class="graphic-body">)\s*'
        r'.*?'
        r'(</div>\s*</div>\s*</div>\s*</div>\s*\n\s*<!-- .* DÉBATS)'
    )

    # Build replacement
    img_html = f'<img src="{chart_img}" alt="{title}" style="width: 100%; border-radius: 2px;">'
    body_html = (
        f'<div class="fly-title">{theme}</div>\n'
        f'            <div class="note-title"><a href="{note_url}">{title}</a></div>\n'
        f'            <div class="note-excerpt" style="margin-top: 12px;">{summary}</div>\n'
        f'            <div class="note-meta" style="margin-top: 16px;">'
        f'<span>{date_str}</span>'
        f'<span class="note-format-tag">Analyse · Vigie</span></div>'
    )

    new_chart_section = (
        f'<div class="graphic-chart">\n'
        f'            {img_html}\n'
        f'          </div>\n'
        f'          <div class="graphic-body">\n'
        f'            {body_html}\n'
        f'          </div>\n'
    )

    # Simple replacement of the graphic-chart div content
    old_pattern = r'<div class="graphic-chart">.*?</div>\s*<div class="graphic-body">.*?</div>'
    new_content = re.sub(
        old_pattern,
        new_chart_section.strip(),
        content,
        count=1,
        flags=re.DOTALL,
    )

    if new_content == content:
        print("[COTW] WARNING: no replacement made — pattern not found")
        return False

    LAYOUT.write_text(new_content, encoding="utf-8")
    print(f"[COTW] Updated: {title} → {note_url}")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chart", help="Path to chart image (relative to /static)")
    parser.add_argument("--note", help="URL of the linked note")
    parser.add_argument("--title", help="Chart title")
    parser.add_argument("--summary", help="Chart summary")
    parser.add_argument("--theme", default="Analyse", help="Theme tag")
    args = parser.parse_args()

    if args.chart and args.note:
        # Manual mode
        date_str = datetime.now().strftime("%B %Y").replace(
            "January", "Janvier").replace("February", "Février").replace(
            "March", "Mars").replace("April", "Avril").replace(
            "May", "Mai").replace("June", "Juin").replace(
            "July", "Juillet").replace("August", "Août").replace(
            "September", "Septembre").replace("October", "Octobre").replace(
            "November", "Novembre").replace("December", "Décembre")
        update_policy_layout(
            args.chart, args.note,
            args.title or "Chart of the Week",
            args.summary or "",
            args.theme,
            date_str,
        )
    else:
        # Auto mode — find latest publication with image
        pub = find_latest_chart_publication()
        if not pub:
            print("[COTW] No chart-eligible publication found")
            sys.exit(0)
        # Format French date
        dt = datetime.strptime(pub["date"], "%Y-%m-%d")
        months_fr = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
        date_str = f"{months_fr[dt.month]} {dt.year}"
        update_policy_layout(
            pub["image"], pub["url"], pub["title"],
            pub["summary"], pub["theme"], date_str,
        )


if __name__ == "__main__":
    main()
