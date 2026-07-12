#!/usr/bin/env python3
"""Mechanism vignettes for Policy articles — erickilama.com house system.

Renders 400x225 SVG vignettes where the central motif encodes the article's
CLAIM FRAME (the mechanism it makes visible), not its category. Doctrine:
editorial/README-visual-doctrine.md (policy-dark register, one visual idea,
readable at 160x90, no text inside the motif). Chrome (eyebrow band, serif
title, footer) matches the categorial SVGs so the catalogue stays coherent.

Claim frames come from data/policy_visual_briefs.json, produced by
editorial/illustrations/generate-policy-visual-briefs.mjs.

Usage:
    python3 editorial/vignettes/generate_mechanism_vignette.py --list
    python3 editorial/vignettes/generate_mechanism_vignette.py <frame> [--out f.svg]
        [--eyebrow "GÉOÉCONOMIE"] [--title "Titre serif"] [--sub "sous-titre"]
"""
import argparse, json, os, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]

# ── Doctrine palette (policy-dark) ─────────────────────────────────────────
BG      = "#0A0A0A"
FORM    = "#F6F4F0"   # warm off-white — main silhouettes
FORM_2  = "#B8B4AC"   # muted form
RED     = "#E6203A"   # editorial red — THE accent, one per image
OCHRE   = "#E0A341"   # secondary accent, sparingly
FAINT   = "rgba(246,244,240,0.16)"
GHOST   = "rgba(246,244,240,0.07)"

W, H = 400, 225
# Motif zone: y ∈ [56, 178] — clear of the eyebrow band and the title block.
MY0, MY1 = 56, 178
MCX, MCY = 200, 118   # motif centre


