# DESIGN AUDIT LAB — erickilama.com
## Consultation croisee : Designer Data + Communication Strategique + Architecte Logiciel + AI Consultant

**Date** : 27 mars 2026
**Objet** : Audit design du site erickilama.com — Transition vers le registre "Institutional Intelligence"
**Commanditaire** : Eric Gabin Kilama
**Statut** : CONSULTATION COMPLETE — EN ATTENTE VALIDATION

---

## Synthese executive (2 minutes de lecture)

Le site actuel est un hybride incoherent : le CSS porte les traces de trois directions abandonnees (Mazzucato, McKinsey, puis un debut de v3 Institutional Intelligence), tandis que le contenu HTML est deja partiellement structure pour la v3. Le resultat est un design qui ne communique ni "chercheur serieux" ni "conseiller strategique" — il communique "site en chantier". La palette CSS (`--navy: #051c2c`, `--accent: #00a9f4`) ne correspond pas a la palette decidee dans le plan (`#1B2A4A`, `#2C5F8A`, `#C0392B`, `#D4A017`, `#F8F7F4`). La typographie melange Playfair Display (titres) et Inter (corps) mais sans Source Serif 4 ni JetBrains Mono. Le site souffre de 1627 lignes de CSS custom boursouflees de `!important` — signe d'un combat permanent contre le framework Hugo Blox plutot qu'une integration fluide.

**Verdict unanime du Lab** : le site a besoin d'une refonte CSS complete (pas structurelle — le contenu et l'architecture Hugo sont corrects), d'un alignement palette/typo sur la v3, et d'un nettoyage des artefacts Mazzucato/McKinsey. Weekend realiste si on se concentre sur le CSS + homepage + 2-3 pages cles.

---

## Q1 — DIAGNOSTIC DU DESIGN ACTUEL

### Designer Data : Visual Design Review

**Design concept actuel (3 mots)** : "Dark Corporate Hybride"

Le site actuel echoue au squint test de Tufte : en plissant les yeux, on ne voit pas "plateforme de pensee institutionnelle" — on voit "site de consultant corporate". Trois problemes majeurs.

#### Probleme 1 : Incoherence de la palette

| Element | Valeur actuelle (CSS) | Valeur cible (plan v3) | Ecart |
|---------|----------------------|------------------------|-------|
| Primaire (navy) | `#051c2c` | `#1B2A4A` | Trop sombre, perd la nuance bleu |
| Accent | `#00a9f4` (bleu vif) | `#C0392B` (rouge analytique) | Direction completement differente |
| Fond | `#ffffff` | `#F8F7F4` (ivoire chaud) | Blanc froid vs ivoire chaud |
| Texte | `#333333` | `#2D2D2D` | Ecart mineur |
| Or (support) | Absent | `#D4A017` | Canal semantique manquant |
| Bleu FPSQ | Absent | `#2C5F8A` | Secondaire manquant |

Le theme Hugo (`kilama.yaml`) utilise encore `#003366` comme primaire — une troisieme valeur differente. Trois palettes en concurrence = zero identite.

**Spec de correction** :
```css
:root {
  --navy: #1B2A4A;
  --blue-fpsq: #2C5F8A;
  --red-analytical: #C0392B;
  --gold-caps: #D4A017;
  --ivory: #F8F7F4;
  --anthracite: #2D2D2D;
  --text-secondary: #5A6068;
  --border-light: rgba(27, 42, 74, 0.08);
}
```

#### Probleme 2 : Typographie incomplete

| Niveau | Actuel | Cible v3 | Usage |
|--------|--------|----------|-------|
| Titres H1-H2 | Playfair Display 700 | Inter 700 | Autorite sans serif, registre Bruegel |
| Corps | Inter 300 | Source Serif 4, 400, 16px/1.6 | Lisibilite longue lecture |
| Accents | Absent | Playfair Display 700 italic | Citations, pull quotes |
| Code | Absent | JetBrains Mono 14pt | Donnees, methodologie |

L'actuel utilise Inter en poids 300 (ultra-light) pour le corps — trop leger pour une lecture serieuse. Source Serif 4 en 400 est la cible pour un registre "rapport institutionnel". Playfair Display en italique reserve aux accents (pas aux titres principaux).

