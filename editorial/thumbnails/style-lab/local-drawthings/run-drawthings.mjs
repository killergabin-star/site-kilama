#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const briefsPath = join(here, "briefs-policy-pilot.json");
const defaultCli = "/Volumes/T7 sharing/local-ai/bin/draw-things-cli";
const defaultModelsDir = "/Volumes/T7 sharing/local-ai/draw-things-models";
const defaultOutDir = "/Users/killergabin/Documents/Application files/site-kilama/editorial/thumbnails/style-lab/local-drawthings/outputs";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key.startsWith("--")) {
    args.set(key, value?.startsWith("--") ? "true" : value ?? "true");
    if (value && !value.startsWith("--")) i += 1;
  }
}

const cli = args.get("--cli") || process.env.DRAWTHINGS_CLI || defaultCli;
const modelsDir = args.get("--models-dir") || process.env.DRAWTHINGS_MODELS_DIR || defaultModelsDir;
const outDir = args.get("--out-dir") || defaultOutDir;
const model = args.get("--model") || process.env.DRAWTHINGS_MODEL || "flux_2_klein_4b_i8x.ckpt";
const width = args.get("--width") || "768";
const height = args.get("--height") || "448";
const steps = args.get("--steps") || "12";
const cfg = args.get("--cfg") || "3.5";
const limit = Number(args.get("--limit") || "0");
const dryRun = args.has("--dry-run");

if (!existsSync(cli)) {
  throw new Error(`Draw Things CLI not found: ${cli}`);
}

const briefs = JSON.parse(readFileSync(briefsPath, "utf8"));
const selected = limit > 0 ? briefs.slice(0, limit) : briefs;
mkdirSync(outDir, { recursive: true });

const sharedNegative = [
  "childish cartoon",
  "kindergarten drawing",
  "naive doodle",
  "crayon",
  "scribble",
  "wobbly lines",
  "messy line art",
  "psychedelic",
  "overcrowded composition",
  "generic AI art",
  "glossy startup illustration",
  "corporate stock vector",
  "readable text",
  "logos",
  "flags",
  "public figures",
  "watermark",
  "blurry",
  "messy anatomy",
  "random globe",
  "meaningless abstract background"
].join(", ");

const manifest = {
  created_at: new Date().toISOString(),
  engine: "draw-things-cli",
  cli,
  model,
  modelsDir,
  width: Number(width),
  height: Number(height),
  steps: Number(steps),
  cfg: Number(cfg),
  results: []
};

for (const [index, brief] of selected.entries()) {
  const output = join(outDir, `${String(index + 1).padStart(2, "0")}-${brief.slug}.png`);
  const prompt = `${brief.prompt}

Style contract: adult press illustration for erickilama.com/policy; visual language close to premium editorial columns and foreign-policy magazine covers; clean vector collage, screen-print discipline, sharp silhouettes, deliberate negative space, smart metaphor, restrained texture, black #101014, warm paper #FFF7E8, policy red #E63846, restrained blue #7CB7E6, small muted yellow and green accents. The image must remain legible as a 16:9 thumbnail.`;

  const commandArgs = [
    "generate",
    "--models-dir",
    modelsDir,
    "--model",
    model,
    "--prompt",
    prompt,
    "--negative-prompt",
    sharedNegative,
    "--width",
    width,
    "--height",
    height,
    "--steps",
    steps,
    "--cfg",
    cfg,
    "--seed",
    String(620260 + index),
    "--output",
    output,
    "--disable-preview"
  ];

  manifest.results.push({
    slug: brief.slug,
    article: brief.article,
    output,
    prompt,
    negative_prompt: sharedNegative,
    command: [cli, ...commandArgs]
  });

  if (dryRun) {
    console.log(`[dry-run] ${output}`);
    continue;
  }

  const result = spawnSync(cli, commandArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      DRAWTHINGS_MODELS_DIR: modelsDir
    }
  });

  if (result.status !== 0) {
    throw new Error(`Draw Things generation failed for ${brief.slug} with status ${result.status}`);
  }
}

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(join(outDir, "manifest.json"));
