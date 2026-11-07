import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page, type Response } from '@playwright/test';

import { captureStableVisual } from './visual';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

function watchRuntimeErrors(page: Page): RuntimeErrors {
  const errors: RuntimeErrors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function expectHealthyPage(page: Page, runtimeErrors: RuntimeErrors): Promise<void> {
  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client + 1);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
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

async function waitForCartUpdate(page: Page, action: () => Promise<void>): Promise<Response> {
  const origin = new URL(page.url()).origin;
  const responsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST'
      && responseUrl.origin === origin
      && [
        '/wp-json/wc/store/v1/batch',
        '/wp-json/wc/store/v1/cart/update-item',
      ].includes(responseUrl.pathname);
  });
  await action();
  const response = await responsePromise;
  expect(response.ok(), `WooCommerce cart update failed with HTTP ${response.status()}`).toBe(true);
  return response;
}

function readMoney(value: string): number {
  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  const amount = Number.parseFloat(normalized);
  expect(Number.isFinite(amount), `Expected a readable monetary amount, received: ${value}`).toBe(true);
  return amount;
}

test('keeps the Paper-shaped marked PDP wired to the native Woo cart', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const productCard = page.locator('[data-home-product-card]').filter({ hasText: 'Моторное масло' }).first();
  await expect(productCard, 'The marked engine-oil fixture is required for SCR-009').toBeVisible();
  const productName = (await productCard.locator('.az-product-card__title').innerText()).trim();
  const productHref = await productCard.locator('.az-product-card__title').getAttribute('href');
  const productId = await productCard.getAttribute('data-product-id');
  expect(productName).not.toBe('');
  expect(productHref).toBeTruthy();
  expect(productId).toMatch(/^\d+$/);

  await page.goto(productHref!, { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/\bsingle-product\b/);
  const productShell = page.locator('body.az-product-detail-expanded div.product').first();
  await expect(productShell).toHaveCount(1);
  expect(await page.locator('body').getAttribute('class')).not.toMatch(/az-demo-product-detail|paper-scr/i);
  await expect(productShell.getByRole('heading', { level: 1, name: productName })).toBeVisible();
  await expect(productShell.locator('.woocommerce-product-gallery')).toBeVisible();
  await expect(productShell.locator('.summary')).toBeVisible();

  const customSections = productShell.locator(':scope > [data-pdp-section]');
  await expect(customSections).toHaveCount(7);
  expect(await customSections.evaluateAll((sections) => sections.map((section) => section.getAttribute('data-pdp-section')))).toEqual([
    'characteristics',
    'fitment',
    'tabs',
    'offers',
    'specifications',
    'description',
    'reviews',
  ]);
  for (const section of [
    'characteristics',
    'fitment',
    'tabs',
    'offers',
    'specifications',
    'description',
    'reviews',
  ]) {
    await expect(productShell.locator(`[data-pdp-section="${section}"]`)).toBeVisible();
  }

  const nativePrice = productShell.locator('.summary .price').first();
  const offerPrice = productShell.locator('.az-pdp-offer-row__price').first();
  await expect(nativePrice).toBeVisible();
  await expect(offerPrice).toBeVisible();
  expect(readMoney(await offerPrice.innerText())).toBe(readMoney(await nativePrice.innerText()));

  await captureStableVisual(page, testInfo, `i2-s82/after-product-${testInfo.project.name}.png`);

  const cartForm = productShell.locator('form.cart');
  const quantity = cartForm.locator('input.qty');
  const addToCart = cartForm.locator('button.single_add_to_cart_button[name="add-to-cart"]');
  await expect(quantity).toBeVisible();
  await expect(addToCart).toHaveAttribute('value', productId!);
  await quantity.fill('2');
  await expect(quantity).toHaveValue('2');
  await quantity.focus();
  await expect(quantity).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(addToCart).toBeFocused();
  expect(await addToCart.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  expect(await addToCart.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    addToCart.click(),
  ]);
  await expect(page.locator('a.az-cart-link #az-cart-count')).toHaveText('2');
  await expect(page.locator('body')).toHaveClass(/\bsingle-product\b/);
  await expectHealthyPage(page, runtimeErrors);

  await page.locator('a.az-cart-link').click();
  await page.waitForLoadState('networkidle');
  const cartRow = page.locator('.wc-block-cart-items__row').filter({ hasText: productName });
  await expect(cartRow).toHaveCount(1);
  await expect(cartRow.locator('.wc-block-components-quantity-selector__input')).toHaveValue('2');
  await expect(page.locator('a.az-cart-link #az-cart-count')).toHaveText('2');
  await expect(page.locator('[data-cart-count-label]')).toHaveText('2 товара');

  await page.reload({ waitUntil: 'networkidle' });
  await expect(cartRow).toHaveCount(1);
  await expect(cartRow.locator('.wc-block-components-quantity-selector__input')).toHaveValue('2');
  await expect(page.locator('a.az-cart-link #az-cart-count')).toHaveText('2');
  await expect(page.locator('[data-cart-count-label]')).toHaveText('2 товара');

  await cartRow.locator('a.wc-block-components-product-name').click();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).pathname).toBe(new URL(productHref!, page.url()).pathname);
  await expect(page.locator('body.az-product-detail-expanded div.product form.cart').first()).toBeVisible();
  await expect(page.locator('a.az-cart-link #az-cart-count')).toHaveText('2');
  await expectHealthyPage(page, runtimeErrors);
});

