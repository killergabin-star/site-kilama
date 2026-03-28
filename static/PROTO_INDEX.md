# Index des Prototypes Visuels — erickilama.com

> Catalogue de 9 moteurs visuels prototypés pour le site.
> Chaque proto est un fichier HTML autonome, servi par Hugo sur `localhost:1314/proto-*.html`.
> Inspirations : Pentagram (Halstead, Opara, Lupi), Graphcore, RAND Art+Data.

---

## Verdicts

| ID | Nom | Verdict | Usage potentiel |
|----|-----|---------|-----------------|
| A  | Halstead Isometric | **GARDÉ** | Section Programmes (2×2 statique premium) |
| B  | Graphcore Quadtree | **REJETÉ** | — |
| C  | Particle Flow Field | **GARDÉ** | Background Vigie / Hero animé |
| D  | Data Constellation | **GARDÉ** | Section Programmes (réseau vivant) |
| E  | CSS Pure Geometry | **GARDÉ** | Section Programmes (léger, 0 JS) |
| F  | Topographic Contours | **GARDÉ** | Section Research / Hero analytique |
| G  | Lupi Dendrites | **REJETÉ** | — |
| H  | Data Rings Orbital | **GARDÉ** | Élément décoratif / About / Loading |
| I  | Radial Sunburst | **EN RÉSERVE** | Portrait de données / identité visuelle |

---

## Proto A — Halstead Isometric 2×2

- **Fichier** : `proto-A-halstead.html`
- **Moteur** : SVG pur (aucune dépendance JS)
- **Inspiration** : Michael Halstead / Eddie Opara (Pentagram) — marks isométriques massifs
- **Concept** : Grille 2×2, chaque cellule contient un mark isométrique géant (~60% de la surface) sur fond gradient sombre. Chaque mark est une métaphore géométrique d'un axe de recherche.
- **Contenu** :
  - Cellule 1 (rouge) : **États** — cube isométrique fracturé avec fragment détaché et débris
  - Cellule 2 (bleu) : **Entreprises** — réseau hexagonal avec hexagones satellites connectés
  - Cellule 3 (or) : **Système Int.** — chevrons empilés en profondeur avec barres de données
  - Cellule 4 (navy/multi) : **Prospectif** — prisme avec 3 branches divergentes (vert 0.25, or 0.45, rouge 0.30)
- **Interaction** : hover scale(1.01) uniquement
- **Performance** : ultra-légère (SVG statique, ~8KB)
- **Cas d'usage** : section Programmes quand on veut un rendu premium sans animation. Alternative sobre au canvas. Idéal pour impression/export.

---

## Proto B — Graphcore Quadtree ❌

- **Fichier** : `proto-B-graphcore.html`
- **Moteur** : p5.js Canvas
- **Inspiration** : Graphcore (processeur AI) — patterns de subdivision weighted
- **Concept** : Subdivision récursive quadtree avec placement de formes géométriques (rectangles, losanges, triangles, cercles). 4 zones colorées. 3 modes (quadtree, isogrid, scattered).
- **Raison du rejet** : shapes trop denses, superpositions illisibles, manque de structure claire
- **Leçon** : la subdivision aléatoire sans contrainte de lisibilité produit du bruit visuel

---

## Proto C — Particle Flow Field

- **Fichier** : `proto-C-particles.html`
- **Moteur** : p5.js Canvas (Perlin noise)
- **Inspiration** : Art génératif / flow fields
- **Concept** : 600 particules suivent un champ vectoriel basé sur Perlin noise avec biais horizontal. Les particules laissent des traces semi-transparentes. Couleur déterminée par la position Y avec interpolation douce entre zones.
- **Contenu** :
  - 5 palettes switchables : Scénarios (vert/or/rouge), Océan, Alerte, Monochrome, Institutionnel
  - Particules respawnent depuis le bord gauche
  - Attraction par lanes horizontales (trajectoires scénarios)
- **Interaction** :
  - Souris = attracteur/repousseur dans rayon 150px
  - Clic = burst de 30 particules
  - Bouton palette switch
- **Performance** : ~600 particules, 60fps
- **Cas d'usage** : background animé pour section Vigie (scénarios). Le mouvement directionnel gauche→droite évoque la progression temporelle. Les palettes permettent d'adapter le mood.

---

## Proto D — Data Constellation

