# External Benchmark — Policy Thumbnails

This folder is a runnable benchmark for serious editorial thumbnail generation.

It exists because:

- built-in prompt-only image generation drifted toward a generic dark institutional style;
- hand-coded SVGs were controllable but too naive;
- the target is mature editorial drawing with real style references.

## Providers

Supported runners:

- `node run-recraft.mjs --dry-run`
- `node run-ideogram.mjs --dry-run`
- `node run-bfl.mjs --dry-run`
- `node run-openai-cli.mjs --dry-run`

Required keys when running for real:

- `RECRAFT_API_KEY`
- `IDEOGRAM_API_KEY`
- `BFL_API_KEY`
- `OPENAI_API_KEY`

No key is currently required for dry-runs.

## Recommended Sequence

1. Run `node prepare-style-inputs.mjs` to create compressed style-reference inputs from the user-provided captures.
2. Run Recraft first.
3. Run Ideogram second.
4. Run BFL/FLUX Kontext if available.
5. Run OpenAI CLI only as a comparison, one article at a time.

## Output

Generated images are written to:

- `outputs/recraft/`
- `outputs/ideogram/`
- `outputs/bfl/`
- `outputs/openai/`

Each provider also writes a JSON manifest so every candidate remains traceable.
