# Economist — Complete Live Extraction (28 mars 2026)

## Page Dimensions
- Total height: 8356px
- Viewport: 1280px
- Content max-width: 1432px
- Dividers: 39 horizontal rules

## Header (162px total, 3 bars)
| Bar | Height | Bg | Border-bottom |
|-----|--------|----|---------------|
| Bar 1 (sticky nav) | 57px | white | 1px solid #595959 |
| Bar 2 (logo/menu) | ~80px area, within 121px | white | 1px solid #0D0D0D |
| Bar 3 (quick-links) | 41px | white | 1px solid #D9D9D9 |

### Bar 1 content
- Logo: 190x22px, left
- Nav: "● Insider" (20px/400 red dot), "For you" (20px/400), "My account", "Menu"

### Bar 3 content (quick-links)
All 17px/400 EconomistSans, dark:
Weekly edition | World in brief | United States | China | Business | Finance & economics | Europe | Asia | Middle East | Americas | Artificial intelligence | Culture | Cartoons & games

## Typography Scale (CORRECTED from initial guess)
| Element | Font | Size | Weight | Color | Transform |
|---------|------|------|--------|-------|-----------|
| Body text | EconomistSerif | 17px | 400 | #0D0D0D | none |
| Hero headline (H3) | EconomistSerif | 34px | 400 | #0D0D0D | none |
| Secondary headline | EconomistSerif | 23px | 400 | #0D0D0D | none |
| Small article headline | EconomistSerif | 17px | 500 | #0D0D0D | none |
| Section-level article | EconomistSerif | 20px | 500 | #0D0D0D | none |
| **Section H2** | EconomistSans | **20px** | **700** | #0D0D0D | none |
| **Fly-title (category)** | EconomistSans | **15px** | **400** | **#E3120B** | **none (lowercase!)** |
| Insider featured | EconomistSerifDisplay | 40px | 500 | white | none |
| Weekly Edition label | EconomistSans | 15px | 400 | #0D0D0D | lowercase |
| Nav main (bar 1) | EconomistSans | 20px | 400 | #0D0D0D | none |
| Nav quick-links (bar 3) | EconomistSans | 17px | 400 | #0D0D0D | none |
| Footer links | - | 17px | - | white | none |

## CRITICAL CORRECTIONS vs initial specs
| What I guessed | Reality | Impact |
|----------------|---------|--------|
| Section labels 12-14px uppercase red | Fly-titles 15px/400 **lowercase** red | Major |
| Headings 28-44px serif bold | Hero 34px/400, secondary 23px/400 — **NOT bold** | Major |
| Section H2 large red | H2 = 20px/700 **dark** sans — **NOT red, SMALL** | Major |
| Dense editorial grids | Single column dominant, max 383px card grid | Medium |
| Dark utility bar | All 3 bars are **white** | Medium |

## Section Structure (offset from top)
1. Top Stories (497px, 968px) — hero + side articles
2. Insider (1521px, margin-top 56px) — H2 20px/700 sans dark
3. Insider dark (1578px, 326px, bg #0D0D0D) — 40px/500 serif white
4. World news (2071px, margin-top 56px)
5. Latest videos (2515px, margin-top 56px) — horizontal scroll
6. Business, finance and economics (3018px, margin-top 56px)
7. [Ad] (3462px, 153px)
8. America at 250 (3671px) — thematic section
9. Other highlights (4431px)
10. Featured story (4875px, margin-top 56px)
11. Graphic detail (5178px)
12. Our primers on liberalism (5568px)
13. [Ad] (5951px)
14. Weekly Edition (6160px) — 15px/400 lowercase label
15. Footer (bg #1A1A1A, 567px)

## Card Pattern
- **ZERO decoration**: no border, no border-radius, no shadow, no padding
- Image-top: 16:9 ratio
- Red fly-title: "Briefing", "Business" etc — 15px/400 red
- Serif headline: size varies by importance
- Horizontal variant: 128x72px image left + text right

## Colors
- --ds-color-economist-red: #E3120B (fly-titles ONLY)
- --ds-color-london-5: #0D0D0D (dark text/borders)
- Footer bg: #1A1A1A
- Insider bg: #0D0D0D
- Border light: #D9D9D9
- Border medium: #595959

## Key Spacing
- Section margin-top: 56px (consistent)
- Card grid gap: 32px
- Card body padding-top: 8px

## Font Mapping
- EconomistSerif / EconomistSerifDisplay → Source Serif 4
- EconomistSans → Inter

## Score: 8.6/10 (86/100)