**Spec de correction** :
```css
:root {
  --font-heading: 'Inter', 'Helvetica Neue', sans-serif;
  --font-body: 'Source Serif 4', 'Source Serif Pro', Georgia, serif;
  --font-accent: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

h1, h2 { font-family: var(--font-heading); font-weight: 700; }
body, p, li { font-family: var(--font-body); font-weight: 400; font-size: 1rem; line-height: 1.6; }
blockquote, .pull-quote { font-family: var(--font-accent); font-style: italic; }
code, .data-label { font-family: var(--font-mono); font-size: 0.875rem; }
```

#### Probleme 3 : Le hero ne positionne pas

Le hero actuel — titre en italique Playfair Display sur fond anime navy — evoque davantage un magazine culture qu'un think tank. Les roles "Chercheur / Stratege / Conseiller" en bas sont un reflexe CV, pas un positionnement.

**Squint test** : FAIL. Le message visible en 3 secondes est "quelqu'un d'important dans un domaine non specifie". Bruegel et PIIE communiquent immediatement leur domaine : "economic policy research".

**Message cible en 1 phrase** : "Ce site produit de l'intelligence geopolitique quantifiee pour les decideurs."

#### Probleme 4 : Surcharge de CSS defensif

1627 lignes de CSS avec 89 `!important` (compte estime). Cela signifie que le design se bat contre Hugo Blox plutot que de travailler avec. Les commentaires internes referent encore a "McKinsey" et "Mazzucato" — deux directions officiellement abandonnees. Cout de maintenance : chaque modification touche des cascades de surcharges imprevisibles.

**Score visuel global : 4/10**

| Critere | Score | Commentaire |
|---------|-------|-------------|
| Palette coherente | 2/10 | 3 palettes en concurrence |
| Typographie | 4/10 | Bonne base mais mauvais poids et stack incomplete |
| Hierarchie visuelle | 5/10 | Structure des sections correcte, execution faible |
| Hero | 3/10 | Effet visuel correct, message absent |
| Registre institutionnel | 3/10 | McKinsey corporate, pas Bruegel institutional |
| Responsive | 6/10 | Fonctionnel mais non optimise |
| Dark mode | 5/10 | Present mais palette dark incoherente aussi |

---

### Communication Strategique : Communication Quality Review

**Protocol active** : Protocol A — SCQA & Audience Design

#### Audience primaire

**Persona** : "Directrice adjointe, direction de la prospective, SGDSN. 45 ans, Sciences Po + ENA. Lit 30 sites/semaine. Cherche un expert quantitatif fiable pour nourrir ses notes. Elle arrive sur le site via un lien LinkedIn et a 90 secondes pour decider si elle bookmarke."

#### SCQA du site actuel

| Element | Etat actuel | Diagnostic |
|---------|-------------|------------|
| **Situation** | Presente mais diluee | "A l'intersection de la recherche, de la strategie et de l'action publique" — formule vague, pas de domaine specifique |
| **Complication** | Absente | Aucune tension, aucun enjeu. Le visiteur ne ressent pas pourquoi ce site existe maintenant |
| **Question** | Absente | Le hero ne pose pas de question implicite |
| **Answer** | Partiellement presente | Les stats + expertise donnent des elements mais sans fil narratif |

#### Verdict registre

Le site parle actuellement le langage **CV en ligne** :
- "4 Publications rang A" — langage recrutement academique
- "12+ Annees d'experience" — langage LinkedIn
- "3 Affiliations academiques" — langage promotion MCF

Un site registre Bruegel/PIIE parle le langage **production intellectuelle** :
- "Dernier rapport : PME et resilience geopolitique" — langage editeur
- "3 scenarios pour le G7 2026" — langage prospective
- "Nouvelle donnee : GPR Index Q1 2026" — langage chercheur actif

#### Jargon et formulations a corriger

| Actuel (CV) | Cible (Institutional Intelligence) |
|-------------|-----------------------------------|
| "Macroeconomiste. Ancien conseiller au Quai d'Orsay" | "Intelligence geopolitique quantifiee pour les decideurs" |
| "Chercheur associe BETA & FERDI" | Integrer dans le contexte, pas en bandeau |
| "Decouvrir mes travaux" (CTA) | "Derniere analyse" ou "Rapport recent" |
| "Foresight →" (CTA secondaire) | "Scenarios G7 2026" (concret, date) |
| "Domaines d'expertise" | "Programmes de recherche" ou "Thematiques" |
| Section "A propos" en homepage | Supprimer de la homepage — la bio est sur /about/ |

#### Parcours de lecture simule (90 secondes)

