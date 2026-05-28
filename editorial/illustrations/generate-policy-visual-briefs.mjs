#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { loadPolicyArticle, listPolicyMarkdownFiles } from '../thumbnails/content-utils.mjs';

const cwd = process.cwd();
const motifPath = resolve(cwd, 'editorial/illustrations/visual-motif-library.json');
const outputJsonPath = resolve(cwd, 'data/policy_visual_briefs.json');
const outputReviewPath = resolve(cwd, 'editorial/illustrations/policy-visual-briefs.review.md');
const currentManifestPath = resolve(cwd, 'data/policy_thumbnails.json');
const currentMappingPath = resolve(cwd, 'editorial/thumbnails/dalle-original-mapping.json');

const motifs = JSON.parse(readFileSync(motifPath, 'utf8'));
const thumbnailManifest = readJsonIfExists(currentManifestPath, {});
const curatedMapping = readJsonIfExists(currentMappingPath, []);
const curatedBySlug = new Map(curatedMapping.map((item) => [item.slug, item]));

const articles = listPolicyMarkdownFiles()
  .map(loadPolicyArticle)
  .filter((article) => article.frontmatter?.title);

const briefs = {};
const reviewRows = [];

for (const article of articles) {
  const extracted = extractArticleText(article.raw);
  const titleHaystack = normalize([
    article.slug,
    article.frontmatter.title,
  ].filter(Boolean).join(' '));
  const metadataHaystack = normalize([
    article.frontmatter.theme,
    ...(article.frontmatter.tags ?? []),
  ].filter(Boolean).join(' '));
  const fullHaystack = normalize([
    titleHaystack,
    metadataHaystack,
    extracted.summary,
    extracted.bodyExcerpt,
  ].filter(Boolean).join(' '));

  const motif = chooseMotif({ titleHaystack, metadataHaystack, fullHaystack });
  const confidence = motif.score >= 6 ? 'high' : motif.score >= 3 ? 'medium' : 'low';
  const currentThumbnail = resolveCurrentThumbnail(article);
  const reviewFlags = buildReviewFlags(article, motif, currentThumbnail, confidence);
  const prompt = buildPrompt(article, motif.entry, extracted);

  briefs[article.permalink] = {
    slug: article.slug,
    file_path: article.filePath,
    title: article.frontmatter.title,
    permalink: article.permalink,
    doc_type: article.frontmatter.doc_type ?? null,
    theme: article.frontmatter.theme ?? null,
    tags: article.frontmatter.tags ?? [],
    semantic_family: motif.entry.semantic_family,
    claim_frame: motif.key,
    visual_mode: motif.entry.visual_mode,
    style_register: motif.entry.style_register,
    visual_brief: motif.entry.visual_brief,
    generation_prompt: prompt,
    negative_prompt: 'No text, no words, no letters, no logos, no flags, no photorealistic politician portrait, no glossy corporate 3D, no generic world-map wallpaper.',
    confidence,
    current_thumbnail: currentThumbnail,
    review_flags: reviewFlags,
  };

  if (reviewFlags.length > 0) {
    reviewRows.push({
      title: article.frontmatter.title,
      slug: article.slug,
      claimFrame: motif.key,
      confidence,
      flags: reviewFlags,
    });
  }
}

mkdirSync(dirname(outputJsonPath), { recursive: true });
mkdirSync(dirname(outputReviewPath), { recursive: true });
writeFileSync(outputJsonPath, `${JSON.stringify(briefs, null, 2)}\n`, 'utf8');
writeFileSync(outputReviewPath, renderReview(briefs, reviewRows), 'utf8');

const counts = Object.values(briefs).reduce((acc, brief) => {
  acc.total += 1;
  acc[brief.style_register] = (acc[brief.style_register] ?? 0) + 1;
  acc[brief.confidence] = (acc[brief.confidence] ?? 0) + 1;
  acc.flagged += brief.review_flags.length > 0 ? 1 : 0;
  return acc;
}, { total: 0, flagged: 0 });

console.log(`Policy visual briefs: ${counts.total}`);
console.log(`flagged for review: ${counts.flagged}`);
console.log(`high confidence: ${counts.high ?? 0}`);
console.log(`medium confidence: ${counts.medium ?? 0}`);
console.log(`low confidence: ${counts.low ?? 0}`);
console.log(`output: data/policy_visual_briefs.json`);
console.log(`review: editorial/illustrations/policy-visual-briefs.review.md`);

function chooseMotif({ titleHaystack, metadataHaystack, fullHaystack }) {
  let best = { key: 'macro_path_break', entry: motifs.macro_path_break, score: 0 };

  for (const [key, entry] of Object.entries(motifs)) {
    const score = (entry.use_when ?? []).reduce((sum, signal) => {
      const normalized = normalize(signal);
      const titleHit = titleHaystack.includes(normalized);
      const metadataHit = metadataHaystack.includes(normalized);
      const fullHit = fullHaystack.includes(normalized);
      if (titleHit) return sum + (signalWeight(signal) * 3);
      if (metadataHit) return sum + (signalWeight(signal) * 0.7);
      if (fullHit) return sum + signalWeight(signal);
      return sum;
    }, 0);

    if (score > best.score) {
      best = { key, entry, score };
    }
  }

  return best;
}

function signalWeight(signal) {
  const normalized = normalize(signal);
  if (['g7', 'summit', 'oil', 'rail', 'routes'].includes(normalized)) return 0.5;
  if (normalized.length >= 12) return 2;
  if (normalized.includes(' ')) return 2;
  return 1;
}

