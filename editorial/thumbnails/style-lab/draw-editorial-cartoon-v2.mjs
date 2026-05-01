#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "drawn-v2");
const svgDir = join(outDir, "svg");
const pngDir = join(outDir, "png");
mkdirSync(svgDir, { recursive: true });
mkdirSync(pngDir, { recursive: true });

const W = 480;
const H = 270;
const C = {
  ink: "#101014",
  red: "#E63846",
  cream: "#FFF7E8",
  paper: "#F6E9D3",
  blue: "#7CB7E6",
  navy: "#15203C",
  green: "#8BCB8F",
  mint: "#A7DCC5",
  yellow: "#F4CC58",
  orange: "#F39A69",
  pink: "#EFB6B6",
  lilac: "#B9A7E8",
  grey: "#9EA3A8",
  darkGrey: "#62656B",
  black: "#070709",
};

const esc = (value) => String(value).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[m]);
const attr = (attrs = {}) => Object.entries(attrs).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
const self = (name, attrs) => `<${name}${attr(attrs)}/>`;
const g = (body, attrs = {}) => `<g${attr(attrs)}>${body}</g>`;
const rect = (x, y, width, height, fill, stroke = C.ink, sw = 5, rx = 0) => self("rect", { x, y, width, height, rx, fill, stroke, "stroke-width": sw });
const line = (x1, y1, x2, y2, stroke = C.ink, sw = 5) => self("line", { x1, y1, x2, y2, stroke, "stroke-width": sw, "stroke-linecap": "round" });
const circle = (cx, cy, r, fill, stroke = C.ink, sw = 5) => self("circle", { cx, cy, r, fill, stroke, "stroke-width": sw });
const ellipse = (cx, cy, rx, ry, fill, stroke = C.ink, sw = 5) => self("ellipse", { cx, cy, rx, ry, fill, stroke, "stroke-width": sw });
const path = (d, fill = "none", stroke = C.ink, sw = 5) => self("path", { d, fill, stroke, "stroke-width": sw, "stroke-linejoin": "round", "stroke-linecap": "round" });
const poly = (points, fill, stroke = C.ink, sw = 5) => self("polygon", { points, fill, stroke, "stroke-width": sw, "stroke-linejoin": "round" });

