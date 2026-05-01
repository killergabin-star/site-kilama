import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const here = dirname(fileURLToPath(import.meta.url));
export const outRoot = join(here, "outputs");
export const styleInputDir = join(here, "style-inputs");

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

export function writeJson(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

export function getArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    dryRun: args.has("--dry-run"),
    force: args.has("--force")
  };
}

export function loadBriefs() {
  return readJson(join(here, "briefs.json"));
}

export function loadPalette() {
  return readJson(join(here, "palette.json"));
}

export function styleInputPaths() {
  if (!existsSync(styleInputDir)) return [];
  return ["ref-01-economist-light.jpg", "ref-02-economist-columns.jpg", "ref-03-foreignaffairs-dark.jpg", "ref-04-foreignaffairs-covers.jpg", "ref-05-mixed-editorial.jpg"]
    .map((name) => join(styleInputDir, name))
    .filter(existsSync);
}

export function requireKey(name, dryRun) {
  const value = process.env[name];
  if (!value && !dryRun) {
    throw new Error(`${name} is not set. Export it or run with --dry-run.`);
  }
  return value || `DRY_RUN_${name}`;
}

export async function download(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${res.statusText}: ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  ensureDir(dirname(path));
  writeFileSync(path, Buffer.from(arrayBuffer));
}

export function manifestBase(provider) {
  return {
    provider,
    created_at: new Date().toISOString(),
    briefs: loadBriefs().map(({ slug, article, prompt }) => ({ slug, article, prompt })),
    style_inputs: styleInputPaths().map((path) => basename(path)),
    palette: loadPalette()
  };
}
