#!/usr/bin/env python3
"""C26 cover generator for erickilama.com articles (institutional house identity).

Renders landscape 1200x675 covers from the C26 design system (wordmark Vigie,
filet rouge #E6203A, thematic filigrane, ghost collection number, FPSQ footer),
faithful to the Cabinet Editorial baseline C26_source.html. Output PNGs land in
static/thumbnails/policy/covers/ and are wired into an article via front matter:

    cover_image: /thumbnails/policy/covers/<slug>.png
    thumbnail:
      resolved_path: /thumbnails/policy/covers/<slug>.png

Usage:
    python3 editorial/covers/generate_c26_cover.py            # render all of covers.json
    python3 editorial/covers/generate_c26_cover.py <slug>     # render one entry

Palette par thème (doctrine C26 / DESIGN_COVER_BASELINE_C26.md) :
    geopol   = Géopolitique & Commerce (violet #3A1B5C) — G7, sanctions, commerce, sécurité éco
    economie = Économie & Finance      (bleu  #003D5C) — finance dév., dette, SMI, dollar, APD
    strategie= Stratégie               (noir  #0E0E10) — systémique transversal, prospective
    climat   = Climat & Transitions    (teal  #00524E) — énergie, CBAM, transition
"""
import html as _h, json, os, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "static" / "thumbnails" / "policy" / "covers"
CONFIG = pathlib.Path(__file__).resolve().parent / "covers.json"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

THEMES = {
 "geopol":   {"bg":"#3A1B5C","tint":"#4D2675","num":"03","collection":"Géopolitique &amp; Commerce"},
 "economie": {"bg":"#003D5C","tint":"#005577","num":"02","collection":"Économie &amp; Finance"},
 "strategie":{"bg":"#0E0E10","tint":"#232328","num":"01","collection":"Stratégie"},
 "climat":   {"bg":"#00524E","tint":"#006963","num":"04","collection":"Climat &amp; Transitions"},
 "business":{"bg":"#16283C","tint":"#274563","num":"05","collection":"Entreprises &amp; Risques"},
}
FILIGRANE = {
 "geopol": '''<g stroke="rgba(246,244,240,0.10)" stroke-width="1.1" fill="none">
   <polygon points="820,90 980,55 1050,200 940,300 800,250"/><polygon points="1000,230 1140,200 1180,360 1060,430 980,330"/>
   <polygon points="700,360 860,330 900,470 800,560 690,500"/>
   <line x1="940" y1="300" x2="1000" y2="330" stroke-dasharray="4,4"/><line x1="800" y1="250" x2="860" y2="360" stroke-dasharray="4,4"/></g>
 <g stroke="rgba(176,98,255,0.22)" stroke-width="1.4" fill="none"><polygon points="820,90 980,55 1050,200 940,300 800,250"/></g>''',
 "economie": '''<g stroke="rgba(246,244,240,0.10)" stroke-width="1.4" fill="none">
   <path d="M 560 120 Q 760 70 940 150 T 1240 110"/><path d="M 560 190 Q 800 130 980 230 T 1240 180"/>
   <path d="M 560 270 Q 760 250 980 330 T 1240 290"/><path d="M 560 360 Q 820 330 980 440 T 1240 400"/>
   <path d="M 560 460 Q 780 440 980 540 T 1240 510"/></g>
 <g stroke="rgba(0,191,255,0.20)" stroke-width="1.4" fill="none"><path d="M 560 150 Q 820 80 1000 180 T 1240 140"/></g>''',
 "strategie": '''<g stroke="rgba(246,244,240,0.12)" stroke-width="0.8" fill="none">
   <path d="M 620 90 L 760 150 L 900 110 L 1060 180 L 1180 140"/><path d="M 760 150 L 720 280 L 900 110"/>
   <path d="M 720 280 L 1000 360 L 1060 180"/></g>
 <g fill="rgba(246,244,240,0.40)"><circle cx="620" cy="90" r="2"/><circle cx="760" cy="150" r="2.5"/><circle cx="900" cy="110" r="2"/><circle cx="1060" cy="180" r="2.5"/><circle cx="1000" cy="360" r="2"/><circle cx="720" cy="280" r="2"/></g>''',
 "climat": '''<g stroke="rgba(246,244,240,0.10)" stroke-width="1" fill="none">
   <path d="M 540 130 C 660 110, 780 160, 900 130 S 1140 150, 1260 120"/><path d="M 540 180 C 660 160, 780 210, 900 180 S 1140 200, 1260 170"/>
   <path d="M 540 240 C 680 220, 800 270, 920 240 S 1160 260, 1260 230"/><path d="M 540 320 C 700 300, 820 350, 940 320 S 1180 340, 1260 310"/></g>
 <g stroke="rgba(0,229,196,0.20)" stroke-width="1.4" fill="none"><path d="M 540 270 C 700 250, 820 300, 940 270 S 1180 290, 1260 260"/></g>''',
 "business": '''<g stroke="rgba(246,244,240,0.09)" stroke-width="1.2" fill="none">
   <path d="M 600 470 L 1250 130"/><path d="M 600 470 L 1250 245"/><path d="M 600 470 L 1250 360"/><path d="M 600 470 L 1250 455"/>
   <line x1="1250" y1="130" x2="1250" y2="455" stroke-dasharray="5,5"/></g>
 <g stroke="rgba(224,138,60,0.22)" stroke-width="1.6" fill="none"><path d="M 600 470 L 1250 130"/></g>
 <g fill="rgba(246,244,240,0.30)"><circle cx="1250" cy="130" r="3.4"/><circle cx="1250" cy="455" r="3.4"/><circle cx="600" cy="470" r="3"/></g>''',
}