function buildPrompt(article, motif, extracted) {
  const register = styleRegisterPrompt(motif.style_register);
  const title = article.frontmatter.title.replace(/\s+/g, ' ').trim();
  const summary = extracted.summary || extracted.bodyExcerpt || '';
  const sourceIdea = summary
    ? `Analytical source idea: ${truncate(summary, 220)}`
    : `Analytical source idea: ${truncate(title, 220)}`;

  return [
    'Original 16:9 editorial magazine illustration for an institutional economic-policy analysis.',
    sourceIdea,
    `Visual thesis: ${motif.visual_brief}`,
    `Scene: ${motif.subject}.`,
    register,
    'Readable at 160 x 90 px, one central metaphor, generous negative space, matte texture, disciplined composition.'
  ].join(' ');
}

function styleRegisterPrompt(styleRegister) {
  switch (styleRegister) {
    case 'economist-light':
      return 'Warm ivory background, ink linework, one analytical red accent, sober conceptual illustration, mature not playful.';
    case 'foreign-affairs-symbolic':
      return 'Strategic and sober symbolic composition, near-black or warm ivory field, one severe central object, restrained red accent, no decorative clutter.';
    case 'ft-data-visual':
      return 'Data-led editorial abstraction, chart logic transformed into visual metaphor, warm ivory and black with red stress line, precise and analytical.';
    case 'policy-dark':
    default:
      return 'Near-black editorial background, warm off-white forms, one analytical red accent, engraved texture, serious current-affairs register.';
  }
}

function resolveCurrentThumbnail(article) {
  const manifestEntry = thumbnailManifest[article.permalink] ?? null;
  const curatedEntry = curatedBySlug.get(article.slug) ?? null;

  return {
    manifest_path: manifestEntry?.path ?? null,
    manifest_strategy: manifestEntry?.strategy ?? null,
    source: manifestEntry?.source ?? null,
    curated_source_file: curatedEntry?.source_file ?? null,
    curated_image_index: curatedEntry?.image_index ?? null,
  };
}

function buildReviewFlags(article, motif, currentThumbnail, confidence) {
  const flags = [];

  if (confidence === 'low') {
    flags.push('semantic_match_low');
  }

  if (!currentThumbnail.manifest_path) {
    flags.push('no_current_thumbnail');
  }

  if (currentThumbnail.manifest_strategy === 'category') {
    flags.push('category_fallback_only');
  }

  if (article.frontmatter.doc_type === 'report' && motif.entry.style_register !== 'foreign-affairs-symbolic') {
    flags.push('report_may_need_more_sober_symbolic_register');
  }

  if (article.frontmatter.title && /Ormuz|Hormuz|Iran|Soudan|Haïti|Haiti|Camara|Sahel/i.test(article.frontmatter.title)
      && motif.key === 'macro_path_break') {
    flags.push('generic_macro_frame_for_geopolitical_piece');
  }

  return flags;
}

function extractArticleText(raw) {
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const frontmatterRaw = frontmatterMatch?.[1] ?? '';
  const body = frontmatterMatch ? raw.slice(frontmatterMatch[0].length) : raw;
  const summary = extractSummary(frontmatterRaw);
  const bodyExcerpt = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]*\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>`#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 900);

  return { summary, bodyExcerpt };
}

function extractSummary(frontmatterRaw) {
  const lines = frontmatterRaw.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const inline = lines[i].match(/^summary:\s*['"]?(.+?)['"]?\s*$/);
    if (inline && inline[1] !== '>' && inline[1] !== '|') return cleanText(inline[1]);

    if (/^summary:\s*[>|]\s*$/.test(lines[i])) {
      const block = [];
      for (let j = i + 1; j < lines.length; j += 1) {
        if (/^[A-Za-z0-9_-]+:/.test(lines[j])) break;
        const item = lines[j].replace(/^\s+/, '');
        if (item) block.push(item);
      }
      return cleanText(block.join(' '));
    }
  }

  return '';
}

function renderReview(briefs, reviewRows) {
  const byFrame = {};
  for (const brief of Object.values(briefs)) {
    byFrame[brief.claim_frame] = (byFrame[brief.claim_frame] ?? 0) + 1;
  }

  const frameRows = Object.entries(byFrame)
    .sort((a, b) => b[1] - a[1])
    .map(([frame, count]) => `| ${frame} | ${count} |`)
    .join('\n');

  const flaggedRows = reviewRows
    .slice(0, 80)
    .map((row) => `| ${row.slug} | ${row.confidence} | ${row.claimFrame} | ${row.flags.join(', ')} |`)
    .join('\n');

  return `# Policy visual briefs review\n\nGenerated from \`content/policy\`.\n\n## Distribution by claim frame\n\n| Claim frame | Articles |\n|---|---:|\n${frameRows}\n\n## Review queue\n\n| Slug | Confidence | Claim frame | Flags |\n|---|---|---|---|\n${flaggedRows || '| - | - | - | - |'}\n\n## Review instruction\n\nFor each flagged article, verify whether the claim frame describes the article-specific mechanism rather than a broad theme. If not, edit the motif library or promote a manually written visual brief before generating images.\n`;
}

function readJsonIfExists(path, fallback) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : fallback;
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, limit) {
  const text = cleanText(value);
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trim()}…`;
}
