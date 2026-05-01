#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { listPolicyMarkdownFiles, loadPolicyArticle } from "../../content-utils.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../../..");
const outDir = join(here, "production-v2");
const metaphors = JSON.parse(readFileSync(join(repoRoot, "editorial/metaphors.json"), "utf8"));

const templateByName = {
  "person-spotlight": "person spotlight",
  "balance-bars": "balance bars",
  "map-arrows": "map arrows",
  "broken-chart": "broken chart",
  "coins-cascade": "coins cascade",
  "parliament-symbol": "parliament symbol",
  "pipeline-valve": "pipeline valve",
  "containers-bridge": "containers bridge",
  "scale-vs-factories": "scale vs factories",
  "roundtable-flows": "roundtable flows",
};

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function articleHaystack(article) {
  return normalize([
    article.slug,
    article.frontmatter.title,
    article.frontmatter.summary,
    article.frontmatter.theme,
    article.frontmatter.doc_type,
    ...(article.frontmatter.tags ?? []),
  ].join(" "));
}

function classify(article) {
  const h = articleHaystack(article);
  const theme = normalize(article.frontmatter.theme);

  if (/(polycrisis|stabilisateur|soft landing|convergence|scenario|gradient|systemique|tail risk)/.test(h)) {
    return { family: "polycrisis", style: "policy-dark", template: "broken-chart" };
  }
  if (/(iran|ormuz|moyen.orient|petrol|choc petrolier|guerre russe|crise iranienne)/.test(h)) {
    return { family: "iran-moyen-orient", style: "policy-dark", template: "pipeline-valve" };
  }
  if (/(energie|energy|jetp|transition energetique|green deal|subventions fossiles|vulnerabilite energetique)/.test(h)) {
    return { family: "energie", style: "policy-dark", template: "pipeline-valve" };
  }
  if (/(sanction|tarif|commerce|trade|section ?122|section ?301|china|chine|trump.xi|zlecaf|cbam)/.test(h)) {
    return { family: "commerce-sanctions", style: "policy-dark", template: "map-arrows" };
  }
  if (/(aide|apd|developpement|development|pma|afrique|africa|humanitaire|haiti|soudan|rail|lobito|seville|sevilla)/.test(h)) {
    const crisisHeavy = /(polycrisis|crise|soudan|haiti|choc|securite alimentaire|pma|contraction|fragile)/.test(h);
    return {
      family: crisisHeavy ? "afrique-pma" : "developpement",
      style: crisisHeavy ? "policy-dark" : "economist-light",
      template: crisisHeavy ? "map-arrows" : "coins-cascade",
    };
  }
  if (/(pme|fragilite par la base|factory|factories|industrie|industrial|pass.through|\bsafe\b|rearm|rearmement|defense|otan|dual.use)/.test(h)) {
    return { family: "defense", style: "policy-dark", template: "scale-vs-factories" };
  }
  if (/(g7|evian|spring meetings|multilateral|borrowers|donor|donateur|coordination|bilan g7)/.test(h)) {
    return { family: "g7-multilateral", style: "policy-dark", template: "roundtable-flows" };
  }
  if (/(dollar|deficit courant|gopinath|pettis|architecture|afi|fmi|bmd|banque mondiale|euroclear|reserve|dette|macrofinance|financial|financiere)/.test(h)) {
    return { family: "architecture-financiere", style: "policy-dark", template: "balance-bars" };
  }
  if (/(institution|gouvernance|reforme|vatican|papaut|leon xiv|non expedit|politique publique)/.test(h) || theme === "institutions") {
    return { family: "institutions", style: "economist-light", template: "parliament-symbol" };
  }

  const themeFamily = {
    "polycrisis": "polycrisis",
    "polycrisis-asie": "polycrisis",
    "geopolitical": "geoeconomie",
    "geopolitics-economics": "geoeconomie",
    "geoeconomics": "geoeconomie",
    "geoeconomie": "geoeconomie",
    "geopolitique": "geoeconomie",
    "architecture-financiere": "architecture-financiere",
    "commerce": "commerce-sanctions",
    "trade": "commerce-sanctions",
    "energie": "energie",
    "defense": "defense",
    "developpement": "developpement",
    "development": "developpement",
    "afrique": "afrique-pma",
    "africa": "afrique-pma",
    "g7": "g7-multilateral",
    "securite": "defense",
    "spring-meetings": "g7-multilateral",
    "iran": "iran-moyen-orient",
  };
  const family = themeFamily[theme] ?? "geoeconomie";
  const first = metaphors[family]?.[0];
  return {
    family,
    style: family === "developpement" || family === "institutions" ? "economist-light" : "policy-dark",
    template: first?.template ?? "map-arrows",
  };
}

