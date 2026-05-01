import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';

export function listPolicyMarkdownFiles(rootDir = 'content/policy') {
  const files = [];

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return files.sort();
}

export function loadPolicyArticle(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(raw);

  return {
    filePath,
    slug: slugFromContentPath(filePath),
    permalink: permalinkFromContentPath(filePath),
    frontmatter,
    raw,
  };
}

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const lines = match[1].split(/\r?\n/);
  const frontmatter = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
    if (!pair) continue;

    const [, key, value] = pair;

    if (key === 'tags' && value === '') {
      const tags = [];
      for (let j = i + 1; j < lines.length; j += 1) {
        const tag = lines[j].match(/^\s*-\s*(.+?)\s*$/);
        if (tag) {
          tags.push(cleanScalar(tag[1]));
          i = j;
          continue;
        }
        if (/^[A-Za-z0-9_-]+:/.test(lines[j])) break;
      }
      frontmatter.tags = tags;
      continue;
    }

    if (key === 'thumbnail' && value === '') {
      const thumbnail = {};
      for (let j = i + 1; j < lines.length; j += 1) {
        const nested = lines[j].match(/^\s{2}([A-Za-z0-9_-]+):\s*(.+?)\s*$/);
        if (nested) {
          thumbnail[nested[1]] = cleanScalar(nested[2]);
          i = j;
          continue;
        }
        if (/^[A-Za-z0-9_-]+:/.test(lines[j])) break;
      }
      frontmatter.thumbnail = thumbnail;
      continue;
    }

    frontmatter[key] = cleanScalar(value);
  }

  return frontmatter;
}

export function hasThumbnailFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return Boolean(match && /^thumbnail:\s*$/m.test(match[1]));
}

export function insertThumbnailFrontmatter(raw, thumbnail) {
  if (hasThumbnailFrontmatter(raw)) return raw;

  const block = [
    'thumbnail:',
    `  strategy: ${thumbnail.strategy}`,
  ];

  if (thumbnail.chart_brief) {
    block.push(`  chart_brief: ${thumbnail.chart_brief}`);
  }

  block.push('');

  return raw.replace(/^---\r?\n/, `---\n${block.join('\n')}`);
}

export function writeArticle(filePath, raw) {
  writeFileSync(filePath, raw, 'utf8');
}

export function permalinkFromContentPath(filePath) {
  const rel = relative('content', filePath).split('\\').join('/');
  const withoutExt = rel.slice(0, -extname(rel).length);
  return `/${withoutExt}/`;
}

export function slugFromContentPath(filePath) {
  const rel = relative('content/policy', filePath).split('\\').join('/');
  return rel
    .slice(0, -extname(rel).length)
    .replace(/\/index$/, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function findLocalChartBrief(filePath) {
  const articleDir = dirname(filePath);
  const candidates = [
    join(articleDir, 'charts', 'main.json'),
    join(articleDir, 'charts', 'figure-1.json'),
  ];

  for (const candidate of candidates) {
    try {
      readFileSync(candidate);
      return relative(articleDir, candidate).split('\\').join('/');
    } catch {
      // Continue to the next candidate.
    }
  }

  try {
    const chartsDir = join(articleDir, 'charts');
    const first = readdirSync(chartsDir)
      .filter((name) => name.endsWith('.json'))
      .sort()[0];
    return first ? `charts/${first}` : null;
  } catch {
    return null;
  }
}

export function isFlagshipCandidate(article) {
  const haystack = [
    article.slug,
    article.frontmatter.title,
    article.frontmatter.theme,
    ...(article.frontmatter.tags ?? []),
  ].join(' ').toLowerCase();

  return [
    'choc-ormuz',
    'ormuz',
    'babylon',
    'babylone',
    'nabuchodonosor',
    'pma',
    'soft-landing',
    'stabilisateurs',
    'pme',
    'fragilite',
    'fragilité',
  ].some((needle) => haystack.includes(needle));
}

function cleanScalar(value) {
  const trimmed = String(value ?? '').trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed.replace(/^['"]|['"]$/g, '');
}
