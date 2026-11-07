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
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('presents the demo cart as a responsive Paper-aligned order review', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const addToCart = page.locator('.az-product-card a.add_to_cart_button[data-product_id]').first();
  await expect(addToCart, 'A purchasable demo product is required for the cart presentation').toBeVisible();
  const sourceCard = addToCart.locator('xpath=ancestor::article[@data-product-id][1]');
  const sourceName = (await sourceCard.locator('.az-product-card__title').innerText()).trim();
  expect(sourceName).not.toBe('');

  const addResponsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST' && responseUrl.searchParams.get('wc-ajax') === 'add_to_cart';
  });
  await addToCart.click();
  expect((await addResponsePromise).ok(), 'WooCommerce must accept the exact demo add').toBe(true);

  const headerCart = page.locator('a.az-cart-link');
  await expect(headerCart.locator('#az-cart-count')).toHaveText('1');
  await headerCart.click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toHaveClass(/\bwoocommerce-cart\b/);
  const intro = page.locator('.az-cart-intro');
  await expect(intro).toBeVisible();
  await expect(intro.getByRole('heading', { level: 1, name: 'Корзина' })).toBeVisible();
  await expect(intro).toContainText('Проверьте товары и количество');
  await expect(intro.locator('[data-cart-count-label]')).toHaveText('1 товар');
  const continueShopping = intro.locator('[data-cart-continue]');
  await expect(continueShopping).toHaveText(/Продолжить покупки/);
  await expect(continueShopping).toHaveAttribute('href', /\/shop\/$/);

  const demoNotice = page.locator('.avtozakup-demo-notice');
  await expect(demoNotice).toBeVisible();
  await expect(demoNotice).toHaveText(
    'Онлайн-оформление заказа временно недоступно.',
  );
  expect(await demoNotice.evaluate((element) => getComputedStyle(element, '::before').content)).toBe('none');

  const cartMain = page.locator('.wc-block-cart__main');
  const cartSidebar = page.locator('.wc-block-cart__sidebar');
  await expect(cartMain).toBeVisible();
  await expect(cartSidebar).toBeVisible();
  const cartTable = cartMain.getByRole('table', { name: 'Товары в корзине' });
  await expect(cartTable).toBeVisible();
  const cartHeaders = cartTable.getByRole('columnheader');
  if (testInfo.project.name === 'desktop-chrome-1440') {
    await expect(cartHeaders).toHaveCount(2);
    await expect(cartHeaders.nth(0)).toHaveAccessibleName('О товаре');
    await expect(cartHeaders.nth(1)).toHaveAccessibleName('Сумма');
  } else {
    await expect(cartHeaders).toHaveCount(0);
  }
  const productRow = page.locator('.wc-block-cart-items__row');
  await expect(productRow).toHaveCount(1);
  await expect(productRow.getByRole('rowheader', { name: sourceName })).toBeVisible();
  await expect(productRow.locator('a.wc-block-components-product-name')).toHaveText(sourceName);
  const productImage = productRow.locator('.wc-block-cart-item__image img');
  await expect(productImage).toBeVisible();
  expect(await productImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);

  const quantity = productRow.locator('.wc-block-components-quantity-selector__input');
  await expect(quantity).toHaveValue('1');
  await expect(quantity).toHaveAccessibleName(`Количество товара «${sourceName}» в корзине`);
  await expect(productRow.locator('.wc-block-components-quantity-selector__button--plus')).toHaveAccessibleName(
    `Увеличить количество товара «${sourceName}»`,
  );
  await expect(productRow.locator('.wc-block-cart-item__remove-link')).toHaveAccessibleName(
    `Удалить товар «${sourceName}» из корзины`,
  );

  const checkout = cartSidebar.getByRole('link', { name: 'Перейти к оформлению', exact: true });
  await expect(checkout).toBeVisible();
  await expect(checkout).toHaveAttribute('href', /\/checkout\/$/);
  if (testInfo.project.name === 'desktop-chrome-1440') {
    await expect(cartSidebar.getByRole('heading', { name: 'Итого', includeHidden: true })).not.toBeVisible();
    await expect(cartSidebar.getByText('Итого к оплате', { exact: true })).toBeVisible();
  }

  const layout = await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>('.wc-block-cart__main')?.getBoundingClientRect();
    const sidebar = document.querySelector<HTMLElement>('.wc-block-cart__sidebar')?.getBoundingClientRect();
    return main && sidebar ? {
      main: { left: main.left, right: main.right, top: main.top, bottom: main.bottom },
      sidebar: { left: sidebar.left, right: sidebar.right, top: sidebar.top, bottom: sidebar.bottom },
    } : null;
  });
  expect(layout).not.toBeNull();
  if (testInfo.project.name === 'desktop-chrome-1440') {
    expect(layout!.main.right).toBeLessThan(layout!.sidebar.left);
    expect(Math.abs(layout!.main.top - layout!.sidebar.top)).toBeLessThanOrEqual(2);
  } else {
    expect(layout!.sidebar.top).toBeGreaterThan(layout!.main.bottom);
    expect(Math.abs(layout!.main.left - layout!.sidebar.left)).toBeLessThanOrEqual(2);
    const mobileGeometry = await page.evaluate(() => {
      const checkoutRect = document.querySelector<HTMLElement>('.wc-block-cart__submit-button')?.getBoundingClientRect();
      const quantityRect = document.querySelector<HTMLElement>('.wc-block-components-quantity-selector')?.getBoundingClientRect();
      const totalRect = document.querySelector<HTMLElement>('.wc-block-components-totals-footer-item')?.getBoundingClientRect();
      const overlaps = (first?: DOMRect, second?: DOMRect) => Boolean(first && second
        && first.left < second.right && first.right > second.left
        && first.top < second.bottom && first.bottom > second.top);
      return {
        checkoutPosition: checkoutRect ? window.getComputedStyle(document.querySelector<HTMLElement>('.wc-block-cart__submit-container')!).position : '',
        overlapsQuantity: overlaps(checkoutRect, quantityRect),
        overlapsTotal: overlaps(checkoutRect, totalRect),
      };
    });
    expect(mobileGeometry.checkoutPosition).toBe('static');
    expect(mobileGeometry.overlapsQuantity).toBe(false);
    expect(mobileGeometry.overlapsTotal).toBe(false);
  }

  const viewportWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(viewportWidth.scroll).toBeLessThanOrEqual(viewportWidth.client + 1);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `cart-${testInfo.project.name}.png`);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('keeps the header count aligned with a Cart Block quantity update', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const addToCart = page.locator('.az-product-card a.add_to_cart_button[data-product_id]').first();
  await expect(addToCart).toBeVisible();
  const sourceCard = addToCart.locator('xpath=ancestor::article[@data-product-id][1]');
  const sourceName = (await sourceCard.locator('.az-product-card__title').innerText()).trim();
  const sourceHref = await sourceCard.locator('.az-product-card__title').getAttribute('href');
  expect(sourceName).not.toBe('');
  expect(sourceHref).toBeTruthy();

  const addResponsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST' && responseUrl.searchParams.get('wc-ajax') === 'add_to_cart';
  });
  await addToCart.click();
  expect((await addResponsePromise).ok()).toBe(true);

  const headerCart = page.locator('a.az-cart-link');
  const headerCount = headerCart.locator('#az-cart-count');
  await expect(headerCount).toHaveText('1');
  await headerCart.click();
  await page.waitForLoadState('networkidle');
  const cartOrigin = new URL(page.url()).origin;

  const productRow = page.locator('.wc-block-cart-items__row');
  await expect(productRow).toHaveCount(1);
  const rowKey = await productRow.getAttribute('data-cart-item-key');
  expect(rowKey).toMatch(/^[a-f0-9]+$/);
  await expect(productRow.locator('a.wc-block-components-product-name')).toHaveText(sourceName);
  await expect(productRow.locator('a.wc-block-components-product-name')).toHaveAttribute('href', sourceHref!);
  const quantity = productRow.locator('.wc-block-components-quantity-selector__input');
  const plus = productRow.locator('.wc-block-components-quantity-selector__button--plus');
  await expect(quantity).toHaveValue('1');
  await expect(plus).toBeEnabled();

  const updateResponsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST'
      && responseUrl.origin === cartOrigin
      && [
        '/wp-json/wc/store/v1/batch',
        '/wp-json/wc/store/v1/cart/update-item',
      ].includes(responseUrl.pathname);
  });
  await plus.click();
  const updateResponse = await updateResponsePromise;
  expect(updateResponse.ok(), `Cart quantity update failed with HTTP ${updateResponse.status()}`).toBe(true);
  const updateUrl = new URL(updateResponse.url());
  expect(updateUrl.origin).toBe(cartOrigin);
  expect(updateUrl.hash).toBe('');
  const responsePayload = JSON.parse(updateResponse.request().postData() ?? '{}');
  const updateRequest = updateUrl.pathname.endsWith('/batch')
    ? responsePayload.requests?.find(
      (request: { path?: string }) => request.path === '/wc/store/v1/cart/update-item',
    )
    : {
      path: '/wc/store/v1/cart/update-item',
      method: updateResponse.request().method(),
      body: responsePayload,
    };
  expect(updateRequest).toBeTruthy();
  expect(updateRequest.path).toBe('/wc/store/v1/cart/update-item');
  expect(updateRequest.method).toBe('POST');
  expect(updateRequest.body?.key).toBe(rowKey);
  expect(updateRequest.body?.quantity).toBe(2);

  await expect(quantity).toHaveValue('2');
  await expect(headerCount).toHaveText('2');
  await expect(page.locator('[data-cart-count-label]')).toHaveText('2 товара');
  await expect(headerCart).toHaveAccessibleName('Корзина 2');
  await expect(productRow).toHaveCount(1);
  await expect(productRow.locator('a.wc-block-components-product-name')).toHaveText(sourceName);

  const cartUrl = page.url();
  const reloadResponse = await page.reload({ waitUntil: 'networkidle' });
  expect(reloadResponse?.ok()).toBe(true);
  expect(page.url()).toBe(cartUrl);
  await expect(quantity).toHaveValue('2');
  await expect(headerCount).toHaveText('2');
  await expect(page.locator('[data-cart-count-label]')).toHaveText('2 товара');
  await expect(headerCart).toHaveAccessibleName('Корзина 2');
  await expect(productRow).toHaveCount(1);
  await expect(productRow.locator('a.wc-block-components-product-name')).toHaveText(sourceName);

  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('turns last-item removal into a localized empty-cart path', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const addToCart = page.locator('.az-product-card a.add_to_cart_button[data-product_id]').first();
  await expect(addToCart).toBeVisible();
  const addResponsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST' && responseUrl.searchParams.get('wc-ajax') === 'add_to_cart';
  });
  await addToCart.click();
  expect((await addResponsePromise).ok()).toBe(true);

  const headerCart = page.locator('a.az-cart-link');
  const headerCount = headerCart.locator('#az-cart-count');
  await expect(headerCount).toHaveText('1');
  await headerCart.click();
  await page.waitForLoadState('networkidle');
  const cartOrigin = new URL(page.url()).origin;

  const productRow = page.locator('.wc-block-cart-items__row');
  await expect(productRow).toHaveCount(1);
  const rowKey = await productRow.getAttribute('data-cart-item-key');
  expect(rowKey).toMatch(/^[a-f0-9]+$/);
  const remove = productRow.locator('.wc-block-cart-item__remove-link');
  await expect(remove).toBeVisible();

  const removeResponsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());
    return response.request().method() === 'POST'
      && responseUrl.origin === cartOrigin
      && [
        '/wp-json/wc/store/v1/batch',
        '/wp-json/wc/store/v1/cart/remove-item',
      ].includes(responseUrl.pathname);
  });
  await remove.click();
  const removeResponse = await removeResponsePromise;
  expect(removeResponse.ok(), `Cart removal failed with HTTP ${removeResponse.status()}`).toBe(true);
  const removeUrl = new URL(removeResponse.url());
  expect(removeUrl.origin).toBe(cartOrigin);
  expect(removeUrl.hash).toBe('');
  const responsePayload = JSON.parse(removeResponse.request().postData() ?? '{}');
  const isBatchRequest = removeUrl.pathname.endsWith('/batch');
  const removeRequestIndex = isBatchRequest && Array.isArray(responsePayload.requests)
    ? responsePayload.requests.findIndex(
      (request: { path?: string }) => request.path === '/wc/store/v1/cart/remove-item',
    )
    : -1;
  if (isBatchRequest) expect(removeRequestIndex).toBeGreaterThanOrEqual(0);
  const removeRequest = isBatchRequest
    ? responsePayload.requests[removeRequestIndex]
    : {
      path: '/wc/store/v1/cart/remove-item',
      method: removeResponse.request().method(),
      body: responsePayload,
    };
  expect(removeRequest).toBeTruthy();
  expect(removeRequest.path).toBe('/wc/store/v1/cart/remove-item');
  expect(removeRequest.method).toBe('POST');
  expect((removeRequest.body ?? removeRequest.data)?.key).toBe(rowKey);
  const removeResponsePayload = await removeResponse.json();
  const removeResult = isBatchRequest
    ? removeResponsePayload.responses?.[removeRequestIndex]
    : { status: removeResponse.status(), body: removeResponsePayload };
  expect(removeResult?.status).toBe(200);
  expect(removeResult?.body?.items_count).toBe(0);

  await expect(productRow).toHaveCount(0);
  await expect(headerCount).toHaveText('0');
  await expect(headerCart).toHaveAccessibleName('Корзина 0');
  await expect.poll(async () => page.evaluate((removedRowKey) => {
    const browserWindow = window as any;
    const cartStore = browserWindow.wc?.wcBlocksData?.cartStore;
    const selectors = cartStore ? browserWindow.wp?.data?.select(cartStore) : null;
    const cartData = selectors?.getCartData?.();
    return {
      itemsCount: cartData?.itemsCount,
      itemsLength: cartData?.items?.length,
      hasPendingOperations: selectors?.hasPendingItemsOperations?.(),
      removedItemPending: selectors?.isItemPendingDelete?.(removedRowKey),
    };
  }, rowKey)).toEqual({
    itemsCount: 0,
    itemsLength: 0,
    hasPendingOperations: false,
    removedItemPending: false,
  });
  const emptyCart = page.locator('.wp-block-woocommerce-empty-cart-block');
  await expect(emptyCart).toHaveCount(1);
  await expect(emptyCart).toBeVisible();
  await expect(page.locator('.az-cart-intro__eyebrow')).toHaveCount(0);
  const emptyHeading = emptyCart.getByRole('heading', { level: 2, name: 'Корзина пока пуста' });
  await expect(emptyHeading).toBeVisible();
  await expect(emptyHeading).toHaveClass(/\bwith-empty-cart-icon\b/);
  const iconPresentation = await emptyHeading.evaluate((element) => {
    const icon = getComputedStyle(element, '::before');
    return {
      content: icon.content,
      width: Number.parseFloat(icon.width),
      height: Number.parseFloat(icon.height),
      backgroundImage: icon.backgroundImage,
      maskImage: icon.maskImage,
      webkitMaskImage: icon.getPropertyValue('-webkit-mask-image'),
    };
  });
  expect(iconPresentation.content).not.toBe('none');
  expect(iconPresentation.width).toBeGreaterThanOrEqual(84);
  expect(iconPresentation.height).toBeGreaterThanOrEqual(84);
  expect(iconPresentation.backgroundImage).toContain('empty-cart.svg');
  expect(iconPresentation.maskImage).toBe('none');
  expect(iconPresentation.webkitMaskImage).toBe('none');
  await expect(page.locator('[data-cart-intro-copy]')).toHaveText(
    'Добавьте нужные запчасти — выбранные позиции появятся здесь.',
  );

  const continueShopping = emptyCart.getByRole('link', { name: 'Перейти в каталог', exact: true });
  await expect(continueShopping).toBeVisible();
  const unfocusedCtaShadow = await continueShopping.evaluate((element) => getComputedStyle(element).boxShadow);
  await page.keyboard.press('Tab');
  await continueShopping.focus();
  await expect(continueShopping).toBeFocused();
  await expect.poll(async () => continueShopping.evaluate((element) => getComputedStyle(element).boxShadow)).toContain(
    'rgb(18, 98, 232) 0px 0px 0px 6px',
  );
  const focusedCta = await continueShopping.evaluate((element) => ({
    focusVisible: element.matches(':focus-visible'),
    shadow: getComputedStyle(element).boxShadow,
  }));
  expect(focusedCta.focusVisible).toBe(true);
  expect(focusedCta.shadow).not.toBe(unfocusedCtaShadow);
  const shopHref = await continueShopping.getAttribute('href');
  expect(shopHref).toBeTruthy();
  const shopUrl = new URL(shopHref!, page.url());
  expect(shopUrl.origin).toBe(cartOrigin);
  expect(shopUrl.pathname).toBe('/shop/');
  expect(shopUrl.search).toBe('');
  expect(shopUrl.hash).toBe('');

  await expect(emptyCart.getByRole('heading')).toHaveCount(1);
  await expect(emptyCart.locator('.wp-block-woocommerce-product-new:visible')).toHaveCount(0);
  await expect(emptyCart.locator('.wc-block-grid__product:visible')).toHaveCount(0);

  const viewportWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(viewportWidth.scroll).toBeLessThanOrEqual(viewportWidth.client + 1);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `cart-empty-${testInfo.project.name}.png`);
  await continueShopping.click();
  await page.waitForLoadState('networkidle');
  expect(page.url()).toBe(shopUrl.href);
  await expect(page.locator('body')).toHaveClass(/\bwoocommerce-shop\b/);
  await expect(headerCount).toHaveText('0');
  await expect(headerCart).toHaveAccessibleName('Корзина 0');
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});
