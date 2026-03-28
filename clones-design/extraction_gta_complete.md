# GTA (Global Trade Alert) — Complete Live Extraction (28 mars 2026)

## Page Dimensions
- Total height: 4702px
- Width: 1435px
- Framework: Nuxt (Vue.js), Tailwind CSS

## Header (56px, fixed)
| Property | Value |
|----------|-------|
| Height | 56px |
| Background | white |
| Position | fixed |
| Shadow | shadow-lg |
| Logo | img 240×37px (logo_light.svg) |

## Typography Scale
| Element | Font | Size | Weight | Color | Line-height |
|---------|------|------|--------|-------|-------------|
| Body | Roboto | 14px | 400 | #676767 | 14px |
| H1 (hero) | Roboto | 30px | 500 | white | 41px |
| H2 (section title) | Roboto | 26px | 500 | #0B263D | 36px |
| H2 (on dark) | Roboto | 26px | 500 | white | 36px |
| H2 ("Explore") | Roboto | 30px | 400 | white | 30px |
| H3 (featured dark) | Roboto | 26px | 500 | white | 36px |
| H3 (card links) | Roboto | 16px | 500 | #3B97ED | 22px |
| H3 (dark section) | Roboto | 24px | 500 | white | 33px |
| H3 (explore cards) | Roboto | 20px | 500 | white | 28px |
| H3 (data label) | Roboto | 16px | 500 | #0B263D | 22px |
| Footer product links | Roboto | 16px | — | #F9F9F9 | — |
| Footer social | Roboto | 14px | — | #F9F9F9 | — |
| "Subscribe" | Roboto | 14px | — | #FFBA24 (gold) | — |
| Chart buttons | Roboto | 11px | — | white/#7DC3F8 | — |

## Colors
| Token | Hex | Usage |
|-------|-----|-------|
| --primary-blue | #3B97ED | Card titles, links |
| --light-blue | #7DC3F8 | Active chart toggle buttons |
| --light-blue-bg | #F0F6FD | Inactive chart toggle buttons |
| --navy-text | #0B263D | Section H2 text (light bg) |
| --hero-overlay | #21303E | Hero banner bg overlay |
| --slate | #2B4661 | Trust section bg, Explore section bg |
| --dark-card | #202E3B | Evidence cards bg |
| --footer-bg | #182029 | Footer |
| --white | #FFFFFF | Header, card bg |
| --gray-text | #676767 | Body text |
| --gold | #FFBA24 | Subscribe link accent |

## Page Sections (8 + footer)
| # | Section | Offset | Height | Background | Key content |
|---|---------|--------|--------|------------|-------------|
| 1 | Hero Banner | 0px | 434px (in 777px container) | bg-image + #21303E | H1 30px/500 "World's Trade..." |
| 2 | Featured/Blog | 323px | 614px | transparent (cards over hero) | Outreach cards, -75px neg margin |
| 3 | Latest updates | 937px | 374px | white | H2 26px/500, card list |
| 4 | Analyse Data | 1311px | 858px | white | H2 "Analyse our Data", SVG charts, Graph/Table toggles |
| 5 | Trust | 2169px | 680px | #2B4661 | H2 "Trusted by..." |
| 6 | Partner logos | 2399px | 450px | (within trust) | Logo grid |
| 7 | Explore Evidence | 2849px | 1219px | #2B4661 | H2 30px/400, 4 evidence cards |
| 8 | Footer | 4068px | 633px | #182029 | Product links, social, subscribe |

## Card Patterns
### Outreach cards (featured analysis)
- Size: 142×388px
- Background: white
- Border-radius: **10px** (unlike Economist/McKinsey = 0px)
- Layout: horizontal (icon left + text right)
- Inner structure: gray bg areas, icon + label + title

### Evidence cards
- Size: 91×578px (wide rectangular)
- Background: #202E3B
- Border-radius: 5px
- White text, product names (Data Center, GTA Threads, API Access, etc.)

### Chart toggle buttons
- Size: 26×64px
- Active: bg #7DC3F8, white text, 11px
- Inactive: bg #F0F6FD, #7DC3F8 text, 11px
- Border-radius: 3px
- Options: Graph | Table | Export

## Hero Banner
- Background image: landing-banner.jpg (cover)
- Overlay color: #21303E (dark blue-gray)
- Padding-top: 170-200px (space for fixed header)
- H1: "The World's Trade and Industrial Policy Watchdog" — centered, 30px/500 white

## Footer (633px)
- Background: #182029 (very dark)
- Social links: Contact, X, Bluesky, Linkedin — 14px, #F9F9F9
- Subscribe link: 14px, **#FFBA24** (gold accent)
- Product links (16px, #F9F9F9): Data Center, Activity Tracker, Analysis, Notification Service, Threads, API Access, MCP Integration, Methodology, About Us

## Key Insights
1. Data-heavy site: SVG charts embedded, interactive Graph/Table/Export toggles
2. Cards have ROUNDED corners (10px, 5px) — UNLIKE Economist/McKinsey (0px)
3. Hero uses negative margin overlap (blog section -75px margin-top)
4. Monochrome blue palette from dark navy to electric blue with gold accent
5. Section spacing via padding (80px) not margin
6. Trust section with partner logos = credibility element
7. Tailwind + Nuxt (utility-first CSS, Vue.js)

## Font Mapping
- Roboto → Inter (closest sans-serif)

## Score: awaiting clone build
