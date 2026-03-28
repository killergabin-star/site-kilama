# Mazzucato (marianamazzucato.com) — Complete Live Extraction (28 mars 2026)

## Page Dimensions
- Total height: 7951px
- Width: 1441px
- CMS: WordPress

## Header (93px, fixed)
| Property | Value |
|----------|-------|
| Height | 93px |
| Background | transparent |
| Position | fixed |
| Border-bottom | 1px solid white (on hero), switches to dark? |
| Nav links | 18px/800 black, dropdown-based |

### Nav items
Bio and CV, Contacts, Press and photos, Institute for Innovation, All books (The Common Good Economy, The Big Con, Mission Economy, The Value of Everything, The Entrepreneurial State)

## Typography Scale
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Body | Georgia, serif | 18px | 400 | rgba(0,0,0,0.8) |
| Section heading (Academic/Advisor/Communicator) | **Poppins** | 26px | 600 | **#FF6666** (coral) |
| Publication H3 | -apple-system (system) | 30px | 700 | **#FF6666** (coral) |
| Publication H4 (subtitle) | -apple-system (system) | 15px | 400 | #333 |
| Quote | **Poppins** | 40px | — | white |
| Quote attribution | **Nunito Sans** | 18px | — | **#FF6666** (coral) |
| Nav links | system font | 18px | 800 | black |
| Featured text | — | 18px | — | #FF6666 |
| Footer links | — | 14px | — | white |

## CRITICAL INSIGHTS
| Expected | Reality | Impact |
|----------|---------|--------|
| Serif for headings | Poppins (sans) for section headings, system font for H3 | Major |
| Georgia everywhere | Georgia = body only; Poppins, Nunito Sans, system font for UI | Major |
| Academic/professional look | **Personal brand** — hero with portrait, coral accent throughout | Major |
| Standard dark header | Transparent header overlaying hero portrait | Medium |
| Single accent color | #FF6666 (coral) is THE signature — headings, links, attributions | Major |

## Colors
| Token | Hex | Usage |
|-------|-----|-------|
| --coral | #FF6666 | Section headings, publication titles, quote attributions, links |
| --dark-blue | #023259 | Featured section bg |
| --body-text | rgba(0,0,0,0.8) | Body text |
| --text-dark | #333 | Subtitles, secondary text |
| --footer-bg | #333333 | Footer |
| --white | #FFFFFF | Card backgrounds, footer text |
| --gray-bg | #C4C4C4 | Video placeholder |

## Page Sections (offsets)
| # | Section | Offset | Height | Background | Content |
|---|---------|--------|--------|------------|---------|
| 1 | Hero/Header | 0px | 760px | bg-image (portrait) | Large portrait photo, transparent nav overlay |
| 2 | Publications carousel | ~820px | ~270px | transparent | H3 30px/700 coral titles, H4 15px/400 subtitles |
| 3 | Featured book | 1097px | 243px | #023259 (dark blue) | Book promotion, "UK edition" coral text |
| 4 | Academic | 1340px | 467px | white | H "Academic" 26px/600 Poppins coral + quote 40px Poppins white + "Quartz" attribution |
| 5 | Advisory work | ~1800px | ~400px | varies | Related to her policy advisory roles |
| 6 | Advisor | 2492px | 439px | white | H "Advisor" 26px/600 Poppins coral + quote |
| 7 | Books section | ~3000px | — | — | Book covers, horizontal scroll |
| 8 | Communicator | 3824px | 456px | white | H "Communicator" + video embed (gray bg) |
| 9 | More content | ~4300px-7600px | — | — | Additional publications, talks, policy work |
| — | Footer | ~7672px | 279px | #333 | Links: About, Books, Research, Policy, Media, Talks, etc. |

## Hero
- Background image: portrait photo (background-top-image-1.png)
- Height: 760px
- Full-width, cover
- Header overlays with transparent bg + white border

## Quote Pattern
- Large serif-style: **Poppins 40px** (not Georgia!)
- White text on colored bg
- Attribution: Nunito Sans 18px, coral #FF6666
- Example: "One of the world's most influential economists... on a mission to save capitalism" — Quartz

## Publication Carousel
- Horizontal scrolling
- 105+ items (publications, reports, papers)
- Each item: H3 30px/700 coral + H4 15px/400 gray
- Categories: WHO Council, UCL IIPP, G20, UN DESA, etc.

## Footer (279px)
- Background: #333333 (dark gray)
- White text
- Links (14px white): About Mariana, Books, Research, Policy, Media, Talks
- Sub-links: Journal articles, Working papers, Policy papers

## Font Mapping
- Poppins → Inter (500-700 weight range)
- Nunito Sans → Inter (400 weight)
- Georgia → Source Serif 4 (body text)
- System font → Inter

## Key Design DNA
1. **Personal brand** — her portrait IS the hero, not an abstract graphic
2. **Coral #FF6666** is THE color — used for ALL headings, links, and accents
3. **Three pillars**: Academic / Advisor / Communicator — each with quote + attribution
4. **Publications-first**: massive carousel (105+ items) near top
5. **Minimal chrome**: very little UI decoration, content-forward
6. **Serif body + Sans headings**: reverse of Economist pattern

## Score: awaiting clone build
