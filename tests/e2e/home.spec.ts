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

    const demoTitle = 'Масляный фильтр MANN-FILTER W 914/2';
    const demoCard = page
      .locator('[aria-labelledby="az-maintenance-title"] .az-product-card')
      .filter({ has: page.getByRole('link', { name: demoTitle, exact: true }) });
    await expect(demoCard).toHaveCount(1);
    await expect(demoCard).toBeVisible();
    const demoProductId = await demoCard.getAttribute('data-product-id');
    expect(demoProductId).toMatch(/^\d+$/);

    const demoTitleLink = demoCard.locator('.az-product-card__title');
    const demoMediaLink = demoCard.locator('.az-product-card__media');
    await expect(demoTitleLink).toHaveText(demoTitle);
    await expect(demoTitleLink).toHaveAttribute('href', /\/product\//);
    const demoPermalink = await demoTitleLink.getAttribute('href');
    expect(demoPermalink).toBeTruthy();
    await expect(demoMediaLink).toHaveAttribute('href', demoPermalink!);

    await expect(demoCard.locator('.az-product-card__brand')).toHaveText('MANN-FILTER');
    const demoArticle = demoCard.locator('.az-product-card__sku');
    await expect(demoArticle).toHaveText('Арт. W 914/2');
    await expect(demoArticle).not.toContainText('AZ-DEMO-');
    const demoStock = demoCard.locator('.az-product-card__stock');
    await expect(demoStock).toHaveClass(/is-in-stock/);
    await expect(demoStock).toHaveText('Демо: есть в наличии');
    await expect(demoCard.locator('.az-product-card__note')).toHaveText('Цена и наличие демонстрационные');
    const demoAction = demoCard.locator('.add_to_cart_button.ajax_add_to_cart');
    await expect(demoAction).toHaveCount(1);
    await expect(demoAction).toBeVisible();
    await expect(demoAction).toHaveText('В корзину');
    await expect(demoAction).toHaveAttribute('data-product_id', demoProductId!);

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
