# Reference Extraction Matrix — Design Cloning Engine v0.1

> Extracted 27 mars 2026. Sources : Chrome MCP (screenshots + getComputedStyle), WebFetch, WebSearch.

---

## 1. McKinsey (mckinsey.com)

### CSS Tokens
- **Font**: "McKinsey Sans", Helvetica Neue, sans-serif
- **Body**: 16px, weight 300, white on dark
- **Nav**: 90px height, transparent bg, sticky
- **Hero H1**: ~60px italic serif (visually), massive impact
- **Nav links**: 16px, weight 300, black on light

### Patterns structurels
- Hero : dark bg plein écran, titre italic serif massif, CTA arrow
- Featured : 3 colonnes asymétriques, images plein format avec texte overlay blanc
- Sections : alternance dark/light avec transitions franches
- Cards : image-first, peu de texte visible, "Read →" avec chevron
- Below fold : sections thématiques (Podcast, Industries) sur fonds bleu/marine

### Ce qu'on clone (REGISTRE, pas STYLE)
- **Échelle typographique** : ratio H1/body très contrasté (~4:1)
- **Rythme dark/light** : alternance franche de backgrounds
- **CTA style** : arrows inline, pas de boutons ronds
- **Density** : peu d'éléments par viewport mais très commandants

---

## 2. Bruegel (bruegel.org)

### CSS Tokens
- **Hero** : full-width photo overlay, ~500px height
- **Hero H1** : ~45px, serif-like (thin weight), white on dark overlay
- **Nav** : 2 rows (utilities top + main below), white text on transparent
- **Nav links** : 9+ items, 16px, medium weight, white
- **Content width** : ~1200px max, 3-column article grid
- **Cards** : images with text below, no borders, clean spacing

### Patterns structurels
- Hero : FULL BLEED photo avec overlay sombre, titre + CTA superposés
- Article grid : 3 colonnes égales, images carrées/rectangulaires, titres courts
- Tags : discrets, texte seul
- Footer : compact, multi-column sitemap
- Registre : sobre, éditorial, autorité par la clarté

### Ce qu'on clone
- **Section labels** : discrets mais structurants
- **Densité de publication** : contenu dès le premier scroll
- **Typographie éditoriale** : serif pour contenu, sans-serif pour UI
- **Rythme** : photo hero → grille articles → contenu dense

---

## 3. PIIE (piie.com)

### CSS Tokens
- **Hero** : 2 colonnes (image 50% + titre 50%)
- **Hero H1** : ~50px, serif, heavy weight, navy/dark
- **Body** : serif, ~18px
- **Nav** : ~90px, white bg, 7 items + search icon
- **Category tags** : UPPERCASE, colored (blue), small caps
- **Article titles** : serif, ~24px, bold
- **Content width** : ~1300px
- **Article grid** : 4 colonnes égales sous hero

### Patterns structurels
- Hero : image gauche + titre serif massif droite, chapeau sous le titre
- Grid : 4 colonnes, chaque card = tag UPPERCASE + titre serif + auteur + date
- Tags : colorés (bleu acier), uppercase, letter-spacing
- Auteurs : visibles dès la homepage
- Footer : compact

### Ce qu'on clone (PRIORITAIRE — registre le plus proche)
- **Titres serif** pour publications/analyses (Source Serif 4 chez nous)
- **Tags UPPERCASE** avec couleur (déjà fait)
- **Densité 4 items/row** pour les analyses (à considérer)
- **Featured article** avec titre massif (fait)
- **Auteurs visibles** (à ajouter)

---

## 4. Mazzucato (marianamazzucato.com)

### CSS Tokens
- **Font body** : Georgia, serif, 18px
- **Headings** : system-ui stack, 30px, weight 700, color rgb(255,102,102) = coral
- **Accent** : #FF6666 (coral/salmon) — headings, quote marks
- **Body bg** : white (transparent)
- **Content** : max-width ~1100px (inferred)
- **Blockquote** : 18px, serif italic, gray

### Patterns structurels
- Hero : bio texte gauche + pull-quote droite (guillemets décoratifs coral)
- Projects : blocks séparés avec titre coral + description + CTA
- Books : couvertures en row sur fond sombre
- Navigation : 7 items avec dropdowns, social icons
- Scroll : linéaire, blocs séparés, zéro bruit graphique

### Ce qu'on clone
- **Structure linéaire** : blocs séparés, scroll naturel (déjà fait)
- **Pull-quote décorative** : guillemets oversized (fait, en gold)
- **Contenu avant bio** : publications/projets d'abord (fait)
- **Zéro bruit** : pas de carrousel, animations minimales (fait)

---

## 5. Global Trade Alert (globaltradealert.org)

