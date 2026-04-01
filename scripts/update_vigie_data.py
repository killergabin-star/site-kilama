#!/usr/bin/env python3
"""
Vigie Data Updater — syncs polycrisis.json from FPSQ pipeline output.
Primary source: FPSQ quantification results.
Fallback: direct download from Caldara & Iacoviello for GPR time series.
Run: python3 scripts/update_vigie_data.py
"""

import json
import os
import re
import ssl
import datetime
import urllib.request
import tempfile

ssl._create_default_https_context = ssl._create_unverified_context

# Paths
SITE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(SITE_ROOT, "themes/kilama/static/data/vigie/dossiers/polycrisis.json")
TEMPLATE_PATH = os.path.join(SITE_ROOT, "themes/kilama/layouts/foresight/list.html")

# FPSQ pipeline source
FPSQ_ROOT = os.path.expanduser("~/Documents/Prospective Strategique/code/fpsq")
FPSQ_QUANT = os.path.join(FPSQ_ROOT, "output/polycrisis_quantification_results.json")
FPSQ_DASHBOARD = os.path.join(FPSQ_ROOT, "output/dashboard_data.json")

# GPR direct download (fallback for time series only)
GPR_URL = "https://www.matteoiacoviello.com/gpr_files/data_gpr_export.xls"

# FPSQ scenario → Site scenario mapping
SCENARIO_MAP = {
    "sursaut":     {"name": "Reform",        "color": "#228833"},
    "decouplage":  {"name": "Cooperative",   "color": "#4477AA"},
    "statu_quo":   {"name": "Status Quo",    "color": "#CCBB44"},
    "embrasement": {"name": "Fragmentation", "color": "#EE6677"},
    "tenaille":    {"name": "Crisis",        "color": "#AA3377"},
}


def load_fpsq_scenarios():
    """Load scenario data from FPSQ pipeline."""
    if not os.path.exists(FPSQ_QUANT):
        print(f"[WARN] FPSQ not found at {FPSQ_QUANT}")
        return None

    with open(FPSQ_QUANT, "r") as f:
        fpsq = json.load(f)

    scenarios = []
    comparison_data = {}
    variables = [
        "GDP Growth (%)", "Inflation (HICP %)", "Spread vs Bund (bp)",
        "Debt/GDP (%)", "Unemployment (%)", "ODA/GNI (%)",
        "Stress Index", "Probability (%)"
    ]

    for fpsq_name, mapping in SCENARIO_MAP.items():
        if fpsq_name not in fpsq:
            continue
        sc = fpsq[fpsq_name]
        prob = round(sc["probability"] * 100)
        term = sc["deterministic_terminal"]

        gdp_ae = term.get("gdp_growth_ae", 1.0)
        scenarios.append({
            "name": mapping["name"],
            "color": mapping["color"],
            "prob": prob,
            "gdp": f"{gdp_ae:+.1f}%",
            "fan_base": round(gdp_ae, 1),
            "fan_trend": round((gdp_ae - 1.1) / 10, 2),
        })

        # Build comparison table row
        stress = term.get("financial_stress_index", 0)
        stress_pct = round(stress * 100)
        spread = round(term.get("sovereign_spread_emde", 100))
        debt = round(term.get("debt_gdp_emde", 110), 1)
        inflation = round(term.get("inflation_global", 2.0), 1)

        comparison_data[mapping["name"]] = [
            f"{gdp_ae:+.1f}", f"{inflation}", f"{spread}",
            f"{debt}", "—", "—", f"{stress_pct}", f"{prob}"
        ]

    return scenarios, comparison_data, variables


def download_gpr_series():
    """Download GPR time series from Caldara & Iacoviello."""
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

        dates, values = [], []
        for r in range(1, sh.nrows):
            serial = sh.cell_value(r, 0)
            dt = datetime.datetime(1899, 12, 30) + datetime.timedelta(days=int(serial))
            gpr = sh.cell_value(r, 1)
            if dt.year >= 2011:
                dates.append(dt.strftime("%Y-%m-01"))
                values.append(round(gpr, 1))
        return dates, values
    finally:
        os.unlink(tmp.name)


