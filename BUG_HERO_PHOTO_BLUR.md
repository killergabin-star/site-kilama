# BUG: Hero Photo Blur Artifact

## Status: OPEN — Priority: P2 (cosmetic, live with defect)

## Problem
The homepage hero photo has a visible blur/haze artifact at the edges (particularly where the figure meets the white background). The same photo renders sharply in the standalone test HTML file (`clones-design/site_homepage_kilama_test_mazzucato.html`).

## Root Cause Analysis

Two differences identified between the working test file and the Hugo layout:

### 1. Different Image File
| | Test (sharp) | Hugo (blurry) |
|---|---|---|
| File | `clones-design/avatar_kilama.png` | `themes/kilama/static/images/avatar_kilama_hero.png` |
| Size | 7.4 MB | 5.9 MB |
| Source | Original high-res | Likely reprocessed/compressed |

The Hugo version is 1.5 MB smaller — possible lossy recompression that degrades edge sharpness under the CSS grayscale+brightness filter stack.

### 2. Missing SVG Grain Texture Overlay
The test file has a `::after` pseudo-element on `.hero` that applies a subtle fractal noise texture:

```css
/* Subtle grain texture */
.hero::after {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
    z-index: 2;
    pointer-events: none;
}
```

This grain overlay (opacity 0.04) masks compression artifacts and edge aliasing by adding uniform visual noise — a common technique in web photography.

The Hugo version has NO such overlay. A gradient overlay was attempted (`cd476b7`) but made things worse and was reverted (`68683dd`).

### CSS Filter Stack (identical in both)
```css
filter: grayscale(1) brightness(1.15) contrast(1.05);
```

The brightness boost (1.15) amplifies any edge artifacts in the source image. The grain texture compensates for this in the test file.

## Fix Plan

### Fix A: Replace Image (test first)
Copy the high-res `avatar_kilama.png` (7.4 MB) to Hugo static:
```bash
cp "clones-design/avatar_kilama.png" "themes/kilama/static/images/avatar_kilama_hero.png"
```
Risk: larger page load (+1.5 MB). May need to optimize with `cwebp` or resize.

### Fix B: Add Grain Texture Overlay
Add the SVG noise `::after` to `.hero-home.hero` in `style.css` or `index.html`:
```css
.hero-home.hero::after {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,...");
    z-index: 2;
    pointer-events: none;
}
```
Risk: low — purely additive, non-destructive.

### Recommended: Apply both A + B, then compare

## Attempted Fixes (failed)
1. **ImageMagick flood fill** — `-fuzz 15%` ate into white shirt; `-fuzz 20% -opaque` hit face. Abandoned.
2. **CSS gradient overlay** (`cd476b7`) — white-to-transparent gradients on edges. Made blur WORSE by adding visible banding. Reverted in `68683dd`.

## Reproduction
- Open `http://localhost:1313/` (Hugo dev server) → observe hero photo edges
- Open `clones-design/site_homepage_kilama_test_mazzucato.html` in browser → sharp rendering
- Both use the same CSS filter stack, different image files

## Files
- `themes/kilama/static/images/avatar_kilama_hero.png` (5.9 MB) — current Hugo image
- `clones-design/avatar_kilama.png` (7.4 MB) — working test image
- `clones-design/site_homepage_kilama_test_mazzucato.html` — reference test page
- `themes/kilama/layouts/index.html` — Hugo homepage layout
- `themes/kilama/static/css/style.css` — global styles
