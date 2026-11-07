import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '../..');

async function projectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8');
}

function singleRegressionTuple(content, pattern, label) {
  const matches = [...content.matchAll(pattern)];

  assert.equal(matches.length, 1, `${label} must contain exactly one current regression summary`);

  return matches[0].slice(1).map(Number);
}

test('published current regression summaries stay in sync', async () => {
  const [readme, acceptance, progress, deployment] = await Promise.all([
    projectFile('README.md'),
    projectFile('docs/implementation/acceptance-status.md'),
    projectFile('docs/implementation/progress.md'),
    projectFile('docs/implementation/deployment.md'),
  ]);

  const canonical = singleRegressionTuple(
    acceptance,
    /^\*\*Текущий regression после [^:\r\n]+:\*\* `(\d+)` tests = `(\d+) passed`, `(\d+) intentional skipped`, `(\d+) failed`;/gm,
    'acceptance status',
  );
  const [total, passed, skipped, failed] = canonical;

  assert.deepEqual(canonical, [70, 68, 2, 0], 'current verified regression lock changed without review');
  assert.equal(total, passed + skipped + failed, 'canonical regression total must add up');
  assert.equal(failed, 0, 'README summary format is valid only for a zero-failure current regression');

  const readmeStatus = singleRegressionTuple(
    readme,
    /^- последний локальный Playwright-прогон: \*\*(\d+) tests: (\d+) passed, (\d+) intentionally skipped\*\*;/gm,
    'README status',
  );
  const readmeTests = singleRegressionTuple(
    readme,
    /^Текущий локальный результат: \*\*(\d+) tests: (\d+) passed, (\d+) intentionally skipped\*\*\./gm,
    'README tests handoff',
  );

  const progressSummary = singleRegressionTuple(
    progress,
    /^\| E2E\/a11y\/visual \| текущий Playwright: `(\d+)` tests, `(\d+) passed`, `(\d+) intentional skipped`, `(\d+) failed`;/gm,
    'progress',
  );
  const deploymentSummary = singleRegressionTuple(
    deployment,
    /^- Playwright: (\d+) tests, (\d+) passed, (\d+) intentional skipped, (\d+) failed;/gm,
    'deployment',
  );

  assert.deepEqual(readmeStatus, [total, passed, skipped]);
  assert.deepEqual(readmeTests, [total, passed, skipped]);
  assert.deepEqual(progressSummary, canonical);
  assert.deepEqual(deploymentSummary, canonical);
});

test('I2-S83 publishes the complete Paper frontend inventory', async () => {
  const [matrix, evidence, iterations, progress] = await Promise.all([
    projectFile('docs/implementation/frontend-route-matrix.md'),
    projectFile('docs/qa/visual-diffs/i2-s83/README.md'),
    projectFile('docs/implementation/iterations.md'),
    projectFile('docs/implementation/progress.md'),
  ]);

  const screenRows = [
    ...matrix.matchAll(/^\| SCR-0(?:0[1-9]|1[0-3]) \| [^|]+ \| [^|]+ \| \[Paper\]/gm),
  ];
  const expectedIds = Array.from({ length: 13 }, (_, index) => String(index + 1).padStart(3, '0'));
  assert.equal(screenRows.length, 13, 'I2-S83 route matrix must contain one row for every Paper screen');
  assert.deepEqual(
    screenRows.map(([row]) => row.match(/SCR-(\d{3})/)?.[1]).sort(),
    expectedIds,
    'I2-S83 route matrix must contain each SCR-001—013 exactly once',
  );
  assert.match(matrix, /\*\*Итог:\*\* `0 DONE`, `10 PARTIAL`, `3 MISSING`\./);
  assert.match(evidence, /Paper token hash: `811c9dc5`/);
  assert.match(evidence, /13 Paper references, 39 current actual captures and 26 diagnostic comparisons/);
  assert.match(iterations, /^### I2-S83 —/m);
  assert.match(progress, /I2-S83/);

  const evidenceDirectory = path.join(projectRoot, 'docs/qa/visual-diffs/i2-s83');
  const evidenceFiles = await readdir(evidenceDirectory);
  const paperFiles = evidenceFiles.filter((name) => /^paper-scr-0(?:0[1-9]|1[0-3])-.+\.png$/.test(name));
  const actualFiles = evidenceFiles.filter((name) => /^before-scr-0(?:0[1-9]|1[0-3])-.+\.png$/.test(name));
  const sideBySideFiles = evidenceFiles.filter((name) => /^side-by-side-scr-0(?:0[1-9]|1[0-3])-.+\.png$/.test(name));
  const overlayFiles = evidenceFiles.filter((name) => /^overlay-scr-0(?:0[1-9]|1[0-3])-.+\.png$/.test(name));
  const evidencePngFiles = evidenceFiles.filter((name) => name.endsWith('.png')).sort();
  const screenIds = (files) => [...new Set(files.map((name) => name.match(/^.*scr-(\d{3})-/)?.[1]))].sort();
  const expectedProjects = ['desktop-chrome-1440', 'mobile-chrome-390', 'mobile-chrome-360'];
  const expectedActualKeys = expectedIds.flatMap((id) => expectedProjects.map((project) => `${id}:${project}`)).sort();
  const actualKeys = actualFiles.map((name) => {
    const match = name.match(/^before-scr-(\d{3})-.+-(desktop-chrome-1440|mobile-chrome-390|mobile-chrome-360)\.png$/);
    return match ? `${match[1]}:${match[2]}` : '';
  }).sort();

  assert.equal(paperFiles.length, 13, 'I2-S83 must retain all 13 Paper exports');
  assert.equal(actualFiles.length, 39, 'I2-S83 must retain 13 actuals for each of three public projects');
  assert.equal(sideBySideFiles.length, 13, 'I2-S83 must retain one desktop side-by-side per screen');
  assert.equal(overlayFiles.length, 13, 'I2-S83 must retain one desktop overlay per screen');
  assert.equal(evidencePngFiles.length, 78, 'I2-S83 evidence must contain exactly the documented 78 PNG files');
  assert.deepEqual(
    evidencePngFiles,
    [...paperFiles, ...actualFiles, ...sideBySideFiles, ...overlayFiles].sort(),
    'I2-S83 evidence must not contain PNG files outside the four documented artifact families',
  );
  assert.deepEqual(actualKeys, expectedActualKeys, 'I2-S83 must retain each SCR on all three public projects');
  assert.deepEqual(screenIds(paperFiles), expectedIds);
  assert.deepEqual(screenIds(actualFiles), expectedIds);
  assert.deepEqual(screenIds(sideBySideFiles), expectedIds);
  assert.deepEqual(screenIds(overlayFiles), expectedIds);

  const visualFiles = await readdir(path.join(projectRoot, 'docs/qa/visual-diffs'), { recursive: true });
  assert.equal(
    visualFiles.filter((name) => name.endsWith('.png')).length,
    133,
    'published visual repository total changed without updating the I2-S83 evidence contract',
  );
});
