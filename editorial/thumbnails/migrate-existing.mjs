#!/usr/bin/env node
import { loadPolicyArticle, listPolicyMarkdownFiles, findLocalChartBrief, hasThumbnailFrontmatter, insertThumbnailFrontmatter, isFlagshipCandidate, writeArticle } from './content-utils.mjs';

const write = process.argv.includes('--write');
const articles = listPolicyMarkdownFiles().map(loadPolicyArticle);
const summary = {
  total: articles.length,
  existing: 0,
  chart: 0,
  category: 0,
  written: 0,
};
const flagship = [];

for (const article of articles) {
  if (hasThumbnailFrontmatter(article.raw)) {
    summary.existing += 1;
    continue;
  }

  const chartBrief = findLocalChartBrief(article.filePath);
  const thumbnail = chartBrief
    ? { strategy: 'chart', chart_brief: chartBrief }
    : { strategy: 'category' };

  summary[thumbnail.strategy] += 1;

  if (isFlagshipCandidate(article)) {
    flagship.push(`${article.slug} :: ${article.frontmatter.title ?? '(sans titre)'}`);
  }

  if (write) {
    writeArticle(article.filePath, insertThumbnailFrontmatter(article.raw, thumbnail));
    summary.written += 1;
  }
}

console.log(write ? 'Migration mode: write' : 'Migration mode: dry-run');
console.log(`articles: ${summary.total}`);
console.log(`thumbnail existing: ${summary.existing}`);
console.log(`to chart: ${summary.chart}`);
console.log(`to category: ${summary.category}`);
console.log(`written: ${summary.written}`);
console.log('');
console.log('Flagship candidates to review:');
for (const item of flagship) {
  console.log(`- ${item}`);
}