| Temps | Ce que le visiteur voit | Ce qu'il retient | Action |
|-------|------------------------|-----------------|--------|
| 0-5s | Hero navy avec titre vague | "Un economiste, ok" | Scroll ou part |
| 5-15s | Stats "4 publis, 12 ans..." | "Un CV" | Continue par inertie |
| 15-30s | Domaines d'expertise (icones) | "Il fait de la geo, du dev, de l'energie" | Pas d'accroche specifique |
| 30-60s | Dernieres analyses (3 posts) | "Il ecrit des trucs" | Peut cliquer si titre accrocheur |
| 60-90s | Publications recentes (showcase) | "Policy brief PME" | Premier contenu concret |

**Probleme** : le premier contenu concret (publication reelle) n'arrive qu'a la 5eme section. Les 4 premieres sont autobiographiques. Un site Bruegel met la production intellectuelle EN PREMIER.

**Score communication : 4/10**

---

### Architecte Logiciel : Code Architecture Review

**Protocol active** : Protocol A — Architecture Decision & Technical Debt Assessment

#### 1. Structure technique

Le site utilise Hugo Blox Builder (ex-Wowchemy) avec deux modules : `blox-plugin-netlify` + `blox-tailwind`. La configuration est saine — `hugo.yaml` bien structure, menu bilingue (FR/EN), taxonomies standard.

**Probleme central** : Le fichier `custom.css` (1627 lignes) est un monolithe qui porte TOUTE la personnalisation visuelle. Il contient :

- **Sections 0-22** de surcharges CSS, chacune commentee "Mazzucato" ou "McKinsey"
- **~89 declarations `!important`** — signal de cascade brisee
- **Utilitaires Tailwind manquants recrits manuellement** (lignes 190-380) — 190 lignes de classes utilitaires qui devraient etre generees par le JIT Tailwind
- **Corrections responsives ad hoc** partout

#### 2. Dette technique

| Issue | Severite | Fix |
|-------|----------|-----|
| 3 palettes en concurrence (CSS vars, kilama.yaml, plan v3) | CRITIQUE | Aligner kilama.yaml + CSS vars sur palette v3 |
| 190 lignes d'utilitaires Tailwind manuels | HAUTE | Configurer correctement tailwind.config.js pour generer les classes manquantes |
| Commentaires "McKinsey"/"Mazzucato" dans le CSS | MOYENNE | Nettoyer, renommer en v3 |
| `border-radius: 0 !important` sur TOUT (`*`) | HAUTE | Decision de design valide mais implementation brutale — utiliser des classes specifiques |
| Hero animation CSS (gradient anime 12s) | BASSE | Gout esthetique, pas un bug, mais consomme GPU inutilement |

#### 3. Architecture Decision Record

```
## ADR-002 — Refonte CSS : McKinsey/Mazzucato → Institutional Intelligence v3

Date : 2026-03-27
Statut : Propose

### Contexte
Le custom.css porte 3 couches de design (Mazzucato, McKinsey, debut v3)
accumulees en 1627 lignes. La palette, la typographie et les composants
ne correspondent plus au design cible v3 Institutional Intelligence.

### Options
1. Refactoring incremental — corriger la palette et typo dans le CSS existant
   (+) Rapide (~3h), moins de risque de regression
   (-) Conserve la dette des 190 lignes utilitaires et les !important

2. Rewrite complet du custom.css — partir d'un fichier propre
   (+) CSS propre, aligne sur v3, suppression de toute la dette
   (-) Plus long (~6-8h), risque de regression sur des composants oublies

3. Migration vers un theme Hugo Blox custom (fork du theme kilama)
   (+) Integration native, pas de surcharges
   (-) Hors scope weekend, maintenance fork a long terme

### Decision recommandee
Option 1 pour le weekend (samedi), avec migration progressive vers
Option 2 en Phase 2 (avril). Le weekend doit produire un site
publiable, pas un site parfait.

### Impact sur les tests
- Tester visuellement : homepage, about, research, foresight, 1 post
- Tester responsive : mobile (375px), tablette (768px), desktop (1280px)
- Tester dark mode sur les memes pages
- Tester FR et EN
```

#### 4. Contrainte Hugo Blox Tailwind

Hugo Blox utilise Tailwind CSS via un build JIT, mais le build ne genere pas toutes les classes utilisees dans les templates Hugo Blox. C'est pourquoi 190 lignes de classes utilitaires sont reecrites manuellement. Solutions :

- **Court terme (weekend)** : conserver les utilitaires manuels, ne pas toucher
- **Moyen terme** : configurer `tailwind.config.js` avec les `content` paths corrects pour que le JIT scanne les templates Hugo Blox et genere les classes automatiquement
- **Long terme** : contribuer au repo Hugo Blox ou forker le module Tailwind

