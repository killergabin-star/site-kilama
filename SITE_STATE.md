# SITE STATE — erickilama.com
**Derniere MAJ** : 28 mars 2026

---

## Status global : DESIGN EN COURS

Le projet site a deux chantiers actifs en parallele :
1. **Prototypes visuels** (moteurs de rendu) — 19 explores, 8 gardes
2. **Clone-design pipeline** (pages du site) — 5 pages produites, design system valide

---

## 1. Prototypes visuels (moteurs de rendu)

19 prototypes explores. 8 gardes, 1 en reserve, 10 rejetes.
Tous dans `static/proto-*.html`, documentes dans `static/PROTO_INDEX.md`.

### Gardes
| ID | Nom | Moteur | Fichier |
|----|-----|--------|---------|
| A | Halstead Isometric | SVG pur | proto-A-halstead.html |
| C | Particle Flow Field | p5.js Canvas | proto-C-particles.html |
| D | Data Constellation | p5.js Canvas | proto-D-constellation.html |
| E | CSS Pure Geometry | CSS @keyframes | proto-E-cssonly.html |
| F | Topographic Contours | p5.js marching squares | proto-F-topographic.html |
| H | Data Rings Orbital | p5.js Canvas | proto-H-datarings.html |
| I | Radial Sunburst | p5.js Canvas | proto-I-sunburst.html (RESERVE) |
| O | Fiber Field | curl noise Canvas 2D | proto-O-fibers.html |

### Rejetes (B, G, J, K, L, M, N, P, Q, R)
Pas de rendu suffisamment innovant ou mal execute.

### Direction future
Sortir des primitives Canvas/p5.js. Chercher des moteurs next-gen (WebGL shaders custom, Three.js, GPGPU, approches non identifiees). Le user veut "encore plus moderne".

---

## 2. Clone-design pipeline

### Infrastructure validee
- **Design Cloning Engine** v1.0 : `.claude/design-cloning-engine.md`
- **Design Procedure** v3 : `.claude/design-procedure.md`
- **Design Tools Research** : `.claude/design-tools-research.md` (20+ outils, top 3 MCP identifies)
- **Design Audit Lab** : `DESIGN_AUDIT_LAB.md` (diagnostic CSS complet, 4 experts)
- **Brand Guidelines** : `brand-guidelines.md`
- **BackstopJS** : `backstop/` (24 screenshots reference, regression testing)

### MCP Tools identifies (a installer)
- **design-copier** (chipsxp) — extraction CSS → Tailwind/React
- **Firecrawl** — crawl batch multi-sites
- **mcp-copy-web-ui** — capture page complete HTML+CSS inline

### Clones de reference
4 extractions completes dans `clones-design/` :
- Economist, GTA, McKinsey, Mazzucato
- Chaque clone : HTML adapte + extraction MD des patterns

### Pages du site produites
5 pages dans `clones-design/site_*.html` :
- **homepage** : site_homepage_kilama.html
- **about** : site_about_kilama.html
- **policy** : site_policy_kilama.html
- **research** : site_research_kilama.html
- **vigie** : site_vigie_kilama.html

### Prototypes data
- dashboard_bloomberg_kilama.html — Dashboard Bloomberg-style
- data_presentation_kilama.html — Presentation de donnees
- interactive_charts_kilama.html — Charts interactifs

### Prototypes v3 (avant clone-design)
- `prototype-v3/` : bold.html, fusion.html, index.html, react.html
- `prototype-piie-clone/index.html`
- `static/v3-fusion.html`, `static/v3-bold.html`, etc.

---

## 3. Design System valide

### Palette (STRICTE)
| Role | Hex | Nom |
|------|-----|-----|
| Primaire | #1B2A4A | Navy profond |
| Secondaire | #2C5F8A | Bleu FPSQ |
| Accent alerte | #C0392B | Rouge analytique |
| Accent premium | #D4A017 | Or CAPS |
| Fond | #F8F7F4 | Ivoire |
| Fond alterne | #F0EDE8 | Ivoire profond |
| Texte | #2D2D2D | Anthracite |

### Typographie (STRICTE)
- Titres : Inter 700
- Corps : Source Serif 4, 400, 16px/1.6
- Citations : Playfair Display 700 italic
- Donnees : JetBrains Mono 400

### Registre
Institutionnel (Bruegel/PIIE), PAS consultant corporate. Fond ivoire, pas sombre.

---

## 4. CLAUDE.md du projet

Mis a jour avec le design system complet, les references structurelles, le positionnement editorial, le workflow de previsualisation. Voir `/Users/killergabin/Documents/Application files/site-kilama/CLAUDE.md`.

---

## 5. Prochaines etapes

1. **Equipe com** — travail a venir avec Eric + equipe communication
2. **Prototypes next-gen** — chercher des moteurs visuels plus modernes
3. **Integration Hugo** — aligner CSS custom sur le design system v3, nettoyer artefacts Mazzucato/McKinsey
4. **Pages finales** — valider les 5 pages site avec equipe com, iterer
5. **MCP tools** — installer design-copier + Firecrawl pour automatiser le pipeline
6. **Permissions macOS** — restart Claude Desktop pour finaliser autorisations systeme

---

## Arborescence cle

```
site-kilama/
  CLAUDE.md                    # Instructions projet (design system, workflow)
  SITE_STATE.md                # CE FICHIER
  DESIGN_AUDIT_LAB.md          # Audit design 4 experts
  brand-guidelines.md          # Brand identity
  .claude/
    design-cloning-engine.md   # Pipeline spec v1.0
    design-procedure.md        # Procedure design v3
    design-tools-research.md   # Recherche outils (20+)
    gap-analysis-dembrandt.md  # Analyse gap Dembrandt
  clones-design/               # 17 fichiers : clones + pages site + data viz
  prototype-v3/                # Prototypes v3 (bold, fusion, react)
  prototype-piie-clone/        # Clone PIIE
  backstop/                    # Visual regression testing
  static/proto-*.html          # 19 prototypes moteurs visuels
  static/PROTO_INDEX.md        # Index + verdicts prototypes
  static/avatar.png            # Photo Eric (source)
```