function chooseMetaphor(article, family, template) {
  const candidates = metaphors[family] ?? metaphors.geoeconomie;
  return candidates.find((candidate) => candidate.template === template) ?? candidates[0];
}

function promptFor(article, style, templateSlug, metaphor) {
  const title = article.frontmatter.title ?? article.slug;
  const summary = article.frontmatter.summary && article.frontmatter.summary !== ">"
    ? `\nArticle summary: ${article.frontmatter.summary}`
    : "";

  if (style === "economist-light") {
    return `Create a 16:9 horizontal conceptual editorial thumbnail illustration.
Use the Economist-light register: warm ivory background, dark ink linework, limited flat colours, one strong deep-red accent, optional muted blue-grey or ochre, subtle paper texture.

Template: ${templateByName[templateSlug] ?? templateSlug}.
Subject: ${metaphor.subject}.
Show ${metaphor.central_symbol} as the dominant visual metaphor. Add only ${metaphor.secondary_1} and ${metaphor.secondary_2} if they clarify the idea.

Article title: ${title}${summary}

Composition rules: one central idea, generous negative space, simple geometry, strong silhouette, readable at 160x90 px, mature current-affairs magazine feel.

No text, no letters, no numbers, no logos, no flags, no photorealism, no public figures, no generic stock illustration, no childish cartoon, no clutter.`;
  }

  return `Create a 16:9 horizontal editorial thumbnail illustration.
Use the Policy-dark register: dark anthracite background, warm off-white main forms, deep editorial red accent, optional muted ochre, slightly textured engraving-inspired look.

Template: ${templateByName[templateSlug] ?? templateSlug}.
Subject: ${metaphor.subject}.
Show ${metaphor.central_symbol} as the dominant visual metaphor. Add only ${metaphor.secondary_1} and ${metaphor.secondary_2} if they clarify the idea.

Article title: ${title}${summary}

Composition rules: one central idea, strong silhouette, high contrast, readable at 160x90 px, mature current-affairs magazine feel.

No text, no letters, no numbers, no logos, no flags, no photorealism, no public figures, no generic globe, no childish cartoon, no clutter.`;
}

const articles = listPolicyMarkdownFiles()
  .map(loadPolicyArticle)
  .filter((article) => article.frontmatter.draft !== true && article.frontmatter.title);

const queue = articles.map((article, index) => {
  const { family, style, template } = classify(article);
  const metaphor = chooseMetaphor(article, family, template);
  return {
    index: index + 1,
    slug: article.slug,
    permalink: article.permalink,
    source: relative(repoRoot, article.filePath),
    title: article.frontmatter.title,
    doc_type: article.frontmatter.doc_type ?? null,
    theme: article.frontmatter.theme ?? null,
    tags: article.frontmatter.tags ?? [],
    family,
    style,
    template,
    metaphor,
    prompt: promptFor(article, style, template, metaphor),
  };
});

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "policy-v2-production-queue.json"), `${JSON.stringify(queue, null, 2)}\n`);

const markdown = [
  "# Policy v2 production queue",
  "",
  `Articles: ${queue.length}`,
  "",
  ...queue.map((item) => [
    `## ${String(item.index).padStart(2, "0")} — ${item.title}`,
    "",
    `- Source: \`${item.source}\``,
    `- Style: \`${item.style}\``,
    `- Family: \`${item.family}\``,
    `- Template: \`${item.template}\``,
    `- Metaphor: ${item.metaphor.subject}`,
    "",
    "```text",
    item.prompt,
    "```",
    "",
  ].join("\n")),
].join("\n");

writeFileSync(join(outDir, "policy-v2-prompts.md"), markdown);
console.log(join(outDir, "policy-v2-production-queue.json"));
console.log(join(outDir, "policy-v2-prompts.md"));
