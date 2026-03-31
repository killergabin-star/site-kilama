// ============================================================
// FPSQ INDICATOR DATABASE — Regime-Aware Data Engine
// ============================================================

// Historical events that affect multiple indicators simultaneously
// Each event: { start: 'YYYY-MM-DD', peak: 'YYYY-MM-DD', end: 'YYYY-MM-DD', effects: {} }
var GLOBAL_EVENTS = [
  { id: 'covid', start: '2020-03-01', peak: '2020-04-15', end: '2020-09-01',
    label: 'COVID-19 pandemic' },
  { id: 'vaccine', start: '2020-12-01', peak: '2021-03-01', end: '2021-06-01',
    label: 'Vaccine rollout recovery' },
  { id: 'inflation', start: '2021-09-01', peak: '2022-06-15', end: '2023-06-01',
    label: 'Inflation surge & rate hikes' },
  { id: 'ukraine', start: '2022-02-24', peak: '2022-03-15', end: '2022-08-01',
    label: 'Russia invades Ukraine' },
  { id: 'truss', start: '2022-09-23', peak: '2022-10-05', end: '2022-11-15',
    label: 'UK mini-budget crisis (Truss)' },
  { id: 'bank23', start: '2023-03-10', peak: '2023-03-15', end: '2023-04-15',
    label: 'SVB / banking stress' },
  { id: 'gaza', start: '2023-10-07', peak: '2023-10-20', end: '2024-01-15',
    label: 'Gaza conflict escalation' },
  { id: 'france24', start: '2024-06-09', peak: '2024-06-15', end: '2024-08-01',
    label: 'French snap election' },
  { id: 'trump25', start: '2025-01-20', peak: '2025-04-01', end: '2025-12-31',
    label: 'Trump tariffs / trade war 2.0' },
  { id: 'hormuz', start: '2025-10-15', peak: '2025-11-01', end: '2026-01-15',
    label: 'Hormuz strait tensions' }
];

// Event impact by indicator × country (multiplier applied during event window)
// format: { event_id: { country: amplitude } }
var EVENT_IMPACTS = {
  'sovereign-spreads': {
    covid:    { France: 25, Italy: 80, Spain: 45, Greece: 65, Portugal: 35, Belgium: 15, Austria: 12 },
    ukraine:  { France: 12, Italy: 35, Spain: 18, Greece: 22, Portugal: 14, Belgium: 8, Austria: 10 },
    truss:    { France: 5, Italy: 15, Spain: 8, Greece: 10, Portugal: 6, Belgium: 3, Austria: 2 },
    bank23:   { France: 8, Italy: 20, Spain: 12, Greece: 15, Portugal: 10, Belgium: 5, Austria: 4 },
    france24: { France: 30, Italy: 12, Spain: 8, Greece: 6, Portugal: 5, Belgium: 10, Austria: 3 },
    trump25:  { France: 10, Italy: 25, Spain: 15, Greece: 18, Portugal: 12, Belgium: 6, Austria: 5 },
    hormuz:   { France: 8, Italy: 20, Spain: 12, Greece: 15, Portugal: 8, Belgium: 5, Austria: 4 }
  },
  'cds-spreads': {
    covid:    { France: 12, Italy: 55, Spain: 30, 'United Kingdom': 10, 'United States': 5, Japan: 8 },
    ukraine:  { France: 8, Italy: 25, Spain: 12, 'United Kingdom': 5, 'United States': 3, Japan: 4 },
    bank23:   { France: 5, Italy: 15, Spain: 8, 'United Kingdom': 4, 'United States': 8, Japan: 3 },
    france24: { France: 18, Italy: 8, Spain: 5, 'United Kingdom': 2, 'United States': 1, Japan: 1 },
    trump25:  { France: 6, Italy: 18, Spain: 10, 'United Kingdom': 4, 'United States': 2, Japan: 5 }
  },
  'gpr-index': {
    covid:    { Global: 40, 'United States': 30, China: 50, Russia: 20, 'Middle East': 15, Europe: 35 },
    ukraine:  { Global: 200, 'United States': 80, China: 40, Russia: 350, 'Middle East': 30, Europe: 180 },
    gaza:     { Global: 60, 'United States': 40, China: 10, Russia: 15, 'Middle East': 200, Europe: 45 },
    trump25:  { Global: 45, 'United States': 80, China: 60, Russia: 20, 'Middle East': 25, Europe: 30 },
    hormuz:   { Global: 55, 'United States': 35, China: 30, Russia: 15, 'Middle East': 180, Europe: 40 }
  },
  'trade-uncertainty': {
    covid:    { Global: 60, 'United States': 80, China: 90, EU: 50, Japan: 40 },
    ukraine:  { Global: 40, 'United States': 25, China: 20, EU: 55, Japan: 30 },
    trump25:  { Global: 180, 'United States': 280, China: 320, EU: 140, Japan: 120 },
    hormuz:   { Global: 35, 'United States': 30, China: 40, EU: 45, Japan: 35 }
  },
  'economic-sentiment': {
    // TARGET SHIFT amplitudes: represent σ-unit deviation from baseline (not daily increments)
    // Calibrated so baseline + event ≤ ±3σ for all countries
    covid:    { France: -2.2, Germany: -2.0, 'United States': -1.8, China: -2.5, 'United Kingdom': -1.8, Italy: -2.4, Japan: -1.2, Canada: -1.5, Australia: -1.2, Spain: -2.2,
                Poland: -1.2, Hungary: -1.5, Turkey: -1.5, Russia: -1.8, Brazil: -1.8, Mexico: -1.5, Argentina: -2.0, India: -1.0, Indonesia: -0.8, 'South Africa': -1.5, Nigeria: -1.2 },
    vaccine:  { France: 1.5, Germany: 1.2, 'United States': 1.8, China: 1.0, 'United Kingdom': 1.6, Italy: 1.2, Japan: 0.8, Canada: 1.4, Australia: 1.2, Spain: 1.1,
                Poland: 0.8, Hungary: 0.6, Turkey: 0.5, Russia: 0.3, Brazil: 1.0, Mexico: 0.8, India: 1.2, Indonesia: 0.8, 'South Africa': 0.6 },
    ukraine:  { France: -0.8, Germany: -1.2, 'United States': -0.4, China: -0.3, 'United Kingdom': -0.6, Italy: -1.0, Japan: -0.3, Canada: -0.4, Spain: -0.7,
                Poland: -1.8, Hungary: -1.8, Turkey: -1.0, Russia: -2.0, Ukraine: -2.5, 'Czech Republic': -1.4, Romania: -1.2, Morocco: -0.4, Egypt: -0.6, India: -0.2, 'South Korea': -0.4 },
    inflation:{ France: -0.6, Germany: -0.8, 'United States': -0.5, China: -0.4, 'United Kingdom': -1.0, Italy: -0.8, Japan: -0.3, Canada: -0.5, Spain: -0.7,
                Poland: -1.0, Hungary: -1.2, Turkey: -1.8, Argentina: -1.5, Brazil: -0.5, Egypt: -1.0, Pakistan: -1.2, Nigeria: -1.0, Ghana: -0.8 },
    gaza:     { Israel: -2.5, Iran: -1.0, Egypt: -0.7, 'Saudi Arabia': -0.4, UAE: -0.3, Turkey: -0.5, France: -0.2, Germany: -0.2, 'United States': -0.3, 'United Kingdom': -0.2 },
    trump25:  { France: -0.5, Germany: -0.6, 'United States': 0.4, China: 1.8, 'United Kingdom': -0.3, Italy: -0.6, Japan: -0.4, Canada: -0.8, Australia: -0.3,
                'South Korea': -0.8, Mexico: -1.4, Brazil: -0.4, India: 0.2, Indonesia: -0.2, Vietnam: -0.6, Poland: -0.4, Hungary: -1.0, Turkey: -0.8,
                'South Africa': -0.3, Nigeria: -0.2, Morocco: -0.3, Argentina: -0.6, Colombia: -0.4, Chile: -0.4 },
    hormuz:   { Iran: -2.0, 'Saudi Arabia': -1.0, UAE: -0.8, Israel: -0.5, Egypt: -0.4, India: -0.4, China: -0.2, Japan: -0.3, 'South Korea': -0.3, France: -0.15, Germany: -0.2 }
  },
  'fiscal-stress': {
    covid:    { France: 1.2, Germany: 0.5, 'United States': 0.8, Italy: 1.8, 'United Kingdom': 0.9, Japan: 0.6, Canada: 0.5 },
    inflation:{ France: 0.4, Germany: 0.2, 'United States': 0.5, Italy: 0.6, 'United Kingdom': 0.7, Japan: 0.15, Canada: 0.3 },
    ukraine:  { France: 0.3, Germany: 0.4, 'United States': 0.1, Italy: 0.5, 'United Kingdom': 0.2, Japan: 0.1, Canada: 0.1 },
    france24: { France: 0.8, Germany: 0.05, 'United States': 0, Italy: 0.15, 'United Kingdom': 0.05, Japan: 0, Canada: 0 },
    trump25:  { France: 0.3, Germany: 0.15, 'United States': 0.6, Italy: 0.4, 'United Kingdom': 0.2, Japan: 0.25, Canada: 0.35 }
  },
  'debt-sustainability': {
    covid:    { France: 15, Germany: 8, Italy: 20, Japan: 12, 'United States': 18, 'United Kingdom': 14, Canada: 10 },
    inflation:{ France: -3, Germany: -5, Italy: -2, Japan: -1, 'United States': -4, 'United Kingdom': -3, Canada: -4 },
    france24: { France: 8, Germany: 0, Italy: 2, Japan: 0, 'United States': 0, 'United Kingdom': 0, Canada: 0 },
    trump25:  { France: 3, Germany: 1, Italy: 5, Japan: 2, 'United States': 6, 'United Kingdom': 2, Canada: 3 }
  },
  'yield-curve': {
    covid:    { Germany: -0.3, France: -0.35, 'United States': -0.5, 'United Kingdom': -0.4, Japan: -0.15 },
    inflation:{ Germany: -0.8, France: -0.9, 'United States': -1.4, 'United Kingdom': -1.1, Japan: -0.3 },
    bank23:   { Germany: 0.15, France: 0.12, 'United States': 0.2, 'United Kingdom': 0.1, Japan: 0.05 }
  },
  'interest-growth': {
    covid:    { France: -1.5, Germany: -1.0, Italy: -1.8, Spain: -1.4, 'United Kingdom': -1.2, Japan: -0.5 },
    inflation:{ France: 1.8, Germany: 1.2, Italy: 2.2, Spain: 1.6, 'United Kingdom': 2.0, Japan: 0.8 },
    trump25:  { France: 0.3, Germany: 0.15, Italy: 0.5, Spain: 0.25, 'United Kingdom': 0.2, Japan: 0.1 }
  },
  'primary-balance': {
    covid:    { France: -5.5, Germany: -3.5, Italy: -6.0, Spain: -5.0, Japan: -4.5, 'United States': -8.0 },
    vaccine:  { France: 2.5, Germany: 2.0, Italy: 2.8, Spain: 2.2, Japan: 1.5, 'United States': 3.5 },
    inflation:{ France: 0.8, Germany: 1.0, Italy: 0.6, Spain: 0.7, Japan: 0.3, 'United States': 1.2 },
    trump25:  { France: -0.4, Germany: -0.2, Italy: -0.5, Spain: -0.3, Japan: -0.3, 'United States': -0.8 }
  }
};