- **Fichier** : `proto-D-constellation.html`
- **Moteur** : p5.js Canvas
- **Inspiration** : Giorgia Lupi (information design) / network graphs
- **Concept** : ~88 nœuds répartis en 4 clusters orbitaux (22/cluster), chacun gravitant autour d'un point d'ancrage. Les nœuds proches sont connectés par des lignes dont l'opacité dépend de la distance. L'ensemble orbite lentement autour d'un centre gravitationnel commun.
- **Contenu** :
  - Cluster rouge (haut-gauche) : États
  - Cluster bleu (haut-droite) : Entreprises
  - Cluster or (bas-gauche) : Système Int.
  - Cluster blanc (bas-droite) : Prospectif
  - Connexions inter-nœuds avec blend de couleurs
  - Indicateurs de zone pulsants (cercles aux ancres)
  - Glow central qui respire
- **Interaction** :
  - Souris = effet "lentille" — attire les nœuds proches (200px)
  - Clic = onde de choc qui repousse les nœuds
  - Boutons densité +/- (±20 nœuds)
- **Performance** : ~88 nœuds + connexions, 60fps
- **Cas d'usage** : section Programmes comme visualisation réseau. Montre les interconnexions entre axes de recherche. La constellation vivante évoque un écosystème intellectuel. Bon pour hero ou section "about my research".

---

## Proto E — CSS Pure Geometric Identity

- **Fichier** : `proto-E-cssonly.html`
- **Moteur** : CSS pur (@keyframes, clip-path, transforms) — **zéro JavaScript**
- **Inspiration** : Pentagram identity systems — geometric branding
- **Concept** : Grille 2×2 identique à Proto A mais chaque mark est animé uniquement en CSS. Boucles infinies, mouvements subtils.
- **Contenu** :
  - Cellule 1 (rouge) : cube isométrique en rotation continue (20s), fragment avec delay pour effet "shatter", 3 débris dérivants
  - Cellule 2 (bleu) : hexagone central pulsant (scale 1.0→1.05, 3s), 4 satellites en orbite à vitesses différentes, lignes de connexion
  - Cellule 3 (or) : 3 chevrons glissant séquentiellement vers la droite (staggered, 6s), 3 barres de données qui grandissent cycliquement
  - Cellule 4 (navy/multi) : losange central, 3 lignes divergentes (vert/or/rouge) qui s'étendent/rétractent (8s), losanges terminaux, labels de probabilité qui fade in/out
- **Interaction** : hover scale(1.01)
- **Performance** : ultra-légère (~15KB, pas de JS à parser)
- **Avantage clé** : fonctionne même si JS est bloqué/désactivé. Pas de dépendance CDN. Chargement instantané.
- **Cas d'usage** : section Programmes quand on veut animation + zéro dépendance. Fallback parfait si p5.js pose problème. Le plus compatible (ancien navigateurs, mobile, faible bande passante).

---

## Proto F — Topographic Contours

- **Fichier** : `proto-F-topographic.html`
- **Moteur** : p5.js Canvas (marching squares algorithm)
- **Inspiration** : Cartes topographiques militaires / Pentagram data-dense identities
- **Concept** : Un champ de hauteur 2D (Perlin noise 3D + 4 pics gaussiens) est rendu en courbes de niveau via marching squares. 10 niveaux d'élévation. Les contours respirent car le noise évolue dans le temps (z-offset).
- **Contenu** :
  - 4 pics gaussiens aux positions des axes de recherche
  - Couleurs par zone : rouge (États), bleu (Entreprises), or (Système Int.), blanc (Prospectif)
  - Opacité croissante avec l'altitude (0.12 → 0.7)
  - Lignes plus épaisses tous les 3 niveaux
  - Légende d'élévation en haut à droite (9% → 91%)
  - Croix aux centres des pics
- **Interaction** :
  - Souris = pic gaussien supplémentaire (avec lerp smoothing)
  - Boutons relief +/- (multiplicateur de 0.3 à 2.5)
- **Performance** : grid step 9px, ~60fps
- **Cas d'usage** : section Research ou hero. La métaphore topographique est puissante pour un chercheur — "cartographier le relief intellectuel". Les pics = les masses de travail accumulé. Évoque la rigueur scientifique (carte militaire) + la complexité (terrain déformé). Potentiellement le plus "think tank" de tous les protos.

---

## Proto G — Lupi Dendrites ❌

- **Fichier** : `proto-G-dendrites.html`
- **Moteur** : p5.js Canvas (bezier curves + Perlin noise)
- **Inspiration** : Giorgia Lupi / RAND Art+Data — "Imaging Mental Health in America"
- **Concept** : 4 points focaux émettant 12-18 courbes bezier organiques (dendrites). Les courbes ondulent via Perlin noise. Labels de données éparpillés autour des foyers.
- **Raison du rejet** : le résultat ne capture pas la densité et la précision du style Lupi. Les courbes sont trop éparses et manquent de la richesse visuelle de l'original. Nécessiterait probablement des centaines de courbes très fines et un travail plus fin sur les épaisseurs/opacités.
- **Leçon** : le style Lupi demande une densité extrême (100+ courbes par focal) et un contrôle fin des épaisseurs. Les 12-18 tendrils par point sont insuffisants.

