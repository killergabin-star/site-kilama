#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { ensureDir, getArgs, loadBriefs, manifestBase, outRoot, requireKey, styleInputPaths, writeJson } from "./shared.mjs";

const { dryRun } = getArgs();
const apiKey = requireKey("RECRAFT_API_KEY", dryRun);
const outDir = join(outRoot, "recraft");
ensureDir(outDir);

async function createStyle() {
  const refs = styleInputPaths().slice(0, 5);
  if (dryRun) {
    return {
      id: "dry-run-style-id",
      request: {
        endpoint: "POST https://external.api.recraft.ai/v1/styles",
        base_style: "digital_illustration",
        images: refs.map((path) => basename(path))
      }
    };
  }

  const form = new FormData();
  form.set("base_style", "digital_illustration");
  for (const path of refs) {
    form.append("file", new Blob([readFileSync(path)]), basename(path));
  }

  const res = await fetch("https://external.api.recraft.ai/v1/styles", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Recraft style error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function generate(brief, styleId) {
  const payload = {
    model: "recraftv3",
    style_id: styleId,
    size: "1365x768",
    prompt: `${brief.prompt}\n\nVisual direction: adult editorial illustration, clear metaphor, flat colour, refined linework, textured print feel, premium policy magazine. Avoid corporate infographic, childish icons, photorealism, logos, flags, readable text, and public figures.`
  };

  if (dryRun) {
    return { request: { endpoint: "POST https://external.api.recraft.ai/v1/images/generations", payload } };
  }

  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Recraft generation error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

const manifest = manifestBase("recraft");
const style = await createStyle();
manifest.style = style;
const styleId = style.id || style.style_id || style.data?.id || "dry-run-style-id";
manifest.results = [];

for (const brief of loadBriefs()) {
  const result = await generate(brief, styleId);
  manifest.results.push({ slug: brief.slug, result });
  const url = result.data?.[0]?.url || result.image?.url || result.url;
  if (url && !dryRun) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download Recraft output for ${brief.slug}`);
    writeFileSync(join(outDir, `${brief.slug}.png`), Buffer.from(await res.arrayBuffer()));
  }
}

writeJson(join(outDir, "manifest.json"), manifest);
console.log(join(outDir, "manifest.json"));
