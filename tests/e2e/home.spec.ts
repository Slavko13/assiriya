import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { captureStableVisual } from './visual';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

const demoCheckoutMessage = 'Это демонстрационный каталог. Оформление, оплата, резервирование, VIN- и B2B-операции отключены.';
const demoCheckoutButtonLabel = 'Оформление отключено в демо-режиме';

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

async function expectExactDemoCheckoutNotice(page: Page): Promise<void> {
  const notices = page.locator('.woocommerce-info, .woocommerce-message').filter({ hasText: demoCheckoutMessage });
  await expect(notices).toHaveCount(1);
  await expect(notices).toHaveText(demoCheckoutMessage);

  const blockNotice = page.locator('.avtozakup-demo-notice');
  if (await blockNotice.count()) {
    await expect(blockNotice).toHaveCount(1);
    await expect(blockNotice).toHaveAttribute('role', 'status');
    await expect(blockNotice).toHaveText(demoCheckoutMessage);
  }
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

    const navToggle = page.locator(
      'button.az-mobile-toggle[data-nav-toggle][aria-controls="az-primary-nav"]',
    );
    const navPanel = page.locator('#az-primary-nav[data-nav-panel]');
    await expect(navToggle).toHaveCount(1);
    await expect(navToggle).toHaveAttribute('type', 'button');
    await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
    expect(await navToggle.getAttribute('aria-label')).toBeNull();
    await expect(navToggle).toHaveAttribute('data-nav-open-label', 'Открыть меню');
    await expect(navToggle).toHaveAttribute('data-nav-close-label', 'Закрыть меню');
    const navLabel = navToggle.locator('.screen-reader-text[data-nav-label]');
    await expect(navLabel).toHaveCount(1);
    await expect(navLabel).toHaveText('Открыть меню');
    await expect(navPanel).toHaveCount(1);
    await expect(navPanel).not.toHaveClass(/\bis-open\b/);

    if (testInfo.project.name === 'desktop-chrome-1440') {
      await expect(navToggle).toBeHidden();
      await expect(navPanel).toBeVisible();
    } else {
      await expect(navToggle).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navPanel).toBeHidden();
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

    if (testInfo.project.name !== 'desktop-chrome-1440') {
      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      await expect(navLabel).toHaveText('Закрыть меню');
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navLabel).toHaveText('Открыть меню');
      await expect(navToggle).toHaveAccessibleName('Открыть меню');

      await navToggle.focus();
      await expect(navToggle).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
      await expect(navToggle).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navToggle).toBeFocused();

      await page.keyboard.press('Enter');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
      const firstNavLink = navPanel.getByRole('link', { name: 'Выбрать автомобиль', exact: true });
      await expect(firstNavLink).toHaveCount(1);
      await page.keyboard.press('Tab');
      await expect(firstNavLink).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navToggle).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navToggle).toBeFocused();
    }

    const contactTriggers = page.locator('button[data-contact-open]');
    const contactTriggerCount = await contactTriggers.count();
    expect(contactTriggerCount, 'At least one contact-dialog trigger is required').toBeGreaterThan(0);
    for (let index = 0; index < contactTriggerCount; index += 1) {
      await expect(contactTriggers.nth(index)).toHaveAttribute('aria-haspopup', 'dialog');
    }

    if (testInfo.project.name !== 'desktop-chrome-1440') {
      await navToggle.click();
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
    }

    const contactTrigger = page.locator(
      'button.az-contact-link[type="button"][data-contact-open][aria-haspopup="dialog"]',
    );
    const contactDialog = page.locator(
      'dialog[data-contact-dialog][aria-labelledby="az-contact-title"]',
    );
    await expect(contactTrigger).toHaveCount(1);
    await expect(contactTrigger).toBeVisible();
    await expect(contactTrigger).toHaveAccessibleName('Связаться с нами');
    await expect(contactDialog).toHaveCount(1);
    await expect(contactDialog).toBeHidden();
    expect(await contactDialog.getAttribute('open')).toBeNull();
    await contactTrigger.focus();
    await expect(contactTrigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(contactDialog).toBeVisible();
    await expect(contactDialog).toHaveAttribute('open', '');
    await expect(contactDialog).toHaveAccessibleName('Связаться с нами');
    const contactLinks = contactDialog.locator('a.az-dialog__contact');
    await expect(contactLinks).toHaveCount(2);
    const phoneLink = contactLinks.nth(0);
    const emailLink = contactLinks.nth(1);
    await expect(phoneLink).toBeVisible();
    await expect(emailLink).toBeVisible();
    const phoneText = (await phoneLink.innerText()).trim();
    const emailText = (await emailLink.innerText()).trim();
    await expect(phoneLink).toHaveAttribute('href', `tel:${phoneText.replace(/[^+\d]/g, '')}`);
    await expect(emailLink).toHaveAttribute('href', `mailto:${emailText}`);
    const contactClose = contactDialog.getByRole('button', { name: 'Закрыть', exact: true });
    await expect(contactClose).toHaveCount(1);
    await expect(contactClose).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(contactDialog).toBeHidden();
    expect(await contactDialog.getAttribute('open')).toBeNull();
    await expect(contactTrigger).toBeFocused();

    if (testInfo.project.name !== 'desktop-chrome-1440') {
      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
    }

    const cityTrigger = page.locator(
      'button.az-city[data-status-dialog="delivery"][aria-haspopup="dialog"]',
    );
    const statusDialog = page.locator(
      'dialog[data-status-dialog-modal][aria-labelledby="az-status-title"]',
    );
    await expect(cityTrigger).toHaveCount(1);
    await expect(cityTrigger).toBeVisible();
    await expect(cityTrigger).toHaveAttribute('type', 'button');
    await expect(cityTrigger).toHaveAccessibleName('Выбрать город');
    await expect(statusDialog).toHaveCount(1);
    await expect(statusDialog).toBeHidden();
    expect(await statusDialog.getAttribute('open')).toBeNull();
    await cityTrigger.focus();
    await expect(cityTrigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(statusDialog).toBeVisible();
    await expect(statusDialog).toHaveAttribute('open', '');
    await expect(statusDialog).toHaveAccessibleName('Сценарий ещё согласуется');
    await expect(statusDialog.locator('[data-status-copy]')).toHaveText(
      'Города, способы получения и география ещё согласуются в DEC-001 и DEC-014.',
    );
    const statusClose = statusDialog.getByRole('button', { name: 'Закрыть', exact: true });
    await expect(statusClose).toHaveCount(1);
    await expect(statusClose).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(statusDialog).toBeHidden();
    expect(await statusDialog.getAttribute('open')).toBeNull();
    await expect(cityTrigger).toBeFocused();

    expectNoRuntimeErrors(runtimeErrors);
  });

  test('keeps blocked homepage actions keyboard-safe and fail-closed', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const statusTriggers = page.locator('button[data-status-dialog]');
    const statusTriggerCount = await statusTriggers.count();
    expect(statusTriggerCount, 'At least the homepage blocked-action triggers are required').toBeGreaterThanOrEqual(4);
    for (let index = 0; index < statusTriggerCount; index += 1) {
      await expect(statusTriggers.nth(index)).toHaveAttribute('type', 'button');
      await expect(statusTriggers.nth(index)).toHaveAttribute('aria-haspopup', 'dialog');
    }

    const statusDialog = page.locator(
      'dialog[data-status-dialog-modal][aria-labelledby="az-status-title"]',
    );
    const statusCopy = statusDialog.locator('[data-status-copy]');
    const statusClose = statusDialog.getByRole('button', { name: 'Закрыть', exact: true });
    await expect(statusDialog).toHaveCount(1);
    await expect(statusDialog).toBeHidden();
    expect(await statusDialog.getAttribute('open')).toBeNull();

    const actions = [
      {
        selector: '.az-vehicle-picker button[data-status-dialog="vehicle"]',
        message: 'Подбор по автомобилю ожидает решения об источнике каталога применяемости (DEC-004). Пока доступен каталог WooCommerce.',
      },
      {
        selector: '#vin-request button[data-status-dialog="vin"]',
        message: 'VIN-заявка не отправляется: обязательные контакты, согласие и маршрут обработки зависят от DEC-017 и DEC-018.',
      },
      {
        selector: '#business button[data-status-dialog="b2b"]',
        message: 'B2B-сценарий откроется после утверждения минимального состава, полномочий и условий (DEC-016).',
      },
    ];
    const initialUrl = page.url();

    for (const action of actions) {
      const trigger = page.locator(action.selector);
      await expect(trigger).toHaveCount(1);
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAccessibleName(/.+/);
      await trigger.focus();
      await expect(trigger).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(statusDialog).toBeVisible();
      await expect(statusDialog).toHaveAttribute('open', '');
      await expect(statusDialog).toHaveAccessibleName('Сценарий ещё согласуется');
      await expect(statusCopy).toHaveText(action.message);
      await expect(statusClose).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(statusDialog).toBeHidden();
      expect(await statusDialog.getAttribute('open')).toBeNull();
      await expect(trigger).toBeFocused();
      expect(page.url()).toBe(initialUrl);
    }

    const failClosedTrigger = page.locator('.az-vehicle-picker button.az-button');
    const retainedCopy = await statusCopy.innerText();
    for (const unknownKey of ['unknown', 'constructor', 'toString', '__proto__']) {
      await failClosedTrigger.evaluate(
        (element, key) => element.setAttribute('data-status-dialog', key),
        unknownKey,
      );
      await failClosedTrigger.focus();
      await page.keyboard.press('Enter');
      await expect(statusDialog).toBeHidden();
      expect(await statusDialog.getAttribute('open')).toBeNull();
      await expect(statusCopy).toHaveText(retainedCopy);
      expect(page.url()).toBe(initialUrl);
    }

    expectNoRuntimeErrors(runtimeErrors);
  });

  test('adds an available WooCommerce product to the cart over AJAX', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const addToCart = page.locator('.az-product-card a.add_to_cart_button[data-product_id]').first();
    await expect(addToCart, 'At least one purchasable in-stock product is required').toBeVisible();
    const sourceCard = addToCart.locator('xpath=ancestor::article[@data-product-id][1]');
    await expect(sourceCard).toHaveCount(1);
    const sourceProductId = await sourceCard.getAttribute('data-product-id');
    expect(sourceProductId).toMatch(/^\d+$/);
    await expect(addToCart).toHaveAttribute('data-product_id', sourceProductId!);
    await expect(addToCart).toHaveAttribute('data-quantity', '1');
    const sourceTitleLink = sourceCard.locator('.az-product-card__title');
    const sourceProductName = (await sourceTitleLink.innerText()).trim();
    const sourceProductHref = await sourceTitleLink.getAttribute('href');
    expect(sourceProductName).not.toBe('');
    expect(sourceProductHref).toBeTruthy();

    const addResponsePromise = page.waitForResponse(
      (response) => {
        const responseUrl = new URL(response.url());
        return response.request().method() === 'POST'
          && responseUrl.searchParams.getAll('wc-ajax').length === 1
          && responseUrl.searchParams.get('wc-ajax') === 'add_to_cart';
      },
    );
    await addToCart.click();
    const addResponse = await addResponsePromise;

    expect(addResponse.ok(), `Add-to-cart failed with HTTP ${addResponse.status()}`).toBeTruthy();
    const addRequest = addResponse.request();
    expect(addRequest.method()).toBe('POST');
    expect(addRequest.headers()['content-type']).toMatch(
      /^application\/x-www-form-urlencoded(?:;|$)/i,
    );
    const addUrl = new URL(addRequest.url());
    expect(addUrl.origin).toBe(new URL(page.url()).origin);
    expect(addUrl.pathname).toBe('/');
    expect([...addUrl.searchParams.entries()]).toEqual([['wc-ajax', 'add_to_cart']]);
    expect(addUrl.hash).toBe('');
    const addPayload = new URLSearchParams(addRequest.postData() ?? '');
    expect(addPayload.getAll('product_id')).toEqual([sourceProductId!]);
    expect(addPayload.getAll('quantity')).toEqual(['1']);
    const responsePayload = await addResponse.json();
    expect(responsePayload.error, 'WooCommerce rejected the add-to-cart request').not.toBe(true);
    await expect(addToCart).toHaveClass(/\badded\b/);
    await expect(page.locator('.az-cart-link b'), 'The header cart badge should reflect the AJAX addition').toHaveText('1');

    const cartLink = page.locator('a.az-cart-link');
    await expect(cartLink).toHaveCount(1);
    const cartHref = await cartLink.getAttribute('href');
    expect(cartHref).toBeTruthy();
    const cartUrl = new URL(cartHref!, page.url());
    expect(cartUrl.origin).toBe(new URL(page.url()).origin);
    expect(cartUrl.pathname).toBe('/cart/');
    expect(cartUrl.search).toBe('');
    expect(cartUrl.hash).toBe('');
    await cartLink.click();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname, 'The cart link must use the canonical WooCommerce slug').toBe('/cart/');
    const cartItems = page.locator('.woocommerce-cart-form__cart-item, .wc-block-cart-items__row');
    await expect(cartItems).toHaveCount(1);
    const cartItem = cartItems.first();
    await expect(cartItem).toContainText(sourceProductName);
    const cartProductLink = cartItem.locator('.product-name a, a.wc-block-components-product-name');
    await expect(cartProductLink).toHaveCount(1);
    await expect(cartProductLink).toHaveText(sourceProductName);
    await expect(cartProductLink).toHaveAttribute('href', sourceProductHref!);
    await expectExactDemoCheckoutNotice(page);

    const checkoutLink = page.locator('a.checkout-button, a.wc-block-cart__submit-button');
    await expect(checkoutLink).toHaveCount(1);
    await expect(checkoutLink).toBeVisible();
    const checkoutHref = await checkoutLink.getAttribute('href');
    expect(checkoutHref).toBeTruthy();
    const checkoutUrl = new URL(checkoutHref!, page.url());
    expect(checkoutUrl.origin).toBe(new URL(page.url()).origin);
    expect(checkoutUrl.pathname).toBe('/checkout/');
    expect(checkoutUrl.search).toBe('');
    expect(checkoutUrl.hash).toBe('');
    await checkoutLink.click();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname, 'The checkout link must use the canonical WooCommerce slug').toBe('/checkout/');
    await expectExactDemoCheckoutNotice(page);
    const classicDisabledButton = page.getByRole('button', { name: demoCheckoutButtonLabel, exact: true });
    if (await classicDisabledButton.count()) {
      await expect(classicDisabledButton).toBeDisabled();
      await expect(classicDisabledButton).toHaveAttribute('aria-disabled', 'true');
      await expect(classicDisabledButton).toHaveText(demoCheckoutButtonLabel);
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
    expect(payload.message).toBe(demoCheckoutMessage);
    expect(payload.data?.status).toBe(403);
  });
});
