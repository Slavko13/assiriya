import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:8080';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 7_500,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    channel: 'chrome',
    colorScheme: 'light',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: process.env.IGNORE_HTTPS_ERRORS === '1',
  },
  projects: [
    {
      name: 'desktop-chrome-1440',
      testIgnore: '**/admin.spec.ts',
      use: {
        viewport: { width: 1440, height: 1100 },
      },
    },
    {
      name: 'mobile-chrome-390',
      testIgnore: ['**/admin.spec.ts', '**/desktop.spec.ts'],
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'mobile-chrome-360',
      testIgnore: ['**/admin.spec.ts', '**/desktop.spec.ts'],
      use: {
        viewport: { width: 360, height: 800 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'admin-chrome-desktop',
      testMatch: '**/admin.spec.ts',
      dependencies: ['desktop-chrome-1440', 'mobile-chrome-390', 'mobile-chrome-360'],
      use: {
        viewport: { width: 1440, height: 1100 },
      },
    },
  ],
});