test('keeps two distinct Woo rows, totals and cart navigation synchronized', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const firstCard = page.locator('[data-home-product-card]').filter({ hasText: 'Моторное масло' }).first();
  const secondCard = page.locator('[data-home-product-card]').filter({ hasText: 'Масляный фильтр' }).first();
  await expect(firstCard, 'The marked engine-oil fixture is required for SCR-010').toBeVisible();
  await expect(secondCard, 'The marked oil-filter fixture is required for SCR-010').toBeVisible();
  const firstAction = firstCard.locator('a.add_to_cart_button[data-product_id]');
  const secondAction = secondCard.locator('a.add_to_cart_button[data-product_id]');
  const firstName = (await firstCard.locator('.az-product-card__title').innerText()).trim();
  const secondName = (await secondCard.locator('.az-product-card__title').innerText()).trim();
  const firstId = await firstAction.getAttribute('data-product_id');
  const secondId = await secondAction.getAttribute('data-product_id');
  expect(firstName).not.toBe(secondName);
  expect(firstId).not.toBe(secondId);

  await addLoopProduct(page, firstAction);
  const secondLiveAction = page.locator(
    `.az-product-card a.add_to_cart_button[data-product_id="${secondId}"]`,
  );
  await expect(secondLiveAction).toHaveCount(1);
  await addLoopProduct(page, secondLiveAction);
  const headerCart = page.locator('a.az-cart-link');
  await expect(headerCart.locator('#az-cart-count')).toHaveText('2');
  await headerCart.click();
  await page.waitForLoadState('networkidle');

  const cartPage = page.locator('[data-cart-page]');
  await expect(cartPage).toHaveCount(1);
  await expect(cartPage.locator('[data-cart-heading]')).toHaveText('Корзина');
  await expect(cartPage.locator('[data-cart-count-label]')).toContainText('2');
  await expect(cartPage.locator('[data-cart-count-label]')).toHaveText('2 товара');
  const continueShopping = cartPage.locator('[data-cart-continue]');
  await expect(continueShopping).toBeVisible();
  const continueHref = await continueShopping.getAttribute('href');
  expect(continueHref).toBeTruthy();
  const continueUrl = new URL(continueHref!, page.url());
  expect(continueUrl.origin).toBe(new URL(page.url()).origin);
  expect(continueUrl.pathname).toBe('/shop/');
  await expect(cartPage.locator('[data-cart-support]')).toBeVisible();

  await expect(cartPage).toHaveAttribute('data-cart-ready', '');
  const rows = page.locator('.wc-block-cart-items__row').filter({ has: page.locator('a.wc-block-components-product-name') });
  await expect(rows).toHaveCount(2);
  const renderedNames = (await rows.locator('a.wc-block-components-product-name').allInnerTexts()).map((name) => name.trim());
  expect(new Set(renderedNames)).toEqual(new Set([firstName, secondName]));
  const sidebar = page.locator('.wc-block-cart__sidebar');
  await expect(sidebar).toBeVisible();
  const checkout = sidebar.getByRole('link', { name: 'Перейти к оформлению', exact: true });
  await expect(checkout).toHaveAttribute('href', /\/checkout\/$/);
  const total = sidebar.locator('.wc-block-components-totals-footer-item .wc-block-formatted-money-amount');
  await expect(total).toBeVisible();
  const totalBefore = readMoney(await total.innerText());

  await captureStableVisual(page, testInfo, `i2-s82/after-cart-${testInfo.project.name}.png`);

  const firstRow = rows.filter({ hasText: firstName });
  const quantity = firstRow.locator('.wc-block-components-quantity-selector__input');
  const plus = firstRow.locator('.wc-block-components-quantity-selector__button--plus');
  await expect(quantity).toHaveValue('1');
  await waitForCartUpdate(page, () => plus.click());
  await expect(quantity).toHaveValue('2');
  await expect(headerCart.locator('#az-cart-count')).toHaveText('3');
  await expect(cartPage.locator('[data-cart-count-label]')).toHaveText('3 товара');
  await expect.poll(async () => readMoney(await total.innerText())).toBeGreaterThan(totalBefore);
  const totalAfter = readMoney(await total.innerText());

  await page.reload({ waitUntil: 'networkidle' });
  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ hasText: firstName }).locator('.wc-block-components-quantity-selector__input')).toHaveValue('2');
  await expect(headerCart.locator('#az-cart-count')).toHaveText('3');
  await expect(cartPage.locator('[data-cart-count-label]')).toHaveText('3 товара');
  expect(readMoney(await total.innerText())).toBe(totalAfter);
  await expectHealthyPage(page, runtimeErrors);

  const secondRow = rows.filter({ hasText: secondName });
  const secondRowKey = await secondRow.getAttribute('data-cart-item-key');
  expect(secondRowKey).toMatch(/^[a-f0-9]+$/);
  const removeResponsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST'
      && responseUrl.origin === new URL(page.url()).origin
      && [
        '/wp-json/wc/store/v1/batch',
        '/wp-json/wc/store/v1/cart/remove-item',
      ].includes(responseUrl.pathname);
  });
  await secondRow.locator('.wc-block-cart-item__remove-link').click();
  const removeResponse = await removeResponsePromise;
  expect(removeResponse.ok(), `WooCommerce cart removal failed with HTTP ${removeResponse.status()}`).toBe(true);
  await expect(rows).toHaveCount(1);
  await expect(rows.filter({ hasText: firstName })).toHaveCount(1);
  await expect(rows.filter({ hasText: secondName })).toHaveCount(0);
  await expect(headerCart.locator('#az-cart-count')).toHaveText('2');
  await expect(cartPage.locator('[data-cart-count-label]')).toHaveText('2 товара');
  await expect.poll(async () => readMoney(await total.innerText())).toBeLessThan(totalAfter);
  const totalAfterRemoval = readMoney(await total.innerText());

  await page.reload({ waitUntil: 'networkidle' });
  await expect(rows).toHaveCount(1);
  await expect(rows.filter({ hasText: firstName }).locator('.wc-block-components-quantity-selector__input')).toHaveValue('2');
  await expect(rows.filter({ hasText: secondName })).toHaveCount(0);
  await expect(headerCart.locator('#az-cart-count')).toHaveText('2');
  await expect(cartPage.locator('[data-cart-count-label]')).toHaveText('2 товара');
  expect(readMoney(await total.innerText())).toBe(totalAfterRemoval);
  await expectHealthyPage(page, runtimeErrors);

  await Promise.all([
    page.waitForURL((url) => url.pathname === '/shop/'),
    continueShopping.click(),
  ]);
  expect(new URL(page.url()).pathname).toBe('/shop/');
  await expect(page.locator('body')).toHaveClass(/\bpost-type-archive-product\b/);
  await expectHealthyPage(page, runtimeErrors);
});
