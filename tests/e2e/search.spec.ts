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

test('shows a truthful product-search empty state', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  const query = 'AZ-NO-RESULT-9F3C & "probe"';
  await page.goto('/', { waitUntil: 'networkidle' });

  const searchForm = page.locator('form.az-search');
  await expect(searchForm).toHaveCount(1);
  await expect(searchForm).toHaveAttribute('method', 'get');
  const searchAction = new URL(await searchForm.evaluate((form: HTMLFormElement) => form.action));
  expect(searchAction.origin).toBe(new URL(page.url()).origin);
  expect(searchAction.pathname).toBe('/');
  expect(searchAction.search).toBe('');
  expect(searchAction.hash).toBe('');

  await expect(page.locator('.az-search__type')).toContainText('По товарам');
  const search = searchForm.getByRole('searchbox', { name: 'Поиск товаров' });
  await expect(search).toHaveAttribute('type', 'search');
  await expect(search).toHaveAttribute('name', 's');
  await expect(search).toHaveAttribute('placeholder', 'Введите запрос');
  const searchScope = searchForm.locator('input[name="post_type"]');
  await expect(searchScope).toHaveCount(1);
  await expect(searchScope).toHaveAttribute('type', 'hidden');
  await expect(searchScope).toHaveValue('product');
  const searchSubmit = searchForm.getByRole('button', { name: 'Найти', exact: true });
  await expect(searchSubmit).toHaveCount(1);
  await expect(searchSubmit).toHaveAttribute('type', 'submit');
  await search.fill(query);
  await searchSubmit.click();
  await page.waitForLoadState('networkidle');

  const resultUrl = new URL(page.url());
  expect(resultUrl.searchParams.get('post_type')).toBe('product');
  expect(resultUrl.searchParams.get('s')).toBe(query);
  await expect(page.locator('main h1').first()).toContainText(`Поиск товаров: «${query}»`);
  await expect(page.getByRole('searchbox', { name: 'Поиск товаров' })).toHaveValue(query);

  const breadcrumb = page.locator('.woocommerce-breadcrumb');
  await expect(breadcrumb).toContainText('Главная');
  await expect(breadcrumb).toContainText('Каталог товаров');
  await expect(breadcrumb).toContainText(`Поиск товаров: «${query}»`);
  await expect(breadcrumb).not.toContainText(/Home|Shop|Search results/);
  const breadcrumbHomeUrl = await breadcrumb.getByRole('link', { name: 'Главная' }).getAttribute('href');
  const breadcrumbShopUrl = await breadcrumb.getByRole('link', { name: 'Каталог товаров' }).getAttribute('href');
  expect(new URL(breadcrumbHomeUrl!, page.url()).pathname).toBe('/');
  expect(new URL(breadcrumbShopUrl!, page.url()).pathname).toBe('/shop/');

  const emptyState = page.locator('[data-product-search-empty]');
  await expect(emptyState).toHaveCount(1);
  await expect(emptyState.getByRole('heading', { name: 'Товары не найдены' })).toBeVisible();
  await expect(emptyState.locator('[data-product-search-query]')).toHaveText(`«${query}»`);
  await expect(emptyState).toContainText('нет опубликованных товаров');
  const catalogUrl = await emptyState.getByRole('link', { name: 'Вернуться в каталог' }).getAttribute('href');
  expect(catalogUrl).toBeTruthy();
  expect(new URL(catalogUrl!, page.url()).pathname).toBe('/shop/');
  await expect(page.locator('ul.products li.product')).toHaveCount(0);
  await expect(page.locator('.woocommerce-info')).toHaveCount(0);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `product-search-empty-${testInfo.project.name}.png`);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('keeps generic product-search results scoped and explicit', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  const query = 'Фильтр';
  await page.goto('/', { waitUntil: 'networkidle' });

  const search = page.getByRole('searchbox', { name: 'Поиск товаров' });
  await search.fill(query);
  await page.getByRole('button', { name: 'Найти' }).click();
  await page.waitForLoadState('networkidle');

  const resultUrl = new URL(page.url());
  expect(resultUrl.searchParams.get('post_type')).toBe('product');
  expect(resultUrl.searchParams.get('s')).toBe(query);
  await expect(page.locator('main h1').first()).toContainText(`Поиск товаров: «${query}»`);
  await expect(page.getByRole('searchbox', { name: 'Поиск товаров' })).toHaveValue(query);
  const breadcrumb = page.locator('.woocommerce-breadcrumb');
  await expect(breadcrumb).toContainText('Главная');
  await expect(breadcrumb).toContainText('Каталог товаров');
  await expect(breadcrumb).toContainText(`Поиск товаров: «${query}»`);
  await expect(breadcrumb).not.toContainText(/Home|Shop|Search results/);
  await expect(page.locator('[data-product-search-empty]')).toHaveCount(0);
  await expect(page.locator('.az-shop-categories')).toHaveCount(0);
  await expect(page.locator('.woocommerce-ordering')).toHaveCount(0);
  await expect(page.locator('[data-product-search-count]')).toHaveText('Найдено товаров: 2');

  const products = page.locator('ul.products li.product');
  await expect(products).toHaveCount(2);
  for (let index = 0; index < await products.count(); index += 1) {
    const product = products.nth(index);
    const productTitle = product.locator('.woocommerce-loop-product__title');
    await expect(productTitle).toBeVisible();
    expect((await productTitle.innerText()).trim()).not.toBe('');
    await expect(product.locator('[data-demo-provenance="product"]')).toContainText('Демонстрационный товар');
    await expect(product.locator('.add_to_cart_button')).toHaveText('Добавить в демо-корзину');
    const productUrl = await product.locator('.woocommerce-loop-product__link').getAttribute('href');
    expect(productUrl).toBeTruthy();
    const parsedProductUrl = new URL(productUrl!, page.url());
    expect(parsedProductUrl.origin).toBe(new URL(page.url()).origin);
    expect(parsedProductUrl.pathname).not.toBe('/');
  }

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `product-search-results-${testInfo.project.name}.png`);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('keeps product-search presentation fail-closed for post-only and mixed scopes', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  const query = 'Фильтр';
  const cases = [
    { label: 'post-only', postTypes: ['post'] },
    { label: 'mixed product and post', postTypes: ['product', 'post'] },
  ];

  for (const searchCase of cases) {
    const params = new URLSearchParams({ s: query });
    if (searchCase.postTypes.length === 1) {
      params.set('post_type', searchCase.postTypes[0]);
    } else {
      searchCase.postTypes.forEach((postType) => params.append('post_type[]', postType));
    }

    const response = await page.goto(`/?${params.toString()}`, { waitUntil: 'networkidle' });
    expect(response?.ok(), `${searchCase.label} search should return a successful document`).toBeTruthy();
    await expect(page.locator('body')).toHaveClass(/\bsearch\b/);
    await expect(page.locator('main')).toBeVisible();

    const resultUrl = new URL(page.url());
    expect(resultUrl.searchParams.get('s'), `${searchCase.label} should preserve the query`).toBe(query);
    if (searchCase.postTypes.length === 1) {
      expect(resultUrl.searchParams.get('post_type')).toBe('post');
    } else {
      expect(resultUrl.searchParams.getAll('post_type[]')).toEqual(searchCase.postTypes);
    }

    await expect(page.locator('[data-product-search-count]')).toHaveCount(0);
    await expect(page.locator('[data-product-search-empty]')).toHaveCount(0);
    await expect(page.locator('[data-shop-product-count]')).toHaveCount(0);
    await expect(page.locator('.az-shop-categories')).toHaveCount(0);
    await expect(page.getByText(/^\s*Поиск товаров:/)).toHaveCount(0);

    const pageWidth = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }));
    expect(pageWidth.scrollWidth, `${searchCase.label} should not overflow`).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  }

  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});
