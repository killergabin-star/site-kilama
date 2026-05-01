#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { ensureDir, getArgs, loadBriefs, manifestBase, outRoot, requireKey, writeJson } from "./shared.mjs";

const { dryRun } = getArgs();
requireKey("OPENAI_API_KEY", dryRun);

const imageCli = `${process.env.CODEX_HOME || `${process.env.HOME}/.codex`}/skills/.system/imagegen/scripts/image_gen.py`;
const outDir = join(outRoot, "openai");
ensureDir(outDir);

const manifest = manifestBase("openai-cli");
manifest.results = [];

for (const brief of loadBriefs()) {
  const prompt = `${brief.prompt}

Visual direction: adult press illustration for a premium policy publication. Use a clear metaphor, strong composition, sophisticated flat colour, refined ink texture, not childish, not corporate infographic. No readable text, no logos, no flags, no public figures.`;
  const out = join(outDir, `${brief.slug}.png`);
  const args = [
    imageCli,
    "generate",
    "--model",
    "gpt-image-2",
    "--prompt",
    prompt,
    "--size",
    "1536x864",
    "--quality",
    "high",
    "--out",
    out
  ];
  if (dryRun) args.push("--dry-run");
  const stdout = execFileSync("python3", args, { encoding: "utf8" });
  manifest.results.push({ slug: brief.slug, out, stdout });
}

writeJson(join(outDir, "manifest.json"), manifest);
console.log(join(outDir, "manifest.json"));
