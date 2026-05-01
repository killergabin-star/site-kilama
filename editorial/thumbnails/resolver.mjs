import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

const DEFAULT_CHART_ENGINE_DIR = '/Volumes/T7 sharing/site-kilama-lab/tools/chart-engine';
const DEFAULT_CATEGORY_MAPPING = 'editorial/thumbnails/category-mapping.json';
const DEFAULT_CATEGORIES_DIR = 'editorial/thumbnails/categories';

export function resolveThumbnail(article = {}, options = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  const frontmatter = article.frontmatter ?? article.params ?? {};
  const warning = createWarningSink(options);

  if (!frontmatter || Object.keys(frontmatter).length === 0) {
    warning('Cannot resolve thumbnail: article has no frontmatter.');
    return null;
  }

  const articlePath = article.filePath ? resolve(cwd, article.filePath) : null;
  const articleDir = resolveArticleDir(article, cwd);

  const customPath = frontmatter.thumbnail?.custom_path ?? frontmatter.thumbnail?.customPath;
  if (customPath) {
    const resolvedCustom = resolveCustomThumbnailPath(customPath, { articleDir, cwd });
    if (resolvedCustom) {
      return {
        strategy: 'custom',
        svgPath: toPortablePath(toRepoRelative(resolvedCustom, cwd)),
      };
    }
    warning(`Custom thumbnail not found: ${customPath}`);
  }

  const chartPath = findChartBrief(article, { cwd, articleDir, warning });
  if (chartPath) {
    const outputPath = resolveChartOutputPath(article, chartPath, cwd, options);
    if (options.renderCharts || typeof options.renderChartThumbnail === 'function') {
      const renderer = options.renderChartThumbnail ?? renderChartThumbnail;
      renderer(chartPath, outputPath, {
        article,
        cwd,
        chartEngineDir: options.chartEngineDir ?? process.env.CHART_ENGINE_DIR ?? DEFAULT_CHART_ENGINE_DIR,
        palette: options.palette ?? 'vivid-editorial',
        lang: options.lang ?? frontmatter.lang ?? frontmatter.language ?? 'fr',
        width: options.width ?? 400,
        height: options.height ?? 225,
      });
    }

    return {
      strategy: 'chart',
      svgPath: toPortablePath(toRepoRelative(outputPath, cwd)),
    };
  }

  const category = resolveCategory(frontmatter, {
    cwd,
    mappingPath: options.mappingPath,
    warning,
  });

  if (category) {
    const categoriesDir = resolve(cwd, options.categoriesDir ?? DEFAULT_CATEGORIES_DIR);
    const svgPath = join(categoriesDir, `${category}.svg`);
    if (existsSync(svgPath)) {
      return {
        strategy: 'category',
        svgPath: toPortablePath(toRepoRelative(svgPath, cwd)),
      };
    }

    warning(`Mapped category SVG not found: ${category}.svg`);
  }

  const fallback = resolveFallbackCategory(cwd, options);
  if (fallback) {
    return {
      strategy: 'category',
      svgPath: toPortablePath(toRepoRelative(fallback, cwd)),
    };
  }

  warning(`Cannot resolve thumbnail for ${articlePath ? toPortablePath(toRepoRelative(articlePath, cwd)) : 'article'}.`);
  return null;
}

export function findChartBrief(article = {}, context = {}) {
  const cwd = resolve(context.cwd ?? process.cwd());
  const articleDir = context.articleDir ?? resolveArticleDir(article, cwd);
  const frontmatter = article.frontmatter ?? article.params ?? {};
  const warning = context.warning ?? (() => {});

  const declared = frontmatter.thumbnail?.chart_brief ?? frontmatter.thumbnail?.chartBrief ?? article.chartBrief;
  if (declared) {
    const chart = resolveExistingPath(declared, [articleDir, cwd]);
    if (chart) return chart;
    warning(`Chart brief not found: ${declared}`);
  }

  const chartCandidates = [
    join(articleDir, 'charts', 'main.json'),
    join(articleDir, 'charts', 'figure-1.json'),
  ];

  for (const candidate of chartCandidates) {
    if (existsSync(candidate)) return candidate;
  }

  const chartsDir = join(articleDir, 'charts');
  try {
    const firstJson = readdirSync(chartsDir)
      .filter((name) => name.endsWith('.json'))
      .sort()[0];
    return firstJson ? join(chartsDir, firstJson) : null;
  } catch {
    return null;
  }
}