### CSS Tokens
- **Font** : Roboto, sans-serif, 14px body
- **Hero H1** : 30px, weight 500, white, Roboto
- **Hero bg** : gradient bleu foncé → bleu moyen
- **Card bg** : white, border-radius 10px, shadow rgba(0,0,0,0.08) 2px 2px 12px
- **Card heading** : 16px, weight 500, blue (#3B97ED)
- **Accent** : #3B97ED (bleu vif)
- **Content** : ~1300px max

### Patterns structurels
- Hero : gradient bleu, titre + sous-titre, plein écran
- Featured : 2 cards côte à côte avec images + texte superposé + dates + "Read more →"
- Data : tableaux et filtres pour les datasets
- Navigation : 5 items, compacte, icone login

### Ce qu'on clone
- **Status indicators** : dots colorés, sparklines (fait en Vigie)
- **KPI display** : chiffres bold + labels small (fait)
- **Cards avec ombres** : shadow subtile (fait avec programme cards)
- **Data-driven feel** : monospace pour données (fait)

---

## 6. The Economist (economist.com) — via WebSearch

### Design Tokens (documentés)
- **Serif** : Milo Serif Bold (headlines)
- **Sans** : Econ Sans Bold
- **Accent** : rouge Economist (#E3120B)
- **Layout** : grid dense, colonnes multiples
- **Registre** : premium éditorial, paywall visible
- **Priorité** : lisibilité et typographie au cœur du redesign

### Ce qu'on clone
- **Densité éditoriale** : beaucoup de contenu par viewport
- **Hiérarchie typographique forte** : serif bold pour titres, sans pour UI
- **Registre premium** : sobre, intelligent, pas flashy

---

## Synthèse — Matrice de convergence

| Notre section | Ref primaire | Ref secondaire | Ce qu'on a | Gap restant |
|---|---|---|---|---|
| Hero | PIIE (2-col) | Mazzucato (linéaire) | 2-col, SVG filigree, CTAs, sidebar 3 items | Pas d'image (acceptable) |
| Featured pub | PIIE (featured) | Bruegel (hero) | Cover data-viz, titre serif 1.9rem, auteur, hover zoom | ✅ Bon |
| Programmes | Bruegel (topics) | McKinsey (grille) | 2×2, border-left, mono numbers, hover shadow | ✅ Bon |
| Analyses | PIIE (grid 4-col) | Economist (dense) | 5 items, tags, titres serif, auteurs, "Lire →" hover | ✅ Bon (densité Economist) |
| Vigie | GTA (dashboard) | — | KPIs, sparklines, status dots, 3 features | ✅ Bon. Unique à nous |
| Credentials | McKinsey (dark) | Mazzucato (quote) | Navy, Playfair, badges, quote marks | ✅ Bon |
| Nav | McKinsey/PIIE | Bruegel | Fixed, dropdowns, accent line, mobile hamburger | ✅ Bon |
| Footer | Bruegel | — | 4-col sitemap, navy, email, social links, timestamp | ✅ Bon |

### Score de distance estimé : **79/100** (révisé 27 mars, honnête)
- Structure : ✅ 8 sections dans le bon ordre (nav, hero, featured, programmes, analyses, vigie, credentials, footer)
- Typographie : ✅ 4 niveaux distincts (Inter, Source Serif, Playfair, JetBrains). Tags 0.82rem/700 ✅. Nav 0.88rem ✅.
- Palette : ✅ Stricte (9 couleurs v3 uniquement)
- Registre : ✅ Densité Economist (5 analyses), transitions marquées entre sections
- Visuels : 🟡→🟢 Photo portrait hero intégrée (+3 pts). SVG covers restent placeholder (photos requises pour 85+)
- Nav : ✅ Professionnelle avec dropdowns et mobile
- Interactions : ✅ Hover sur cards, analyses, cover, sidebar items
- Footer : ✅ Email, social links, timestamp de fraîcheur
- Ombres : ✅ Doublées (0.04→0.08), plus proches PIIE (0.12)
- Body LH : ✅ Réduit de 1.6 → 1.5 (aligné références)

### Améliorations appliquées (session 27 mars, round 2)
1. +1 analyse (5 items → densité Economist/PIIE)
2. Compactage items analyses (padding 1.5→1.25rem)
3. Border-top entre sections (analyses, vigie) pour rythme visuel
4. Email contact dans footer + timestamp "Mis à jour"
5. Hover zoom sur cover featured
6. Hover renforcé sidebar hero
7. Excerpt featured compacté (margin 1.8→1.2rem)
8. Featured cover margin réduite (2→1.5rem)

### Pour atteindre 85+ (prochaine session)
- Images : photos d'accompagnement articles (+3 pts visuels)
- Featured cover : remplacer SVG par image réelle (+2 pts)
- Responsive : test et corrections 768px tablet (+2 pts)
- Teaching teaser : section manquante (+1 pt)
- Performance : font-display swap, lazy load (+1 pt)

### Pour atteindre 90+ (phase ultérieure)
- Photos multi-sections (articles, programmes)
- Contenu réel (pas placeholder)
- SEO meta, Open Graph
- Conversion Hugo custom theme
