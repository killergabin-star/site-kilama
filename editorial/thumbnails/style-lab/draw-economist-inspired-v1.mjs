#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "drawn-v1");
const svgDir = join(outDir, "svg");
const pngDir = join(outDir, "png");
mkdirSync(svgDir, { recursive: true });
mkdirSync(pngDir, { recursive: true });

const W = 480;
const H = 270;
const C = {
  ink: "#111116",
  ivory: "#F8F1E3",
  paper: "#F3E5CF",
  red: "#E23B4A",
  navy: "#17213B",
  blue: "#75A7D8",
  steel: "#B8C5CF",
  green: "#8BBF8A",
  yellow: "#F2C85A",
  coral: "#F39A7B",
  lilac: "#BDA8D9",
  grey: "#6E7179",
  dark: "#11131A",
};

const esc = (value) => String(value).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[m]);
const attr = (attrs = {}) => Object.entries(attrs).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
const el = (name, attrs, body = "") => `<${name}${attr(attrs)}>${body}</${name}>`;
const self = (name, attrs) => `<${name}${attr(attrs)}/>`;
const line = (x1, y1, x2, y2, color = C.ink, w = 4) => self("line", { x1, y1, x2, y2, stroke: color, "stroke-width": w, "stroke-linecap": "round" });
const circle = (cx, cy, r, fill, stroke = C.ink, sw = 4) => self("circle", { cx, cy, r, fill, stroke, "stroke-width": sw });
const rect = (x, y, width, height, fill, stroke = C.ink, sw = 4, rx = 0) => self("rect", { x, y, width, height, rx, fill, stroke, "stroke-width": sw });
const path = (d, fill = "none", stroke = C.ink, sw = 4) => self("path", { d, fill, stroke, "stroke-width": sw, "stroke-linejoin": "round", "stroke-linecap": "round" });
const poly = (points, fill, stroke = C.ink, sw = 4) => self("polygon", { points, fill, stroke, "stroke-width": sw, "stroke-linejoin": "round" });

