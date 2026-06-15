# Covers C26 — procédure de publication (habitude)

Système de pages de garde par **identité thématique** (C26), décliné en **cover paysage 1200×675**
pour les cartes, le hero « À la une » et l'og:image. À utiliser pour **tout article Tier-1 ou pièce
de dossier** (rapport phare, note de cadrage de sommet, dossier thématique). Les notes courantes
peuvent rester sur les SVG catégoriels (`static/thumbnails/categories/`).

> **Pourquoi** : les rasters auto/DALL-E « dénaturent » le site (correction Eric, 15/06/2026). La
> cover C26 est l'identité maison institutionnelle. Source historique : `C26_source.html` +
> `DESIGN_COVER_BASELINE_C26.md` (run Cabinet Editorial 20260528).

## Palette par thème (doctrine C26)

| thème (`theme`) | identité | couleur | usage |
|---|---|---|---|
| `geopol` | Géopolitique & Commerce | violet `#3A1B5C` | G7, sanctions, commerce, sécurité éco, géopolitique |
| `economie` | Économie & Finance | bleu `#003D5C` | finance du développement, dette, SMI, dollar, APD |
| `strategie` | Stratégie | noir `#0E0E10` | systémique transversal, prospective, scénarios |
| `climat` | Climat & Transitions | teal `#00524E` | énergie, CBAM, transition |

## Procédure (4 étapes)

1. **Ajouter l'entrée** dans `covers.json` :
   ```json
   { "slug": "notes-mon-article", "theme": "geopol",
     "eyebrow": "Dossier X · sous-titre", "title": "Titre de l'article",
     "meta": "Note<span class=\"sep\">·</span>contexte<span class=\"sep\">·</span>date",
     "tagline": "Collection · Mois 2026", "titlesize": 56 }
   ```
   `slug` = `<section>-<nom-de-fichier>` (ex. `notes-…`, `reports-…`). `titlesize` : 56 par défaut,
   ↑ (64-66) pour les titres courts, ↓ (52-54) pour les très longs.

2. **Générer** (rendu headless Chrome → `static/thumbnails/policy/covers/<slug>.png`) :
   ```bash
   python3 editorial/covers/generate_c26_cover.py            # toutes les entrées
   python3 editorial/covers/generate_c26_cover.py <slug>     # une seule
   ```

3. **Câbler** dans le front-matter de l'article :
   ```yaml
   cover_image: /thumbnails/policy/covers/<slug>.png
   thumbnail:
     resolved_path: /thumbnails/policy/covers/<slug>.png
   ```
   `cover_image` → hero « À la une » /policy/ + bandeau home ; `thumbnail.resolved_path` → cartes.

4. **Déployer** : `bash scripts/sync_and_deploy.sh` (ou le déploiement manuel gh-pages pour un
   changement template-only — cf. AGENTS.md, `public/` est gitignoré).

## Garde-fous

- La cover est un **objet conçu pour être vu entier** : tout conteneur qui l'affiche doit être en
  **16:9 + `background-size: contain`** (jamais `cover`, qui rogne wordmark/tag/footer).
- **Valider 1 sample avant un rollout** de plusieurs covers (préférence design d'Eric prime).
- Ne jamais committer la cover dans un état rogné ; vérifier le rendu (carte + hero) avant `done`.
