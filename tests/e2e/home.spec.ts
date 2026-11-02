import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { captureStableVisual } from './visual';

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

function expectNoRuntimeErrors(errors: RuntimeErrors): void {
  expect(errors.console, `Browser console errors:\n${errors.console.join('\n')}`).toEqual([]);
  expect(errors.page, `Uncaught page errors:\n${errors.page.join('\n')}`).toEqual([]);
}

test.describe('АВТОЗАКУП homepage', () => {
  test('renders the complete homepage, remains accessible and does not overflow', async ({ page }, testInfo) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const requiredSections = [
      '.az-header',
      'main#primary',
      '.az-hero',
      '.az-benefits',
      '#catalog',
      '[aria-labelledby="az-maintenance-title"]',
      '[aria-labelledby="az-stock-title"]',
      '#vin-request',
      '#business',
      '.az-pickup',
      '.az-footer',
    ];

    for (const selector of requiredSections) {
      await expect(page.locator(selector), `Required homepage section is missing: ${selector}`).toBeVisible();
    }

    const productCards = page.locator('.az-product-card');
    const productCount = await productCards.count();
    expect(productCount, 'The homepage must render WooCommerce product cards').toBeGreaterThan(0);

    for (let index = 0; index < productCount; index += 1) {
      await expect(productCards.nth(index)).toHaveAttribute('data-product-id', /^\d+$/);
    }

    const pageWidth = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }));
    expect(
      pageWidth.scrollWidth,
      `Horizontal overflow detected: scrollWidth=${pageWidth.scrollWidth}, clientWidth=${pageWidth.clientWidth}`,
    ).toBeLessThanOrEqual(pageWidth.clientWidth + 1);

    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blockingViolations = accessibility.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(
      blockingViolations,
      `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
    ).toEqual([]);

    await captureStableVisual(page, testInfo, `homepage-${testInfo.project.name}.png`);

    expectNoRuntimeErrors(runtimeErrors);
  });

  test('adds an available WooCommerce product to the cart over AJAX', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const addToCart = page.locator('.az-product-card a.add_to_cart_button[data-product_id]').first();
    await expect(addToCart, 'At least one purchasable in-stock product is required').toBeVisible();
    await expect(addToCart).toHaveAttribute('data-product_id', /^\d+$/);

    const addResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('wc-ajax=add_to_cart'),
    );
    await addToCart.click();
    const addResponse = await addResponsePromise;

    expect(addResponse.ok(), `Add-to-cart failed with HTTP ${addResponse.status()}`).toBeTruthy();
    const responsePayload = await addResponse.json();
    expect(responsePayload.error, 'WooCommerce rejected the add-to-cart request').not.toBe(true);
    await expect(addToCart).toHaveClass(/\badded\b/);
    await expect(page.locator('.az-cart-link b'), 'The header cart badge should reflect the AJAX addition').toHaveText('1');

    await page.locator('.az-cart-link').click();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname, 'The cart link must use the canonical WooCommerce slug').toBe('/cart/');
    const cartItems = page.locator('.woocommerce-cart-form__cart-item, .wc-block-cart-items__row');
    await expect(cartItems).toHaveCount(1);
    await expect(page.locator('.woocommerce-info, .woocommerce-message').filter({ hasText: 'демонстрационный каталог' })).toBeVisible();

    const checkoutLink = page.locator('.checkout-button, .wc-block-cart__submit-button');
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname, 'The checkout link must use the canonical WooCommerce slug').toBe('/checkout/');
    await expect(page.locator('.woocommerce-info, .woocommerce-message').filter({ hasText: 'демонстрационный каталог' })).toBeVisible();
    const classicDisabledButton = page.getByRole('button', { name: 'Оформление отключено в демо-режиме' });
    if (await classicDisabledButton.count()) {
      await expect(classicDisabledButton).toBeDisabled();
    } else {
      await expect(page.locator('.wp-block-woocommerce-checkout')).toBeVisible();
    }

    expectNoRuntimeErrors(runtimeErrors);
  });

  test('blocks direct Store API checkout in the demo environment', async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome-1440', 'The API guard is viewport-independent.');

    const response = await request.post('/wp-json/wc/store/v1/checkout', { data: {} });
    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(payload.code).toBe('avtozakup_demo_checkout_disabled');
  });
});
