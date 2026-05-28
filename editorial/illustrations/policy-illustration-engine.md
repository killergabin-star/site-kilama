# Policy illustration engine

## Purpose

The current thumbnail system guarantees coverage. The illustration engine adds
editorial adequacy.

The target pipeline is:

```text
article markdown
  -> semantic brief
  -> visual brief
  -> generated candidates
  -> adequacy scoring
  -> curated promotion
  -> thumbnail resolver
```

Only the final promoted asset is exposed to Hugo through
`data/policy_thumbnails.json`.

## Why this layer exists

A theme-level mapping is too coarse. Two articles can both be tagged
`polycrisis` while needing completely different images:

- a G7 coordination piece needs a roundtable or institutional grid;
- an Ormuz shock piece needs a chokepoint-to-food-security transmission;
- a Spring Meetings macro piece may need a data/chart visual;
- a Trump/Babylon piece can use mythological imperial architecture.

The engine therefore targets the claim frame, not just the category.

## Files

```text
editorial/illustrations/
├── reference-visual-grammar.md
├── policy-illustration-engine.md
├── visual-motif-library.json
└── generate-policy-visual-briefs.mjs
```

Generated files:

```text
data/policy_visual_briefs.json
editorial/illustrations/policy-visual-briefs.review.md
```

## Visual brief schema

Each article receives:

- `title`
- `permalink`
- `semantic_family`
- `claim_frame`
- `visual_mode`
- `style_register`
- `visual_brief`
- `generation_prompt`
- `negative_prompt`
- `current_thumbnail`
- `review_flags`

The generated prompt is not the final image. It is a disciplined first draft for
an image-generation tool.

## Promotion rule

An image can become live only if the review record answers:

- What is the article-specific mechanism?
- What is the chosen metaphor?
- Why does this image fit better than the category fallback?
- Does it avoid literal text, flags, logos and generic AI gloss?
- Does it still read in the Policy card rectangle?

## Relationship to existing thumbnails

The current resolver remains the publication layer:

1. curated article-specific asset;
2. chart thumbnail;
3. category fallback.

The illustration engine feeds step 1. It does not replace the resolver.

## Next integration point

The next robust step is a candidate-generation command:

```bash
node editorial/illustrations/generate-policy-visual-briefs.mjs
node editorial/illustrations/generate-image-candidates.mjs --slug notes-ormuz-choc-petrolier-xxi
node editorial/illustrations/score-image-candidates.mjs --slug notes-ormuz-choc-petrolier-xxi
```

The candidate and scoring commands should be added only after the brief layer has
been reviewed on 10 to 15 articles. Otherwise we automate weak thinking.