function svg(bg, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.08"/></feComponentTransfer>
    </filter>
    <pattern id="dotgrid" width="18" height="18" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${C.ink}" opacity="0.16"/>
    </pattern>
  </defs>
  ${rect(0, 0, W, H, bg, "none", 0)}
  ${rect(0, 0, W, H, "white", "none", 0)}
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" filter="url(#paper)" opacity="0.55"/>
  ${body}
</svg>`;
}

const pieces = [
  {
    slug: "01-ormuz-food-security",
    bg: "#F3D99A",
    body: () => [
      path("M20 210 C95 165 145 185 205 138 C270 87 342 103 462 42", "none", C.blue, 14),
      path("M28 222 C113 175 161 198 215 151 C283 92 347 115 462 58", "none", C.dark, 26),
      rect(218, 84, 38, 100, C.red, C.ink, 5),
      ...[0, 1, 2, 3].map((i) => path(`M256 ${105 + i * 22} C315 ${88 + i * 15} 350 ${126 + i * 8} 420 ${101 + i * 19}`, "none", [C.ivory, C.green, C.yellow, C.blue][i], 7)),
      path("M308 189 C340 170 386 174 430 193 L438 237 L298 237 Z", C.green),
      ...Array.from({ length: 24 }, (_, i) => circle(322 + (i % 8) * 13, 198 + Math.floor(i / 8) * 13, 3, C.yellow, "none", 0)),
      path("M336 190 L365 235 M388 180 L374 238 M418 193 L405 238", "none", C.red, 4),
      circle(78, 78, 28, C.ivory),
      path("M78 52 L78 78 L101 90", "none", C.red, 5),
    ].join(""),
  },
  {
    slug: "02-borrowers-platform",
    bg: "#E7DED2",
    body: () => [
      circle(160, 136, 70, "#D3C5B2"),
      circle(160, 136, 38, C.ivory),
      ...Array.from({ length: 18 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 18;
        const x = 160 + Math.cos(a) * 100;
        const y = 136 + Math.sin(a) * 88;
        return rect(x - 9, y - 9, 18, 18, [C.blue, C.green, C.yellow, C.coral, C.lilac][i % 5], C.ink, 3, 2);
      }),
      rect(326, 82, 112, 108, C.navy, C.ink, 5, 8),
      ...[348, 376, 404].map((x) => rect(x, 56, 20, 24, C.grey, C.ink, 3, 3)),
      rect(218, 116, 58, 42, C.red, C.ink, 5, 5),
      line(230, 116, 230, 102, C.ink, 4),
      line(264, 116, 264, 102, C.ink, 4),
      path("M254 137 L312 137 L322 126", "none", C.red, 6),
    ].join(""),
  },
  {
    slug: "03-babylonian-configuration",
    bg: "#EEE6D4",
    body: () => [
      rect(174, 188, 136, 30, C.grey),
      rect(190, 155, 104, 34, C.yellow),
      rect(168, 121, 148, 34, C.blue),
      rect(198, 88, 88, 34, C.coral),
      rect(218, 54, 48, 34, C.navy),
      circle(242, 33, 18, C.ivory),
      ...[185, 220, 255, 290].map((x) => line(x, 122, x + 22, 155, C.ink, 3)),
      ...[204, 235, 266].map((x) => circle(x, 172, 10, C.ivory, C.ink, 3)),
      path("M238 54 L229 104 L251 137 L238 181 L263 218", "none", C.red, 8),
      path("M193 218 L170 246 L225 246 L242 218", "#C69B72"),
      path("M288 218 L318 246 L264 246 L242 218", "#77736C"),
      line(242, 218, 245, 246, C.red, 5),
      path("M54 238 C135 222 350 222 428 238", "none", C.ink, 5),
    ].join(""),
  },
  {
    slug: "04-failed-stabilizers",
    bg: "#D9EBF1",
    body: () => [
      rect(0, 0, W, H, "url(#dotgrid)", "none", 0),
      ...[105, 235, 365].map((x, i) => [
        circle(x, 196, 24, C.ivory),
        line(x, 172, x + 20, 78, C.ink, 8),
        line(x + 20, 78, x + 43, 58, C.ink, 8),
        path(`M${x + 8} 115 L${x + 31} 130 L${x + 17} 146`, "none", C.red, 7),
        circle(x + 48, 54, 13, [C.yellow, C.green, C.lilac][i]),
      ].join("")).join(""),
      path("M58 225 C142 165 202 250 282 178 S392 148 430 72", "none", C.red, 5),
      ...[40, 80, 120, 160, 200, 240].map((y) => line(22, y, 458, y, "#7BA1B2", 1)),
    ].join(""),
  },
  {
    slug: "05-africa-ldc-contraction",
    bg: "#EFE5D6",
    body: () => [
      rect(40, 40, 140, 178, "#D8CAB7", C.ink, 3),
      rect(70, 63, 96, 12, C.red, "none", 0),
      rect(65, 96, 78, 10, C.grey, "none", 0),
      rect(65, 121, 95, 10, C.grey, "none", 0),
      rect(65, 146, 66, 10, C.grey, "none", 0),
      path("M252 56 L406 56 L438 184 L222 184 Z", C.ivory),
      ...[260, 306, 352, 398].map((x) => line(x, 66, x - 20, 184, C.ink, 4)),
      rect(294, 176, 46, 18, C.red, C.ink, 3),
      ...[250, 292, 334, 376].map((x, i) => [
        poly(`${x},218 ${x + 22},200 ${x + 44},218`, [C.blue, C.green, C.yellow, C.coral][i]),
        rect(x + 6, 218, 32, 24, C.ivory, C.ink, 3),
      ].join("")).join(""),
      circle(400, 93, 30, "none", C.ink, 5),
      path("M400 93 L400 66", "none", C.red, 6),
    ].join(""),
  },
  {
    slug: "06-sme-fragility",
    bg: "#F7E3D6",
    body: () => [
      ...Array.from({ length: 14 }, (_, i) => {
        const x = 64 + (i % 7) * 48;
        const y = 96 + Math.floor(i / 7) * 64;
        return rect(x, y, 34, 34, [C.ivory, C.blue, C.green, C.yellow][i % 4], C.ink, 3, 2) + poly(`${x + 4},${y} ${x + 17},${y - 14} ${x + 30},${y}`, C.coral, C.ink, 3);
      }).join(""),
      rect(50, 50, 26, 172, C.red, C.ink, 5),
      rect(404, 50, 26, 172, C.red, C.ink, 5),
      line(76, 136, 164, 136, C.red, 7),
      line(404, 136, 316, 136, C.red, 7),
      ...[28, 36, 44].map((y) => path(`M18 ${y} C72 ${y + 22} 96 ${y - 10} 126 ${y + 19}`, "none", C.ink, 3)),
      ...[226, 236, 246].map((y) => line(350, y, 430, y, C.ink, 3)),
      path("M243 81 L228 130 L257 164 L238 209", "none", C.red, 5),
    ].join(""),
  },
  {
    slug: "07-second-china-shock",
    bg: "#BEE1F4",
    body: () => [
      path("M18 180 C100 98 170 236 246 142 C324 48 386 108 464 72 L464 250 L18 250 Z", C.blue),
      ...Array.from({ length: 24 }, (_, i) => {
        const x = 78 + (i % 8) * 36;
        const y = 122 + Math.floor(i / 8) * 26 + (i % 2) * 6;
        return rect(x, y, 28, 20, [C.yellow, C.green, C.coral, C.lilac, C.ivory][i % 5], C.ink, 2, 1);
      }).join(""),
      rect(316, 188, 104, 48, C.ivory, C.ink, 4),
      ...[330, 356, 382].map((x) => rect(x, 164, 16, 24, C.grey, C.ink, 3)),
      line(316, 188, 286, 236, C.ink, 4),
      path("M76 74 L114 42 L152 74 Z", C.red),
      circle(114, 74, 34, C.ivory, C.ink, 4),
      line(86, 74, 142, 74, C.red, 5),
    ].join(""),
  },
  {
    slug: "08-aid-defense-reallocation",
    bg: "#F1DFA6",
    body: () => [
      line(240, 54, 240, 215, C.ink, 6),
      line(105, 102, 375, 102, C.ink, 6),
      path("M118 102 L75 190 L161 190 Z", "none", C.ink, 4),
      path("M360 102 L310 214 L415 214 Z", "none", C.ink, 4),
      rect(92, 160, 52, 30, C.green, C.ink, 3),
      poly("98,160 118,140 138,160", C.ivory, C.ink, 3),
      path("M330 160 L360 130 L390 160 L380 205 L340 205 Z", C.navy),
      line(350, 172, 370, 192, C.red, 5),
      path("M160 188 C222 172 260 174 326 150", "none", C.red, 11),
      circle(240, 222, 24, C.ivory),
    ].join(""),
  },
  {
    slug: "09-rearm-europe-safe",
    bg: C.navy,
    body: () => [
      path("M202 42 L318 42 L346 92 L326 205 L260 238 L194 205 L174 92 Z", C.ivory, C.ivory, 0),
      path("M202 42 L318 42 L346 92 L326 205 L260 238 L194 205 L174 92 Z", "none", C.ink, 5),
      ...[
        "M205 70 L255 70 L248 126 L196 118 Z",
        "M262 70 L320 70 L334 118 L268 126 Z",
        "M196 130 L248 137 L242 197 L204 181 Z",
        "M266 137 L334 130 L316 181 L274 198 Z",
      ].map((d, i) => path(d, [C.blue, C.yellow, C.green, C.coral][i], C.ink, 4)).join(""),
      rect(350, 113, 44, 44, C.red, C.ivory, 4, 6),
      line(394, 135, 454, 135, C.red, 9),
      ...[82, 106, 130].map((y) => line(52, y, 174, y + 35, C.ivory, 4)),
      circle(92, 207, 15, C.red, C.ivory, 3),
      circle(134, 211, 12, C.grey, C.ivory, 3),
    ].join(""),
  },
  {
    slug: "10-sanctions-rerouting",
    bg: "#DDE7E8",
    body: () => [
      rect(0, 0, W, H, "url(#dotgrid)", "none", 0),
      path("M36 56 H168 V116 H92 V194 H220 V236", "none", C.ink, 8),
      path("M225 36 V98 H350 V166 H282 V234 H444", "none", C.ink, 8),
      rect(150, 96, 60, 42, C.red, C.ink, 4),
      rect(325, 148, 60, 42, C.red, C.ink, 4),
      path("M70 224 C148 160 244 178 306 116 S404 54 452 84", "none", C.grey, 5),
      ...[115, 265, 414].map((x, i) => [
        path(`M${x} ${206 - i * 36} l38 10 l-18 10 l-38 -10 z`, C.navy, C.ink, 3),
        line(x + 4, 216 - i * 36, x + 28, 216 - i * 36, C.ivory, 2),
      ].join("")).join(""),
      circle(72, 78, 24, C.yellow),
      circle(422, 198, 22, C.green),
    ].join(""),
  },
  {
    slug: "11-haiti-impasse",
    bg: "#B9D5C8",
    body: () => [
      path("M160 82 C206 54 282 66 318 104 C354 146 318 205 250 210 C182 216 118 178 126 124 C130 105 142 93 160 82 Z", "#E7D0A4"),
      ...[175, 208, 242, 276].map((x, i) => rect(x, 135 + (i % 2) * 24, 30, 36, [C.ivory, C.coral, C.blue, C.yellow][i], C.ink, 3)),
      path("M126 117 C170 64 274 55 326 105 C374 151 340 220 258 229 C169 238 99 181 126 117 Z", "none", C.ivory, 9),
      path("M91 88 C151 18 310 20 379 91 C438 153 392 250 266 255 C134 260 42 173 91 88 Z", "none", C.dark, 5),
      path("M231 94 L246 145 L220 178 L248 222", "none", C.red, 6),
      path("M126 117 C170 64 274 55 326 105", "none", C.red, 9),
      ...[58, 77, 397, 420].map((x) => rect(x, 190, 18, 36, C.grey, C.ink, 3)),
    ].join(""),
  },
  {
    slug: "12-development-banks",
    bg: "#F5EFE7",
    body: () => [
      ...[105, 168, 231].map((x, i) => [
        rect(x, 70, 38, 130, [C.ivory, C.steel, C.ivory][i], C.ink, 4),
        poly(`${x - 10},70 ${x + 19},44 ${x + 48},70`, C.navy, C.ink, 4),
        rect(x - 12, 200, 62, 20, C.grey, C.ink, 4),
      ].join("")).join(""),
      rect(296, 95, 20, 96, C.green, C.ink, 3),
      rect(326, 78, 20, 113, C.green, C.ink, 3),
      rect(356, 52, 20, 139, C.green, C.ink, 3),
      path("M291 214 H420", "none", C.ink, 6),
      path("M294 219 C330 150 366 122 432 66", "none", C.red, 7),
      circle(432, 66, 20, C.yellow),
      line(432, 66, 451, 52, C.red, 5),
      path("M60 236 H430", "none", C.ink, 5),
    ].join(""),
  },
];

for (const item of pieces) {
  const file = join(svgDir, `${item.slug}.svg`);
  writeFileSync(file, svg(item.bg, item.body()));
  const png = join(pngDir, `${item.slug}.png`);
  execFileSync("magick", [file, "-resize", "480x270", png], { stdio: "inherit" });
}

const pngs = pieces.map((item) => join(pngDir, `${item.slug}.png`));
const sheetW = 4 * W + 5 * 16;
const sheetH = 3 * H + 4 * 16;
const sheetSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}" viewBox="0 0 ${sheetW} ${sheetH}">
  <rect width="${sheetW}" height="${sheetH}" fill="#f7f2ea"/>
  ${pieces.map((item, i) => {
    const x = 16 + (i % 4) * (W + 16);
    const y = 16 + Math.floor(i / 4) * (H + 16);
    const inner = svg(item.bg, item.body()).replace(/^<\?xml[^>]+>\s*/, "");
    return `<svg x="${x}" y="${y}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;
  }).join("\n  ")}
