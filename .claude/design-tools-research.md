# Design Tools Research — Synthèse croisée
> Sources : 5 rapports Perplexity (Eric) + 3 agents recherche concurrente (Claude)
> Date : 27 mars 2026
> Status : Tous agents COMPLETE — Prototype score 85/100 ✅

## 0. TOP DISCOVERIES — MCP Servers installables immédiatement

### design-copier (chipsxp) ⭐⭐⭐
- **GitHub** : github.com/chipsxp/design-copier
- **3 outils** : `designcopier_snapshot` (capture styles+HTML), `designcopier_extract` (CSS→Tailwind/React), `designcopier_apply` (applique styles à un framework)
- **Install** : Clone repo → npm install → npm run prepare → config MCP stdio
- **Verdict** : EXACTEMENT notre besoin Phase 1+5 du pipeline

### Firecrawl MCP (officiel) ⭐⭐⭐
- **Install** : `claude mcp add firecrawl --url https://mcp.firecrawl.dev/API-KEY/v2/mcp`
- **Free tier** : 500 crédits à firecrawl.dev/app/api-keys
- **Verdict** : Moteur de crawl pour extraction batch multi-sites

### mcp-copy-web-ui ⭐⭐⭐
- **GitHub** : github.com/maoxiaoke/mcp-copy-web-ui
- **Install** : `npx -y @maoxiaoke/maoxiaoke-web-ui-copy-copy-web-ui`
- **Ce qu'il fait** : Page complète avec CSS inline + images Base64 → 1 fichier HTML autosuffisant
- **Verdict** : Parfait pour capturer une page de référence à analyser offline

### Skills communautaires de clonage
- **Perfect-Web-Clone** (ericshang98) : 40+ outils, architecture multi-agents, le plus ambitieux
- **JCodesMore skill** : Chrome MCP + agents parallèles en worktrees Git
- **MCPMarket** : Firecrawl + Next.js + Shadcn

---

## 1. Cartographie des outils par catégorie

### A. Extraction de Design Tokens (PHASE 1 du pipeline)

| Outil | Type | Sortie | Installation | Score utilité |
|-------|------|--------|-------------|--------------|
| **Dembrandt** | CLI open-source | JSON design tokens (palette, typo, spacing) | `npm install -g dembrandt` | ⭐⭐⭐ |
| **ExtractCSS.dev** | Extension Chrome MANUELLE | CSS → Tailwind par élément | Chrome extension | ⭐ (pas automatable) |
| **DivMagic** | Extension Chrome | CSS computed per element | Chrome extension | ⭐⭐ (manuel) |
| **Chrome DevTools getComputedStyle** | Intégré Chrome MCP | CSS computed values | Déjà disponible | ⭐⭐⭐ |
| **Design Token Extractor** | Extension Chrome | Design tokens JSON | Chrome extension | ⭐⭐ |

| **Project Wallace** | CLI npm | W3C Design Tokens JSON | `npm install -g wallace-cli` | ⭐⭐ |
| **DesignKit** | App (uses Dembrandt) | `tailwind.preset.js` + styleguide | Clone + npm install | ⭐⭐ |
| **css-to-tailwindcss** | npm package | CSS → Tailwind classes | `npm install -g css-to-tailwindcss` | ⭐⭐ |

**Verdict RÉVISÉ** : Dembrandt est le champion CLI (`--json-only` pipeable). Chrome MCP + getComputedStyle reste notre base déjà opérationnelle. ExtractCSS.dev = manuel uniquement → écarté. DesignKit sort un tailwind.preset.js directement (bonus).

### B. Clonage de structure (PHASE 1 alt)

| Outil | Type | Sortie | Score |
|-------|------|--------|-------|
| **goClone** | CLI Go | Mirror HTML/CSS/JS complet | ⭐⭐ (wget++) |
| **screenshot-to-code** (abi) | Python + GPT Vision | HTML/Tailwind from screenshot | ⭐⭐⭐ |
| **Firecrawl** | API + MCP | HTML structure + markdown | ⭐⭐⭐ |
| **Open Lovable v2** | Full-stack orchestrateur | React/Next.js app | ⭐⭐ (overkill) |

**Verdict** : screenshot-to-code le plus aligné avec notre stack. Firecrawl MCP intéressant si disponible. goClone = juste wget moderne.

### C. MCP Servers pertinents

| MCP | Source | Capacité | Installé ? |
|-----|--------|----------|-----------|
| **Chrome MCP** | Claude in Chrome | Navigate, JS exec, screenshot, read_page | ✅ Oui |
| **Claude Preview** | Claude Code natif | preview_start, screenshot, eval, inspect | ✅ Oui |
| **Firecrawl MCP** | npm @anthropic/firecrawl-mcp | Crawl + extract markdown/HTML | ❌ À installer |
| **Banani AI MCP** | banani.ai | Aspiration + export MCP | ❌ À évaluer |

### D. Orchestration / Style Transfer

| Outil | Type | Ce qu'il fait | Score |
|-------|------|--------------|-------|
| **JCodesMore skill** | Skill Claude Code | Clone any website via Chrome MCP + agents | ⭐⭐⭐ |
| **Exidesign** | Prototype académique | Style transfer web (contenu A + style B) | ⭐⭐ (concept) |
| **Google Stitch** | Fermé Google | Redesign agent par image | ⭐ (pas intégrable) |
| **V0.dev** | Vercel SaaS | UI generation from prompts/screenshots | ⭐⭐ (ref seulement) |

---

## 2. Diagnostic Hugo Blox (extrait des docs Perplexity)

Les 2 documents sur Hugo convergent sur le même diagnostic :