export function resolveCategory(frontmatter = {}, options = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  const mappingPath = resolve(cwd, options.mappingPath ?? DEFAULT_CATEGORY_MAPPING);
  const mapping = readMapping(mappingPath);

  const values = collectCategorySignals(frontmatter);
  if (values.length === 0) {
    options.warning?.('Cannot resolve category: no theme, category or tags found.');
    return null;
  }

  for (const value of values) {
    const category = lookupMapping(mapping, value);
    if (category) return category;
  }

  return mapping._default ?? '_fallback';
}

export function chartEngineSupportsThumbnailMode(chartEngineDir = DEFAULT_CHART_ENGINE_DIR) {
  const command = resolveChartEngineCommand(chartEngineDir);
  if (!command) return false;

  const result = spawnSync(process.execPath, [...command.args, 'render', '--help'], {
    cwd: chartEngineDir,
    encoding: 'utf8',
  });

  return result.status === 0 && result.stdout.includes('--thumbnail-mode');
}

export function renderChartThumbnail(chartPath, outputPath, options = {}) {
  const chartEngineDir = options.chartEngineDir ?? process.env.CHART_ENGINE_DIR ?? DEFAULT_CHART_ENGINE_DIR;
  const command = resolveChartEngineCommand(chartEngineDir);
  if (!command) {
    throw new Error(`Chart engine CLI not found in: ${chartEngineDir}`);
  }

  mkdirSync(dirname(outputPath), { recursive: true });

  const width = options.width ?? 400;
  const height = options.height ?? 225;
  const palette = options.palette ?? 'vivid-editorial';
  const lang = options.lang ?? 'fr';

  let briefPath = chartPath;
  const args = [...command.args, 'render', briefPath, '--palette', palette, '--lang', lang, '--format', 'svg', '--out', outputPath];

  if (chartEngineSupportsThumbnailMode(chartEngineDir)) {
    args.push('--width', String(width), '--height', String(height), '--thumbnail-mode');
  } else {
    briefPath = writeTemporaryThumbnailBrief(chartPath, { width, height });
    const briefArgIndex = args.indexOf(chartPath);
    args[briefArgIndex] = briefPath;
  }

  const result = spawnSync(process.execPath, args, {
    cwd: chartEngineDir,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Chart thumbnail render failed for ${chartPath}`);
  }

  return outputPath;
}

function resolveChartEngineCommand(chartEngineDir) {
  const distCli = join(chartEngineDir, 'dist', 'cli.js');
  const srcCli = join(chartEngineDir, 'src', 'cli.ts');
  const distPalettesDir = join(chartEngineDir, 'dist', 'palettes');
  const requiredPalettes = [
    'vivid-editorial.css',
    'vivid-bloomberg.css',
    'editorial-print.css',
    'bloomberg-print.css',
  ];

  const distIsComplete = existsSync(distCli)
    && requiredPalettes.every((name) => existsSync(join(distPalettesDir, name)));

  if (distIsComplete) return { args: [distCli] };
  if (existsSync(srcCli)) return { args: ['--loader', 'ts-node/esm', srcCli] };
  if (existsSync(distCli)) return { args: [distCli] };
  return null;
}

function resolveArticleDir(article, cwd) {
  if (article.dir) return resolve(cwd, article.dir);
  if (article.contentDir) return resolve(cwd, article.contentDir);
  if (article.filePath) return dirname(resolve(cwd, article.filePath));
  return cwd;
}

function resolveExistingPath(candidate, bases) {
  const paths = isAbsolute(candidate)
    ? [candidate]
    : bases.map((base) => resolve(base, candidate));

  return paths.find((path) => existsSync(path)) ?? null;
}

function resolveCustomThumbnailPath(candidate, { articleDir, cwd }) {
  const direct = resolveExistingPath(candidate, [articleDir, cwd]);
  if (direct) return direct;

  if (isAbsolute(candidate)) return null;

  const normalized = candidate.replace(/^\/+/, '');
  const filename = basename(normalized);
  const hugoCandidates = [
    resolve(cwd, 'static', normalized),
    resolve(cwd, 'themes', 'kilama', 'static', normalized),
    resolve(cwd, 'editorial', 'thumbnails', 'custom', filename),
  ];

  return hugoCandidates.find((path) => existsSync(path)) ?? null;
}

function resolveChartOutputPath(article, chartPath, cwd, options) {
  if (options.chartOutputPath) return resolve(cwd, options.chartOutputPath);
  const slug = article.slug ?? slugFromArticle(article) ?? basename(dirname(chartPath));
  if (options.outputDir) return resolve(cwd, options.outputDir, `${slug}.svg`);
  return join(dirname(chartPath), 'output', 'chart-thumbnail.svg');
}

function slugFromArticle(article) {
  if (!article.filePath) return null;
  const dirName = basename(dirname(article.filePath));
  const fileName = basename(article.filePath, extname(article.filePath));
  return fileName === 'index' || fileName === '_index' ? dirName : fileName;
}

function resolveFallbackCategory(cwd, options) {
  const categoriesDir = resolve(cwd, options.categoriesDir ?? DEFAULT_CATEGORIES_DIR);
  const fallback = join(categoriesDir, '_fallback.svg');
  return existsSync(fallback) ? fallback : null;
}

function readMapping(mappingPath) {
  return JSON.parse(readFileSync(mappingPath, 'utf8'));
}

function lookupMapping(mapping, value) {
  const normalized = normalizeSignal(value);
  if (Object.hasOwn(mapping, normalized)) return mapping[normalized];

  const accentless = stripAccents(normalized);
  if (Object.hasOwn(mapping, accentless)) return mapping[accentless];

  return null;
}

function collectCategorySignals(frontmatter) {
  const signals = [];
  pushSignal(signals, frontmatter.thumbnail?.category);
  pushSignal(signals, frontmatter.theme);
  pushSignal(signals, frontmatter.category);
  pushSignal(signals, frontmatter.categories);
  pushSignal(signals, frontmatter.tags);
  return signals;
}

function pushSignal(signals, value) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) pushSignal(signals, item);
    return;
  }
  signals.push(value);
}

function normalizeSignal(value) {
  return String(value)
    .normalize('NFC')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function stripAccents(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function toRepoRelative(filePath, cwd) {
  const rel = relative(cwd, filePath);
  return rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : filePath;
}

function toPortablePath(filePath) {
  return filePath.split(sep).join('/');
}

function createWarningSink(options) {
  if (options.warn === false) return () => {};
  if (typeof options.warn === 'function') return options.warn;
  return (message) => console.warn(`[thumbnails] ${message}`);
}

function writeTemporaryThumbnailBrief(chartPath, { width, height }) {
  const brief = JSON.parse(readFileSync(chartPath, 'utf8'));
  const thumbnailBrief = simplifyBriefForThumbnail(brief, { width, height });
  const tempDir = mkdtempSync(join(tmpdir(), 'policy-chart-thumb-'));
  const tempPath = join(tempDir, basename(chartPath));
  writeFileSync(tempPath, JSON.stringify(thumbnailBrief, null, 2), 'utf8');
  return tempPath;
}

function simplifyBriefForThumbnail(brief, { width, height }) {
  const clone = globalThis.structuredClone
    ? globalThis.structuredClone(brief)
    : JSON.parse(JSON.stringify(brief));

  clone.export = {
    ...(clone.export ?? {}),
    default_size: [width, height],
  };
  clone.interactive = false;

  if (Array.isArray(clone.annotations) && clone.annotations.length > 1) {
    clone.annotations = [clone.annotations.find((annotation) => annotation.type === 'point-annotation' || annotation.type === 'inline-callout') ?? clone.annotations[0]];
  }

  if (Array.isArray(clone.data?.series) && clone.data.series.length > 2) {
    const hero = clone.data.series.find((series) => series.hero);
    clone.data.series = hero
      ? [hero, ...clone.data.series.filter((series) => series !== hero).slice(0, 1)]
      : clone.data.series.slice(0, 2);
  }

  return clone;
}
