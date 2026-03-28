# Design Procedure — erickilama.com v3

## Rôle
Senior product designer web + ingénieur front-end. Références : Bruegel, PIIE, CEPR, Kiel.
Objectif : design professionnel, sobre, institutionnel. PAS un template générique d'IA.

---

## 1. Technique de clonage structurel

### Principe
Ne jamais générer from scratch. Toujours partir d'un **site de référence concret**, en extraire la STRUCTURE et la DENSITÉ, puis y appliquer notre design system.

### Procédure

#### Phase A — Extraction des patterns de référence
Pour chaque site de référence (Bruegel, PIIE, Mazzucato) :
1. Screenshot pleine page
2. Analyser et documenter :
   - Séquence exacte des sections (top → bottom)
   - Largeur du contenu (px)
   - Grille (nb colonnes, gouttières)
   - Ratio texte/whitespace par viewport
   - Taille des titres vs corps
   - Nombre d'éléments par section
   - Hauteur de chaque section (% du viewport)

#### Phase B — Matrice de clonage
Pour chaque section de notre homepage, spécifier :

| Notre section | Référence clonée | Pattern structural | Adaptation |
|---|---|---|---|
| Hero | Bruegel hero | Titre + sous-titre + 2 CTA, pas de photo | Nos couleurs, notre texte |
| Dernière pub | PIIE featured | Card principale + 2 secondaires | Nos tags, notre contenu |
| Programmes | Bruegel topics | Grille 2×2, bandeau latéral | Nos 4 programmes |
| Analyses | PIIE/VoxEU | Liste verticale date+tag+titre+chapeau | Nos analyses |
| Vigie | Bruegel data | Bloc discret avec features | Notre framework |
| Citation | Mazzucato quote | Playfair + credentials | Nos badges |