var FPSQ_INDICATORS = [
  {
    id: 'fiscal-stress', group: 'Fiscal Stress',
    name: 'Fiscal Stress Index', badge: 'live',
    desc: 'Composite index of fiscal vulnerability across G7 economies. Combines debt dynamics, primary balance gap, and market signals.',
    source: 'FPSQ Pipeline v1.4.0 · ECB SDW, IMF WEO',
    countries: ['France','Germany','United States','Italy','United Kingdom','Japan','Canada'],
    colors: ['#0073e6','#46AF61','#C48A00','#E86850','#9B6DC8','#E8A848','#4AAA6A'],
    // Structural levels per country (pre-COVID baseline, early 2020)
    levels: { France: 0.3, Germany: -0.5, 'United States': 0.5, Italy: 1.0, 'United Kingdom': 0.1, Japan: 0.6, Canada: -0.2 },
    vol: { France: 0.18, Germany: 0.12, 'United States': 0.20, Italy: 0.28, 'United Kingdom': 0.18, Japan: 0.12, Canada: 0.12 },
    meanRevert: 0.05, // Target-shift model: higher MR tracks event targets
    unit: 'σ', riskZones: true
  },
  {
    id: 'debt-sustainability', group: 'Fiscal Stress',
    name: 'Debt Sustainability Score', badge: 'updated',
    desc: 'Probability-weighted debt trajectory score under 5 FPSQ scenarios. Higher values indicate deteriorating sustainability.',
    source: 'FPSQ Scenario Engine · IMF DSA Framework',
    countries: ['France','Germany','Italy','Japan','United States','United Kingdom','Canada'],
    colors: ['#0073e6','#46AF61','#E86850','#E8A848','#C48A00','#9B6DC8','#4AAA6A'],
    levels: { France: 42, Germany: 28, Italy: 68, Japan: 75, 'United States': 48, 'United Kingdom': 38, Canada: 25 },
    vol: { France: 0.4, Germany: 0.25, Italy: 0.6, Japan: 0.35, 'United States': 0.5, 'United Kingdom': 0.35, Canada: 0.25 },
    meanRevert: 0.03, // Target-shift model: track debt score changes
    unit: '/100', riskZones: false
  },
  {
    id: 'primary-balance', group: 'Fiscal Stress',
    name: 'Primary Balance Gap', badge: 'updated',
    desc: 'Distance between actual primary balance and debt-stabilizing level. Positive = above stabilizing, negative = below.',
    source: 'ECB SDW · AMECO · FPSQ computation',
    countries: ['France','Germany','Italy','Spain','Japan','United States'],
    colors: ['#0073e6','#46AF61','#E86850','#E8A848','#C48A00','#9B6DC8'],
    levels: { France: -1.8, Germany: 1.2, Italy: -0.5, Spain: -2.0, Japan: -3.5, 'United States': -3.8 },
    vol: { France: 0.15, Germany: 0.12, Italy: 0.18, Spain: 0.15, Japan: 0.12, 'United States': 0.2 },
    meanRevert: 0.03, // Target-shift model: track fiscal balance changes
    unit: '% GDP', riskZones: false
  },
  {
    id: 'interest-growth', group: 'Fiscal Stress',
    name: 'Interest-Growth Differential (r-g)', badge: 'updated',
    desc: 'Implicit interest rate on government debt minus nominal GDP growth. Positive = debt ratio rises mechanically.',
    source: 'ECB SDW · Eurostat · FPSQ computation',
    countries: ['France','Germany','Italy','Spain','United Kingdom','Japan'],
    colors: ['#0073e6','#46AF61','#E86850','#E8A848','#9B6DC8','#C48A00'],
    levels: { France: -0.8, Germany: -1.2, Italy: 0.2, Spain: -0.5, 'United Kingdom': -0.6, Japan: 0.8 },
    vol: { France: 0.08, Germany: 0.06, Italy: 0.10, Spain: 0.08, 'United Kingdom': 0.08, Japan: 0.05 },
    meanRevert: 0.03, // Target-shift model: track r-g dynamics
    unit: 'pp', riskZones: false
  },
  {
    id: 'sovereign-spreads', group: 'Market Stress',
    name: 'Sovereign Spreads vs. Bund', badge: 'live',
    desc: '10-year government bond yield spread versus Germany. Key market indicator of country-specific fiscal risk.',
    source: 'ECB SDW · Bloomberg via FPSQ',
    countries: ['France','Italy','Spain','Greece','Portugal','Belgium','Austria'],
    colors: ['#5BA8E6','#E86850','#E8A848','#9B6DC8','#4AAA6A','#C48A00','#7DC3F8'],
    levels: { France: 32, Italy: 135, Spain: 68, Greece: 145, Portugal: 55, Belgium: 28, Austria: 18 },
    vol: { France: 2.5, Italy: 6, Spain: 3.5, Greece: 5, Portugal: 3, Belgium: 1.5, Austria: 1.2 },
    meanRevert: 0.02,
    unit: 'bp', riskZones: false
  },
  {
    id: 'cds-spreads', group: 'Market Stress',
    name: 'CDS Spreads (5Y)', badge: 'live',
    desc: '5-year sovereign credit default swap spreads. Pure market assessment of default probability.',
    source: 'Bloomberg · Markit via FPSQ',
    countries: ['France','Italy','Spain','United Kingdom','United States','Japan'],
    colors: ['#0073e6','#E86850','#E8A848','#9B6DC8','#C48A00','#4AAA6A'],
    levels: { France: 18, Italy: 65, Spain: 32, 'United Kingdom': 15, 'United States': 10, Japan: 22 },
    vol: { France: 1.5, Italy: 4, Spain: 2.5, 'United Kingdom': 1.2, 'United States': 0.8, Japan: 1.2 },
    meanRevert: 0.025,
    unit: 'bp', riskZones: false
  },
  {
    id: 'yield-curve', group: 'Market Stress',
    name: 'Yield Curve Slope (10Y-2Y)', badge: 'updated',
    desc: 'Spread between 10Y and 2Y sovereign yields. Inversion (negative) historically signals recession risk.',
    source: 'ECB SDW · Fed FRED · FPSQ',
    countries: ['Germany','France','United States','United Kingdom','Japan'],
    colors: ['#46AF61','#0073e6','#C48A00','#9B6DC8','#E8A848'],
    levels: { Germany: 0.55, France: 0.60, 'United States': 0.80, 'United Kingdom': 0.65, Japan: 0.20 },
    vol: { Germany: 0.04, France: 0.04, 'United States': 0.06, 'United Kingdom': 0.05, Japan: 0.02 },
    meanRevert: 0.03, // Target-shift model: track curve dynamics
    unit: 'pp', riskZones: false
  },
  {
    id: 'gpr-index', group: 'Geopolitical',
    name: 'Geopolitical Risk Index', badge: 'live',
    desc: 'Caldara & Iacoviello (2022) index based on newspaper articles. Spikes during geopolitical events (wars, crises, tensions).',
    source: 'Caldara & Iacoviello · matteoiacoviello.com/gpr.htm',
    countries: ['Global','United States','China','Russia','Middle East','Europe'],
    colors: ['#0073e6','#C48A00','#E86850','#AA3377','#E8A848','#46AF61'],
    levels: { Global: 95, 'United States': 80, China: 110, Russia: 140, 'Middle East': 120, Europe: 75 },
    vol: { Global: 5, 'United States': 4, China: 7, Russia: 10, 'Middle East': 8, Europe: 3.5 },
    meanRevert: 0.03,
    unit: 'index', riskZones: false
  },
  {
    id: 'trade-uncertainty', group: 'Geopolitical',
    name: 'Trade Policy Uncertainty', badge: 'live',
    desc: 'Baker, Bloom & Davis (2016) index. Captures newspaper coverage of trade uncertainty. Explosive post-tariffs.',
    source: 'Baker, Bloom & Davis · policyuncertainty.com',
    countries: ['Global','United States','China','EU','Japan'],
    colors: ['#0073e6','#C48A00','#E86850','#46AF61','#E8A848'],
    levels: { Global: 80, 'United States': 95, China: 85, EU: 60, Japan: 50 },
    vol: { Global: 3.5, 'United States': 5, China: 5.5, EU: 2.5, Japan: 2 },
    meanRevert: 0.02,
    unit: 'index', riskZones: false
  },
  {
    id: 'economic-sentiment', group: 'Geopolitical',
    name: 'Economic Sentiment (GDELT)', badge: 'updated',
    desc: 'Sentiment from GDELT media analysis. Tone × relative coverage, 28-day WMA, normalized by country history (2017–present). Positive = better perception, negative = worse.',
    source: 'GDELT via FPSQ',
    countries: [
      // Developed Markets (visible by default: first 3)
      'France','Germany','United States','United Kingdom','Italy','Spain','Japan','Canada','Australia',
      'Netherlands','Belgium','Austria','Ireland','Portugal','Greece','Norway','Sweden','Finland','Switzerland','South Korea',
      // EM Europe & CIS
      'Poland','Hungary','Romania','Turkey','Russia','Ukraine','Czech Republic',
      // N.Africa & Middle East
      'Morocco','Egypt','Israel','Saudi Arabia','UAE','Iran',
      // Latin America
      'Brazil','Mexico','Argentina','Colombia','Chile',
      // Asia & Pacific
      'China','India','Indonesia','Thailand','Vietnam','Philippines','Pakistan',
      // Sub-Saharan Africa
      'South Africa','Nigeria','Kenya','Ghana','Senegal'
    ],
    colors: [
      // 6-color cycle: Blue, Red, Green, Gold, Purple, Amber — Institutional Intelligence v3
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848',
      '#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848'
    ],
    levels: {
      // Structural baselines: positive = healthy media perception, negative = stressed
      France: 0.2, Germany: 0.4, 'United States': 0.3, 'United Kingdom': 0.2, Italy: -0.2, Spain: 0.1, Japan: 0.3, Canada: 0.2, Australia: 0.2,
      Netherlands: 0.3, Belgium: 0.1, Austria: 0.3, Ireland: 0.2, Portugal: -0.1, Greece: -0.5, Norway: 0.5, Sweden: 0.4, Finland: 0.3, Switzerland: 0.6, 'South Korea': 0.1,
      Poland: -0.2, Hungary: -0.5, Romania: -0.3, Turkey: -0.8, Russia: -1.2, Ukraine: -1.5, 'Czech Republic': 0.1,
      Morocco: -0.2, Egypt: -0.6, Israel: -0.8, 'Saudi Arabia': 0.2, UAE: 0.3, Iran: -1.0,
      Brazil: -0.3, Mexico: -0.4, Argentina: -0.7, Colombia: -0.2, Chile: 0.1,
      China: 0.5, India: 0.1, Indonesia: 0.1, Thailand: 0.0, Vietnam: 0.2, Philippines: -0.1, Pakistan: -0.5,
      'South Africa': -0.4, Nigeria: -0.6, Kenya: -0.3, Ghana: -0.4, Senegal: -0.1
    },
    vol: {
      // Calibrated for target-shift model: std ~0.6-0.9 after EMA(14), range within ±3σ
      France: 0.20, Germany: 0.18, 'United States': 0.22, 'United Kingdom': 0.20, Italy: 0.22, Spain: 0.20, Japan: 0.16, Canada: 0.18, Australia: 0.18,
      Netherlands: 0.16, Belgium: 0.15, Austria: 0.15, Ireland: 0.18, Portugal: 0.20, Greece: 0.25, Norway: 0.14, Sweden: 0.16, Finland: 0.14, Switzerland: 0.12, 'South Korea': 0.20,
      Poland: 0.22, Hungary: 0.25, Romania: 0.22, Turkey: 0.28, Russia: 0.28, Ukraine: 0.30, 'Czech Republic': 0.18,
      Morocco: 0.20, Egypt: 0.25, Israel: 0.28, 'Saudi Arabia': 0.16, UAE: 0.15, Iran: 0.28,
      Brazil: 0.22, Mexico: 0.22, Argentina: 0.28, Colombia: 0.22, Chile: 0.20,
      China: 0.25, India: 0.22, Indonesia: 0.20, Thailand: 0.18, Vietnam: 0.18, Philippines: 0.20, Pakistan: 0.25,
      'South Africa': 0.22, Nigeria: 0.25, Kenya: 0.22, Ghana: 0.22, Senegal: 0.18
    },
    meanRevert: 0.05, // Target-shift model: higher MR tracks event targets
    unit: 'σ', riskZones: true
  }
];

