#!/usr/bin/env python3
"""Reproduce fig9_stabilizer_history with vigie_chart_style BNEF engine."""

import sys
sys.path.insert(0, '/Users/killergabin/.claude/tools')
from vigie_chart_style import (
    bnef, fig_single, finalize,
    PURPLE_TITLE, TEXT_BODY, TEXT_MUTED, AXIS_COLOR, FONT
)
import matplotlib.pyplot as plt
import numpy as np

bnef()

crises = [
    'Choc pétrolier\n1973-74',
    'Tournant Volcker\n1979-82',
    'Crise asiatique\n1997-98',
    'Crise financière\n2008-09',
    'COVID-19\n2020',
    'Polycrisis Trump\n2025-26',
]

stabilizers = ['S', 'F', 'A']

# 0=Dégradé/absent  1=Sous tension  2=Opérationnel
states = [
    [0, 0, 1],  # 1973-74: swap limitées, Fed Burns pression, Alliance tension Kippour
    [1, 2, 2],  # 1979-82: 2/3 opérationnels (Fed + Alliance rétablies)
    [2, 2, 2],  # 1997-98: les trois fonctionnent
    [2, 2, 2],  # 2008-09: idem
    [2, 2, 1],  # 2020: swaps + monétaire OK, Alliance fissures
    [1, 1, 0],  # 2025-26: tous fragilisés, Alliance structurellement érodée
]

STATE_COLORS = {
    2: '#43A047',  # Opérationnel — BNEF green
    1: '#FB8C00',  # Sous tension — BNEF orange
    0: '#E53935',  # Dégradé / absent — BNEF red
}

fig, ax = fig_single(width=12, height=6.5)

n_crises = len(crises)
bar_width = 0.22
x = np.arange(n_crises)

for j in range(3):
    offsets = x + (j - 1) * bar_width
    colors = [STATE_COLORS[states[i][j]] for i in range(n_crises)]
    bars = ax.bar(offsets, [1] * n_crises, width=bar_width, color=colors, edgecolor='none')
    for i, bar in enumerate(bars):
        ax.text(
            bar.get_x() + bar.get_width() / 2, bar.get_height() / 2,
            stabilizers[j], ha='center', va='center',
            fontsize=12, fontweight=700, color='white',
        )

# AUJOURD'HUI dashed line
today_x = x[-2] + 0.5 * (x[-1] - x[-2]) + bar_width * 0.3
ax.axvline(x=today_x, color='#5A6068', linestyle='--', linewidth=1.0, zorder=3)
ax.text(today_x, 1.06, 'AUJOURD’HUI', ha='center', va='bottom',
        fontsize=8, fontweight=600, color='#5A6068', fontfamily=FONT[0])

ax.set_xticks(x)
ax.set_xticklabels(crises, fontsize=9, fontfamily=FONT[0])
ax.set_yticks([])
ax.set_ylim(0, 1.15)
ax.spines['left'].set_visible(False)
ax.spines['bottom'].set_linewidth(0.3)

# Stabilizer key (below source band)
key_lines = [
    ('S', 'Lignes de swap Fed'),
    ('F', 'Indépendance Fed'),
    ('A', 'Cohésion Alliance atlantique'),
]
for k, (letter, desc) in enumerate(key_lines):
    y_pos = 0.042 - k * 0.018
    fig.text(0.06, y_pos, f'{letter}  =  {desc}', fontsize=7.5,
             fontfamily=FONT[0], color=TEXT_BODY, va='top')

legend_above = [
    (STATE_COLORS[2], 'Opérationnel'),
    (STATE_COLORS[1], 'Sous tension'),
    (STATE_COLORS[0], 'Dégradé / absent'),
]

out = '/Users/killergabin/Documents/Application files/site-kilama/static/uploads/charts/fig9_stabilizer_history_v2.png'
finalize(
    fig, out,
    title='État des trois stabilisateurs institutionnels lors des crises majeures',
    subtitle='Pour la première fois depuis Bretton Woods, les trois stabilisateurs sont simultanément fragilisés',
    source='Analyse historique des mécanismes institutionnels de stabilisation, six crises majeures 1973-2026.',
    legend_above=legend_above,
)
plt.close()
print(f'Saved → {out}')