TPL = '''<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Playfair+Display:ital,wght@1,500;1,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{{--bg:{bg};--tint:{tint};--red:#E6203A;--white:#F6F4F0;--muted:rgba(246,244,240,0.65);--faint:rgba(246,244,240,0.40);--fantom:rgba(246,244,240,0.06);}}
*{{margin:0;padding:0;box-sizing:border-box;}}html,body{{width:1200px;height:675px;}}
.cover{{width:1200px;height:675px;position:relative;overflow:hidden;background:radial-gradient(120% 140% at 82% 18%,var(--tint) 0%,var(--bg) 55%);color:var(--white);font-family:"Inter",sans-serif;}}
.filigrane{{position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0.6;}}
.ghost-num{{position:absolute;bottom:-7%;right:1%;font-family:"Newsreader",serif;font-weight:400;font-size:520px;line-height:0.8;color:var(--fantom);z-index:0;letter-spacing:-0.05em;}}
.inner{{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;z-index:2;}}
.wordmark-vigie{{font-family:"Playfair Display","Didot",serif;font-style:italic;font-weight:500;font-size:64px;line-height:1;color:var(--white);letter-spacing:-0.02em;}}
.wm-rule{{display:flex;align-items:center;gap:7px;margin-top:2px;}}.wm-trait{{width:44px;height:3px;background:var(--red);}}.wm-dot{{width:9px;height:9px;border-radius:50%;background:var(--red);}}
.collection-tag{{position:absolute;top:64px;right:72px;text-align:right;z-index:3;font-size:13px;font-weight:500;letter-spacing:1.6px;text-transform:uppercase;color:var(--white);}}
.collection-tag .num{{display:block;margin-top:5px;color:var(--muted);font-family:"IBM Plex Mono",monospace;font-size:12px;letter-spacing:0.5px;}}
.eyebrow{{display:flex;align-items:center;gap:12px;margin-top:auto;margin-bottom:14px;}}
.eyebrow-mark{{width:24px;height:10px;background:var(--red);flex-shrink:0;}}
.eyebrow-text{{font-size:14px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:var(--red);}}
.h-display{{font-family:"Newsreader",serif;font-weight:500;font-size:{titlesize}px;line-height:1.04;letter-spacing:-0.02em;color:var(--white);max-width:21ch;margin-bottom:22px;}}
.meta{{font-family:"IBM Plex Mono",monospace;font-size:14px;color:var(--muted);letter-spacing:0.5px;line-height:1.6;}}.meta .sep{{margin:0 8px;color:var(--faint);}}
.footer{{display:flex;justify-content:space-between;align-items:center;margin-top:38px;padding-top:18px;border-top:0.5px solid rgba(246,244,240,0.18);font-size:12.5px;font-weight:500;letter-spacing:1.4px;text-transform:uppercase;color:var(--muted);}}
.footer .author{{color:var(--white);}}
</style></head><body><div class="cover">
<svg class="filigrane" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">{filigrane}</svg>
<div class="ghost-num">{num}</div>
<div class="collection-tag">{collection}<span class="num">{tagline}</span></div>
<div class="inner">
  <div><span class="wordmark-vigie">Vigie</span><div class="wm-rule"><div class="wm-trait"></div><div class="wm-dot"></div></div></div>
  <div class="eyebrow"><span class="eyebrow-mark"></span><span class="eyebrow-text">{eyebrow}</span></div>
  <h1 class="h-display">{title}</h1><div class="meta">{meta}</div>
  <div class="footer"><span class="author">Eric Gabin Kilama</span><span>FPSQ · Diffusion restreinte</span></div>
</div></div></body></html>'''


def build_html(entry):
    t = THEMES[entry["theme"]]
    return TPL.format(bg=t["bg"], tint=t["tint"], num=entry.get("num", t["num"]),
                      collection=t["collection"], tagline=_h.escape(entry.get("tagline", "")),
                      filigrane=FILIGRANE[entry["theme"]], eyebrow=_h.escape(entry["eyebrow"]),
                      title=_h.escape(entry["title"]), meta=entry["meta"],
                      titlesize=entry.get("titlesize", 56))


def render(entry, tmp):
    slug = entry["slug"]
    htmlp = pathlib.Path(tmp) / f"{slug}.html"
    htmlp.write_text(build_html(entry), encoding="utf-8")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    outp = OUT_DIR / f"{slug}.png"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
                    "--force-device-scale-factor=2", "--window-size=1200,675", "--virtual-time-budget=5000",
                    f"--screenshot={outp}", f"file://{htmlp}"], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"  rendered {slug}.png  [{entry['theme']}]  -> {outp.relative_to(ROOT)}")


def main():
    if not os.path.exists(CHROME):
        sys.exit(f"Chrome introuvable: {CHROME} (rendu headless requis)")
    entries = json.loads(CONFIG.read_text(encoding="utf-8"))
    want = sys.argv[1] if len(sys.argv) > 1 else None
    sel = [e for e in entries if (want is None or e["slug"] == want)]
    if not sel:
        sys.exit(f"slug '{want}' absent de {CONFIG.name}")
    with tempfile.TemporaryDirectory() as tmp:
        for e in sel:
            render(e, tmp)
    print(f"DONE {len(sel)} cover(s). Câbler chaque article : cover_image + thumbnail.resolved_path = /thumbnails/policy/covers/<slug>.png")


if __name__ == "__main__":
    main()
