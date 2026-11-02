import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { captureStableVisual } from './visual';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

type CategoryCardSnapshot = {
  id: string;
  href: string;
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

async function readCategoryCards(page: Page, selector: string): Promise<CategoryCardSnapshot[]> {
  return page.locator(selector).evaluateAll((cards) =>
    cards.map((card) => ({
      id: card.getAttribute('data-category-id') ?? '',
      href: (card as HTMLAnchorElement).href,
    })),
  );
}

async function expectCategoryAccessibleNames(cards: Locator): Promise<void> {
  for (let index = 0; index < await cards.count(); index += 1) {
    const card = cards.nth(index);
    const visibleName = (await card.locator(':scope > span:last-child').innerText()).trim();
    expect(visibleName).not.toBe('');
    await expect(card).toHaveAccessibleName(visibleName);
  }
}

test('opens the dynamic catalog and a published WooCommerce category', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const homeCategoryCards = page.locator('#catalog .az-category-card');
  await expect(homeCategoryCards).toHaveCount(8);
  await expectCategoryAccessibleNames(homeCategoryCards);
  const homeCategories = await readCategoryCards(page, '#catalog .az-category-card');
  const homeOrigin = new URL(page.url()).origin;
  const homeCategoryIds = homeCategories.map(({ id }) => id);
  expect(homeCategoryIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);
  expect(new Set(homeCategoryIds).size).toBe(8);
  expect(
    homeCategories.every(({ href }) => {
      const categoryUrl = new URL(href);
      return categoryUrl.origin === homeOrigin && /^\/product-category\/[^/]+\/$/.test(categoryUrl.pathname);
    }),
    'Every selected homepage category should retain a same-origin WooCommerce taxonomy URL',
  ).toBe(true);

  const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
  expect(shopUrl, 'The header must expose the configured WooCommerce shop URL').toBeTruthy();
  expect(new URL(shopUrl!, page.url()).pathname, 'The repaired catalog route must use the canonical WooCommerce slug').toBe('/shop/');
  await page.goto(shopUrl!, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1, name: 'Каталог товаров' })).toBeVisible();

  const shopBreadcrumb = page.locator('.woocommerce-breadcrumb');
  await expect(shopBreadcrumb).toHaveText(/^\s*Главная\s*\/\s*Каталог товаров\s*$/);
  const shopHomeUrl = await shopBreadcrumb.getByRole('link', { name: 'Главная' }).getAttribute('href');
  expect(shopHomeUrl).toBeTruthy();
  expect(new URL(shopHomeUrl!, page.url()).pathname).toBe('/');

  const resultCount = page.locator('[data-shop-product-count]');
  await expect(resultCount).toHaveCount(1);
  await expect(resultCount).toHaveText(/^Товаров в каталоге: \d+$/);
  await expect(page.locator('.woocommerce-ordering')).toHaveCount(0);

  const visibleProducts = page.locator('ul.products li.product');
  const visibleProductCount = await visibleProducts.count();
  expect(visibleProductCount, 'The canonical catalog should render published products').toBeGreaterThan(0);
  const totalProductCount = Number((await resultCount.innerText()).match(/\d+$/)?.[0] ?? 0);
  expect(totalProductCount, 'The catalog total should cover every product visible on the current page').toBeGreaterThanOrEqual(visibleProductCount);
  const productHrefs = await visibleProducts.locator('.woocommerce-loop-product__link').evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).href),
  );
  expect(productHrefs).toHaveLength(visibleProductCount);
  const shopOrigin = new URL(page.url()).origin;
  expect(
    productHrefs.every((href) => {
      const productUrl = new URL(href);
      return productUrl.origin === shopOrigin && productUrl.pathname.length > 1;
    }),
    'Every catalog card should retain a same-origin product URL',
  ).toBe(true);

  const catalog = page.locator('.az-shop-categories');
  await expect(catalog).toBeVisible();
  await expect(catalog.getByRole('heading', { name: 'Каталог автозапчастей' })).toBeVisible();

  const categoryCards = catalog.locator('.az-category-card');
  await expect(categoryCards, 'The canonical shop should expose exactly the eight selected top-level categories').toHaveCount(8);
  await expectCategoryAccessibleNames(categoryCards);
  const shopCategories = await readCategoryCards(page, '.az-shop-categories .az-category-card');
  expect(shopCategories, 'Homepage and shop must preserve the same selected category identities, order and URLs').toEqual(homeCategories);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  const shopPageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(shopPageWidth.scrollWidth).toBeLessThanOrEqual(shopPageWidth.clientWidth + 1);

  await captureStableVisual(page, testInfo, `catalog-${testInfo.project.name}.png`);

  const brakes = categoryCards.filter({ hasText: 'Тормозная система' });
  await expect(brakes).toHaveCount(1);
  await brakes.click();
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/\/product-category\//);
  const categoryBreadcrumb = page.locator('.woocommerce-breadcrumb');
  await expect(categoryBreadcrumb).toContainText('Главная');
  await expect(categoryBreadcrumb).toContainText('Тормозная система');
  await expect(categoryBreadcrumb).not.toContainText(/\bHome\b/);
  await expect(page.getByRole('heading', { level: 1, name: 'Тормозная система' })).toBeVisible();
  await expect(page.locator('[data-shop-product-count]')).toHaveCount(0);
  await expect(page.locator('.woocommerce-result-count')).toHaveCount(1);
  await expect(page.locator('.woocommerce-ordering')).toHaveCount(1);
  expect(await page.locator('ul.products li.product').count(), 'The published category should contain demo products').toBeGreaterThan(0);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('shows explicit demo provenance through shop, product search and PDP', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
  expect(shopUrl).toBeTruthy();
  await page.goto(shopUrl!, { waitUntil: 'networkidle' });

  await page.locator('.az-category-card').filter({ hasText: 'Тормозная система' }).click();
  await page.waitForLoadState('networkidle');

  const shopProduct = page.locator('ul.products li.product').filter({
    has: page.locator('[data-demo-provenance="product"]'),
  }).first();
  await expect(shopProduct).toBeVisible();
  await expect(shopProduct.locator('[data-demo-provenance="product"]')).toContainText('цена и наличие не подтверждены');

  const search = page.getByRole('searchbox', { name: 'Поиск товаров' });
  await search.fill('Фильтр');
  await page.getByRole('button', { name: 'Найти' }).click();
  await page.waitForLoadState('networkidle');

  const searchProduct = page.locator('ul.products li.product').filter({ hasText: 'Масляный фильтр' }).first();
  await expect(searchProduct).toBeVisible();
  await expect(searchProduct.locator('[data-demo-provenance="product"]')).toContainText('Демонстрационный товар');
  await searchProduct.locator('.woocommerce-loop-product__link').click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toHaveClass(/single-product/);
  const provenance = page.locator('.summary [data-demo-provenance="product"]');
  await expect(provenance).toBeVisible();
  await expect(provenance).toContainText('Цена, остаток, срок поставки и применяемость не подтверждены внешними системами');
  await expect(provenance).toContainText('Paper SCR-002, SCR-006, SCR-007, SCR-009');

  await captureStableVisual(page, testInfo, `product-demo-provenance-${testInfo.project.name}.png`);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('keeps the marked demo PDP technical and relation-safe', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
  expect(shopUrl).toBeTruthy();
  await page.goto(shopUrl!, { waitUntil: 'networkidle' });

  const productCard = page.locator('ul.products li.product').filter({
    has: page.locator('[data-demo-provenance="product"]'),
  }).first();
  await expect(productCard).toBeVisible();
  const expectedName = (await productCard.locator('.woocommerce-loop-product__title').innerText()).trim();
  await productCard.locator('.woocommerce-loop-product__link').click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toHaveClass(/single-product/);
  const title = page.locator('h1.product_title');
  await expect(title).toHaveCount(1);
  await expect(title).toHaveText(expectedName);
  const productBreadcrumb = page.locator('.woocommerce-breadcrumb');
  await expect(productBreadcrumb).toContainText('Главная');
  await expect(productBreadcrumb).toContainText(expectedName);
  await expect(productBreadcrumb).not.toContainText(/\bHome\b/);

  const productImage = page.locator('.woocommerce-product-gallery img').first();
  await expect(productImage).toBeVisible();
  const image = await productImage.evaluate((element: HTMLImageElement) => ({
    alt: element.alt.trim(),
    src: element.currentSrc || element.src,
  }));
  expect(image.src).toBeTruthy();
  expect(image.alt.length > 0 || image.src.includes('placeholder'), 'Product image needs meaningful alt text or the Woo placeholder').toBe(true);

  await expect(page.locator('.woocommerce-product-details__short-description')).toBeVisible();
  await expect(page.locator('.woocommerce-Tabs-panel--description')).toBeVisible();
  await expect(page.locator('.woocommerce-tabs .description_tab')).toContainText('Описание');
  await expect(page.locator('.woocommerce-Tabs-panel--description h2')).toHaveText('Описание');
  await expect(page.locator('[data-demo-provenance="product"]')).toBeVisible();

  const demoMeta = page.locator('[data-demo-product-meta="product"]');
  await expect(demoMeta).toBeVisible();
  await expect(demoMeta).toContainText('Технический демо-SKU');
  await expect(demoMeta).toContainText('не OEM и не артикул производителя');
  await expect(demoMeta.locator('[data-demo-technical-sku]')).toHaveText(/^AZ-DEMO-\d{3}$/);
  await expect(demoMeta.locator('.posted_in a')).toHaveAttribute('href', /\/product-category\//);

  await expect(page.locator('p.stock')).toContainText('Демо-наличие не подтверждено внешними системами');
  await expect(page.locator('button.single_add_to_cart_button')).toContainText('Добавить в демо-корзину');
  await expect(page.locator('section.related.products')).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `product-technical-baseline-${testInfo.project.name}.png`);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});