**Verdict architecture : CORRECTIONS — pas de refonte structurelle ce weekend**

---

### AI Consultant : Strategie d'implementation Claude Code

**Question centrale** : Comment Claude Code peut-il produire un design de qualite proche des outils dedies (Figma, Dall-E, Midjourney) ?

#### Ce que Claude Code fait bien

1. **CSS/HTML** : Claude Code peut ecrire, modifier et optimiser du CSS et du HTML avec precision. Pour un site statique Hugo, c'est suffisant — pas besoin de Figma.
2. **Architecture de fichiers** : navigation dans le repo Hugo, modification de `hugo.yaml`, creation de partials, structuration du contenu.
3. **Coherence systemique** : capacite a maintenir une palette, une typographie et des conventions CSS sur l'ensemble des fichiers.
4. **Iteration rapide** : modifier le CSS, voir le resultat via `hugo server`, ajuster en boucle.

#### Ce que Claude Code ne fait PAS

1. **Pas de rendu visuel direct** : Claude Code ne "voit" pas le site. Il ecrit du CSS a l'aveugle. C'est le gap principal avec Figma.
2. **Pas de generation d'images** : Claude Code ne peut pas generer de SVG complexes ou d'illustrations. (Note : les `theme-*.svg` references dans la page Research existent deja dans `/static/media/` — pas de blocage ici.)
3. **Pas de design system interactif** : pas de tokens, pas de composants visuels reutilisables au sens Figma.
4. **Pas de feedback perceptif** : le "squint test" de Tufte est impossible pour un agent textuel.

#### Strategies compensatoires

**Strategie 1 : Preview MCP comme retour visuel**

Claude Code dispose du MCP `Claude_Preview` (screenshot, inspect, console_logs). Le workflow compensatoire :
1. Lancer `hugo server` en arriere-plan
2. Utiliser `preview_start` pour ouvrir le site en local
3. Utiliser `preview_screenshot` apres chaque modification CSS
4. Analyser visuellement le screenshot (Claude est multimodal)
5. Iterer

Ce workflow transforme Claude Code en "designer iteratif" — pas aussi rapide que Figma, mais fonctionnel.

**Strategie 2 : Design system en CSS variables**

Au lieu de designer "visuellement", designer "semantiquement". Definir TOUTES les decisions de design dans des CSS custom properties :
```css
:root {
  /* Palette */
  --color-primary: #1B2A4A;
  --color-secondary: #2C5F8A;
  --color-accent: #C0392B;
  --color-support: #D4A017;
  --color-bg: #F8F7F4;
  --color-text: #2D2D2D;

  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Source Serif 4', serif;
  --font-accent: 'Playfair Display', serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --section-padding: 5rem;
  --content-max-width: 1200px;
  --hero-height: 600px;

  /* Borders */
  --accent-bar-height: 3px;
  --card-border: 1px solid rgba(27, 42, 74, 0.1);
}
```

Chaque modification visuelle passe par ces variables — pas de valeurs hardcodees dans les composants. Claude Code peut modifier ces tokens sans voir le rendu, et le resultat sera coherent.

**Strategie 3 : References visuelles explicites**

Fournir a Claude Code des screenshots des sites de reference (Bruegel, PIIE, CEPR) et lui demander d'analyser les patterns CSS visibles. Puisque Claude est multimodal, il peut extraire :
- La structure de grille
- Les rapports de taille typographique
- Les espacements
- La palette approximative

Ce n'est pas du reverse engineering — c'est de l'analyse de references, la meme chose qu'un designer ferait avec un moodboard.

**Strategie 4 : Composants Hugo Blox existants**

Hugo Blox offre des blocks pre-construits (hero, stats, features, collection, markdown, cta-card). La strategie optimale est de MAXIMISER l'utilisation de ces blocks (qui sont deja responsive et accessibles) et de MINIMISER le CSS custom. Le site actuel fait l'inverse — il surcharge tout.

**Strategie 5 : SVG et images**

Pour les illustrations (icones de themes, backgrounds, etc.) :
- Utiliser Heroicons (deja integre dans Hugo Blox) pour les icones
- Pour les images de fond de cartes, utiliser des gradients CSS sophistiques plutot que des images
- Pour les SVG thematiques, utiliser des services externes (Undraw, Storyset) ou demander a Eric de fournir des images
- Alternative : utiliser des blocs de couleur avec typographie forte (pattern Bruegel)

