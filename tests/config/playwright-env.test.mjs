import assert from 'node:assert/strict';
import test from 'node:test';

import { validatePlaywrightEnvironment } from '../../scripts/playwright-env.mjs';

test('requires an explicit base URL', () => {
  assert.throws(
    () => validatePlaywrightEnvironment({}),
    /BASE_URL is required/,
  );
});

test('rejects malformed or unsafe base URLs', () => {
  const invalidTargets = [
    'not-a-url',
    'ftp://example.test/',
    'https://user:password@example.test/',
    'https://example.test/?preview=1',
    'https://example.test/#preview',
    'https://example.test/wordpress/',
  ];

  for (const BASE_URL of invalidTargets) {
    assert.throws(() => validatePlaywrightEnvironment({ BASE_URL }), /Playwright preflight/);
  }
});

test('allows public tests with only an explicit safe base URL', () => {
  assert.deepEqual(
    validatePlaywrightEnvironment({ BASE_URL: 'http://localhost:8086' }),
    {
      baseURL: 'http://localhost:8086/',
      adminWritesEnabled: false,
    },
  );
});

test('rejects every partial or invalid admin-write opt-in', () => {
  const partialEnvironments = [
    { WP_ADMIN_USER: 'admin' },
    { WP_ADMIN_PASSWORD: 'secret' },
    { E2E_ALLOW_ADMIN_WRITES: '1' },
    { WP_ADMIN_USER: 'admin', WP_ADMIN_PASSWORD: 'secret' },
    { WP_ADMIN_USER: 'admin', E2E_ALLOW_ADMIN_WRITES: '1' },
    { WP_ADMIN_PASSWORD: 'secret', E2E_ALLOW_ADMIN_WRITES: '1' },
    { WP_ADMIN_USER: 'admin', WP_ADMIN_PASSWORD: 'secret', E2E_ALLOW_ADMIN_WRITES: '0' },
  ];

  for (const partialEnvironment of partialEnvironments) {
    assert.throws(
      () => validatePlaywrightEnvironment({ BASE_URL: 'http://localhost:8086', ...partialEnvironment }),
      /Mutable admin E2E requires/,
    );
  }
});

test('allows admin writes only with the complete explicit triplet', () => {
  assert.deepEqual(
    validatePlaywrightEnvironment({
      BASE_URL: 'https://example.test/',
      WP_ADMIN_USER: 'admin',
      WP_ADMIN_PASSWORD: 'secret',
      E2E_ALLOW_ADMIN_WRITES: '1',
    }),
    {
      baseURL: 'https://example.test/',
      adminWritesEnabled: true,
    },
  );
});

test('does not disclose supplied credential values in errors', () => {
  assert.throws(
    () => validatePlaywrightEnvironment({
      BASE_URL: 'http://localhost:8086',
      WP_ADMIN_USER: 'private-user-value',
      WP_ADMIN_PASSWORD: 'private-password-value',
    }),
    (error) => {
      assert.match(error.message, /Mutable admin E2E requires/);
      assert.doesNotMatch(error.message, /private-user-value|private-password-value/);
      return true;
    },
  );
});
