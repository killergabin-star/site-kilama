import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveThumbnail } from './resolver.mjs';

function createFixtureRepo() {
  const cwd = mkdtempSync(join(tmpdir(), 'policy-thumbnails-test-'));
  const categoriesDir = join(cwd, 'editorial', 'thumbnails', 'categories');
  mkdirSync(categoriesDir, { recursive: true });
  writeFileSync(join(categoriesDir, 'polycrisis.svg'), '<svg></svg>', 'utf8');
  writeFileSync(join(categoriesDir, '_fallback.svg'), '<svg></svg>', 'utf8');
  writeFileSync(join(cwd, 'editorial', 'thumbnails', 'category-mapping.json'), JSON.stringify({
    polycrisis: 'polycrisis',
    _default: '_fallback',
  }), 'utf8');
  return {
    cwd,
    categoriesDir: 'editorial/thumbnails/categories',
    mappingPath: 'editorial/thumbnails/category-mapping.json',
  };
}

test('custom_path explicite -> strategy custom', () => {
  const fixture = createFixtureRepo();
  mkdirSync(join(fixture.cwd, 'custom'), { recursive: true });
  writeFileSync(join(fixture.cwd, 'custom', 'flagship.svg'), '<svg></svg>', 'utf8');

  const result = resolveThumbnail({
    filePath: 'content/policy/notes/custom.md',
    frontmatter: {
      thumbnail: {
        custom_path: 'custom/flagship.svg',
      },
    },
  }, { ...fixture, warn: false });

  assert.deepEqual(result, {
    strategy: 'custom',
    svgPath: 'custom/flagship.svg',
  });
});

test('custom_path Hugo static -> strategy custom', () => {
  const fixture = createFixtureRepo();
  mkdirSync(join(fixture.cwd, 'themes', 'kilama', 'static', 'thumbnails', 'custom'), { recursive: true });
  writeFileSync(join(fixture.cwd, 'themes', 'kilama', 'static', 'thumbnails', 'custom', 'flagship.svg'), '<svg></svg>', 'utf8');

  const result = resolveThumbnail({
    filePath: 'content/policy/notes/custom-hugo.md',
    frontmatter: {
      thumbnail: {
        custom_path: 'thumbnails/custom/flagship.svg',
      },
    },
  }, { ...fixture, warn: false });

  assert.deepEqual(result, {
    strategy: 'custom',
    svgPath: 'themes/kilama/static/thumbnails/custom/flagship.svg',
  });
});

test('chart_brief frontmatter -> strategy chart and renderer invocation', () => {
  const fixture = createFixtureRepo();
  const articleDir = join(fixture.cwd, 'content', 'policy', 'notes', 'with-chart');
  mkdirSync(join(articleDir, 'charts'), { recursive: true });
  writeFileSync(join(articleDir, 'charts', 'custom.json'), '{}', 'utf8');

  let renderCall = null;
  const result = resolveThumbnail({
    filePath: 'content/policy/notes/with-chart/index.md',
    slug: 'with-chart',
    frontmatter: {
      thumbnail: {
        chart_brief: 'charts/custom.json',
      },
    },
  }, {
    ...fixture,
    renderCharts: true,
    renderChartThumbnail: (chartPath, outputPath) => {
      renderCall = { chartPath, outputPath };
      mkdirSync(join(articleDir, 'charts', 'output'), { recursive: true });
      writeFileSync(outputPath, '<svg></svg>', 'utf8');
    },
    warn: false,
  });

  assert.equal(result.strategy, 'chart');
  assert.equal(result.svgPath, 'content/policy/notes/with-chart/charts/output/chart-thumbnail.svg');
  assert.ok(renderCall.chartPath.endsWith('content/policy/notes/with-chart/charts/custom.json'));
  assert.ok(existsSync(renderCall.outputPath));
});

test('charts/main.json détecté automatiquement -> strategy chart', () => {
  const fixture = createFixtureRepo();
  const articleDir = join(fixture.cwd, 'content', 'policy', 'notes', 'auto-chart');
  mkdirSync(join(articleDir, 'charts'), { recursive: true });
  writeFileSync(join(articleDir, 'charts', 'main.json'), '{}', 'utf8');

  const result = resolveThumbnail({
    filePath: 'content/policy/notes/auto-chart/index.md',
    frontmatter: {
      theme: 'polycrisis',
    },
  }, { ...fixture, warn: false });

  assert.equal(result.strategy, 'chart');
  assert.equal(result.svgPath, 'content/policy/notes/auto-chart/charts/output/chart-thumbnail.svg');
});

test('sans chart avec tag polycrisis -> category polycrisis.svg', () => {
  const fixture = createFixtureRepo();

  const result = resolveThumbnail({
    filePath: 'content/policy/notes/poly.md',
    frontmatter: {
      tags: ['polycrisis'],
    },
  }, { ...fixture, warn: false });

  assert.deepEqual(result, {
    strategy: 'category',
    svgPath: 'editorial/thumbnails/categories/polycrisis.svg',
  });
});

test('tag inconnu -> category _fallback.svg', () => {
  const fixture = createFixtureRepo();

  const result = resolveThumbnail({
    filePath: 'content/policy/notes/unknown.md',
    frontmatter: {
      tags: ['xyz'],
    },
  }, { ...fixture, warn: false });

  assert.deepEqual(result, {
    strategy: 'category',
    svgPath: 'editorial/thumbnails/categories/_fallback.svg',
  });
});

test('article vide -> null avec warning', () => {
  const fixture = createFixtureRepo();
  const warnings = [];

  const result = resolveThumbnail({}, {
    ...fixture,
    warn: (message) => warnings.push(message),
  });

  assert.equal(result, null);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /no frontmatter/);
});