#### Skills manquants et compensations

| Capacite | Outil dedie | Claude Code | Compensation |
|----------|-------------|-------------|-------------|
| Rendu visuel | Figma, browser | Non natif | Preview MCP + screenshots |
| Generation d'images | Dall-E, Midjourney | Non | Gradients CSS, icones SVG, images fournies |
| Prototypage interactif | Figma, Framer | Non | HTML/CSS direct + hugo server |
| Design tokens | Figma tokens plugin | Oui via CSS vars | CSS custom properties = design tokens |
| Responsive testing | Chrome DevTools | Via Preview MCP | preview_resize a differentes tailles |
| Accessibilite | axe, Lighthouse | Via terminal | `lighthouse` CLI ou `pa11y` |

---

## Q2 — RECOMMANDATIONS DESIGN : REGISTRE "INSTITUTIONAL INTELLIGENCE"

### Designer Data : Visual Concept Document

**Design concept (3 mots)** : "Quiet Institutional Authority"

Inspire de Bruegel, PIIE, CEPR — pas de Flash, pas d'animation, pas d'effets. La credibilite vient du contenu, de la typographie et de l'espace blanc.

#### Palette v3 finalisee

| Role | Hex | Nom | Usage |
|------|-----|-----|-------|
| Primaire | `#1B2A4A` | Navy profond | Titres H1-H2, header, footer, CTAs principaux |
| Secondaire | `#2C5F8A` | Bleu FPSQ | Liens, elements interactifs, hover states |
| Accent | `#C0392B` | Rouge analytique | Alertes, elements de mise en evidence, tags "nouveau" |
| Support | `#D4A017` | Or CAPS | Highlights, citations, badges |
| Fond | `#F8F7F4` | Ivoire chaud | Background global (remplace le blanc froid) |
| Fond alt | `#F0EDE8` | Ivoire profond | Sections alternees |
| Texte | `#2D2D2D` | Anthracite | Corps de texte |
| Texte sec. | `#5A6068` | Gris moyen | Sous-titres, dates, metadonnees |
| Bordure | `rgba(27,42,74,0.08)` | — | Separateurs subtils |

**Regle** : le rouge `#C0392B` est reserve aux elements d'attention — jamais en decoration. Ratio max rouge/page : 5%. L'or `#D4A017` reserve aux citations et distinctions. Le bleu `#2C5F8A` est la couleur de travail (liens, boutons, interactions).

#### Typographie v3 finalisee

| Niveau | Font | Poids | Taille | Line-height | Couleur |
|--------|------|-------|--------|-------------|---------|
| H1 (hero) | Inter | 700 | clamp(2rem, 4vw, 2.75rem) | 1.2 | #1B2A4A ou blanc |
| H2 (sections) | Inter | 700 | 1.625rem | 1.3 | #1B2A4A |
| H3 (sous-sections) | Inter | 600 | 1.25rem | 1.4 | #2D2D2D |
| Corps | Source Serif 4 | 400 | 1rem (16px) | 1.6 | #2D2D2D |
| Citations | Playfair Display | 400 italic | 1.25rem | 1.55 | #5A6068 |
| Metadonnees | Inter | 500 | 0.8125rem | 1.4 | #5A6068 |
| Labels/Tags | Inter | 600 | 0.6875rem | 1 | uppercase, #2C5F8A |
| Code/Data | JetBrains Mono | 400 | 0.875rem | 1.5 | #2D2D2D |

#### Grille

- Max-width contenu : 1100px (pas 1200px — plus intime, plus Bruegel)
- Marges laterales : `max(2rem, 5vw)`
- Gouttiere : 2rem (grille 2 colonnes), 1.5rem (grille 3 colonnes)
- Padding vertical sections : 4rem desktop, 2.5rem mobile

