# Design Cloning Engine — Specification v1.0

## Concept

Un pipeline automatisé qui **extrait** les patterns visuels de sites de référence, les **compare** à notre prototype, **score** l'écart, et **converge** par itérations vers le registre cible.

Ce n'est pas du copier-coller : c'est de l'**ingénierie inverse de design** au service d'un design system propriétaire.

---

## Architecture

```
EXTRACTION → MAPPING → SCORING → CONVERGENCE
     ↑                                    |
     └────────────── FEEDBACK LOOP ───────┘
```

### Phase 1 : EXTRACTION

**Outils** : DivMagic (CSS computed), Chrome MCP (screenshot + inspect), WebFetch (structure HTML)

Pour chaque section d'un site de référence, capturer :

```json
{
  "site": "globaltradealert.org",
  "section": "hero",
  "screenshot": "ref_gta_hero.png",
  "properties": {
    "layout": {
      "display": "flex",
      "max_width": "1400px",
      "padding": "80px 60px",
      "gap": "40px"
    },
    "typography": {
      "h1_family": "sans-serif",
      "h1_size": "48px",
      "h1_weight": "700",
      "h1_color": "#ffffff",
      "body_size": "18px",
      "body_line_height": "1.6"
    },
    "colors": {
      "background": "#1a4b6d",
      "text_primary": "#ffffff",
      "text_secondary": "rgba(255,255,255,0.7)",
      "accent": "#3B97ED"
    },
    "visual_elements": {
      "has_image": true,
      "has_gradient": true,
      "has_shadow": "0 8px 32px rgba(0,0,0,0.15)",
      "border_radius": "8px",
      "has_decoration": "abstract_chart_bg"
    },
    "density": {
      "whitespace_ratio": 0.40,
      "elements_per_viewport": 4,
      "text_blocks": 2,
      "cta_count": 2
    }
  }
}
```

**Méthode d'extraction** :
1. DivMagic → clic sur chaque élément → CSS computed values
2. Chrome MCP → screenshot section → image de référence
3. preview_inspect → computed styles (alternative à DivMagic si pas disponible)
4. WebFetch → structure HTML simplifiée

### Phase 2 : MAPPING

Table de correspondance entre sections de référence et sections de notre prototype :

| Notre section | Référence primaire | Référence secondaire | Ce qu'on clone |
|---|---|---|---|
| Hero | GTA hero | McKinsey hero | Gradient bg, type scale, CTA style |
| Featured pub | Bruegel featured | — | Card + cover image pattern |
| Programmes | McKinsey insights grid | — | Card layout, visual weight |
| Analyses | Bruegel publications | — | Editorial list density |
| Vigie | GTA data display | — | KPI layout, status indicators, charts |
| Credentials | McKinsey dark section | — | Dark bg + quote + badges |
| Nav | McKinsey nav | Bruegel nav | Dropdown pattern, spacing |
| Footer | Bruegel footer | — | Mini-sitemap grid |

### Phase 3 : SCORING

**Distance visuelle** par propriété :

```python
def visual_distance(ref_value, our_value, property_type):
    """Score 0-1 where 0 = identical, 1 = maximally different"""
    if property_type == 'color':
        return color_distance(ref_value, our_value)  # deltaE CIELab
    elif property_type == 'size':
        return abs(parse_px(ref_value) - parse_px(our_value)) / max(parse_px(ref_value), 1)
    elif property_type == 'boolean':
        return 0 if ref_value == our_value else 1
    elif property_type == 'ratio':
        return abs(ref_value - our_value)
```

**Pondération par impact visuel** :

| Catégorie | Poids | Propriétés |
|---|---|---|
| Structure | 3x | layout, grid, max-width, padding |
| Typographie | 3x | font-size, font-weight, line-height |
| Couleur fond | 2x | background-color, gradient |
| Visuels | 2x | has_image, has_decoration, shadow |
| Densité | 2x | whitespace_ratio, elements_per_viewport |
| Détails | 1x | border-radius, letter-spacing, border |

**Score par section** = 100 - Σ(distance × poids) / Σ(poids) × 100

**Score global** = moyenne pondérée des scores par section

### Phase 4 : CONVERGENCE

```
POUR chaque itération (max 5) :
  1. Calculer le score par section
  2. Identifier les 3 sections avec le score le plus bas
  3. Pour chaque section faible :
     a. Identifier les 3 propriétés avec la plus grande distance
     b. Générer les corrections CSS
     c. Appliquer au prototype
  4. Screenshot → re-scorer
  5. Log : {iteration, score_before, score_after, corrections}
  6. SI score_global >= 85 : STOP
  7. SI score stagne (delta < 2) sur 2 itérations : ALERT "plateau"
```

---

## Contraintes

1. **Design system override** : Les corrections ne doivent JAMAIS violer notre palette/typo/grille. Si la propriété de référence est hors spec (ex: font-family = "Gotham" → on garde Inter), on ne clone que les propriétés structurelles (tailles, poids, spacing).

2. **Registre over copie** : On clone le REGISTRE (density, visual weight, contrast), pas le STYLE (couleurs, fonts). Notre design system reste souverain.

3. **Image gap** : Les sites de référence ont des photos. Nous n'en avons pas (pour l'instant). Le scoring doit traiter `has_image` séparément avec un flag `image_available: false` pour ne pas pénaliser ce qu'on ne peut pas encore résoudre.

---

## Implémentation

### Option A : Skill Claude Code (`/clone-design`)

```
Usage: /clone-design <url> --section <hero|featured|nav|...> --target <notre_section>
```

Workflow :
1. Chrome MCP → naviguer vers <url>
2. Screenshot section de référence
3. preview_inspect → extraire propriétés CSS (ou DivMagic si dispo)
4. Comparer avec notre prototype (preview_inspect sur notre serveur)
5. Calculer score + gap analysis
6. Proposer corrections CSS
7. Si confirmé : appliquer → re-screenshot → re-scorer

### Option B : Script Python standalone

```python
# design_cloner.py
# Input: reference_matrix.json + notre prototype URL
# Output: score_report.md + corrections.css
```

### Option C : Hybrid (recommandé)

- **Extraction** via Chrome MCP / DivMagic (interactif)
- **Scoring** via script Python (automatisé, reproductible)
- **Correction** via Claude Code (intelligent, respecte le design system)
- **Vérification** via Claude Preview (screenshot loop)

---

## Prochaines étapes

1. [ ] Extraire les propriétés CSS de GTA hero + McKinsey hero
2. [ ] Extraire les propriétés de notre prototype
3. [ ] Calculer le premier score de distance
4. [ ] Faire une passe de convergence
5. [ ] Itérer jusqu'à score >= 85
6. [ ] Packager en skill `/clone-design`

---

## Note sur DivMagic

DivMagic Toolbox extrait le CSS computed de n'importe quel élément en un clic.
Avantage : précision des valeurs (pas d'approximation).
Limitation : nécessite une interaction manuelle (clic sur l'élément dans Chrome).
Alternative : `preview_inspect` de Claude Preview donne les mêmes computed styles pour notre prototype.

Pour les sites de référence, la combinaison `Chrome MCP screenshot` + `WebFetch structure` + `DivMagic CSS` donne l'extraction la plus complète.
