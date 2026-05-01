# Policy thumbnails visual doctrine

This doctrine turns Policy thumbnails into a reusable editorial system rather
than a collection of decorative images.

## Goal

Every Policy thumbnail should communicate one analytical idea at small size:

- one central metaphor;
- one dominant subject;
- one controlled palette;
- no written labels inside the image.

The reference register is premium current-affairs editorial illustration:
high-contrast, disciplined, concept-first, textured, and readable at
160 x 90 px.

## Register A: policy-dark

Use for macro-financial risk, geopolitics, sanctions, energy security,
polycrisis, defence, debt, G7, multilateral architecture, and institutional
power.

Palette:

- background: anthracite / near-black (`#0E0E10`, `#18181C`);
- main forms: warm off-white (`#F6F4F0`, `#F2EDE6`);
- accent: editorial red (`#E6203A`);
- secondary accent: muted ochre (`#E0A341`) only when needed.

Visual language:

- maps, routes, arrows, broken charts, pressure gauges, pipelines, containers;
- parliaments, tables, scales, bridges, gates, arches;
- engraving-inspired texture, matte surfaces, sharp silhouettes.

## Register B: economist-light

Use for pedagogical, social, institutional, teaching-adjacent, and more
explanatory pieces where a lighter register improves readability.

Palette:

- background: warm ivory (`#FAF8F3`, `#F2EDE6`);
- linework: ink navy / black (`#1A1815`, `#15203C`);
- accent: deep editorial red (`#B81628`);
- secondary accents: muted blue-grey or ochre, never rainbow.

Visual language:

- simple figures, everyday objects, coins, bars, scales, spotlight;
- one symbolic scene rather than a literal data dashboard;
- generous negative space and simple geometry.

## Common rules

- Use exactly one visual idea per thumbnail.
- Prefer a reusable template over a bespoke composition unless the article is
  a flagship.
- Keep the central symbol legible at 160 x 90 px.
- Avoid dense charts unless the chart itself is the analytical object.
- No readable text, numbers, labels, logos, flags, photorealistic portraits,
  public figures, screenshots, or generic AI-gloss imagery.
- The thumbnail may be beautiful, but its first job is analytical recall.

## Content mapping

Default styles:

- `polycrisis`: `policy-dark`
- `geopolitics-economics`: `policy-dark`
- `commerce-sanctions`: `policy-dark`
- `energie`: `policy-dark`
- `defense`: `policy-dark`
- `architecture-financiere`: `policy-dark`
- `g7-multilateral`: `policy-dark`
- `developpement`: mixed, usually `economist-light` unless crisis-heavy
- `afrique-pma`: mixed, usually `policy-dark` for crisis and `economist-light`
  for development finance
- `institutions`: mixed, usually `economist-light` unless strategic crisis

## Frontmatter target

Only selected final assets should be wired into content frontmatter.
Production-lab candidates stay in `editorial/thumbnails/style-lab/`.

```yaml
thumbnail:
  strategy: custom
  style: policy-dark
  custom_path: editorial/thumbnails/custom/article-slug.png
```

Alternative styles:

```yaml
thumbnail:
  strategy: custom
  style: economist-light
  custom_path: editorial/thumbnails/custom/article-slug.png
```

For generated chart thumbnails:

```yaml
thumbnail:
  strategy: chart
  chart_brief: charts/main.json
```