// ============================================================
// REGIME-AWARE DATA GENERATOR
// ============================================================
function generateRealisticData(indId, country, startDate, days) {
  var ind = FPSQ_INDICATORS.find(function(i) { return i.id === indId; });
  if (!ind) return { dates: [], values: [] };

  var baseline = ind.levels[country] || 0;
  var vol = ind.vol[country] || 0.05;
  var mr = ind.meanRevert || 0.01;
  var impacts = EVENT_IMPACTS[indId] || {};
  var isRiskZone = ind.riskZones;

  var data = { dates: [], values: [] };
  var d = new Date(startDate);
  var v = baseline;
  var seed = hashStr(indId + country);
  var rng = seededRandom(seed);

  // Pre-compute event timestamps for performance
  var eventCache = [];
  GLOBAL_EVENTS.forEach(function(evt) {
    var evtImpacts = impacts[evt.id];
    if (!evtImpacts || !evtImpacts[country]) return;
    eventCache.push({
      amp: evtImpacts[country],
      start: new Date(evt.start).getTime(),
      peak: new Date(evt.peak).getTime(),
      end: new Date(evt.end).getTime()
    });
  });

  for (var i = 0; i < days; i++) {
    var dateStr = d.toISOString().split('T')[0];
    var now = d.getTime();

    // Daily noise (Box-Muller)
    var u1 = rng(), u2 = rng();
    var normal = Math.sqrt(-2 * Math.log(1 - u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);

    // TARGET SHIFT MODEL: events define WHERE the series should be
    // Amplitudes represent the deviation from baseline in native units
    var eventShift = 0;
    for (var e = 0; e < eventCache.length; e++) {
      var ec = eventCache[e];
      if (now < ec.start || now > ec.end) continue;
      if (now <= ec.peak) {
        var progress = (now - ec.start) / (ec.peak - ec.start);
        eventShift += ec.amp * progress;
      } else {
        var decayDays = (ec.end - ec.peak) / 86400000;
        var daysSincePeak = (now - ec.peak) / 86400000;
        eventShift += ec.amp * Math.exp(-2.5 * daysSincePeak / decayDays);
      }
    }
    // Mean reversion toward baseline + event shift
    v += (baseline + eventShift - v) * mr;
    v += normal * vol;
    // Clamp: risk-zone soft clamp at ±2.8σ; non-negative floor for bp/index/score
    if (isRiskZone) {
      if (Math.abs(v) > 2.8) {
        var excess = Math.abs(v) - 2.8;
        v -= (v > 0 ? 1 : -1) * excess * 0.3;
      }
    } else if (ind.unit === 'bp' || ind.unit === 'index' || ind.unit === '/100') {
      v = Math.max(1, v);
    }

    data.dates.push(dateStr);
    data.values.push(Math.round(v * (ind.unit === 'σ' || ind.unit === 'pp' ? 1000 : 10)) / (ind.unit === 'σ' || ind.unit === 'pp' ? 1000 : 10));
    d.setDate(d.getDate() + 1);
  }

  // EMA smoothing — calibrated per indicator type
  if (isRiskZone) {
    data.values = ema(data.values, 14);     // 14d EMA
  } else if (ind.unit === 'σ') {
    data.values = ema(data.values, 28);     // Fiscal stress composites
  } else if (ind.unit === 'bp') {
    data.values = ema(data.values, 7);      // Market data — fast
  } else if (ind.unit === 'index') {
    data.values = ema(data.values, 7);      // GPR/EPU — weekly smoothing
  } else if (ind.unit === '/100') {
    data.values = ema(data.values, 14);     // Scores — moderate smoothing
  } else {
    data.values = ema(data.values, 7);      // Default: % GDP, pp — weekly
  }

  return data;
}

// Exponential Moving Average
function ema(values, period) {
  var k = 2 / (period + 1);
  var result = [values[0]];
  for (var i = 1; i < values.length; i++) {
    result.push(values[i] * k + result[i-1] * (1 - k));
  }
  // Round appropriately
  return result.map(function(v) { return Math.round(v * 1000) / 1000; });
}

// Simple string hash for seeding
function hashStr(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Seeded PRNG (mulberry32)
function seededRandom(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ============================================================
// DATA PIPELINE — Loads real data if available, falls back to synthetic
// ============================================================
// Pipeline contract:
//   Real data: /data/fpsq/{indicator_id}.json
//   Format: { "meta": { "last_update": "2026-03-29", "source": "..." },
//             "countries": { "France": { "dates": ["2020-01-01",...], "values": [0.12,...] }, ... } }
//
// To switch from synthetic to real:
//   1. FPSQ R pipeline exports: fpsq_export_vigie(indicator, output_dir="data/fpsq/")
//   2. Set VIGIE_DATA_MODE = 'live' below
//   3. Vigie loads JSON, skips synthetic generation for that indicator
//
var VIGIE_DATA_MODE = 'synthetic'; // 'synthetic' | 'live' | 'hybrid'
var VIGIE_DATA_PATH = 'data/fpsq/'; // relative to vigie.html
var DATA_START = '2020-01-01';
var DATA_DAYS = 2277; // 2020-01-01 to 2026-03-26

var INDICATOR_DATA = {};

// Attempt to load real data for an indicator
function loadRealData(indId) {
  return new Promise(function(resolve, reject) {
    var url = VIGIE_DATA_PATH + indId + '.json';
    fetch(url).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(json) {
      // Validate structure
      if (!json.countries || typeof json.countries !== 'object') throw new Error('Invalid format');
      resolve(json.countries);
    }).catch(function(err) {
      resolve(null); // fallback to synthetic
    });
  });
}

// Generate synthetic data for one indicator
function generateIndicatorData(ind) {
  var data = {};
  ind.countries.forEach(function(c) {
    data[c] = generateRealisticData(ind.id, c, DATA_START, DATA_DAYS);
  });
  return data;
}

// Initialize all data (sync for synthetic, async for live)
function initAllData(callback) {
  if (VIGIE_DATA_MODE === 'synthetic') {
    // Pure synthetic — immediate
    FPSQ_INDICATORS.forEach(function(ind) {
      INDICATOR_DATA[ind.id] = generateIndicatorData(ind);
    });
    if (callback) callback();
    return;
  }

  // Live or hybrid: try to load real data first
  var promises = FPSQ_INDICATORS.map(function(ind) {
    return loadRealData(ind.id).then(function(realData) {
      if (realData && VIGIE_DATA_MODE !== 'synthetic') {
        INDICATOR_DATA[ind.id] = realData;
        console.log('[Vigie] Loaded real data: ' + ind.id + ' (' + Object.keys(realData).length + ' countries)');
      } else {
        INDICATOR_DATA[ind.id] = generateIndicatorData(ind);
        console.log('[Vigie] Synthetic data: ' + ind.id);
      }
    });
  });

  Promise.all(promises).then(function() {
    console.log('[Vigie] Data pipeline ready. Mode: ' + VIGIE_DATA_MODE);
    if (callback) callback();
  });
}

// Initialize data immediately (synthetic mode is synchronous)
initAllData();

// ============================================================
// INDICATOR CARD GRID
// ============================================================
function buildIndicatorGrid() {
  var grid = document.getElementById('data-ind-grid');
  if (!grid) return;
  grid.innerHTML = '';

  FPSQ_INDICATORS.forEach(function(ind) {
    var card = document.createElement('div');
    card.className = 'data-indicator-card';
    card.setAttribute('data-ind', ind.id);
    if (ind.id === 'fiscal-stress') card.classList.add('active');

    // Last values for first 3 countries
    var statsHTML = '';
    ind.countries.slice(0, 3).forEach(function(c, ci) {
      var data = INDICATOR_DATA[ind.id][c];
      var lastVal = data.values[data.values.length - 1];
      var prevVal = data.values[data.values.length - 30];
      var change = lastVal - prevVal;
      var isPos = change >= 0;
      // For spreads/debt, up is bad; for sentiment, down is bad
      var upIsBad = (ind.unit === 'bp' || ind.unit === '/100' || ind.unit === 'index' || ind.unit === 'pp');
      var colorClass = upIsBad ? (isPos ? 'negative' : 'positive') : (isPos ? 'positive' : 'negative');
      if (ind.unit === '% GDP' || ind.unit === 'σ') colorClass = isPos ? 'negative' : 'positive';

      statsHTML += '<div class="data-ind-stat">' +
        '<span class="data-ind-stat-label">' + c + '</span>' +
        '<span class="data-ind-stat-value">' + formatVal(lastVal, ind.unit) + '</span>' +
        '</div>';
    });

    // Mini sparkline for card
    var sparkData = INDICATOR_DATA[ind.id][ind.countries[0]];
    var last60 = sparkData.values.slice(-60);
    var sparkSVG = createMiniSpark(last60, ind.colors[0]);

    card.innerHTML =
      '<div class="data-ind-header">' +
        '<div class="data-ind-title">' + ind.name + '</div>' +
        '<span class="data-ind-badge ' + ind.badge + '">' + ind.badge + '</span>' +
      '</div>' +
      '<div class="data-ind-desc">' + ind.desc.substring(0, 120) + (ind.desc.length > 120 ? '...' : '') + '</div>' +
      '<div class="data-ind-stats">' + statsHTML + '</div>' +
      '<div class="data-ind-spark">' + sparkSVG + '</div>';

    card.addEventListener('click', function() {
      document.querySelectorAll('.data-indicator-card').forEach(function(c) { c.classList.remove('active'); });
      card.classList.add('active');
      // Activate in side nav
      var sideLink = document.querySelector('.data-side-link[data-ind="' + ind.id + '"]');
      if (sideLink) selectIndicator(ind.id, sideLink);
    });

    grid.appendChild(card);
  });
}

function formatVal(val, unit) {
  if (unit === 'σ') return val.toFixed(2);
  if (unit === 'bp' || unit === '/100' || unit === 'index') return Math.round(val).toString();
  if (unit === '% GDP' || unit === 'pp') return val.toFixed(1);
  return val.toFixed(2);
}

function createMiniSpark(values, color) {
  var w = 280, h = 36;
  var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
  var range = max - min || 1;
  var pts = values.map(function(v, i) {
    return (i / (values.length - 1)) * w + ',' + (h - 3 - ((v - min) / range) * (h - 6));
  });
  return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="width:100%;height:100%;">' +
    '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+color+'" stroke-width="1.5" stroke-opacity="0.6"/></svg>';
}

// ============================================================
// DETAIL CHART — Time Series (Plotly)
// ============================================================
var currentIndicator = 'fiscal-stress';
var currentRange = '1y';

function selectIndicator(indId, el) {
  currentIndicator = indId;
  // Update side nav
  document.querySelectorAll('.data-side-link').forEach(function(a) { a.classList.remove('active'); });
  if (el) el.classList.add('active');
  // Update card grid
  document.querySelectorAll('.data-indicator-card').forEach(function(c) {
    c.classList.toggle('active', c.getAttribute('data-ind') === indId);
  });

  var comparePanel = document.getElementById('data-compare-panel');
  var tsChart = document.getElementById('data-ts-chart');
  var hmChart = document.getElementById('data-hm-chart');
  var viewToggle = document.querySelector('.data-view-toggle');
  var rangeEl = document.getElementById('data-range-pills');
  var riskLegend = document.querySelector('.data-risk-legend');
  var chartTop = document.querySelector('.data-chart-top');

  if (indId === 'country-comparison') {
    // Show comparison mode, hide regular charts
    comparePanel.classList.add('active');
    tsChart.style.display = 'none';
    hmChart.style.display = 'none';
    viewToggle.style.display = 'none';
    rangeEl.style.display = 'none';
    riskLegend.style.display = 'none';
    // Update header
    document.getElementById('data-detail-title').textContent = 'Country Comparison';
    document.getElementById('data-detail-desc').textContent = 'Compare countries across all FPSQ indicators. Select up to 6 countries by region to see a cross-indicator stress profile. ' + getAllCountries().length + ' countries available.';
    document.getElementById('data-readout').innerHTML = '';
    document.getElementById('data-source').textContent = 'Source: FPSQ Pipeline v1.4.0 — All indicators';
    renderCountryComparison();
  } else {
    // Hide comparison, show regular charts
    comparePanel.classList.remove('active');
    tsChart.style.display = 'block';
    viewToggle.style.display = 'flex';
    rangeEl.style.display = 'flex';
    riskLegend.style.display = 'flex';

    // Show/hide country picker for multi-country indicators
    var picker = document.getElementById('data-country-picker');
    var ind = FPSQ_INDICATORS.find(function(i) { return i.id === indId; });
    if (ind && ind.countries.length > 7) {
      picker.style.display = 'block';
      renderCountryPicker(ind);
    } else {
      picker.style.display = 'none';
    }

    renderDetailChart();
    renderHeatmap();
  }
}

function renderDetailChart() {
  var ind = FPSQ_INDICATORS.find(function(i) { return i.id === currentIndicator; });
  if (!ind) return;

  // Update header
  document.getElementById('data-detail-title').textContent = ind.name;
  document.getElementById('data-detail-desc').textContent = ind.desc;
  document.getElementById('data-source').textContent = 'Last update: Mar 29, 2026 | Source: ' + ind.source;

  // Build traces — only for countries that have data for this indicator
  // For many-country indicators (>7), use activeCountries subset (default 3)
  var traces = [];
  var annotations = [];
  var displayCountries = ind.countries;

  // For indicators with many countries, only render the active subset
  // (the user can change this via the country selector)
  if (!ind._activeCountries && ind.countries.length > 7) {
    ind._activeCountries = ind.countries.slice(0, 3);
  }
  if (ind.countries.length > 7) {
    displayCountries = ind._activeCountries || ind.countries.slice(0, 3);
  }

  displayCountries.forEach(function(c, ci) {
    var data = INDICATOR_DATA[ind.id] && INDICATOR_DATA[ind.id][c];
    if (!data) return; // skip countries without data

    var dates = data.dates;
    var values = data.values;

    // Apply range filter
    var cutoff = getRangeCutoff(currentRange, dates);
    var filteredDates = dates.slice(cutoff);
    var filteredValues = values.slice(cutoff);

    // 6-color cycle — Institutional Intelligence v3 palette
    var VIGIE_COLORS = ['#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848'];
    var lineColor = ind.countries.length > 7 ? VIGIE_COLORS[ci % 6] : ind.colors[ci];

    traces.push({
      x: filteredDates, y: filteredValues,
      type: 'scatter', mode: 'lines',
      name: c,
      line: { color: lineColor, width: ind.riskZones ? 1.5 : 2 },
      visible: true,
      showlegend: true,
      hovertemplate: '<b>' + c + '</b><br>%{x|%d %b %Y}: %{y:.' + (ind.unit === 'σ' ? '2' : '1') + 'f} ' + ind.unit + '<extra></extra>'
    });

    // Collect endpoint data for right-side annotations (only for ≤7 countries)
    var lastVal = filteredValues[filteredValues.length - 1];
    annotations.push({
      _rawY: lastVal, _color: ind.colors[ci], _country: c, _unit: ind.unit
    });
  });

  // No right-side annotations for multi-country charts (>7)
  // For ≤7 countries, show clean endpoint labels
  if (ind.countries.length <= 7) {
    var yVals = traces.map(function(t) { return t.y; });
    var allY = []; yVals.forEach(function(arr) { arr.forEach(function(v) { allY.push(v); }); });
    var yMin = Math.min.apply(null, allY), yMax = Math.max.apply(null, allY);
    var yRange = yMax - yMin || 1;
    var minGap = yRange * 0.06;

    annotations.sort(function(a, b) { return a._rawY - b._rawY; });
    var spacedY = annotations.map(function(a) { return a._rawY; });
    for (var pass = 0; pass < 5; pass++) {
      for (var i = 1; i < spacedY.length; i++) {
        var diff = spacedY[i] - spacedY[i - 1];
        if (diff < minGap) {
          var shift = (minGap - diff) / 2;
          spacedY[i - 1] -= shift;
          spacedY[i] += shift;
        }
      }
    }

    annotations = annotations.map(function(a, i) {
      var valStr = formatVal(a._rawY, a._unit);
      if ((a._unit === 'σ' || a._unit === 'pp') && a._rawY > 0) valStr = '+' + valStr;
      return {
        x: 1.01, xref: 'paper', xanchor: 'left',
        y: spacedY[i], yref: 'y', yanchor: 'middle',
        text: '<b>' + valStr + '</b> <span style="font-size:10px">' + a._country + '</span>',
        showarrow: false,
        font: { color: a._color, size: 12, family: 'Inter, sans-serif' },
        bgcolor: 'rgba(255,255,255,0.85)'
      };
    });
  } else {
    annotations = [];
  }

  // Update date range display
  var firstDate = traces[0].x[0];
  var lastDate = traces[0].x[traces[0].x.length - 1];
  var dateRangeEl = document.getElementById('data-date-range');
  if (dateRangeEl) {
    var fd = new Date(firstDate), ld = new Date(lastDate);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dateRangeEl.textContent = months[fd.getMonth()] + ' ' + fd.getDate() + ', ' + fd.getFullYear() +
      '  →  ' + months[ld.getMonth()] + ' ' + ld.getDate() + ', ' + ld.getFullYear();
  }

  // Risk zone shapes: #ADB8C2 ShortDot at ±1, thinner at ±3
  var shapes = [];
  if (ind.riskZones) {
    shapes = [
      // Main risk boundaries at ±1 (prominent)
      { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 1, y1: 1,
        line: { color: '#ADB8C2', width: 2, dash: 'dot' } },
      { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: -1, y1: -1,
        line: { color: '#ADB8C2', width: 2, dash: 'dot' } },
      // Extreme zone at ±3 (subtler)
      { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 3, y1: 3,
        line: { color: 'rgba(173,184,194,0.4)', width: 1, dash: 'dot' } },
      { type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: -3, y1: -3,
        line: { color: 'rgba(173,184,194,0.4)', width: 1, dash: 'dot' } },
      // Subtle risk zone bands
      { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: -3, y1: -1,
        fillcolor: 'rgba(76,175,80,0.03)', line: { width: 0 }, layer: 'below' },
      { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: -1, y1: 1,
        fillcolor: 'rgba(158,158,158,0.02)', line: { width: 0 }, layer: 'below' },
      { type: 'rect', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 1, y1: 3,
        fillcolor: 'rgba(255,152,0,0.03)', line: { width: 0 }, layer: 'below' }
    ];
  }

  // Y-axis configuration — fixed -3 to +3 for risk-zone indicators
  var yaxisConfig = {
    gridcolor: '#F0F0F4',
    gridwidth: 0,
    showgrid: false,
    zeroline: false,
    tickfont: { size: 12, color: '#070E46', family: 'Inter, sans-serif' }
  };
  if (ind.riskZones) {
    // Fixed -3 to +3 with tick at every integer, no + prefix
    yaxisConfig.range = [-3.15, 3.15];
    yaxisConfig.dtick = 1;
    yaxisConfig.tickformat = 'd';
  } else if (ind.unit === 'σ' || ind.unit === 'pp') {
    yaxisConfig.tickformat = '+.1f';
    yaxisConfig.zeroline = true;
    yaxisConfig.zerolinecolor = '#ADB8C2';
    yaxisConfig.zerolinewidth = 1;
  }

  // No rangeslider, no navigator — clean chart only
  Plotly.newPlot('data-ts-chart', traces, {
    height: ind.riskZones ? 525 : 440,
    margin: { l: 48, r: 80, t: 10, b: 50 },
    font: { family: 'Inter, sans-serif', size: 12, color: '#070E46' },
    paper_bgcolor: '#FFFFFF',
    plot_bgcolor: '#FFFFFF',
    xaxis: {
      gridwidth: 0,
      showgrid: false,
      tickfont: { size: 12, color: '#070E46', family: 'Inter, sans-serif' },
      tickformat: '%b %Y',
      showspikes: true, spikemode: 'across', spikethickness: 1, spikecolor: '#ADB8C2', spikedash: 'solid'
    },
    yaxis: yaxisConfig,
    legend: displayCountries.length > 1 ? {
      orientation: 'h', x: 0, y: -0.12,
      font: { size: 12, color: '#070E46', family: 'Inter, sans-serif' },
      bgcolor: 'transparent', traceorder: 'normal',
      itemclick: 'toggle', itemdoubleclick: 'toggleothers'
    } : { visible: false },
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: '#FFFFFF', bordercolor: '#E0E0E6',
      font: { color: '#070E46', size: 12, family: 'Inter, sans-serif' }
    },
    shapes: shapes,
    annotations: annotations
  }, { displayModeBar: false, responsive: true });
}

function getRangeCutoff(range, dates) {
  if (range === 'all') return 0;
  var end = new Date(dates[dates.length - 1]);
  var start;
  switch(range) {
    case '1m': start = new Date(end); start.setMonth(start.getMonth() - 1); break;
    case '3m': start = new Date(end); start.setMonth(start.getMonth() - 3); break;
    case '6m': start = new Date(end); start.setMonth(start.getMonth() - 6); break;
    case '1y': start = new Date(end); start.setFullYear(start.getFullYear() - 1); break;
    default: return 0;
  }
  var startStr = start.toISOString().split('T')[0];
  for (var i = 0; i < dates.length; i++) {
    if (dates[i] >= startStr) return i;
  }
  return 0;
}

function setDataRange(range, el) {
  currentRange = range;
  document.querySelectorAll('.data-range-pill').forEach(function(p) { p.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderDetailChart();
}

// ============================================================
// COUNTRY PICKER — Select up to 6 for multi-country indicators
// ============================================================
var PICKER_REGIONS = [
  { name: 'Developed Markets', countries: ['France','Germany','United States','United Kingdom','Italy','Spain','Japan','Canada','Australia','Netherlands','Belgium','Austria','Ireland','Portugal','Greece','Norway','Sweden','Finland','Switzerland','South Korea'] },
  { name: 'EM Europe & CIS', countries: ['Poland','Hungary','Romania','Turkey','Russia','Ukraine','Czech Republic'] },
  { name: 'N. Africa & Middle East', countries: ['Morocco','Egypt','Israel','Saudi Arabia','UAE','Iran'] },
  { name: 'Latin America', countries: ['Brazil','Mexico','Argentina','Colombia','Chile'] },
  { name: 'Asia & Pacific', countries: ['China','India','Indonesia','Thailand','Vietnam','Philippines','Pakistan'] },
  { name: 'Sub-Saharan Africa', countries: ['South Africa','Nigeria','Kenya','Ghana','Senegal'] }
];
var MAX_PICKER = 6;
var VIGIE_COLORS = ['#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848'];

function renderCountryPicker(ind) {
  var tagsEl = document.getElementById('data-picker-tags');
  var regionsEl = document.getElementById('data-picker-regions');
  var countEl = document.getElementById('data-picker-count');
  if (!tagsEl || !regionsEl) return;

  var active = ind._activeCountries || ind.countries.slice(0, 3);
  var available = ind.countries;

  // Render tags for selected countries
  tagsEl.innerHTML = '';
  active.forEach(function(c, i) {
    var tag = document.createElement('span');
    tag.className = 'data-picker-tag';
    tag.style.background = VIGIE_COLORS[i % 6];
    tag.innerHTML = c + ' <span class="tag-x">×</span>';
    tag.onclick = function() {
      ind._activeCountries = active.filter(function(x) { return x !== c; });
      renderCountryPicker(ind);
      renderDetailChart();
    };
    tagsEl.appendChild(tag);
  });
  countEl.textContent = active.length + ' / ' + MAX_PICKER + ' selected';

  // Render regional buttons
  regionsEl.innerHTML = '';
  PICKER_REGIONS.forEach(function(region) {
    // Only show region if it has countries available for this indicator
    var regionCountries = region.countries.filter(function(c) {
      return available.indexOf(c) !== -1;
    });
    if (regionCountries.length === 0) return;

    var div = document.createElement('div');
    div.className = 'data-picker-region';
    div.innerHTML = '<div class="data-picker-region-label">' + region.name + '</div>';
    var btnsDiv = document.createElement('div');
    btnsDiv.className = 'data-picker-region-btns';

    regionCountries.forEach(function(c) {
      var btn = document.createElement('button');
      btn.className = 'data-picker-btn';
      btn.textContent = c;
      var isSelected = active.indexOf(c) !== -1;
      var atLimit = active.length >= MAX_PICKER;

      if (isSelected) {
        btn.classList.add('selected');
      } else if (atLimit) {
        btn.classList.add('unavailable');
      }

      btn.onclick = function() {
        if (isSelected) {
          ind._activeCountries = active.filter(function(x) { return x !== c; });
        } else if (!atLimit) {
          ind._activeCountries = active.concat([c]);
        }
        renderCountryPicker(ind);
        renderDetailChart();
      };
      btnsDiv.appendChild(btn);
    });
    div.appendChild(btnsDiv);
    regionsEl.appendChild(div);
  });
}

// ============================================================
// HEATMAP VIEW (countries × time)
// ============================================================
function renderHeatmap() {
  var ind = FPSQ_INDICATORS.find(function(i) { return i.id === currentIndicator; });
  if (!ind) return;

  // Build heatmap data (weekly samples for performance)
  var zData = [], yLabels = [];
  var xDates = [];
  var firstCountry = INDICATOR_DATA[ind.id][ind.countries[0]];
  for (var d = 0; d < firstCountry.dates.length; d += 7) {
    xDates.push(firstCountry.dates[d]);
  }

  ind.countries.forEach(function(c) {
    var data = INDICATOR_DATA[ind.id][c];
    var row = [];
    for (var d = 0; d < data.values.length; d += 7) {
      row.push(data.values[d]);
    }
    zData.push(row);
    yLabels.push(c);
  });

  // Blue gradient colorscale (7 stops)
  var colorscale = [
    [0, '#b7e1fc'],
    [0.167, '#a1cdea'],
    [0.333, '#87c1f7'],
    [0.5, '#639bd1'],
    [0.667, '#2c5aa5'],
    [0.833, '#0f3b82'],
    [1, '#081b47']
  ];

  Plotly.newPlot('data-hm-chart', [{
    z: zData,
    x: xDates,
    y: yLabels,
    type: 'heatmap',
    colorscale: colorscale,
    showscale: true,
    colorbar: {
      title: { text: ind.unit, font: { size: 12, color: '#070E46' } },
      tickfont: { size: 11, color: '#070E46' },
      thickness: 14,
      len: 0.9,
      outlinewidth: 0
    },
    hovertemplate: '<b>%{y}</b><br>%{x|%d %b %Y}<br>Value: %{z:.' + (ind.unit === 'σ' ? '2' : '1') + 'f} ' + ind.unit + '<extra></extra>',
    xgap: 1,
    ygap: 2
  }], {
    height: 500,
    margin: { l: 120, r: 60, t: 10, b: 40 },
    font: { family: 'Inter, sans-serif', size: 12, color: '#070E46' },
    paper_bgcolor: '#FFFFFF',
    plot_bgcolor: '#FFFFFF',
    xaxis: { showgrid: false, tickfont: { color: '#070E46', size: 12 } },
    yaxis: { showgrid: false, autorange: 'reversed', tickfont: { color: '#070E46', size: 12 } }
  }, { displayModeBar: false, responsive: true });
}

// ============================================================
// VIEW TOGGLE (Time Series ↔ Heatmap)
// ============================================================
function switchDataView(view, el) {
  document.querySelectorAll('.data-view-btn').forEach(function(b) { b.classList.remove('active'); });
  if (el) el.classList.add('active');

  var tsEl = document.getElementById('data-ts-chart');
  var hmEl = document.getElementById('data-hm-chart');
  var rangeEl = document.getElementById('data-range-pills');

  if (view === 'heatmap') {
    tsEl.style.display = 'none';
    hmEl.style.display = 'block';
    rangeEl.style.display = 'none';
    // Reflow
    Plotly.Plots.resize(document.getElementById('data-hm-chart'));
  } else {
    tsEl.style.display = 'block';
    hmEl.style.display = 'none';
    rangeEl.style.display = 'flex';
  }
}

// ============================================================
// COUNTRY COMPARISON MODE
// ============================================================
var selectedCompareCountries = ['France', 'Germany', 'United States', 'China'];

function getAllCountries() {
  var set = {};
  FPSQ_INDICATORS.forEach(function(ind) {
    ind.countries.forEach(function(c) { set[c] = true; });
  });
  // Sort: major economies first, then alpha
  var priority = ['France','Germany','United States','Italy','United Kingdom','Japan','China','Spain','Canada'];
  var all = Object.keys(set);
  all.sort(function(a, b) {
    var ia = priority.indexOf(a), ib = priority.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
  return all;
}

function renderCountryComparison() {
  var selector = document.getElementById('data-compare-selector');
  var summary = document.getElementById('data-compare-summary');
  var grid = document.getElementById('data-compare-grid');
  if (!selector) return;

  // Regional grouping
  var REGIONS = [
    { name: 'Developed Markets', countries: ['France','Germany','United States','United Kingdom','Italy','Spain','Japan','Canada','Australia','Netherlands','Belgium','Austria','Ireland','Portugal','Greece','Norway','Sweden','Finland','Switzerland','South Korea','New Zealand'] },
    { name: 'EM Europe & CIS', countries: ['Poland','Hungary','Romania','Bulgaria','Croatia','Czech Republic','Turkey','Russia','Ukraine','Georgia','Kazakhstan'] },
    { name: 'N. Africa & Middle East', countries: ['Morocco','Algeria','Tunisia','Egypt','Israel','Saudi Arabia','UAE','Iran','Iraq','Jordan','Qatar'] },
    { name: 'Latin America', countries: ['Brazil','Mexico','Argentina','Colombia','Chile','Peru','Ecuador','Venezuela','Uruguay'] },
    { name: 'Asia & Pacific', countries: ['China','India','Indonesia','South Korea','Thailand','Malaysia','Philippines','Vietnam','Pakistan','Bangladesh','Hong Kong','Singapore','Taiwan'] },
    { name: 'Sub-Saharan Africa', countries: ['South Africa','Nigeria','Kenya','Ghana','Ethiopia','Senegal',"Côte d'Ivoire"] }
  ];

  var allAvailable = getAllCountries(); // countries that have data
  var MAX_COMPARE = 6;

  selector.innerHTML = '';

  // Limit message
  var limitDiv = document.createElement('div');
  limitDiv.className = 'data-compare-limit-msg';
  limitDiv.innerHTML = 'Select up to <span class="data-compare-limit-count">' + MAX_COMPARE + '</span> countries — <strong>' + selectedCompareCountries.length + '</strong> selected';
  selector.appendChild(limitDiv);

  // Build regional groups
  REGIONS.forEach(function(region) {
    var group = document.createElement('div');
    group.className = 'data-compare-region-group';
    group.innerHTML = '<div class="data-compare-region-label">' + region.name + '</div>';
    var btnsDiv = document.createElement('div');
    btnsDiv.className = 'data-compare-region-btns';

    region.countries.forEach(function(c) {
      var isAvailable = allAvailable.indexOf(c) !== -1;
      var isSelected = selectedCompareCountries.indexOf(c) !== -1;
      var atLimit = selectedCompareCountries.length >= MAX_COMPARE && !isSelected;

      var btn = document.createElement('button');
      btn.className = 'data-compare-country-btn' + (isSelected ? ' selected' : '') + (!isAvailable || atLimit ? ' unavailable' : '');
      btn.textContent = c;
      if (isAvailable && !atLimit) {
        btn.addEventListener('click', function() {
          var idx = selectedCompareCountries.indexOf(c);
          if (idx !== -1) {
            if (selectedCompareCountries.length <= 1) return;
            selectedCompareCountries.splice(idx, 1);
          } else {
            if (selectedCompareCountries.length >= MAX_COMPARE) return;
            selectedCompareCountries.push(c);
          }
          renderCountryComparison();
        });
      } else if (isSelected) {
        btn.addEventListener('click', function() {
          if (selectedCompareCountries.length <= 1) return;
          var idx = selectedCompareCountries.indexOf(c);
          selectedCompareCountries.splice(idx, 1);
          renderCountryComparison();
        });
      }
      btnsDiv.appendChild(btn);
    });

    group.appendChild(btnsDiv);
    selector.appendChild(group);
  });

  // 6-color cycle — consistent per selected country position
  var COMPARE_COLORS = ['#2C5F8A','#C0392B','#228833','#D4A017','#6B4C7A','#E8A848'];

  // Summary cards: composite stress score per selected country
  summary.innerHTML = '';
  selectedCompareCountries.forEach(function(c, cIdx) {
    var indicatorCount = 0, zSum = 0;
    FPSQ_INDICATORS.forEach(function(ind) {
      if (ind.countries.indexOf(c) === -1) return;
      var data = INDICATOR_DATA[ind.id][c];
      if (!data) return;
      var lastVal = data.values[data.values.length - 1];
      var baseline = ind.levels[c] || 0;
      var vol = ind.vol[c] || 1;
      var z = (lastVal - baseline) / (vol > 0 ? vol * 10 : 1);
      zSum += z;
      indicatorCount++;
    });
    var avgZ = indicatorCount > 0 ? zSum / indicatorCount : 0;
    var scoreColor = avgZ > 1 ? '#C0392B' : avgZ < -0.5 ? '#228833' : '#2D2D2D';
    summary.innerHTML +=
      '<div class="data-compare-stat">' +
        '<div class="data-compare-stat-country" style="color:' + COMPARE_COLORS[cIdx % 6] + ';">' + c + '</div>' +
        '<div class="data-compare-stat-value" style="color:' + scoreColor + ';">' + avgZ.toFixed(2) + 'σ</div>' +
        '<div class="data-compare-stat-label">Composite stress</div>' +
      '</div>';
  });

  // Small multiples: one mini chart per indicator
  grid.innerHTML = '';
  var chartIds = [];
  FPSQ_INDICATORS.forEach(function(ind, indIdx) {
    var cell = document.createElement('div');
    cell.className = 'data-compare-mini';
    var chartId = 'compare-mini-' + ind.id;
    cell.innerHTML =
      '<div class="data-compare-mini-title">' + ind.name + '</div>' +
      '<div class="data-compare-mini-unit">' + ind.unit + '</div>' +
      '<div id="' + chartId + '" style="height:150px;"></div>';
    grid.appendChild(cell);

    // Build traces — color by POSITION in selectedCompareCountries (not indicator)
    var traces = [];
    selectedCompareCountries.forEach(function(c, cIdx) {
      if (ind.countries.indexOf(c) === -1) return;
      var data = INDICATOR_DATA[ind.id][c];
      if (!data) return;
      var n = Math.min(365, data.dates.length);
      traces.push({
        x: data.dates.slice(-n),
        y: data.values.slice(-n),
        type: 'scatter', mode: 'lines',
        name: c,
        line: { color: COMPARE_COLORS[cIdx % 6], width: 1.5 },
        hovertemplate: '<b>' + c + '</b>: %{y:.' + (ind.unit === 'σ' ? '2' : '1') + 'f}<extra></extra>'
      });
    });

    if (traces.length === 0) {
      cell.innerHTML += '<div style="color:#666666;font-size:11px;padding:20px;text-align:center;">No selected country available</div>';
      return;
    }

    chartIds.push({ id: chartId, traces: traces, indIdx: indIdx });
  });

  // Batch render all mini charts after DOM is ready
  requestAnimationFrame(function() {
    chartIds.forEach(function(item) {
      Plotly.newPlot(item.id, item.traces, {
        height: 150,
        margin: { l: 35, r: 8, t: 4, b: 22 },
        font: { family: 'Inter, sans-serif', size: 9, color: '#666666' },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: { showgrid: false, tickfont: { size: 8, color: '#666666' } },
        yaxis: { gridcolor: 'rgba(0,0,0,0.04)', tickfont: { size: 8, color: '#666666' } },
        legend: { orientation: 'h', x: 0, y: 1.15, font: { size: 9, color: '#666666' }, bgcolor: 'transparent' },
        hovermode: 'closest',
        showlegend: item.indIdx === 0
      }, { displayModeBar: false, responsive: true });
    });
  });
}

// ============================================================
// INIT DATA TAB
// ============================================================
function initDataTab() {
  buildIndicatorGrid();
  renderDetailChart();
  renderHeatmap();
}