#### Phase C — Génération guidée
1. Générer le HTML section par section (pas tout d'un coup)
2. Après CHAQUE section : screenshot → comparer avec la référence
3. Ajuster avant de passer à la section suivante

---

## 2. Design System — Institutional Intelligence v3

### Palette (STRICTE — ne jamais inventer d'autres teintes)
```css
:root {
  --navy:           #1B2A4A;
  --blue-fpsq:      #2C5F8A;
  --red-analytical:  #C0392B;
  --gold-caps:      #D4A017;
  --ivory:          #F8F7F4;
  --ivory-deep:     #F0EDE8;
  --anthracite:     #2D2D2D;
  --text-secondary: #5A6068;
  --border-light:   rgba(27, 42, 74, 0.08);
}
```

Règles :
- Fond par défaut = ivoire. Sections alternées ivoire / ivoire-deep
- PAS de fond sombre pour la homepage (le bloc Vigie navy = exception très contrôlée, optionnel)
- Rouge et or = accents rares (max 5% de la surface), jamais des fonds
- Mat, éditorial, calme. Zéro gradient, glassmorphism, néon

### Typographie (STRICTE)
```css
:root {
  --font-heading: 'Inter', 'Helvetica Neue', sans-serif;
  --font-body:    'Source Serif 4', 'Source Serif Pro', Georgia, serif;
  --font-accent:  'Playfair Display', Georgia, serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
}
```
- H1: Inter 700, 2.5rem
- H2: Inter 700, 1.5rem
- H3: Inter 600, 1.15rem
- Corps: Source Serif 4, 400, 1rem (16px), line-height 1.6
- Citations: Playfair Display italic 700
- Labels/données: JetBrains Mono 0.875rem

### Grille
- Max-width: 1100px
- Padding vertical: 4rem desktop, 2.5rem mobile
- Gouttière 2col: 2rem
- Gouttière 3col: 1.5rem

### Structure homepage (6 sections EXACTEMENT)
1. **Hero** (ivoire) — titre + sous-titre 2-3 lignes + 2 CTA
2. **Dernière publication** (ivoire-deep) — 1 carte principale + optionnel 2 secondaires
3. **Programmes de recherche** (ivoire) — grille 2×2, bandeau 3px gauche blue-fpsq
4. **Analyses récentes** (ivoire-deep) — liste éditoriale VoxEU (date + tag + titre + chapeau)
5. **Vigie / Foresight** (ivoire ou navy discret) — framework + 3 features
6. **Citation & credentials** (ivoire) — Playfair + badges CAPS/BETA/FERDI + lien About

PAS de section Publications, Teaching, Contact en homepage. Ce sont des pages dédiées.

### Hero spécifique
- Desktop : 2 colonnes (texte 60% gauche + mini-liste 40% droite)
- Mobile : pile verticale
- Pas de photo, pas de fond sombre, pas de stats type LinkedIn

---

## 3. Rubrique d'évaluation (scoring 0-100)

Chaque itération du prototype est évaluée sur 10 critères :

### Critères structurels (50 pts)
| # | Critère | Pts | Comment scorer |
|---|---------|-----|----------------|
| S1 | Séquence des sections | 10 | 6 sections dans le bon ordre = 10. Section manquante/extra = -2 chacune |
| S2 | Ratio contenu/whitespace | 10 | Comparable à Bruegel = 10. Trop dense ou trop vide = -3 |
| S3 | Hero 2 colonnes | 5 | 2 col desktop + pile mobile = 5. Mono-colonne = 0 |
| S4 | Densité de texte par carte | 5 | Max 2-3 lignes par description = 5. Mur de texte = 0 |
| S5 | Hiérarchie typographique | 10 | 4 niveaux distincts (H1 > H2 > body > meta) bien différenciés = 10 |
| S6 | Navigation | 10 | Fixe, sobre, 5 liens + lang switch, pas de burger desktop = 10 |

### Critères visuels (30 pts)
| # | Critère | Pts | Comment scorer |
|---|---------|-----|----------------|
| V1 | Palette stricte | 10 | Aucune couleur hors spec = 10. Couleur inventée = -3 chacune |
| V2 | Registre institutionnel | 10 | "Bruegel feeling" = 10. Corporate/startup/académique CV = 0-3 |
| V3 | Propreté des bordures/espacements | 10 | Alignements parfaits, padding régulier = 10 |

### Critères de contenu (20 pts)
| # | Critère | Pts | Comment scorer |
|---|---------|-----|----------------|
| C1 | Production intellectuelle > CV | 10 | Rapports/analyses visibles avant bio = 10. Stats d'expérience = 0 |
| C2 | Persona 5 secondes | 10 | En 5 sec on comprend: intelligence géopolitique quantifiée + rapports concrets + ton institutionnel = 10 |

### Seuils
- **< 60** : refaire, structurellement non conforme
- **60-75** : corrections majeures nécessaires
- **75-85** : corrections mineures, montrable en prototype
- **85-95** : prêt pour lancement weekend
- **> 95** : niveau professionnel, déployer

### Auto-évaluation obligatoire
Après chaque screenshot loop, remplir ce tableau AVANT de montrer à Eric :
```
Score: XX/100
S1: X/10 — [justification]
S2: X/10 — [justification]
...
Points à corriger avant prochain cycle : [liste]
```

---

## 4. Workflow itératif

### Boucle de travail
```
POUR chaque itération :
  1. Générer/modifier le HTML
  2. Lancer le serveur
  3. Screenshot pleine page (desktop 1440px)
  4. Auto-évaluer (rubrique ci-dessus)
  5. SI score < 85 :
       a. Identifier les 3 critères les plus faibles
       b. Corriger UNIQUEMENT ces 3 points
       c. Retour à 2
  6. SI score >= 85 :
       a. Screenshot mobile (375px)
       b. Vérifier responsive
       c. Présenter à Eric avec le score détaillé
```

### Règle des 2 passes minimum
JAMAIS présenter une version à Eric sans au moins 2 cycles screenshot → correction.
La première version générée est TOUJOURS un brouillon interne.

---

## 5. Ce qu'on tire de chaque référence

### De Mazzucato : la STRUCTURE
- Scroll linéaire par blocs séparés
- Contenu concret très tôt (projets/rapports AVANT bio)
- Patterns qui se répètent (même gabarit pour chaque entrée)
- Zéro bruit graphique, zero carrousel
- Bio fragmentée en rôles, pas en pavé

### De Bruegel : le REGISTRE
- Fond clair, typographie éditoriale
- Publications en avant dès le premier scroll
- Cards simples (titre long + résumé 2-3 lignes)
- Aucune démonstration graphique
- Crédibilité par la clarté, pas par le design

### De PIIE : la DENSITÉ
- Grille de publications avec featured item
- Tags de catégorie discrets
- Dates visibles, navigation par type
- Sens de l'actualité (latest analysis en premier)
- Registre entre journal et think tank

### Synthèse pour erickilama.com
Structure = Mazzucato (scroll linéaire, contenu tôt, patterns répétés)
Registre = Bruegel (sobre, éditorial, autorité calme)
Densité = PIIE (featured + grille, tags, actualité)

---

## 6. Interdictions absolues

1. Fond sombre plein écran en homepage
2. Stats type LinkedIn ("12+ ans", "4 publications rang A")
3. Gradients, glassmorphism, ombres lourdes
4. Photos décoratives floues
5. Slogans marketing vagues ("Navigate the future")
6. Carrousels, animations agressives
7. Plus de 6 sections en homepage
8. Bio longue en homepage (→ page About)
9. Typographie par défaut (system fonts)
10. Styles Mazzucato/McKinsey (cyan vif, arrondis, hero sombre)
