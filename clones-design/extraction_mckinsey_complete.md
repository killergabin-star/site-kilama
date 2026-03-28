# McKinsey — Complete Live Extraction (28 mars 2026)

## Page Dimensions
- Total height: 5977px (after lazy load)
- Viewport: 1280px
- Content max-width: 1280px
- BentoBox container: 1120px (padding 80px each side)

## Header (90px, single bar)
| Property | Value |
|----------|-------|
| Height | 90px |
| Background | transparent (overlays dark BentoBox) |
| Position | static (NOT sticky) |
| Border | NONE |
| Box-shadow | NONE |

### Header content
- Logo: "McKinsey & Company" SVG, white on dark
- Nav: Industries, Capabilities, Featured Insights, Careers, About us — 16px/300 white
- Search icon + Menu hamburger, right side

## Typography Scale
| Element | Font | Size | Weight | Color | Line-height |
|---------|------|------|--------|-------|-------------|
| Body text | McKinsey Sans | 16px | 300 | #333333 | 24px |
| Hero H2 (article) | McKinsey Sans | 44px | 300 | white | 52px |
| Bower H3 (CTA/aspirational) | Bower serif | 52px | 300 | white | — |
| Bower H2 (Careers) | Bower serif | 44px | 300 | #2251FF | — |
| Section label H2 | McKinsey Sans | 16px | 500 | white | — |
| Subsection H5 | McKinsey Sans | 24px | 500 | white | — |
| Card H6 title | McKinsey Sans | 24px | 500 | white | — |
| Podcast H3 | McKinsey Sans | 76px | 300 | white | — |
| Article label ("CASE STUDY") | McKinsey Sans | 18px | 300 | white | — |
| Intro description | McKinsey Sans | 18px | 300 | white | — |
| Footer main links | McKinsey Sans | 20px | 400 | black | — |
| Footer secondary links | McKinsey Sans | 14px | — | — | — |
| Accordion H4 | McKinsey Sans | 28px | 500 | — | — |
| Nav links | McKinsey Sans | 16px | 300 | white | — |

## CRITICAL INSIGHTS vs initial specs
| What I expected | Reality | Impact |
|----------------|---------|--------|
| Bold headlines (700) | ALL headlines weight 300 (LIGHT!) | Major |
| Bower serif for headings | Bower = CTA/aspirational only; article headings = McKinsey Sans | Major |
| Section headers prominent | Section H2 = TINY 16px/500 — same approach as Economist | Major |
| Dark footer | Footer = transparent bg, no dark section | Medium |
| CSS Grid BentoBox | 7-col × 3-row named grid with 16px gap | Confirmed |
| Sticky header | Static header, overlays dark content | Medium |

## Colors
| Token | Hex | Usage |
|-------|-----|-------|
| --navy | #051C2C | Primary bg: BentoBox, "How we help" |
| --deep-blue | #042A76 | Podcast section bg |
| --electric-blue | #2251FF | Societal impact bg, Careers CTA text |
| --light-gray | #F0F0F0 | Accordion bg |
| --white | #FFFFFF | Careers section bg, App CTA bg |
| --text-body | #333333 | Body text |
| --text-white | #FFFFFF | Text on dark sections |

## Page Sections (7 + footer)
| # | Section | Offset | Height | Background | Heading | Heading style |
|---|---------|--------|--------|------------|---------|---------------|
| 1 | BentoBox | 0px | 1389px | #051C2C | "How Campbell's..." | H2 44px/300 McKSans white |
| 2 | Podcast | 1389px | 1175px | #042A76 | "The McKinsey Podcast" | H3 76px/300 McKSans |
| 3 | How we help | 2564px | 704px | #051C2C | "How we help clients" (16px label) + Bower 52px | H2 16px/500 + H3 52px/300 Bower |
| 4 | Careers | 3332px | 367px | white | "Looking for your next move?" | H2 44px/300 Bower #2251FF |
| 5 | Societal impact | 3763px | 768px | #2251FF | "Sharing our best to help..." | H3 52px/300 Bower white |
| 6 | App CTA | 4595px | 461px | white | "...Don't just keep pace. Stay ahead." | H3 52px/300 Bower |
| 7 | Accordion | 5120px | 198px | #F0F0F0 | "Deferred Prosecution Agreement..." | H4 28px/500 McKSans |
| — | Footer | 5318px | 659px | transparent | — | — |

### Section spacing
- Sections 1-2: no gap (continuous)
- Sections 3-7: **64px margin-top** (consistent)

## BentoBox Grid (Section 1)
- Display: CSS Grid
- Columns: 7 × ~146px
- Rows: 234px, 514px, 389px
- Gap: 16px
- Padding: 156px 80px 64px
- Max-width: 1280px
- Background: #051C2C

### Grid cells (named areas)
| Cell | Size (h×w) | Content |
|------|-----------|---------|
| intro | 194×569 | "Game-changing work..." description 18px/300 |
| featured | 764×471 | Hero article H2 44px/300 + image bg |
| item2 | 514×309 | Article card with bg image |
| item3 | 402×309 | Article card with bg image |
| item4 | 341×309 | Article card with bg image |
| item5 | 445×309 | Article card with bg image |
| promo | 389×471 | CTA/promo card |

## Card Pattern
- **ZERO decoration**: no border, no border-radius (0px), no shadow
- Content padding: 24px
- Text overlays on background images (dark overlay implied)
- Labels: "ARTICLE", "REPORT", "CASE STUDY" — 18px/300 white
- Labels are written in ALL CAPS but NOT via text-transform (native case)
- Card titles: H6 24px/500 McKinsey Sans white

## Footer (659px)
- Background: transparent (no dark bg)
- 3 tiers:
  1. Logo wrapper: 124px
  2. Main links: Careers, About us, Alumni, Contact us, Global locations — 20px/400 black
  3. Secondary: Scam warning, FAQ, Privacy, Terms — 14px
- "Subscribe" H4 at 20px
- Social icons (empty text = SVG icons)

## Font Mapping
- McKinsey Sans → Inter (weight mapping: 300→300, 400→400, 500→500)
- Bower → Source Serif 4 (serif, always weight 300)

## Score: awaiting clone build
