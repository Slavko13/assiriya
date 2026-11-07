import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page, type Response, type TestInfo } from '@playwright/test';

import { captureStableVisual } from './visual';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

type ExpectedRoute = {
  path: string;
  status: 200 | 404;
};

const expectedRouteInventory: ExpectedRoute[] = [
  { path: '/', status: 200 },
  { path: '/vin-request/', status: 200 },
  { path: '/shop/', status: 200 },
  { path: '/product-category/tormoznaya-sistema/', status: 200 },
  { path: '/cart/', status: 200 },
  { path: '/delivery/', status: 200 },
  { path: '/returns/', status: 200 },
  { path: '/contacts/', status: 200 },
  { path: '/vehicle/', status: 404 },
  { path: '/product-category/tormoznye-diski/', status: 404 },
  { path: '/about/', status: 404 },
  { path: '/faq/', status: 404 },
  { path: '/documents/', status: 404 },
  { path: '/offer/', status: 404 },
  { path: '/privacy/', status: 404 },
];

function watchRuntimeErrors(page: Page): RuntimeErrors {
  const errors: RuntimeErrors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function expectCurrentScreenHealthy(
  page: Page,
  runtimeErrors: RuntimeErrors,
  screen: string,
): Promise<void> {
  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(width.scroll, `${screen} must not overflow the document viewport`).toBeLessThanOrEqual(width.client + 1);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );
  expect(
    blockingViolations,
    `${screen} serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);
  expect(runtimeErrors.console.splice(0), `${screen} browser console errors`).toEqual([]);
  expect(runtimeErrors.page.splice(0), `${screen} uncaught page errors`).toEqual([]);
}

async function captureInventoryScreen(
  page: Page,
  testInfo: TestInfo,
  runtimeErrors: RuntimeErrors,
  screen: string,
  filename: string,
): Promise<void> {
  await captureStableVisual(page, testInfo, `i2-s83/${filename}-${testInfo.project.name}.png`);
  await expectCurrentScreenHealthy(page, runtimeErrors, screen);
}

async function gotoExpected(page: Page, path: string, status: 200 | 404): Promise<Response> {
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  expect(response, `${path} must return a document response`).not.toBeNull();
  expect(response!.status(), `${path} must preserve the inventoried HTTP status`).toBe(status);
  return response!;
}

function acknowledgeExpectedMissingDocument(runtimeErrors: RuntimeErrors, path: string): void {
  const consoleErrors = runtimeErrors.console.splice(0);
  const expectedMessage = 'Failed to load resource: the server responded with a status of 404 (Not Found)';
  expect(
    consoleErrors.every((message) => message === expectedMessage),
    `${path} must not hide console errors other than the optional browser document-404 message`,
  ).toBe(true);
  expect(consoleErrors.length, `${path} may emit at most one browser document-404 message`).toBeLessThanOrEqual(1);
  expect(runtimeErrors.page.splice(0), `${path} must not emit an uncaught page error`).toEqual([]);
}

async function addLoopProduct(page: Page, action: Locator): Promise<Response> {
  const responsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST' && responseUrl.searchParams.get('wc-ajax') === 'add_to_cart';
  });
  await action.click();
  const response = await responsePromise;
  expect(response.ok(), `WooCommerce add-to-cart failed with HTTP ${response.status()}`).toBe(true);
  return response;
}

async function pinCanonicalImageSources(imagesLocator: Locator): Promise<void> {
  await imagesLocator.evaluateAll(async (elements) => {
    const images = elements as HTMLImageElement[];
    for (const image of images) {
      const canonicalSource = image.getAttribute('src');
      if (!canonicalSource) {
        throw new Error('Visual evidence image has no canonical src attribute');
      }
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
      image.src = canonicalSource;
    }
    await Promise.all(images.map((image) => image.decode()));
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  });
}

test('inventories every current frontend state against the 13 Paper artboards', async ({ page }, testInfo) => {
  testInfo.setTimeout(600_000);
  const runtimeErrors = watchRuntimeErrors(page);

  await gotoExpected(page, '/', 200);
  const contactTrigger = page.locator('button[data-contact-open]:visible').first();
  const contactDialog = page.locator('dialog[data-contact-dialog]');
  await expect(contactTrigger).toBeVisible();
  await contactTrigger.focus();
  await expect(contactTrigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(contactDialog).toBeVisible();
  const contactClose = contactDialog.getByRole('button', { name: 'Закрыть', exact: true });
  await expect(contactClose).toBeFocused();
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-001 contact dialog', 'before-scr-001-contact');
  await contactClose.click();
  await expect(contactDialog).toBeHidden();

  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-002 homepage', 'before-scr-002-home');

  await gotoExpected(page, '/vehicle/', 404);
  acknowledgeExpectedMissingDocument(runtimeErrors, '/vehicle/');
  await captureInventoryScreen(
    page,
    testInfo,
    runtimeErrors,
    'SCR-003 vehicle selection missing route',
    'before-scr-003-vehicle',
  );

  await gotoExpected(page, '/vin-request/', 200);
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-004 VIN request', 'before-scr-004-vin');

  await gotoExpected(page, '/shop/', 200);
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-005 catalog', 'before-scr-005-catalog');

  await gotoExpected(page, '/product-category/tormoznaya-sistema/', 200);
  await captureInventoryScreen(
    page,
    testInfo,
    runtimeErrors,
    'SCR-006 category archive',
    'before-scr-006-category',
  );

  await gotoExpected(page, '/product-category/tormoznye-diski/', 404);
  acknowledgeExpectedMissingDocument(runtimeErrors, '/product-category/tormoznye-diski/');
  await captureInventoryScreen(
    page,
    testInfo,
    runtimeErrors,
    'SCR-007 subcategory missing route',
    'before-scr-007-subcategory',
  );

  await gotoExpected(page, '/', 200);
  const vehicleTrigger = page.locator('.az-vehicle-picker button[data-status-dialog="vehicle"]');
  const statusDialog = page.locator('dialog[data-status-dialog-modal]');
  await expect(vehicleTrigger).toBeVisible();
  await vehicleTrigger.focus();
  await expect(vehicleTrigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(statusDialog).toBeVisible();
  const statusClose = statusDialog.getByRole('button', { name: 'Закрыть', exact: true });
  await expect(statusClose).toBeFocused();
  await captureInventoryScreen(
    page,
    testInfo,
    runtimeErrors,
    'SCR-008 selected-vehicle catalog missing state',
    'before-scr-008-vehicle-catalog',
  );
  await statusClose.click();
  await expect(statusDialog).toBeHidden();

  const oilCard = page.locator('[data-home-product-card]').filter({ hasText: 'Моторное масло' }).first();
  await expect(oilCard).toBeVisible();
  const oilHref = await oilCard.locator('.az-product-card__title').getAttribute('href');
  expect(oilHref).toBeTruthy();
  await page.goto(oilHref!, { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/\bsingle-product\b/);
  const productGalleryImages = page.locator('.woocommerce-product-gallery img');
  await expect(productGalleryImages).toHaveCount(1);
  await pinCanonicalImageSources(productGalleryImages);
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-009 product detail', 'before-scr-009-product');

  await gotoExpected(page, '/', 200);
  const firstCard = page.locator('[data-home-product-card]').filter({ hasText: 'Моторное масло' }).first();
  const secondCard = page.locator('[data-home-product-card]').filter({ hasText: 'Масляный фильтр' }).first();
  const firstAction = firstCard.locator('a.add_to_cart_button[data-product_id]');
  const secondAction = secondCard.locator('a.add_to_cart_button[data-product_id]');
  await expect(firstAction).toBeVisible();
  await expect(secondAction).toBeVisible();
  const secondId = await secondAction.getAttribute('data-product_id');
  expect(secondId).toMatch(/^\d+$/);
  await addLoopProduct(page, firstAction);
  const secondLiveAction = page.locator(`a.add_to_cart_button[data-product_id="${secondId}"]`).first();
  await expect(secondLiveAction).toBeVisible();
  await addLoopProduct(page, secondLiveAction);
  const headerCart = page.locator('a.az-cart-link');
  await expect(headerCart.locator('#az-cart-count')).toHaveText('2');
  await headerCart.click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-cart-page][data-cart-ready]')).toBeVisible();
  const cartRows = page.locator('.wc-block-cart-items__row');
  await expect(cartRows).toHaveCount(2);
  await expect(cartRows.locator('.wc-block-components-skeleton__element')).toHaveCount(0, { timeout: 30_000 });
  const cartImages = cartRows.locator('img');
  await expect(cartImages).toHaveCount(2);
  await pinCanonicalImageSources(cartImages);
  await expect.poll(async () => cartImages.evaluateAll((images) => images.every((image) => (
    image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
  )))).toBe(true);
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-010 cart', 'before-scr-010-cart');

  const checkoutLink = page.locator('a.checkout-button, a.wc-block-cart__submit-button');
  await expect(checkoutLink).toBeVisible();
  await checkoutLink.click();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).pathname).toBe('/checkout/');
  await expect(page.locator('.wp-block-woocommerce-checkout, form.checkout')).toBeVisible();
  await expect(page.locator('[class*="skeleton"]')).toHaveCount(0, { timeout: 30_000 });
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-011 checkout', 'before-scr-011-checkout');

  await gotoExpected(page, '/delivery/', 200);
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-012 delivery', 'before-scr-012-delivery');

  await gotoExpected(page, '/returns/', 200);
  await captureInventoryScreen(page, testInfo, runtimeErrors, 'SCR-013 returns', 'before-scr-013-returns');

  if (testInfo.project.name === 'desktop-chrome-1440') {
    for (const route of expectedRouteInventory) {
      const response = await page.request.get(route.path);
      expect(response.status(), `${route.path} route inventory changed`).toBe(route.status);
    }

    await gotoExpected(page, '/delivery/', 200);
    await expect(page.locator('a[href="#vin-request"]')).toHaveCount(1);
    await expect(page.locator('#vin-request')).toHaveCount(0);
    await gotoExpected(page, '/', 200);
    await expect(page.locator('#vin-request')).toHaveCount(1);
    await expectCurrentScreenHealthy(page, runtimeErrors, 'I2-S83 route and fragment audit');
  }
});
