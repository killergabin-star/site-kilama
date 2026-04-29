#!/usr/bin/env python3
"""Bar chart — Hausse des prix des intrants agricoles depuis le blocus d'Ormuz."""

import sys
sys.path.insert(0, '/Users/killergabin/.claude/tools')
from vigie_chart_style import (
    bnef, fig_single, finalize, bar_chart,
    SERIES, PURPLE_TITLE, TEXT_BODY, TEXT_MUTED, FONT
)
import matplotlib.pyplot as plt
import numpy as np

bnef()

categories = [
    'Urée',
    'DAP\n(phosphate diammonique)',
    'Indice engrais\nAmérique du Nord',
    'Soufre',
    'Ammoniac',
]
values = [43.0, 32.0, 27.5, 25.2, 14.5]
sources_detail = [
    '~490 — ~700 $/t',
    '516 — 683 $/t',
    '',
    '',
    '',
]

fig, ax = fig_single(width=11, height=6)

colors = [SERIES[6]] * len(categories)  # BNEF red for all — crisis/alert encoding

bars = ax.barh(
    np.arange(len(categories)), values,
    height=0.55, color=colors, edgecolor='none'
)

ax.set_yticks(np.arange(len(categories)))
ax.set_yticklabels(categories, fontsize=9.5, fontfamily=FONT[0])
ax.tick_params(axis='y', length=0)
ax.invert_yaxis()

ax.spines['left'].set_visible(False)
ax.spines['bottom'].set_linewidth(0.3)
ax.set_xlabel('Hausse de prix (%)', fontsize=9, color=TEXT_MUTED, fontfamily=FONT[0])
ax.axvline(x=0, color='#BDBDBD', linewidth=0.5)

ax.xaxis.grid(True, linestyle='--', alpha=0.35, linewidth=0.3, color='#E0E0E0')
ax.set_axisbelow(True)

for bar, val, src in zip(bars, values, sources_detail):
    label = f'+{val:g} %'
    if src:
        label += f'   ({src})'
    ax.text(
        bar.get_width() + 0.8, bar.get_y() + bar.get_height() / 2,
        label, va='center', fontsize=9.5, fontweight=600,
        color=TEXT_BODY, fontfamily=FONT[0],
    )

ax.set_xlim(0, 58)

out = '/Users/killergabin/Documents/Application files/site-kilama/static/uploads/charts/fig_ormuz_engrais.png'
finalize(
    fig, out,
    title='Hausse des prix des intrants agricoles\ndepuis le blocus d\'Ormuz',
    subtitle='Variation depuis le 27 février 2026',
    source='World Bank, IndexBox, FAO, CNBC (avril 2026).',
)
plt.close()
print(f'Saved → {out}')
