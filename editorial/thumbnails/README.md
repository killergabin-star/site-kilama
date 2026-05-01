# Policy thumbnails

This folder contains the source assets and mapping rules for Policy publication thumbnails.

## Cascade

Each Policy item should resolve to one thumbnail through this order:

1. `custom`: a hand-designed SVG for a flagship article.
2. `chart`: a compact 16:9 SVG generated from the article's main chart brief.
3. `category`: a reusable category SVG selected from `category-mapping.json`.

If no category matches, the resolver should use `categories/_fallback.svg`.

## Structure

```text
editorial/thumbnails/
├── categories/             # reusable category SVGs
├── custom/                 # article-specific flagship SVGs
├── category-mapping.json   # theme/tag -> category slug
└── README.md
```

## Category assets

The category SVGs are 400 x 225 and use the Policy dark editorial register. Their filenames are stable category slugs:

```text
polycrisis.svg
geoeconomie.svg
architecture-financiere.svg
developpement.svg
energie.svg
defense.svg
commerce-sanctions.svg
iran-moyen-orient.svg
afrique-pma.svg
g7-multilateral.svg
_fallback.svg
```

## Mapping doctrine

`category-mapping.json` maps current Policy `theme` values first, then selected tags as a safety net. The future resolver should normalize values before lookup:

- lowercase
- trim whitespace
- preserve accented French labels where possible
- optionally test an accent-stripped alias when no exact match exists

For current content, `theme` is the most reliable field. Tags are numerous and sometimes very specific, so the mapping intentionally prioritizes semantic families rather than one-off labels.

## Adding a new category

1. Add a 400 x 225 SVG to `categories/`.
2. Add a category slug to `category-mapping.json`.
3. Map the relevant `theme` or tags to that slug.
4. Rebuild thumbnails once the resolver and build script are installed.

## Promoting an article to custom

1. Add the SVG to `custom/`.
2. Set the article frontmatter to point to that custom asset once the resolver is installed.
3. Keep the custom SVG source stable so the thumbnail remains reproducible.

Expected frontmatter shape:

```yaml
thumbnail:
  strategy: custom
  style: policy-dark
  custom_path: editorial/thumbnails/custom/article-slug.svg
```

For chart-based thumbnails, the expected shape will be:

```yaml
thumbnail:
  strategy: chart
  chart_brief: charts/main.json
```

`style` is optional for the resolver, but required for editorial review. Current
values are:

- `policy-dark`: macro-risk, geopolitics, energy, sanctions, defence, G7.
- `economist-light`: explanatory, pedagogical, social, development finance.
