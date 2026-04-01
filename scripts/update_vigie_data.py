#!/usr/bin/env python3
"""
Vigie Data Updater — refreshes polycrisis.json with latest GPR Index data.
Downloads from Caldara & Iacoviello, updates JSON + inline fallback in template.
Run: python3 scripts/update_vigie_data.py
"""

import json
import os
import re
import ssl
import datetime
import urllib.request
import tempfile

# Fix macOS SSL cert issue
ssl._create_default_https_context = ssl._create_unverified_context

# Paths
SITE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(SITE_ROOT, "themes/kilama/static/data/vigie/dossiers/polycrisis.json")
TEMPLATE_PATH = os.path.join(SITE_ROOT, "themes/kilama/layouts/foresight/list.html")

GPR_URL = "https://www.matteoiacoviello.com/gpr_files/data_gpr_export.xls"


def download_gpr():
    """Download and parse GPR Index from Caldara & Iacoviello."""
    try:
        import xlrd
    except ImportError:
        os.system("pip install xlrd -q")
        import xlrd

    tmp = tempfile.NamedTemporaryFile(suffix=".xls", delete=False)
    try:
        urllib.request.urlretrieve(GPR_URL, tmp.name)
        wb = xlrd.open_workbook(tmp.name)
        sh = wb.sheet_by_index(0)

        dates = []
        values = []
        for r in range(1, sh.nrows):
            serial = sh.cell_value(r, 0)
            dt = datetime.datetime(1899, 12, 30) + datetime.timedelta(days=int(serial))
            gpr = sh.cell_value(r, 1)
            # Only keep from 2011 onwards (matching current JSON)
            if dt.year >= 2011:
                dates.append(dt.strftime("%Y-%m-01"))
                values.append(round(gpr, 1))

        return dates, values
    finally:
        os.unlink(tmp.name)


def update_json(dates, values):
    """Update polycrisis.json with fresh GPR data."""
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    now = datetime.datetime.now()
    today = now.strftime("%Y-%m-%d")
    latest_date = dates[-1]  # e.g. "2026-02-01"
    latest_value = values[-1]
    latest_label = datetime.datetime.strptime(latest_date, "%Y-%m-%d").strftime("%b %Y")

    # Previous value for change calculation
    prev_value = values[-2] if len(values) > 1 else latest_value
    change = round(latest_value - prev_value, 1)
    pct_change = round((change / prev_value) * 100, 1) if prev_value else 0

    # Update meta
    data["meta"]["last_update"] = today
    data["meta"]["data_mode"] = "hybrid"

    # Update alert
    data["alert"]["value"] = latest_value
    data["alert"]["timestamp"] = now.strftime("%Y-%m-%dT%H:%M:%S+01:00")
    # Recompute 1-year moving average for threshold
    if len(values) >= 12:
        ma12 = round(sum(values[-12:]) / 12, 1)
        data["alert"]["threshold"] = ma12

    # Update sparklines GPR card
    for card in data["sparklines"]["cards"]:
        if card["ticker"] == "GPR:IND":
            card["value"] = latest_value
            card["change"] = change
            card["pct"] = pct_change

    # Update featured chart
    data["featured_chart"]["dates"] = dates
    data["featured_chart"]["values"] = values
    data["featured_chart"]["latest_value"] = latest_value
    data["featured_chart"]["latest_label"] = latest_label

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return data


def update_inline_fallback(data):
    """Update the inline fallback JS variable in the template."""
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    # Build compact JSON for inline (no pretty-print)
    compact = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

    # Replace the _FALLBACK_POLYCRISIS variable
    pattern = r"var _FALLBACK_POLYCRISIS = \{.*?\};"
    replacement = f"var _FALLBACK_POLYCRISIS = {compact};"

    # Use re.DOTALL since the JSON might span multiple lines
    new_template = re.sub(pattern, replacement, template, count=1, flags=re.DOTALL)

    if new_template != template:
        with open(TEMPLATE_PATH, "w", encoding="utf-8") as f:
            f.write(new_template)
        print("[OK] Inline fallback updated")
    else:
        print("[WARN] Inline fallback pattern not found — no change")


def main():
    print(f"[Vigie Updater] {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Downloading GPR data from {GPR_URL}...")

    dates, values = download_gpr()
    print(f"GPR series: {len(values)} months, latest = {dates[-1]} → {values[-1]}")

    data = update_json(dates, values)
    print(f"[OK] {JSON_PATH} updated (last_update: {data['meta']['last_update']})")

    update_inline_fallback(data)

    print("\nDone. Run 'git add -A && git commit && git push' to deploy.")


if __name__ == "__main__":
    main()
