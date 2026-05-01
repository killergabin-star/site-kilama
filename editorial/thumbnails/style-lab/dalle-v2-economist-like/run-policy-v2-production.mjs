#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const defaultCli = "/Volumes/T7 sharing/local-ai/bin/draw-things-cli";
const defaultModelsDir = "/Volumes/T7 sharing/local-ai/draw-things-models";
const defaultQueue = join(here, "production-v2/policy-v2-production-queue.json");
const defaultOutDir = join(here, "production-v2/raw");

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
const queuePath = args.get("--queue") || defaultQueue;
const outDir = args.get("--out-dir") || defaultOutDir;
const templateDir = args.get("--template-dir") || join(here, "web-800");
const model = args.get("--model") || process.env.DRAWTHINGS_MODEL || "playground_v2.5_q6p_q8p.ckpt";
const width = args.get("--width") || "768";
// Draw Things requires multiples of 64. Post-processing crops back to 16:9.
const height = args.get("--height") || "448";
const steps = args.get("--steps") || "28";
const cfg = args.get("--cfg") || "5";
const offset = Number(args.get("--offset") || "0");
const limit = Number(args.get("--limit") || "0");
const dryRun = args.has("--dry-run");
const skipExisting = args.has("--skip-existing");
const useTemplateReference = args.has("--use-template-reference");
const strength = args.get("--strength") || "0.48";

if (!existsSync(cli)) throw new Error(`Draw Things CLI not found: ${cli}`);
if (!existsSync(queuePath)) throw new Error(`Queue not found: ${queuePath}`);

const queue = JSON.parse(readFileSync(queuePath, "utf8"));
const selected = queue.slice(offset, limit > 0 ? offset + limit : undefined);
mkdirSync(outDir, { recursive: true });

const sharedNegative = [
  "text",
  "letters",
  "numbers",
  "caption",
  "headline",
  "logo",
  "watermark",
  "signature",
  "flag",
  "public figure",
  "photorealism",
  "photo",
  "3d render",
  "glossy startup illustration",
  "corporate stock vector",
  "childish cartoon",
  "kindergarten drawing",
  "naive doodle",
  "random globe",
  "overcrowded",
  "low contrast",
  "blurry",
  "messy anatomy"
].join(", ");

const manifest = {
  created_at: new Date().toISOString(),
  queue: queuePath,
  engine: "draw-things-cli",
  model,
  width: Number(width),
  height: Number(height),
  steps: Number(steps),
  cfg: Number(cfg),
  useTemplateReference,
  strength: useTemplateReference ? Number(strength) : null,
  offset,
  limit: limit || null,
  results: [],
};

for (const item of selected) {
  const output = join(outDir, `${String(item.index).padStart(2, "0")}-${item.slug}.png`);
  manifest.results.push({
    index: item.index,
    slug: item.slug,
    title: item.title,
    style: item.style,
    template: item.template,
    output,
  });

  if (skipExisting && existsSync(output)) {
    console.log(`[skip] ${output}`);
    continue;
  }

  const commandArgs = [
    "generate",
    "--models-dir", modelsDir,
    "--model", model,
    "--prompt", item.prompt,
    "--negative-prompt", sharedNegative,
    "--width", width,
    "--height", height,
    "--steps", steps,
    "--cfg", cfg,
    "--seed", String(920260 + item.index),
    "--output", output,
    "--disable-preview",
  ];

  if (useTemplateReference) {
    const templateImage = join(templateDir, templateImageName(item.template));
    if (!existsSync(templateImage)) {
      throw new Error(`Template reference not found for ${item.template}: ${templateImage}`);
    }
    commandArgs.push("--image", templateImage, "--strength", strength);
  }

  if (dryRun) {
    console.log(`[dry-run] ${output}`);
    continue;
  }

  console.log(`[${item.index}/${queue.length}] ${item.slug}`);
  const result = spawnSync(cli, commandArgs, {
    stdio: "inherit",
    env: { ...process.env, DRAWTHINGS_MODELS_DIR: modelsDir },
  });

  if (result.status !== 0) {
    throw new Error(`Generation failed for ${item.slug} with status ${result.status}`);
  }
}

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(join(outDir, "manifest.json"));

function templateImageName(template) {
  const names = {
    "person-spotlight": "01-person-spotlight.png",
    "balance-bars": "02-balance-bars.png",
    "map-arrows": "03-map-arrows.png",
    "broken-chart": "04-broken-chart.png",
    "coins-cascade": "05-coins-cascade.png",
    "parliament-symbol": "06-parliament-symbol.png",
    "pipeline-valve": "07-pipeline-valve.png",
    "containers-bridge": "08-containers-bridge.png",
    "scale-vs-factories": "09-scale-vs-factories.png",
    "roundtable-flows": "10-roundtable-flows.png",
  };
  return names[template] ?? `${template}.png`;
}
