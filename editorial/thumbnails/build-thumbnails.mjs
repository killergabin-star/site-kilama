#!/usr/bin/env node
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { loadPolicyArticle, listPolicyMarkdownFiles } from './content-utils.mjs';
import { resolveThumbnail } from './resolver.mjs';

const cwd = process.cwd();
const outputDir = 'static/thumbnails/policy';
const dataPath = 'data/policy_thumbnails.json';
const chartEngineDir = process.env.CHART_ENGINE_DIR ?? '/Volumes/T7 sharing/site-kilama-lab/tools/chart-engine';

mkdirSync(outputDir, { recursive: true });
mkdirSync(dirname(dataPath), { recursive: true });

const articles = listPolicyMarkdownFiles().map(loadPolicyArticle);
const manifest = {};
const counts = { custom: 0, chart: 0, category: 0, null: 0 };

for (const article of articles) {
  const targetRel = join(outputDir, `${article.slug}.svg`);
  const publicPath = `/${targetRel.replace(/^static\//, '').split('\\').join('/')}`;

  const resolved = resolveThumbnail(article, {
    cwd,
    outputDir,
    chartEngineDir,
    renderCharts: true,
    warn: (message) => console.warn(`[build-thumbnails] ${article.filePath}: ${message}`),
  });

  if (!resolved) {
    counts.null += 1;
    continue;
  }

  counts[resolved.strategy] = (counts[resolved.strategy] ?? 0) + 1;

  if (resolved.strategy !== 'chart') {
    copyFileSync(resolve(cwd, resolved.svgPath), resolve(cwd, targetRel));
  }

  manifest[article.permalink] = {
    strategy: resolved.strategy,
    path: publicPath,
    source: resolved.svgPath,
  };
}

writeFileSync(dataPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`Policy thumbnails built: ${articles.length} articles`);
console.log(`custom: ${counts.custom}`);
console.log(`chart: ${counts.chart}`);
console.log(`category: ${counts.category}`);
console.log(`null: ${counts.null}`);
console.log(`manifest: ${dataPath}`);
console.log(`assets: ${outputDir}`);