---

## Proto H — Data Rings Orbital

- **Fichier** : `proto-H-datarings.html`
- **Moteur** : p5.js Canvas
- **Inspiration** : Giorgia Lupi — concentric data encoding / astronomical instruments
- **Concept** : 10 anneaux concentriques (rayon 60→220px), chacun composé de marques géométriques différentes (dots, ticks, dashes, diamonds, mixed). Rotation différentielle : anneaux internes rapides, externes lents, alternance horaire/anti-horaire.
- **Contenu** :
  - 5 types de marques par anneau (dots → ticks → dashes → diamonds → mixed)
  - 4 quadrants colorés avec transitions douces de 15°
  - Losange central (15px) avec glow pulsant
  - 4-6 lignes de connexion inter-anneaux
  - Labels aux 4 quadrants (JetBrains Mono)
  - Pulse de respiration toutes les 5s
- **Interaction** :
  - Distance souris au centre module la vitesse de rotation
  - Hover sur un quadrant = brightening
  - Clic = expansion momentanée du quadrant (15px outward)
  - Boutons vitesse +/-
- **Performance** : léger (~200 marks), 60fps
- **Cas d'usage** : élément d'identité visuelle / about page / loading state. L'orrery intellectuel. Pourrait servir de médaillon dans un header ou une page "research programme". Le rendu astronomique/scientifique est très institutionnel.

---

## Proto I — Radial Data Portrait (Sunburst)

- **Fichier** : `proto-I-sunburst.html`
- **Moteur** : p5.js Canvas
- **Inspiration** : Giorgia Lupi — radial compositions / data art
- **Concept** : 60 rayons partent d'un centre décalé (45%, 50%). Chaque rayon est composé de marques géométriques variées selon la distance au centre. 4 lobes asymétriques créent une silhouette organique.
- **Contenu** :
  - 4 types de marques par distance : dots (0-60px), ticks (60-120px), diamonds (120-180px), circles vides (180-240px)
  - Couleurs interpolées par quadrant (rouge → bleu → or → argent)
  - Lobes gaussiens aux 4 directions cardinales
  - Guides concentriques et axes radiaux très subtils
  - Labels aux 4 quadrants
- **Interaction** :
  - Souris = directional bloom (rayons proches s'allongent)
  - Hover quadrant = marks scale 1.5x + brighten
  - Clic = pulse wave du centre
  - Auto-pulse toutes les 8s
  - Particules aux extrémités des rayons
- **Performance** : 60 rayons × ~15 marks, 60fps
- **Cas d'usage** : en réserve. Portrait de données du programme de recherche — chaque rayon = un sujet, chaque marque = un indicateur. Potentiellement utilisable comme favicon dynamique, illustration de couverture, ou élément de branding.

---

## Moteurs maîtrisés

| Moteur | Protos | Avantages | Limites |
|--------|--------|-----------|---------|
| **SVG pur** | A | Ultra-léger, imprimable, accessible | Pas d'animation complexe |
| **CSS @keyframes** | E | Zéro JS, chargement instant, compatible partout | Animations limitées (pas de physique) |
| **p5.js Canvas** | C, D, F, H, I | Génératif, interactif, Perlin noise, mouse | Dépendance CDN (~300KB), pas imprimable |
| **p5.js Bezier** | G (rejeté) | Courbes organiques | Densité insuffisante sans optimisation |

## Techniques disponibles

| Technique | Proto(s) | Descripteur |
|-----------|----------|-------------|
| Isometric 3D (SVG/CSS) | A, E | Cubes, hexagones, losanges en perspective axonométrique |
| Flow field / particules | C | Perlin noise → champ vectoriel → particules traçantes |
| Network / constellation | D | Nœuds orbitaux + connexions distance-based |
| Marching squares | F | Extraction de contours d'un champ scalaire 2D |
| Concentric rings | H | Anneaux de marques géométriques en rotation différentielle |
| Radial data encoding | I | Rayons composés de marques variées, silhouette asymétrique |
| CSS-only animation | E | @keyframes, clip-path, transforms sans JS |

---

*Dernière mise à jour : 28 mars 2026*
*9 prototypes, 7 gardés, 2 rejetés (B, G)*