</svg>`;
writeFileSync(join(outDir, "contact-sheet-drawn-v1.svg"), sheetSvg);
const compositeArgs = ["-size", `${sheetW}x${sheetH}`, "xc:#f7f2ea"];
for (const [i, png] of pngs.entries()) {
  const x = 16 + (i % 4) * (W + 16);
  const y = 16 + Math.floor(i / 4) * (H + 16);
  compositeArgs.push(png, "-geometry", `+${x}+${y}`, "-composite");
}
compositeArgs.push(join(outDir, "contact-sheet-drawn-v1.png"));
execFileSync("magick", compositeArgs, { stdio: "inherit" });

const html = `<!doctype html>
<meta charset="utf-8">
<title>Policy thumbnails drawn style v1</title>
<style>
  body { margin: 0; background: #f7f2ea; color: #111116; font-family: ui-sans-serif, system-ui, sans-serif; }
  main { padding: 28px; }
  h1 { font-size: 22px; margin: 0 0 18px; letter-spacing: .01em; }
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  figure { margin: 0; background: white; border: 1px solid rgba(17,17,22,.16); }
  img { display: block; width: 100%; height: auto; }
  figcaption { padding: 8px 10px 10px; font-size: 12px; line-height: 1.3; color: #444; }
</style>
<main>
  <h1>Policy thumbnails - drawn editorial style v1</h1>
  <div class="grid">
    ${pieces.map((item, i) => `<figure><img src="svg/${item.slug}.svg"><figcaption>${i + 1}. ${item.slug}</figcaption></figure>`).join("\n    ")}
  </div>
</main>`;
writeFileSync(join(outDir, "preview.html"), html);

console.log(join(outDir, "contact-sheet-drawn-v1.png"));