def chrome(eyebrow: str, title: str, sub: str, motif: str) -> str:
    """Standard card chrome shared with the categorial SVGs."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">
  <rect width="{W}" height="{H}" fill="{BG}"/>
  <rect x="16" y="16" width="14" height="6" fill="{RED}"/>
  <text x="36" y="22" font-family="Inter, sans-serif" font-size="8" font-weight="600" fill="{RED}" letter-spacing="0.10em">{eyebrow}</text>
{motif}
  <text x="16" y="196" font-family="Source Serif 4, Georgia, serif" font-size="18" font-weight="500" fill="{FORM}">{title}</text>
  <text x="16" y="211" font-family="Inter, sans-serif" font-size="7" fill="#71717A" letter-spacing="0.04em">{sub}</text>
</svg>'''


# ── The eight motifs ───────────────────────────────────────────────────────

def m_institutional_coordination_table(p):
    """Roundtable seen from above; seats around; ONE red blocked seat."""
    import math
    seats = int(p.get("seats", 8))
    blocked = int(p.get("blocked_seat", 2))
    cx, cy, rx, ry = MCX, MCY, 96, 44
    out = []
    # table: two concentric ellipses, engraved feel
    out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="{FORM}" stroke-width="1.6"/>')
    out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx-14}" ry="{ry-14}" fill="none" stroke="{FAINT}" stroke-width="1"/>')
    # seats
    for i in range(seats):
        a = 2 * math.pi * i / seats - math.pi / 2
        sx, sy = cx + (rx + 13) * math.cos(a), cy + (ry + 13) * math.sin(a)
        col = RED if i == blocked else FORM
        w2 = 4.6 if i == blocked else 3.6
        out.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="{w2}" fill="{col}"/>')
    # circulation arrows on the inner ring (two short arcs with heads)
    out.append(f'<path d="M {cx-52} {cy-27} A 60 27 0 0 1 {cx+20} {cy-32}" fill="none" stroke="{FORM_2}" stroke-width="1"/>')
    out.append(f'<polygon points="{cx+20},{cy-32} {cx+11},{cy-35} {cx+13},{cy-27}" fill="{FORM_2}"/>')
    out.append(f'<path d="M {cx+52} {cy+27} A 60 27 0 0 1 {cx-20} {cy+32}" fill="none" stroke="{FORM_2}" stroke-width="1"/>')
    out.append(f'<polygon points="{cx-20},{cy+32} {cx-11},{cy+35} {cx-13},{cy+27}" fill="{FORM_2}"/>')
    return "\n".join("  " + s for s in out)


def m_shrinking_public_good(p):
    """Demand expands (dashed outline, outward arrows) while the good contracts."""
    cx, cy = MCX, MCY
    out = []
    # outer demand envelope — dashed, with outward arrows at 4 corners
    out.append(f'<rect x="{cx-92}" y="{cy-46}" width="184" height="92" fill="none" stroke="{FORM_2}" stroke-width="1" stroke-dasharray="5,4"/>')
    for dx, dy in ((-92, -46), (92, -46), (-92, 46), (92, 46)):
        ex, ey = cx + dx, cy + dy
        ux, uy = (1 if dx > 0 else -1), (1 if dy > 0 else -1)
        out.append(f'<line x1="{ex}" y1="{ey}" x2="{ex+10*ux}" y2="{ey+10*uy}" stroke="{FORM_2}" stroke-width="1"/>')
        out.append(f'<polygon points="{ex+10*ux},{ey+10*uy} {ex+3*ux},{ey+9*uy} {ex+9*ux},{ey+3*uy}" fill="{FORM_2}"/>')
    # the good: solid block, visibly smaller, inward arrows pressing on it
    out.append(f'<rect x="{cx-34}" y="{cy-19}" width="68" height="38" fill="{FORM}" opacity="0.92"/>')
    for sx, sy, ex, ey in ((cx-62, cy, cx-40, cy), (cx+62, cy, cx+40, cy)):
        out.append(f'<line x1="{sx}" y1="{sy}" x2="{ex}" y2="{ey}" stroke="{RED}" stroke-width="1.6"/>')
        d = 1 if ex > sx else -1
        out.append(f'<polygon points="{ex},{ey} {ex-6*d},{ey-4} {ex-6*d},{ey+4}" fill="{RED}"/>')
    # the gap between envelope and good — thin ochre hatch marks top/bottom
    out.append(f'<line x1="{cx-70}" y1="{cy-33}" x2="{cx-58}" y2="{cy-33}" stroke="{OCHRE}" stroke-width="1" opacity="0.7"/>')
    out.append(f'<line x1="{cx+58}" y1="{cy+33}" x2="{cx+70}" y2="{cy+33}" stroke="{OCHRE}" stroke-width="1" opacity="0.7"/>')
    return "\n".join("  " + s for s in out)


def m_chokepoint_to_macro_shock(p):
    """Wide flow pinched between two coastal masses; waves radiate rightward."""
    cy = MCY
    out = []
    # left flow: three converging streamlines
    for y0 in (cy - 34, cy, cy + 34):
        out.append(f'<path d="M 44 {y0} C 104 {y0}, 138 {cy}, 180 {cy}" fill="none" stroke="{FORM}" stroke-width="1.4" opacity="0.85"/>')
    # coastal masses — full, land-like silhouettes (top and bottom shores)
    out.append(f'<path d="M 150 {MY0} L 236 {MY0} L 224 {MY0+18} L 206 {cy-30} L 196 {cy-12} L 168 {cy-26} L 156 {MY0+22} Z" fill="#1C1C20" stroke="{FORM}" stroke-width="1.3"/>')
    out.append(f'<path d="M 150 {MY1} L 236 {MY1} L 226 {MY1-16} L 208 {cy+28} L 196 {cy+12} L 170 {cy+24} L 158 {MY1-20} Z" fill="#1C1C20" stroke="{FORM}" stroke-width="1.3"/>')
    # the strait passage — red
    out.append(f'<line x1="196" y1="{cy-10}" x2="196" y2="{cy+10}" stroke="{RED}" stroke-width="3.4"/>')
    # transmission: concentric arcs radiating right
    for r, o in ((24, 0.9), (44, 0.55), (64, 0.32), (84, 0.18)):
        out.append(f'<path d="M {212+r*0.25} {cy-r} A {r} {r} 0 0 1 {212+r*0.25} {cy+r}" fill="none" stroke="{FORM}" stroke-width="1.1" opacity="{o}"/>')
    return "\n".join("  " + s for s in out)


def m_blocked_route_redirected_flow(p):
    """Main route barred; flow reroutes around, longer and costlier."""
    cy = MCY
    out = []
    # original route — now ghost/dashed after the bar
    out.append(f'<path d="M 48 {cy} L 186 {cy}" fill="none" stroke="{FORM}" stroke-width="1.8"/>')
    out.append(f'<path d="M 206 {cy} L 348 {cy}" fill="none" stroke="{FAINT}" stroke-width="1.4" stroke-dasharray="4,5"/>')
    # the bar
    out.append(f'<rect x="192" y="{cy-20}" width="6" height="40" fill="{RED}"/>')
    # the detour: long arc over the top, with arrowhead rejoining
    out.append(f'<path d="M 150 {cy} C 170 {cy-52}, 260 {cy-52}, 292 {cy-8}" fill="none" stroke="{FORM}" stroke-width="1.8"/>')
    out.append(f'<polygon points="296,{cy-4} 282,{cy-15} 287,{cy-1}" fill="{FORM}"/>')
    # small distance ticks along the detour (the added cost)
    out.append(f'<line x1="205" y1="{cy-40}" x2="205" y2="{cy-46}" stroke="{OCHRE}" stroke-width="1"/>')
    out.append(f'<line x1="228" y1="{cy-45}" x2="228" y2="{cy-51}" stroke="{OCHRE}" stroke-width="1"/>')
    out.append(f'<line x1="251" y1="{cy-44}" x2="251" y2="{cy-50}" stroke="{OCHRE}" stroke-width="1"/>')
    return "\n".join("  " + s for s in out)


def m_polycrisis_channels_converge(p):
    """N channels from the edges converge on one pressure point; impact rings."""
    import math
    n = int(p.get("channels", 5))
    cx, cy = MCX, MCY
    out = []
    angs = [200, 155, 250, 115, 320, 25][:n]
    for i, adeg in enumerate(angs):
        a = math.radians(adeg)
        x0, y0 = cx + 168 * math.cos(a), cy + 92 * math.sin(a)
        x1, y1 = cx + 26 * math.cos(a), cy + 26 * math.sin(a)
        out.append(f'<line x1="{x0:.0f}" y1="{y0:.0f}" x2="{x1:.0f}" y2="{y1:.0f}" stroke="{FORM}" stroke-width="1.3" opacity="{0.9-0.08*i:.2f}"/>')
        # arrowhead pointing inward
        ux, uy = (x1 - x0), (y1 - y0)
        L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
        px, py = -uy, ux
        out.append(f'<polygon points="{x1:.0f},{y1:.0f} {x1-8*ux+3.5*px:.0f},{y1-8*uy+3.5*py:.0f} {x1-8*ux-3.5*px:.0f},{y1-8*uy-3.5*py:.0f}" fill="{FORM}"/>')
    # pressure point + rings
    out.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="{RED}"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="14" fill="none" stroke="{RED}" stroke-width="1" opacity="0.55"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="21" fill="none" stroke="{RED}" stroke-width="0.8" opacity="0.28"/>')
    return "\n".join("  " + s for s in out)


def m_fragility_last_lever(p):
    """A long lever on a too-small fulcrum, heavy load on the short arm."""
    out = []
    # ground line
    out.append(f'<line x1="70" y1="164" x2="330" y2="164" stroke="{FAINT}" stroke-width="1"/>')
    # fulcrum — small red triangle (the fragile support)
    out.append(f'<polygon points="238,164 250,146 262,164" fill="{RED}"/>')
    # lever — long bar, inclined (load side down-left lifted? no: load presses right side down)
    out.append(f'<line x1="92" y1="96" x2="332" y2="152" stroke="{FORM}" stroke-width="2.4"/>')
    # the load — big block sitting near the short end (right)
    out.append(f'<rect x="296" y="118" width="34" height="30" fill="{FORM}" opacity="0.92" transform="rotate(13 313 133)"/>')
    # effort arrow pushing down on the long end (left)
    out.append(f'<line x1="96" y1="66" x2="96" y2="88" stroke="{OCHRE}" stroke-width="1.6"/>')
    out.append(f'<polygon points="96,92 90,82 102,82" fill="{OCHRE}"/>')
    # hairline cracks under the fulcrum
    out.append(f'<path d="M 247 164 L 243 172 M 252 164 L 254 173 M 257 164 L 261 171" stroke="{RED}" stroke-width="0.9" fill="none" opacity="0.8"/>')
    return "\n".join("  " + s for s in out)


def m_fiscal_space_vs_security(p):
    """Two-pan balance, tilted beam, pans hang vertically; shield side heavier."""
    import math
    cx = MCX
    px, py = cx, 80            # pivot
    ang = math.radians(9)      # beam tilt: right side down
    L = 102
    lx, ly = px - L * math.cos(ang), py - L * math.sin(ang)   # left end (up)
    rx, ry = px + L * math.cos(ang), py + L * math.sin(ang)   # right end (down)
    out = []
    # column + base
    out.append(f'<line x1="{px}" y1="{py}" x2="{px}" y2="160" stroke="{FORM}" stroke-width="2"/>')
    out.append(f'<line x1="{px-26}" y1="160" x2="{px+26}" y2="160" stroke="{FORM}" stroke-width="2"/>')
    # beam
    out.append(f'<line x1="{lx:.0f}" y1="{ly:.0f}" x2="{rx:.0f}" y2="{ry:.0f}" stroke="{FORM}" stroke-width="2.2"/>')
    # left side (budget) — vertical drop, pan arc, small ochre block IN the pan
    d1 = 24
    out.append(f'<line x1="{lx:.0f}" y1="{ly:.0f}" x2="{lx:.0f}" y2="{ly+d1:.0f}" stroke="{FORM_2}" stroke-width="1"/>')
    out.append(f'<path d="M {lx-21:.0f} {ly+d1:.0f} A 21 9 0 0 0 {lx+21:.0f} {ly+d1:.0f}" fill="none" stroke="{FORM}" stroke-width="1.4"/>')
    out.append(f'<rect x="{lx-8:.0f}" y="{ly+d1-11:.0f}" width="16" height="11" fill="{OCHRE}" opacity="0.95"/>')
    # right side (security) — vertical drop, pan arc, shield IN the pan
    out.append(f'<line x1="{rx:.0f}" y1="{ry:.0f}" x2="{rx:.0f}" y2="{ry+d1:.0f}" stroke="{FORM_2}" stroke-width="1"/>')
    out.append(f'<path d="M {rx-21:.0f} {ry+d1:.0f} A 21 9 0 0 0 {rx+21:.0f} {ry+d1:.0f}" fill="none" stroke="{FORM}" stroke-width="1.4"/>')
    sy0 = ry + d1 - 16
    out.append(f'<path d="M {rx-9:.0f} {sy0:.0f} L {rx+9:.0f} {sy0:.0f} L {rx+9:.0f} {sy0+9:.0f} Q {rx:.0f} {sy0+16:.0f} {rx-9:.0f} {sy0+9:.0f} Z" fill="{FORM}"/>')
    # pivot — red
    out.append(f'<circle cx="{px}" cy="{py}" r="4.5" fill="{RED}"/>')
    return "\n".join("  " + s for s in out)


def m_debt_architecture_imbalance(p):
    """An arch of blocks with the keystone slipped — red block off-axis."""
    cx, base = MCX, 168
    out = []
    # two piers
    for sx in (cx - 74, cx + 46):
        for i in range(3):
            out.append(f'<rect x="{sx}" y="{base-24*(i+1)}" width="28" height="20" fill="none" stroke="{FORM}" stroke-width="1.4"/>')
    # spring blocks (slanted) left and right
    out.append(f'<rect x="{cx-58}" y="{base-92}" width="26" height="18" fill="none" stroke="{FORM}" stroke-width="1.4" transform="rotate(-18 {cx-45} {base-83})"/>')
    out.append(f'<rect x="{cx+32}" y="{base-92}" width="26" height="18" fill="none" stroke="{FORM}" stroke-width="1.4" transform="rotate(18 {cx+45} {base-83})"/>')
    # keystone — slipped, red, tilted
    out.append(f'<rect x="{cx-13}" y="{base-104}" width="26" height="19" fill="{RED}" transform="rotate(8 {cx} {base-95})"/>')
    # drop hint under keystone
    out.append(f'<line x1="{cx+2}" y1="{base-82}" x2="{cx+5}" y2="{base-66}" stroke="{RED}" stroke-width="0.9" stroke-dasharray="2,3" opacity="0.8"/>')
    # ground
    out.append(f'<line x1="{cx-96}" y1="{base}" x2="{cx+96}" y2="{base}" stroke="{FAINT}" stroke-width="1"/>')
    return "\n".join("  " + s for s in out)


MOTIFS = {
    "institutional_coordination_table": (m_institutional_coordination_table,
        "La table de coordination", "Qui bloque, qui décide"),
    "shrinking_public_good": (m_shrinking_public_good,
        "Le bien public se contracte", "La demande s'étend, le financement recule"),
    "chokepoint_to_macro_shock": (m_chokepoint_to_macro_shock,
        "Le détroit fait la transmission", "Du point d'étranglement au choc macro"),
    "blocked_route_redirected_flow": (m_blocked_route_redirected_flow,
        "Flux dévié", "La route bloquée se paie en distance"),
    "polycrisis_channels_converge": (m_polycrisis_channels_converge,
        "Les canaux convergent", "Plusieurs crises, un même point de pression"),
    "fragility_last_lever": (m_fragility_last_lever,
        "Le dernier levier", "Un appui trop étroit pour la charge"),
    "fiscal_space_vs_security": (m_fiscal_space_vs_security,
        "L'arbitrage budget-sécurité", "Ce que pèse la sécurité dans la balance"),
    "debt_architecture_imbalance": (m_debt_architecture_imbalance,
        "L'architecture sous tension", "La clé de voûte a glissé"),
}


def render(frame: str, eyebrow: str = None, title: str = None, sub: str = None,
           params: dict = None) -> str:
    fn, deft, defsub = MOTIFS[frame]
    motif = fn(params or {})
    return chrome(eyebrow or "POLICY · MÉCANISME", title or deft, sub or defsub, motif)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("frame", nargs="?")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--out")
    ap.add_argument("--eyebrow"); ap.add_argument("--title"); ap.add_argument("--sub")
    ap.add_argument("--params", help="JSON dict of motif params")
    a = ap.parse_args()
    if a.list or not a.frame:
        for k, (_, t, s) in MOTIFS.items():
            print(f"{k:38s} {t} — {s}")
        return
    svg = render(a.frame, a.eyebrow, a.title, a.sub,
                 json.loads(a.params) if a.params else None)
    out = a.out or f"{a.frame}.svg"
    pathlib.Path(out).write_text(svg, encoding="utf-8")
    print("written", out)


if __name__ == "__main__":
    main()