#### Composants homepage recommandes

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER : Navy #1B2A4A, fixe, logo Inter 700 blanc             │
│  Nav : Inter 400, blanc 85%, hover #2C5F8A                     │
│  Pas d'animation, pas de mega-menu — dropdowns simples         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SECTION 1 : HERO (fond ivoire, PAS fond sombre)               │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  [Inter 700, 2.75rem, #1B2A4A]                       │       │
│  │  "Quantifier les chocs geopolitiques                 │       │
│  │   pour eclairer les decisions"                       │       │
│  │                                                       │       │
│  │  [Source Serif 4, 400, 1rem, #5A6068]                │       │
│  │  Economiste-stratege. Intelligence geopolitique      │       │
│  │  quantifiee au service des decideurs G7, OCDE,       │       │
│  │  Quai d'Orsay.                                       │       │
│  │                                                       │       │
│  │  [CTA] Dernier rapport →   [CTA2] Scenarios 2026 →  │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 2 : DERNIERE PUBLICATION (mise en avant)               │
│  ┌─────────────────────────────────┬────────────────────┐       │
│  │ [Tag: POLICY BRIEF | Fev 2026] │                     │       │
│  │                                 │  Resume 3 lignes   │       │
│  │ "La fragilite par la base :     │  + lien PDF        │       │
│  │  PME et resilience              │  + lien page       │       │
│  │  geopolitique"                  │                     │       │
│  └─────────────────────────────────┴────────────────────┘       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 3 : PROGRAMMES DE RECHERCHE (pas "expertise")         │
│  Grille 2x2 — fond ivoire profond #F0EDE8                     │
│  Chaque carte : titre Inter 600 + 2 lignes description         │
│  Pas d'icones — un bandeau colore a gauche (3px #2C5F8A)       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 4 : ANALYSES RECENTES (collection 3 derniers posts)   │
│  Format liste simple : date + titre + tag thematique            │
│  Style CEPR/VoxEU                                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION 5 : CITATION + CREDENTIALS (au lieu de bio)           │
│  ┌────────────────────────────┬─────────────────────────┐       │
│  │ Citation Playfair italic   │ CAPS/MEAE 2018-2023     │       │
│  │ "L'enjeu pour l'Europe..." │ BETA + FERDI            │       │
│  │                             │ 4 publications rang A   │       │
│  │        — E. Kilama, 2026   │ Cert. FMI Climate 2024  │       │
│  └────────────────────────────┴─────────────────────────┘       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER : Navy #1B2A4A, compact                                │
│  Copyright + liens + affiliations                               │
└─────────────────────────────────────────────────────────────────┘
```

**Changements cles vs actuel** :
1. Hero sur fond IVOIRE (pas noir) — autorite calme, pas theatralite corporate
2. La PRODUCTION arrive en section 2 (pas en section 5)
3. Suppression de la section stats type CV
4. Bio/quote reculee en section 5, condensee
5. Pas de showcase en fond sombre — les publications sont sur fond clair, style editorial

#### Conformite references institutionnelles

| Element | Bruegel | PIIE | CEPR | Recommandation Kilama |
|---------|---------|------|------|-----------------------|
| Fond | Blanc | Blanc casse | Blanc | Ivoire `#F8F7F4` |
| Header | Discret, blanc | Navy | Blanc | Navy fixe (deja correct) |
| Hero | Titre + derniere publi | Titre + featured | Pas de hero | Titre + tagline |
| Contenu en premier | Oui, grid publis | Oui, featured | Oui, blog list | Oui, derniere publi en S2 |
| Typographie corps | Serif | Serif | Sans-serif | Source Serif 4 (serif) |
| Couleur accent | Bleu Bruegel | Bleu PIIE | Rouge CEPR | Rouge `#C0392B` (analytique) |

---

### Communication Strategique : Communication Architecture

#### SCQA homepage recommandee

**Situation** (implicite dans le design) :
Les chocs geopolitiques — sanctions, fragmentation commerciale, competition sino-americaine — se multiplient et affectent directement les economies europeennes.

**Complication** (implicite dans le positionnement) :
L'analyse geopolitique reste qualitative. L'economie quantitative ignore les chocs politiques. Les decideurs manquent d'outils quantifies.

**Question** (la tension que le visiteur ressent) :
Qui produit une intelligence geopolitique rigoureusement quantifiee ?

**Answer** (le site entier, mais concentree dans le hero) :
Eric Kilama — econometrie causale, prospective quantitative, conseil decideurs G7/OCDE. 12 ans a l'intersection recherche-strategie-action publique. Ancien conseiller CAPS/Quai d'Orsay.

#### Titre hero recommande

**Option A** (factuelle) :
> Quantifier les chocs geopolitiques pour eclairer les decisions

**Option B** (positionnement) :
> Intelligence geopolitique quantifiee

**Option C** (orientee production) :
> Recherche, prospective et conseil strategique sur les risques geopolitiques et economiques

**Recommandation** : Option A — elle repond a "qu'est-ce que ce site fait pour moi ?" en une phrase, avec un verbe d'action. Elle est specifique (geopolitique), methodologique (quantifier) et orientee utilisateur (eclairer les decisions).

#### Registre cible : 5 formulations do/don't

| # | DON'T (CV en ligne) | DO (Institutional Intelligence) |
|---|---------------------|-------------------------------|
| 1 | "Bienvenue sur mon site personnel" | Pas de bienvenue. Le contenu parle. |
| 2 | "Publications rang A" | "Publie dans European Economic Review, Journal of Comparative Economics" |
| 3 | "12+ annees d'experience" | "Ancien conseiller CAPS/Quai d'Orsay (2018-2023)" |
| 4 | "Domaines d'expertise" | "Programmes de recherche" |
| 5 | "A propos de moi" (sur homepage) | Pas de bio en homepage. Lien "About" dans le menu suffit. |

---

## Q3 — STRATEGIE D'IMPLEMENTATION CLAUDE CODE

### Plan technique detaille

#### Phase 0 : Preparation (30 min)

1. Creer une branche git `v3-institutional` (si repo git) ou un backup du CSS actuel
2. Mettre a jour `kilama.yaml` (theme Hugo) avec la palette v3
3. Charger les Google Fonts manquantes dans le `<head>` Hugo : Source Serif 4, JetBrains Mono

#### Phase 1 : CSS variables et typographie (1h30)

1. Remplacer toutes les CSS custom properties (`:root`) par la palette v3
2. Mettre a jour la stack typographique
3. Modifier le fond de `body` : `#ffffff` → `#F8F7F4`
4. Ajuster les poids de police : corps de `300` → `400`, titres Inter au lieu de Playfair
5. Tester visuellement via Preview MCP

#### Phase 2 : Homepage restructuration (2h)

1. Modifier `content/_index.md` :
   - Hero : nouveau titre, sous-titre, CTAs
   - Supprimer le block `stats` (CV)
   - Ajouter un block `markdown` "Derniere publication" en position 2
   - Renommer "Domaines d'expertise" → "Programmes de recherche"
   - Deplacer la section bio/quote en dernier
   - Supprimer le showcase dark (publications recentes) — remplacer par un format editorial clair
2. Ajuster le CSS des sections modifiees
3. Tester via Preview MCP

#### Phase 3 : Nettoyage CSS (1h30)

1. Supprimer tous les commentaires "McKinsey" et "Mazzucato"
2. Supprimer le `border-radius: 0 !important` global → appliquer selectivement
3. Supprimer l'animation du hero gradient (remplacer par fond statique ou ivoire)
4. Reduire les `!important` a ceux strictement necessaires
5. Reorganiser en sections logiques v3

#### Phase 4 : Pages secondaires (1h30)

1. Page About : verifier coherence typo/palette
2. Page Research : verifier la grille de themes (les SVG existent-ils ?)
3. Page Foresight : verifier le hero + section "En developpement"
4. Tester chaque page via Preview MCP

#### Phase 5 : Tests finaux (1h)

1. Responsive : mobile 375px, tablette 768px, desktop 1280px
2. Dark mode : verification palette dark coherente
3. Performance : `lighthouse` CLI pour score performance/accessibilite
4. Bilingue : verifier FR et EN

### Workflow iteratif recommande

```
1. hugo server --disableFastRender (en arriere-plan)
2. Modifier CSS ou contenu
3. preview_screenshot → analyser
4. Si OK → commit
5. Si NON → ajuster → retour a 2
```

Ce workflow remplace Figma. La boucle de feedback est plus lente (~30s vs instantanee) mais suffisante pour un weekend.

---

## Q4 — PLAN WEEKEND REALISTE

### Samedi : Design system + Homepage (6-7h)

| Heure | Tache | Livrable | Duree |
|-------|-------|----------|-------|
| 9h00-9h30 | Backup, branche, preparation | Branche v3-institutional | 30 min |
| 9h30-10h30 | Google Fonts, kilama.yaml, CSS variables | Palette + typo alignees v3 | 1h |
| 10h30-11h00 | Fond ivoire, poids police, nettoyage base | Rendu global v3 | 30 min |
| 11h00-13h00 | Homepage : hero, sections, structure | Homepage v3 complete | 2h |
| 14h00-15h00 | Nettoyage CSS : !important, commentaires | CSS propre (<1000 lignes) | 1h |
| 15h00-16h30 | Hero CSS, composants homepage | Composants finalises | 1h30 |
| 16h30-17h00 | Test responsive + dark mode | Tests visuels passes | 30 min |

**Livrable samedi soir** : Homepage v3 publiable sur fond ivoire avec palette coherente.

### Dimanche : Pages + Deploy (5-6h)

| Heure | Tache | Livrable | Duree |
|-------|-------|----------|-------|
| 9h00-10h00 | Page About : bio narrative, suppression CV-style | About v3 | 1h |
| 10h00-11h30 | Page Research : grille themes, liste publications | Research v3 | 1h30 |
| 11h30-12h30 | Page Foresight : hero + approche + placeholder | Foresight v3 | 1h |
| 14h00-15h00 | Tests complets (responsive, dark, FR/EN, perf) | Rapport de test | 1h |
| 15h00-16h00 | Acheter domaine erickilama.com + config Netlify | Site deploye | 1h |
| 16h00-17h00 | Derniers ajustements post-deploy | Site live | 1h |

**Livrable dimanche soir** : Site erickilama.com live avec homepage + about + research + foresight en v3 Institutional Intelligence.

### Ce qui est HORS SCOPE weekend

- Pipeline `publish.py` (Phase 2, avril)
- Contenu CAPS allege (necessite selection + anonymisation)
- Newsletter Substack
- Dashboard FPSQ interactif
- Pages Teaching detaillees
- SEO avance (Plausible Analytics, meta tags, schema.org)
- Dark mode parfait (fonctionnel mais pas optimise)

### Risques et mitigations

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Hugo Blox casse apres modif CSS | Moyenne | Bloquant | Backup CSS avant chaque phase, `git stash` |
| Tailwind JIT ne genere pas les classes | Haute | Moyen | Conserver les utilitaires manuels, ne pas toucher |
| SVG thematiques a ajuster (research) | Basse | Faible | Les SVG existent dans /static/media/ — verifier qu'ils collent a la palette v3 |
| Temps insuffisant pour tout faire | Moyenne | Moyen | Prioriser homepage > about > research > rest |
| Domaine pas encore achete | Basse | Faible | Deployer sur Netlify subdomain d'abord |

---

## TENSION DOCUMENTEE

**Tension identifiee** : Ambition design vs contrainte weekend.

- **Designer Data** : "Le hero devrait etre entierement reconcu avec une approche fond clair, typographie forte, zero animation. Il faut aussi creer des composants editoriaux (publication card, analysis list) qui n'existent pas dans Hugo Blox."
- **Architecte Logiciel** : "Creer des composants Hugo custom (partials, shortcodes) prend du temps et introduit de la dette. Pour le weekend, maximiser l'utilisation des blocks existants et ne toucher qu'au CSS. Les composants custom peuvent attendre Phase 2."

**Arbitrage recommande** : L'Architecte a raison pour le weekend. On travaille AVEC Hugo Blox, pas contre. Les blocks `hero`, `markdown`, `features`, `collection` suffisent. La qualite vient de la palette, la typographie et le contenu — pas de composants custom.

---

## CHECKLIST PRE-IMPLEMENTATION

- [ ] Sauvegarder le CSS actuel (`custom.css.backup-mazzucato`)
- [ ] Verifier que `hugo server` fonctionne avant toute modification
- [ ] Aligner `kilama.yaml` sur palette v3 AVANT de toucher le CSS
- [ ] Charger Source Serif 4 + JetBrains Mono dans la config Hugo
- [ ] Preparer les textes hero/homepage en amont (pas de redaction pendant le CSS)
- [x] SVG thematiques presents (`/static/media/theme-*.svg`) — verifier coherence palette v3
- [ ] Acheter erickilama.com vendredi soir si possible (propagation DNS)

---

## ANNEXE : References de design

Sites a screenshoter et analyser avant implementation :

1. **Bruegel** (bruegel.org) — reference principale. Fond blanc, typo serif corps, contenu en premier, zero decoration.
2. **PIIE** (piie.com) — featured publications en homepage, header navy, grille editoriale.
3. **CEPR** (cepr.org) — VoxEU column list, format blog academique, minimalisme.
4. **Kiel Institute** (ifw-kiel.de) — cartes de publications, navigation thematique.
5. **IFRI** (ifri.org) — reference francophone, hero avec derniere publi, navigation par theme.

**Instruction Claude Code** : avant de commencer le samedi, utiliser Preview MCP (ou Chrome MCP) pour screenshoter ces 5 sites, analyser les patterns visuels communs, et extraire les constantes CSS (tailles, espacements, couleurs dominantes). Cela remplace le moodboard Figma.

---

*Consultation Lab terminee. 4 personas : Designer Data, Communication Strategique, Architecte Logiciel, AI Consultant. Document pret pour second opinion (Perplexity ou autre).*
