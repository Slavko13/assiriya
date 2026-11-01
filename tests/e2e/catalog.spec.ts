import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

function watchRuntimeErrors(page: Page): RuntimeErrors {
  const errors: RuntimeErrors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.console.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('opens the dynamic catalog and a published WooCommerce category', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
  expect(shopUrl, 'The header must expose the configured WooCommerce shop URL').toBeTruthy();
  expect(new URL(shopUrl!, page.url()).pathname, 'The repaired catalog route must use the canonical WooCommerce slug').toBe('/shop/');
  await page.goto(shopUrl!, { waitUntil: 'networkidle' });

  const catalog = page.locator('.az-shop-categories');
  await expect(catalog).toBeVisible();
  await expect(catalog.getByRole('heading', { name: 'Каталог автозапчастей' })).toBeVisible();

  const categoryCards = catalog.locator('.az-category-card');
  expect(await categoryCards.count(), 'The seeded top-level catalog should expose its eight demo categories').toBeGreaterThanOrEqual(8);

  const visualDiffDirectory = path.resolve(process.cwd(), 'docs/qa/visual-diffs');
  await mkdir(visualDiffDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(visualDiffDirectory, `catalog-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
    style: '.az-skip-link { display: none !important; }',
  });

  const brakes = categoryCards.filter({ hasText: 'Тормозная система' });
  await expect(brakes).toHaveCount(1);
  await brakes.click();
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/\/product-category\//);
  await expect(page.locator('.woocommerce-breadcrumb')).toContainText('Тормозная система');
  await expect(page.getByRole('heading', { level: 1, name: 'Тормозная система' })).toBeVisible();
  expect(await page.locator('ul.products li.product').count(), 'The published category should contain demo products').toBeGreaterThan(0);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});
