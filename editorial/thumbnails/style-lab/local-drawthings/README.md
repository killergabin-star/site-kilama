# Local Draw Things Thumbnail Lab

This folder runs open-source/local image generation for the Policy thumbnail bank without touching the live site.

## Engine

- Binary: `/Volumes/T7 sharing/local-ai/bin/draw-things-cli`
- Models: `/Volumes/T7 sharing/local-ai/draw-things-models`
- Default model: `flux_2_klein_4b_i8x.ckpt`
- Outputs: `outputs/`

## Commands

Dry run:

```bash
node run-drawthings.mjs --dry-run --limit 4
```

Generate first four pilots:

```bash
node run-drawthings.mjs --limit 4
```

Generate all pilot briefs:

```bash
node run-drawthings.mjs
```

Use a lighter model if FLUX.2 is too slow:

```bash
node run-drawthings.mjs --model sd_xl_turbo_q6p_q8p.ckpt --steps 8
```
