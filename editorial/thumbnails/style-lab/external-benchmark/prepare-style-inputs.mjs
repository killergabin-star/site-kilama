#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { here, styleInputDir } from "./shared.mjs";

const zip = "/Users/killergabin/Desktop/images .zip";
const tmp = "/tmp/ek-policy-ref-images";
const imageDir = join(tmp, "images ");

if (!existsSync(imageDir)) {
  if (!existsSync(zip)) {
    throw new Error(`Reference zip not found: ${zip}`);
  }
  execFileSync("rm", ["-rf", tmp]);
  execFileSync("mkdir", ["-p", tmp]);
  execFileSync("unzip", ["-q", zip, "-d", tmp]);
}

mkdirSync(styleInputDir, { recursive: true });

const files = readdirSync(imageDir)
  .filter((name) => name.toLowerCase().endsWith(".png"))
  .sort()
  .map((name) => join(imageDir, name));

function byTime(time) {
  const found = files.find((path) => path.includes(time));
  if (!found) throw new Error(`No screenshot found for ${time}`);
  return found;
}

const refs = [
  {
    name: "ref-01-economist-light.jpg",
    source: byTime("08.24.30"),
    crop: "1500x1080+220+260"
  },
  {
    name: "ref-02-economist-columns.jpg",
    source: byTime("08.25.30"),
    crop: "1500x1080+220+240"
  },
  {
    name: "ref-03-foreignaffairs-dark.jpg",
    source: byTime("08.12.42"),
    crop: "1500x1080+130+130"
  },
  {
    name: "ref-04-foreignaffairs-covers.jpg",
    source: byTime("08.18.41"),
    crop: "1400x1080+120+190"
  },
  {
    name: "ref-05-mixed-editorial.jpg",
    source: byTime("08.26.10"),
    crop: "1750x1280+180+130"
  }
];

for (const ref of refs) {
  const out = join(styleInputDir, ref.name);
  execFileSync("magick", [
    ref.source,
    "-auto-orient",
    "-crop",
    ref.crop,
    "+repage",
    "-resize",
    "1200x900>",
    "-strip",
    "-quality",
    "88",
    out
  ], { stdio: "inherit" });
}

const tileW = 280;
const tileH = 210;
const gap = 12;
const sheetW = refs.length * tileW + (refs.length + 1) * gap;
const sheetH = tileH + 2 * gap;
const args = ["-size", `${sheetW}x${sheetH}`, "xc:#f8f1e6"];
for (const [index, ref] of refs.entries()) {
  const src = join(styleInputDir, ref.name);
  const tile = join(styleInputDir, `.tile-${index + 1}.jpg`);
  execFileSync("magick", [src, "-resize", `${tileW}x${tileH}^`, "-gravity", "center", "-extent", `${tileW}x${tileH}`, tile], { stdio: "inherit" });
  args.push(tile, "-geometry", `+${gap + index * (tileW + gap)}+${gap}`, "-composite");
}
args.push(join(here, "style-inputs-contact-sheet.jpg"));
execFileSync("magick", args, { stdio: "inherit" });

console.log(styleInputDir);
