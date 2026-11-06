import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

  assert.deepEqual(canonical, [61, 59, 2, 0], 'current verified regression lock changed without review');
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
