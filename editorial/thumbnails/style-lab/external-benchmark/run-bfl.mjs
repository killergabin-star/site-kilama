#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { ensureDir, getArgs, loadBriefs, manifestBase, outRoot, requireKey, styleInputPaths, writeJson } from "./shared.mjs";

const { dryRun } = getArgs();
const apiKey = requireKey("BFL_API_KEY", dryRun);
const outDir = join(outRoot, "bfl");
ensureDir(outDir);

const toBase64 = (path) => readFileSync(path).toString("base64");

async function poll(id) {
  for (let i = 0; i < 60; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const res = await fetch(`https://api.bfl.ai/v1/get_result?id=${encodeURIComponent(id)}`, {
      headers: { "x-key": apiKey }
    });
    const json = await res.json();
    if (json.status === "Ready" || json.status === "ready") return json;
    if (json.status === "Error" || json.status === "error") throw new Error(`BFL job error: ${JSON.stringify(json)}`);
  }
  throw new Error(`Timed out waiting for BFL job ${id}`);
}

async function generate(brief) {
  const refs = styleInputPaths().slice(0, 4);
  const payload = {
    prompt: `${brief.prompt}\n\nUse the reference images only for visual language: mature press illustration, adult metaphor, refined line, controlled flat colour. Do not copy layouts or images. No text, no logos, no flags.`,
    input_image: toBase64(refs[0]),
    input_image_2: refs[1] ? toBase64(refs[1]) : undefined,
    input_image_3: refs[2] ? toBase64(refs[2]) : undefined,
    input_image_4: refs[3] ? toBase64(refs[3]) : undefined,
    aspect_ratio: "16:9",
    output_format: "png",
    prompt_upsampling: false
  };

  if (dryRun) {
    return {
      request: {
        endpoint: "POST https://api.bfl.ai/v1/flux-kontext-pro",
        payload: { ...payload, input_image: basename(refs[0] || ""), input_image_2: basename(refs[1] || ""), input_image_3: basename(refs[2] || ""), input_image_4: basename(refs[3] || "") }
      }
    };
  }

  const res = await fetch("https://api.bfl.ai/v1/flux-kontext-pro", {
    method: "POST",
    headers: {
      "x-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`BFL error ${res.status}: ${JSON.stringify(json)}`);
  const final = await poll(json.id || json.request_id);
  return { submit: json, final };
}

const manifest = manifestBase("bfl");
manifest.results = [];
for (const brief of loadBriefs()) {
  const result = await generate(brief);
  manifest.results.push({ slug: brief.slug, result });
  const url = result.final?.result?.sample || result.final?.sample || result.final?.url;
  if (url && !dryRun) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download BFL output for ${brief.slug}`);
    writeFileSync(join(outDir, `${brief.slug}.png`), Buffer.from(await res.arrayBuffer()));
  }
}
writeJson(join(outDir, "manifest.json"), manifest);
console.log(join(outDir, "manifest.json"));
