#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { ensureDir, getArgs, loadBriefs, loadPalette, manifestBase, outRoot, requireKey, styleInputPaths, writeJson } from "./shared.mjs";

const { dryRun } = getArgs();
const apiKey = requireKey("IDEOGRAM_API_KEY", dryRun);
const outDir = join(outRoot, "ideogram");
ensureDir(outDir);

async function generate(brief) {
  const refs = styleInputPaths().slice(0, 3);
  const payload = {
    prompt: `${brief.prompt}\n\nAdult editorial magazine drawing; sophisticated, witty, precise; not childish; not corporate; no text.`,
    aspect_ratio: "16x9",
    style_type: "DESIGN",
    magic_prompt: "OFF",
    color_palette: {
      members: loadPalette().colors.map((color) => ({ color }))
    },
    style_reference_images: refs.map((path) => basename(path))
  };

  if (dryRun) {
    return {
      request: {
        endpoint: "POST https://api.ideogram.ai/v1/ideogram-v3/generate",
        payload,
        note: "Real request is multipart/form-data with style_reference_images files."
      }
    };
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (key === "style_reference_images") continue;
    form.set(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  for (const path of refs) {
    form.append("style_reference_images", new Blob([readFileSync(path)]), basename(path));
  }

  const res = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
    method: "POST",
    headers: { "Api-Key": apiKey },
    body: form
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Ideogram error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

const manifest = manifestBase("ideogram");
manifest.results = [];
for (const brief of loadBriefs()) {
  const result = await generate(brief);
  manifest.results.push({ slug: brief.slug, result });
  const url = result.data?.[0]?.url || result.images?.[0]?.url || result.url;
  if (url && !dryRun) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download Ideogram output for ${brief.slug}`);
    writeFileSync(join(outDir, `${brief.slug}.png`), Buffer.from(await res.arrayBuffer()));
  }
}
writeJson(join(outDir, "manifest.json"), manifest);
console.log(join(outDir, "manifest.json"));