**Problème identifié** : ce n'est PAS Hugo le problème, c'est Hugo Blox (Academic)
- Architecture ultra-rigide (blocks figés)
- CSS monolithique avec 80+ `!important`
- Look "Bootstrap/Admin Panel" par défaut
- Claude se bat contre le thème au lieu de designer librement

**Solution retenue** (déjà en cours) :
1. Prototyper en HTML/Tailwind pur (`v3-prototype.html`) ← C'EST CE QU'ON FAIT
2. Valider le design visuellement
3. Intégrer ensuite comme thème Hugo custom (pas Academic)

**Validation** : l'approche prototype-first est confirmée comme la bonne stratégie par les 2 analyses Perplexity.

---

## 3. Architecture du Skill cible — "/clone-design" v2

### Inputs
```
/clone-design <urls_reference> --section <hero|featured|nav|...> --target <notre_section>
```

### Pipeline en 6 phases

```
1. EXTRACT    — Chrome MCP + getComputedStyle (+ Dembrandt si installé)
   → Design tokens JSON par section

2. MAP        — Associer sections référence ↔ sections prototype
   → Matrice de correspondance (reference-extraction-matrix.md)

3. SCORE      — Calculer distance visuelle par propriété
   → Score 0-100 pondéré (structure 3x, typo 3x, couleur 2x, densité 2x, détails 1x)

4. FILTER     — Appliquer les contraintes design system
   → Rejeter couleurs/fonts hors spec, garder structure/spacing/density

5. GENERATE   — Produire corrections CSS ciblées
   → Patches CSS respectant la palette/typo v3

6. VERIFY     — Screenshot → re-score → itérer
   → Boucle convergence jusqu'à score ≥ 85
```

### Ce qui différencie notre outil de l'existant

| Capacité | Outils existants | Notre skill |
|----------|-----------------|-------------|
| Extraction tokens | ✅ Dembrandt, ExtractCSS | ✅ Chrome MCP + JS |
| Clone 1 site | ✅ screenshot-to-code, goClone | ✅ |
| **Fusion multi-sites** | ❌ Aucun | ✅ Matrice de convergence |
| **Respect design system** | ❌ (clone brut) | ✅ Filtre palette/typo v3 |
| **Scoring automatique** | ❌ | ✅ Distance visuelle pondérée |
| **Boucle convergence** | ❌ | ✅ Itération jusqu'à seuil |

---

## 4. Découvertes Agent 3 — Recherche académique et scoring

### Scoring automatique (PRIORITÉ pour le pipeline)

| Outil | Type | Ce qu'il fait | Score utilité |
|-------|------|--------------|---------------|
| **BackstopJS** | MIT, mature | Visual regression cross-domaines. Compare notre site vs PIIE/Bruegel, score pixel-diff | ⭐⭐⭐ |
| **Webthetics** | Académique (IJHCS 2019) | DNN scoring esthétique de pages web. Pearson 0.85 vs humains | ⭐⭐ (concept) |
| **AgenticDRS** | arXiv 2025 | Multi-agent design review. Static agents (typo/couleurs) + dynamic agents (registre) | ⭐⭐ (concept) |
| **page-compare** | GitHub | Similarité structurelle 0-100 entre pages. Heuristique simple | ⭐⭐ |
| **ui-diff-tool** | GitHub | Pixel comparison + génération de prompts de correction AI-readable | ⭐⭐⭐ |

### Style transfer académique
- **Exidesign** : Prototype de transfert de style web (contenu A + style B). Cost features visuels/sémantiques/relationnels — concept exactement aligné avec notre pipeline
- **Neural Style Transfer** : Domaine image, pas web directement. Concept de "pluggable style representations" intéressant

### Hugo templates de référence
- **Pascal Michaillat** (MIT) : Template Hugo minimaliste pour économistes. Site pascal.michaillat.org. Structure clean, bon point de départ pour conversion Hugo
- **Blowfish** : Hugo theme moderne avec Tailwind intégré
- **DSFR** (France) : Design system du gouvernement français. Registre institutionnel pertinent

---

## 5. Recommandations opérationnelles

### ✅ Fait (sessions 27 mars)
1. ✅ Itérations prototype HTML : **score 78 → 85** (objectif atteint)
2. ✅ Chrome MCP pour extraction CSS des 6 références
3. ✅ Synthèse croisée Perplexity + 3 agents de recherche

### Court terme (cette semaine)
4. [ ] Évaluer installation Dembrandt : `npm install -g dembrandt`
5. [ ] Évaluer Firecrawl MCP : chercher le package npm
6. [ ] Étudier le skill JCodesMore pour l'architecture multi-agents
7. [ ] Tester BackstopJS cross-domain (notre site vs PIIE)

### Moyen terme (après MCF)
8. [ ] Packager le skill `/clone-design` complet
9. [ ] Convertir prototype validé en thème Hugo custom (pas Academic)
10. [ ] Implémenter scoring automatique (BackstopJS + ui-diff-tool)
11. [ ] Template Hugo basé sur Pascal Michaillat + notre design system v3

---

## 6. Ce qu'on NE fait PAS

- **goClone** : juste un wget++, on a déjà mieux via Chrome MCP read_page
- **Open Lovable** : full-stack React, hors scope (on fait du HTML statique)
- **Google Stitch** : fermé, pas intégrable
- **Framer/Webflow** : sortent de notre stack Claude Code + Hugo
- **screenshot-to-code** : redondant — on fait déjà mieux en combinant Chrome MCP + Claude + Preview
- **Webthetics/AgenticDRS** : concepts intéressants mais pas installables. On garde BackstopJS + ui-diff-tool