function svg(bg, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.2"/></filter>
    <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 9 L9 0" stroke="${C.ink}" stroke-width="1" opacity="0.18"/></pattern>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="${C.ink}" opacity="0.16"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g filter="url(#wobble)">
  ${body}
  </g>
</svg>`;
}

const wave = (x, y, w, h, fill) => path(`M${x} ${y + h * 0.55} C${x + w * 0.2} ${y} ${x + w * 0.38} ${y + h} ${x + w * 0.58} ${y + h * 0.48} C${x + w * 0.78} ${y} ${x + w * 0.9} ${y + h * 0.7} ${x + w} ${y + h * 0.35} L${x + w} ${y + h} L${x} ${y + h} Z`, fill);
const chair = (x, y, fill) => rect(x, y, 20, 22, fill, C.ink, 4, 3) + line(x + 2, y + 22, x - 4, y + 39, C.ink, 4) + line(x + 18, y + 22, x + 24, y + 39, C.ink, 4);
const factory = (x, y, fill) => rect(x, y + 25, 54, 36, fill, C.ink, 4) + poly(`${x},${y + 25} ${x + 14},${y + 8} ${x + 28},${y + 25} ${x + 41},${y + 8} ${x + 54},${y + 25}`, fill, C.ink, 4) + rect(x + 7, y + 38, 10, 23, C.cream, C.ink, 2) + rect(x + 30, y + 38, 14, 12, C.blue, C.ink, 2);
const ship = (x, y, fill = C.navy) => path(`M${x} ${y} L${x + 82} ${y + 10} L${x + 56} ${y + 28} L${x + 12} ${y + 24} Z`, fill) + rect(x + 24, y - 24, 28, 24, C.cream, C.ink, 4) + line(x + 10, y + 13, x + 70, y + 18, C.cream, 3);
const moneyStack = (x, y, fill = C.green) => rect(x, y, 72, 20, fill, C.ink, 4, 2) + rect(x + 8, y - 12, 72, 20, fill, C.ink, 4, 2) + circle(x + 45, y - 2, 8, C.cream, C.ink, 3);
const dots = () => Array.from({ length: 42 }, (_, i) => circle(28 + (i % 14) * 32, 30 + Math.floor(i / 14) * 80, 2, C.ink, "none", 0)).join("");
const hatch = () => Array.from({ length: 18 }, (_, i) => line(18 + i * 30, 248, 82 + i * 30, 185, C.ink, 1.4)).join("");

const pieces = [
  {
    slug: "01-ormuz-bottle-grain",
    bg: "#FFE0A8",
    body: () => [
      path("M74 72 C134 42 229 46 286 79 C340 110 338 157 286 183 C220 218 121 205 67 168 C22 137 32 93 74 72 Z", C.blue),
      ship(101, 117, C.navy),
      rect(283, 88, 46, 92, C.red, C.ink, 6, 7),
      ...[0, 1, 2, 3].map((i) => path(`M330 ${100 + i * 20} C370 ${90 + i * 15} 397 ${103 + i * 18} 432 ${87 + i * 22}`, "none", [C.yellow, C.orange, C.mint, C.green][i], 7)),
      path("M345 190 C382 169 434 183 453 217 L456 249 L333 249 Z", C.green),
      ...Array.from({ length: 22 }, (_, i) => circle(356 + (i % 8) * 12, 203 + Math.floor(i / 8) * 13, 3.2, C.yellow, "none", 0)).join(""),
      circle(52, 54, 23, C.cream),
      path("M52 36 L52 54 L69 62", "none", C.red, 5),
    ].join(""),
  },
  {
    slug: "02-borrowers-megaphone",
    bg: "#F9F0DC",
    body: () => [
      ellipse(150, 150, 95, 62, "#D7C6A7"),
      ...Array.from({ length: 16 }, (_, i) => {
        const a = Math.PI * 2 * i / 16;
        return chair(150 + Math.cos(a) * 112 - 10, 150 + Math.sin(a) * 78 - 10, [C.blue, C.green, C.yellow, C.orange, C.lilac][i % 5]);
      }).join(""),
      path("M229 136 L295 106 L295 178 L229 151 Z", C.red),
      circle(218, 144, 20, C.cream),
      rect(337, 71, 90, 120, C.navy, C.ink, 6, 12),
      rect(358, 42, 48, 34, C.darkGrey, C.ink, 5, 5),
      rect(246, 195, 58, 42, C.red, C.ink, 6, 6),
      line(260, 195, 260, 180, C.ink, 5),
      line(291, 195, 291, 180, C.ink, 5),
      path("M304 215 C333 210 364 204 396 192", "none", C.red, 7),
    ].join(""),
  },
  {
    slug: "03-babylon-statue-feet",
    bg: "#F3E1C2",
    body: () => [
      rect(187, 88, 106, 124, C.yellow, C.ink, 7, 10),
      circle(240, 58, 28, C.cream),
      rect(214, 33, 52, 15, C.red, C.ink, 5, 2),
      rect(156, 132, 58, 44, C.blue, C.ink, 5, 4),
      rect(267, 132, 58, 44, C.green, C.ink, 5, 4),
      ...[99, 126, 153, 180].map((y) => line(199, y, 282, y, C.ink, 3)),
      circle(214, 151, 11, C.cream, C.ink, 3),
      circle(267, 151, 11, C.cream, C.ink, 3),
      path("M241 86 L229 126 L251 151 L236 211", "none", C.red, 8),
      path("M199 212 L164 246 L224 246 L241 212", "#C3926B"),
      path("M283 212 L320 246 L259 246 L241 212", C.darkGrey),
      line(240, 212, 245, 246, C.red, 5),
      ...[43, 387].map((x) => rect(x, 190, 52, 29, C.navy, C.ink, 5, 4)),
    ].join(""),
  },
  {
    slug: "04-stabilizers-snapped-springs",
    bg: "#F6F6F2",
    body: () => [
      dots(),
      ...[100, 240, 380].map((x, i) => [
        line(x, 55, x, 212, C.ink, 7),
        ...[0, 1, 2, 3, 4].map((j) => path(`M${x - 33} ${72 + j * 24} C${x - 3} ${58 + j * 24} ${x + 3} ${88 + j * 24} ${x + 33} ${74 + j * 24}`, "none", [C.blue, C.yellow, C.green][i], 5)).join(""),
        path(`M${x - 28} 128 L${x + 3} 145 L${x - 10} 167`, "none", C.red, 8),
        circle(x, 222, 18, C.cream),
      ].join("")).join(""),
      path("M33 236 C138 190 229 259 332 191 C382 158 410 119 443 68", "none", C.red, 5),
    ].join(""),
  },
  {
    slug: "05-sudan-aid-net",
    bg: "#EEE2D2",
    body: () => [
      path("M62 62 H175 L159 198 H77 Z", "#D8CCB8"),
      rect(78, 83, 74, 11, C.red, "none", 0),
      rect(78, 114, 84, 9, C.darkGrey, "none", 0),
      rect(78, 138, 60, 9, C.darkGrey, "none", 0),
      path("M236 56 L422 56 L450 192 L196 192 Z", C.cream),
      ...[241, 285, 329, 373, 417].map((x) => line(x, 68, x - 22, 192, C.ink, 3)),
      ...[86, 116, 146].map((y) => line(218, y, 433, y, C.ink, 2)),
      rect(306, 174, 48, 20, C.red, C.ink, 4, 2),
      ...[231, 279, 327, 375].map((x, i) => factory(x, 203, [C.blue, C.green, C.yellow, C.orange][i]).replaceAll("stroke-width=\"4\"", "stroke-width=\"3\"")),
      circle(412, 94, 28, C.cream),
      path("M412 94 L412 69", "none", C.red, 6),
    ].join(""),
  },
  {
    slug: "06-sme-red-clamp",
    bg: "#FAE7DE",
    body: () => [
      ...[68, 143, 218, 293].map((x, i) => factory(x, 110 + (i % 2) * 30, [C.blue, C.green, C.yellow, C.orange][i])),
      rect(29, 54, 37, 168, C.red, C.ink, 7, 7),
      rect(414, 54, 37, 168, C.red, C.ink, 7, 7),
      line(66, 138, 145, 138, C.red, 10),
      line(414, 138, 332, 138, C.red, 10),
      path("M23 44 C65 73 99 38 143 66", "none", C.ink, 4),
      path("M340 232 H433 M354 219 H431 M367 206 H432", "none", C.ink, 4),
      path("M222 82 L202 131 L230 163 L214 218", "none", C.red, 7),
    ].join(""),
  },
  {
    slug: "07-china-shock-wave",
    bg: "#D9F0FF",
    body: () => [
      wave(20, 70, 340, 166, C.blue),
      ...Array.from({ length: 26 }, (_, i) => {
        const x = 66 + (i % 8) * 36;
        const y = 113 + Math.floor(i / 8) * 28 + (i % 2) * 4;
        return rect(x, y, 30, 20, [C.yellow, C.green, C.orange, C.lilac, C.cream][i % 5], C.ink, 3, 2);
      }).join(""),
      rect(342, 174, 83, 51, C.cream, C.ink, 5, 2),
      ...[354, 380, 406].map((x) => rect(x, 145, 15, 29, C.darkGrey, C.ink, 3)),
      path("M88 73 C109 39 145 39 161 74", "none", C.red, 8),
      circle(126, 75, 35, C.cream, C.ink, 5),
      line(94, 75, 158, 75, C.red, 6),
    ].join(""),
  },
  {
    slug: "08-aid-defense-siphon",
    bg: "#FFF0B5",
    body: () => [
      line(240, 49, 240, 224, C.ink, 7),
      line(82, 97, 398, 97, C.ink, 7),
      path("M124 97 L72 201 H176 Z", C.cream),
      path("M358 97 L296 224 H425 Z", C.cream),
      factory(94, 160, C.green),
      path("M333 145 L360 115 L390 145 L380 204 L343 204 Z", C.navy),
      path("M350 163 L374 191", "none", C.red, 7),
      path("M169 193 C235 178 271 169 326 145", "none", C.red, 13),
      circle(240, 225, 22, C.cream),
      moneyStack(35, 46, C.green),
    ].join(""),
  },
  {
    slug: "09-rearm-fragmented-shield",
    bg: "#15203C",
    body: () => [
      path("M195 35 L318 35 L354 95 L329 209 L258 242 L187 209 L162 95 Z", C.cream, C.cream, 0),
      path("M195 35 L318 35 L354 95 L329 209 L258 242 L187 209 L162 95 Z", "none", C.ink, 6),
      path("M198 72 L257 66 L248 132 L181 121 Z", C.blue),
      path("M267 66 L326 74 L342 123 L269 132 Z", C.yellow),
      path("M184 137 L248 148 L235 203 L197 185 Z", C.green),
      path("M269 148 L336 137 L318 185 L280 204 Z", C.orange),
      rect(361, 110, 43, 48, C.red, C.cream, 5, 7),
      line(404, 134, 458, 134, C.red, 9),
      ...[66, 95, 124].map((y) => line(46, y, 162, y + 31, C.cream, 4)),
      circle(81, 213, 14, C.red, C.cream, 3),
      circle(120, 219, 11, C.grey, C.cream, 3),
    ].join(""),
  },
  {
    slug: "10-sanctions-shadow-routes",
    bg: "#E7EFEF",
    body: () => [
      hatch(),
      path("M33 58 H179 V121 H97 V202 H227", "none", C.ink, 9),
      path("M221 36 V96 H361 V171 H286 V235 H446", "none", C.ink, 9),
      rect(154, 99, 58, 45, C.red, C.ink, 5, 3),
      rect(333, 149, 58, 45, C.red, C.ink, 5, 3),
      path("M62 223 C134 164 245 177 305 117 S410 48 448 83", "none", C.grey, 5),
      ship(86, 201, C.navy),
      ship(257, 143, C.navy),
      ship(379, 75, C.navy),
      circle(66, 84, 22, C.yellow),
      circle(425, 206, 22, C.green),
    ].join(""),
  },
  {
    slug: "11-haiti-small-perimeter",
    bg: "#B9DCCB",
    body: () => [
      path("M155 79 C206 47 287 64 325 112 C360 156 322 210 249 218 C170 227 111 175 124 123 C129 103 139 90 155 79 Z", "#E7CE9D"),
      ...[176, 213, 250, 287].map((x, i) => rect(x, 137 + (i % 2) * 22, 28, 35, [C.cream, C.orange, C.blue, C.yellow][i], C.ink, 4, 2)),
      path("M128 116 C172 65 276 58 328 105 C375 151 337 219 255 228 C166 238 99 181 128 116 Z", "none", C.cream, 10),
      path("M91 88 C155 18 315 21 382 92 C438 154 392 250 266 255 C134 260 42 174 91 88 Z", "none", C.ink, 5),
      path("M230 94 L246 145 L220 179 L248 222", "none", C.red, 7),
      path("M128 116 C172 65 276 58 328 105", "none", C.red, 10),
      rect(56, 189, 22, 43, C.grey, C.ink, 4, 3),
      rect(401, 189, 22, 43, C.grey, C.ink, 4, 3),
    ].join(""),
  },
  {
    slug: "12-mdb-mission-compass",
    bg: "#F8EEE4",
    body: () => [
      ...[89, 154, 219].map((x, i) => [
        rect(x, 78, 40, 119, [C.cream, C.blue, C.cream][i], C.ink, 5),
        poly(`${x - 11},78 ${x + 20},49 ${x + 51},78`, C.navy, C.ink, 5),
        rect(x - 12, 197, 64, 20, C.grey, C.ink, 5),
      ].join("")).join(""),
      rect(300, 113, 18, 73, C.green, C.ink, 4),
      rect(328, 94, 18, 92, C.green, C.ink, 4),
      rect(356, 65, 18, 121, C.green, C.ink, 4),
      path("M292 222 H430", "none", C.ink, 7),
      path("M293 222 C332 151 371 122 432 66", "none", C.red, 8),
      circle(432, 66, 22, C.yellow),
      line(432, 66, 452, 51, C.red, 6),
      path("M48 237 H438", "none", C.ink, 5),
    ].join(""),
  },
];

for (const item of pieces) {
  const file = join(svgDir, `${item.slug}.svg`);
  writeFileSync(file, svg(item.bg, item.body()));
  execFileSync("magick", [file, "-resize", "480x270", join(pngDir, `${item.slug}.png`)], { stdio: "inherit" });
}

const sheetW = 4 * W + 5 * 16;
const sheetH = 3 * H + 4 * 16;
const args = ["-size", `${sheetW}x${sheetH}`, "xc:#f8f1e6"];
for (const [i, item] of pieces.entries()) {
  const x = 16 + (i % 4) * (W + 16);
  const y = 16 + Math.floor(i / 4) * (H + 16);
  args.push(join(pngDir, `${item.slug}.png`), "-geometry", `+${x}+${y}`, "-composite");
}
args.push(join(outDir, "contact-sheet-drawn-v2.png"));
execFileSync("magick", args, { stdio: "inherit" });

const html = `<!doctype html><meta charset="utf-8"><title>Policy thumbnails drawn v2</title>
<style>body{margin:0;background:#f8f1e6;font-family:ui-sans-serif,system-ui,sans-serif;color:#101014}main{padding:28px}h1{font-size:22px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;background:white;border:1px solid rgba(16,16,20,.16)}img{display:block;width:100%;height:auto}figcaption{padding:8px 10px 10px;font-size:12px;color:#4c4c50}</style>
<main><h1>Policy thumbnails - editorial cartoon v2</h1><div class="grid">${pieces.map((item, i) => `<figure><img src="svg/${item.slug}.svg"><figcaption>${i + 1}. ${item.slug}</figcaption></figure>`).join("")}</div></main>`;
writeFileSync(join(outDir, "preview.html"), html);

console.log(join(outDir, "contact-sheet-drawn-v2.png"));
