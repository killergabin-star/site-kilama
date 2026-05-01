#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "production-v2");
const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key.startsWith("--")) {
    args.set(key, value?.startsWith("--") ? "true" : value ?? "true");
    if (value && !value.startsWith("--")) i += 1;
  }
}

const variant = args.get("--variant") || "txt2img";
const rawDir = args.get("--raw-dir") || join(root, variant === "txt2img" ? "raw" : `raw-${variant}`);
const webDir = args.get("--web-dir") || join(root, variant === "txt2img" ? "web-800" : `web-800-${variant}`);
const thumbDir = args.get("--thumb-dir") || join(root, variant === "txt2img" ? "thumb-400" : `thumb-400-${variant}`);
const actualDir = args.get("--actual-dir") || join(root, variant === "txt2img" ? "actual-160" : `actual-160-${variant}`);
const previewsDir = args.get("--previews-dir") || join(root, variant === "txt2img" ? "previews" : `previews-${variant}`);

for (const dir of [webDir, thumbDir, actualDir, previewsDir]) mkdirSync(dir, { recursive: true });

const files = existsSync(rawDir)
  ? readdirSync(rawDir).filter((name) => /^\d{2}-.+\.png$/.test(name)).sort()
  : [];

function magick(args) {
  const result = spawnSync("magick", args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`magick failed: ${args.join(" ")}`);
}

for (const file of files) {
  const input = join(rawDir, file);
  magick([input, "-resize", "800x450^", "-gravity", "center", "-extent", "800x450", "-strip", join(webDir, file)]);
  magick([input, "-resize", "400x225^", "-gravity", "center", "-extent", "400x225", "-strip", join(thumbDir, file)]);
  magick([input, "-resize", "160x90^", "-gravity", "center", "-extent", "160x90", "-strip", join(actualDir, file)]);
}

const actualFiles = files.map((file) => join(actualDir, file));
const sheetRows = [];
for (let i = 0; i < actualFiles.length; i += 8) {
  const rowOutput = join(previewsDir, `.row-${String(i / 8).padStart(2, "0")}.png`);
  const rowArgs = ["-background", "#0E0E10"];
  for (const file of actualFiles.slice(i, i + 8)) {
    rowArgs.push("(", file, "-gravity", "center", "-extent", "188x118", ")");
  }
  rowArgs.push("+append", rowOutput);
  magick(rowArgs);
  sheetRows.push(rowOutput);
}

if (sheetRows.length > 0) {
  magick(["-background", "#0E0E10", ...sheetRows, "-append", join(previewsDir, "contact-sheet-actual-160x90.png")]);
}

const webFiles = files.map((file) => join(webDir, file));
const webRows = [];
for (let i = 0; i < webFiles.length; i += 4) {
  const rowOutput = join(previewsDir, `.web-row-${String(i / 4).padStart(2, "0")}.png`);
  const rowArgs = ["-background", "#0E0E10"];
  for (const file of webFiles.slice(i, i + 4)) {
    rowArgs.push("(", file, "-resize", "320x180", "-gravity", "center", "-extent", "352x212", ")");
  }
  rowArgs.push("+append", rowOutput);
  magick(rowArgs);
  webRows.push(rowOutput);
}

if (webRows.length > 0) {
  magick(["-background", "#0E0E10", ...webRows, "-append", join(previewsDir, "contact-sheet-web-800.png")]);
}

writeFileSync(join(root, "postprocess-summary.json"), `${JSON.stringify({
  created_at: new Date().toISOString(),
  count: files.length,
  rawDir,
  webDir,
  thumbDir,
  actualDir,
  previewsDir,
}, null, 2)}\n`);

console.log(join(root, "postprocess-summary.json"));