def update_json(dates, values, fpsq_result):
    """Update polycrisis.json with FPSQ scenarios + GPR series."""
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    now = datetime.datetime.now()
    today = now.strftime("%Y-%m-%d")
    latest_value = values[-1]
    latest_date = dates[-1]
    latest_label = datetime.datetime.strptime(latest_date, "%Y-%m-%d").strftime("%b %Y")

    prev_value = values[-2] if len(values) > 1 else latest_value
    change = round(latest_value - prev_value, 1)
    pct_change = round((change / prev_value) * 100, 1) if prev_value else 0

    # Meta
    data["meta"]["last_update"] = today

    # Alert
    data["alert"]["value"] = latest_value
    data["alert"]["timestamp"] = now.strftime("%Y-%m-%dT%H:%M:%S+01:00")
    if len(values) >= 12:
        data["alert"]["threshold"] = round(sum(values[-12:]) / 12, 1)

    # Sparklines GPR card
    for card in data["sparklines"]["cards"]:
        if card["ticker"] == "GPR:IND":
            card["value"] = latest_value
            card["change"] = change
            card["pct"] = pct_change
        elif card["ticker"] == "STRESS:FPSQ" and fpsq_result:
            # Update stress index from FPSQ Status Quo scenario
            scenarios, comp, _ = fpsq_result
            for sc in scenarios:
                if sc["name"] == "Status Quo":
                    stress_val = round(sc.get("fan_base", 1.1) * 38, 0)
                    card["value"] = int(comp["Status Quo"][6]) if "Status Quo" in comp else card["value"]

    # Featured chart (GPR series)
    data["featured_chart"]["dates"] = dates
    data["featured_chart"]["values"] = values
    data["featured_chart"]["latest_value"] = latest_value
    data["featured_chart"]["latest_label"] = latest_label

    # Scenarios from FPSQ
    if fpsq_result:
        scenarios, comp_data, variables = fpsq_result
        data["scenarios"] = scenarios
        data["comparison_table"]["data"] = comp_data
        data["comparison_table"]["variables"] = variables
        print(f"[OK] Scenarios synced from FPSQ ({len(scenarios)} scenarios)")

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return data


def update_inline_fallback(data):
    """Update the inline fallback JS variable in the template."""
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    compact = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    pattern = r"var _FALLBACK_POLYCRISIS = \{.*?\};"
    replacement = f"var _FALLBACK_POLYCRISIS = {compact};"
    new_template = re.sub(pattern, replacement, template, count=1, flags=re.DOTALL)

    if new_template != template:
        with open(TEMPLATE_PATH, "w", encoding="utf-8") as f:
            f.write(new_template)
        print("[OK] Inline fallback updated")
    else:
        print("[WARN] Inline fallback pattern not found — no change")


def main():
    print(f"[Vigie Updater] {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")

    # 1. Load FPSQ scenarios
    fpsq_result = load_fpsq_scenarios()
    if fpsq_result:
        scenarios, _, _ = fpsq_result
        print(f"[OK] FPSQ: {len(scenarios)} scenarios loaded from {FPSQ_QUANT}")
    else:
        print("[WARN] FPSQ unavailable — keeping existing scenario data")

    # 2. GPR time series (from Caldara-Iacoviello — FPSQ doesn't store the full monthly series)
    print(f"Downloading GPR series from {GPR_URL}...")
    dates, values = download_gpr_series()
    print(f"[OK] GPR: {len(values)} months, latest = {dates[-1]} → {values[-1]}")

    # 3. Update JSON
    data = update_json(dates, values, fpsq_result)
    print(f"[OK] {JSON_PATH} updated (last_update: {data['meta']['last_update']})")

    # 4. Update inline fallback
    update_inline_fallback(data)

    print("\nDone. Commit and push to deploy.")


if __name__ == "__main__":
    main()
