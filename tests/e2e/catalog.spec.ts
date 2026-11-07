import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { expectLoopCardPresentation, expectLoopGridPresentation } from './product-card';
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

  const catalogLink = page.locator('a.az-catalog-button');
  await expect(catalogLink).toHaveCount(1);
  await expect(catalogLink).toBeVisible();
  await expect(catalogLink).toHaveAccessibleName('Каталог товаров');
  const catalogHref = await catalogLink.getAttribute('href');
  expect(catalogHref, 'The header must expose the configured WooCommerce shop URL').toBeTruthy();
  const catalogUrl = new URL(catalogHref!, page.url());
  expect(catalogUrl.origin).toBe(homeOrigin);
  expect(catalogUrl.pathname, 'The repaired catalog route must use the canonical WooCommerce slug').toBe('/shop/');
  expect(catalogUrl.search).toBe('');
  expect(catalogUrl.hash).toBe('');

  await catalogLink.click();
  await page.waitForLoadState('networkidle');
  await page.mouse.move(0, 0);
  const loadedCatalogUrl = new URL(page.url());
  expect(loadedCatalogUrl.origin).toBe(catalogUrl.origin);
  expect(loadedCatalogUrl.pathname).toBe(catalogUrl.pathname);
  expect(loadedCatalogUrl.search).toBe('');
  expect(loadedCatalogUrl.hash).toBe('');
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
  await expectLoopGridPresentation(page.locator('ul.products'), page.viewportSize()?.width ?? 0);
  for (let index = 0; index < visibleProductCount; index += 1) {
    await expectLoopCardPresentation(visibleProducts.nth(index), { kind: 'demo' });
  }
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
  const categoryResultCount = page.locator('[data-category-product-count]');
  await expect(categoryResultCount).toHaveCount(1);
  await expect(categoryResultCount).toHaveText(/^Товаров в категории: \d+$/);
  await expect(page.locator('.woocommerce-ordering')).toHaveCount(0);
  const categoryProductList = page.locator('ul.products');
  const categoryProducts = categoryProductList.locator('li.product');
  const categoryProductCount = await categoryProducts.count();
  expect(categoryProductCount, 'The published category should contain demo products').toBeGreaterThan(0);
  await expectLoopGridPresentation(categoryProductList, page.viewportSize()?.width ?? 0);
  for (let index = 0; index < categoryProductCount; index += 1) {
    await expectLoopCardPresentation(categoryProducts.nth(index), { kind: 'demo' });
  }

  const categoryAccessibility = await new AxeBuilder({ page }).analyze();
  const categoryBlockingViolations = categoryAccessibility.violations.filter((violation) => (
    ['serious', 'critical'].includes(violation.impact ?? '')
  ));
  expect(
    categoryBlockingViolations,
    `Category serious/critical axe violations:\n${JSON.stringify(categoryBlockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `product-category-${testInfo.project.name}.png`);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('keeps public catalog copy free from fixture and implementation labels', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
  expect(shopUrl).toBeTruthy();
  await page.goto(shopUrl!, { waitUntil: 'networkidle' });

  await page.locator('.az-category-card').filter({ hasText: 'Тормозная система' }).click();
  await page.waitForLoadState('networkidle');

  const shopProduct = page.locator('ul.products li.product').first();
  await expect(shopProduct).toBeVisible();
  await expect(shopProduct.locator('[data-demo-provenance="product"]')).toHaveCount(0);
  await expect(shopProduct).not.toContainText(/демо|демонстрац|Paper SCR|AZ-DEMO-/i);

  const search = page.getByRole('searchbox', { name: 'Поиск товаров' });
  await search.fill('Фильтр');
  await page.getByRole('button', { name: 'Найти' }).click();
  await page.waitForLoadState('networkidle');

  const searchProduct = page.locator('ul.products li.product').filter({ hasText: 'Масляный фильтр' }).first();
  await expect(searchProduct).toBeVisible();
  await expect(searchProduct.locator('[data-demo-provenance="product"]')).toHaveCount(0);
  await expect(searchProduct).not.toContainText(/демо|демонстрац|Paper SCR|AZ-DEMO-/i);
  await searchProduct.locator('.woocommerce-loop-product__link').click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toHaveClass(/single-product/);
  await expect(page.locator('[data-demo-provenance="product"]')).toHaveCount(0);
  await expect(page.locator('main#primary')).not.toContainText(/демо|демонстрац|Paper SCR|AZ-DEMO-/i);

  await captureStableVisual(page, testInfo, `product-public-copy-${testInfo.project.name}.png`);

  const pageWidth = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth + 1);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('keeps the seeded PDP customer-facing and relation-safe', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
  expect(shopUrl).toBeTruthy();
  await page.goto(shopUrl!, { waitUntil: 'networkidle' });

  const productCard = page.locator('ul.products li.product').filter({ hasText: 'Тормозной диск' }).first();
  await expect(productCard).toBeVisible();
  const expectedName = (await productCard.locator('.woocommerce-loop-product__title').innerText()).trim();
  const loopAction = productCard.locator('a.add_to_cart_button[data-product_id]');
  await expect(loopAction).toHaveCount(1);
  const productId = await loopAction.getAttribute('data-product_id');
  expect(productId).toMatch(/^\d+$/);
  expect(Number(productId)).toBeGreaterThan(0);
  await productCard.locator('.woocommerce-loop-product__link').click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toHaveClass(/single-product/);
  const productShell = page.locator('.single-product div.product').first();
  await expect(productShell).toHaveCSS('display', 'grid');
  const title = productShell.locator(':scope > h1.product_title');
  await expect(title).toHaveCount(1);
  await expect(title).toHaveText(expectedName);
  const publicIdentity = productShell.locator(':scope > .az-product-identity[data-product-identity="catalog"]');
  await expect(publicIdentity).toHaveCount(1);
  await expect(publicIdentity.locator('dt')).toHaveText(['Бренд', 'Артикул']);
  const publicBrand = publicIdentity.locator('[data-product-brand]');
  const publicArticle = publicIdentity.locator('[data-product-article]');
  await expect(publicBrand).toContainText(/\S/);
  await expect(publicArticle).toContainText(/\S/);
  await expect(publicIdentity).not.toContainText(/AZ-DEMO-/);
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

	await expect(page.locator('.woocommerce-product-details__short-description')).toHaveCount(0);
	await expect(page.locator('.woocommerce-tabs')).toHaveCount(0);
	const productDescription = productShell.locator(':scope > [data-pdp-section="description"]');
	await expect(productDescription).toBeVisible();
	await expect(productDescription.getByRole('heading', { level: 2, name: 'О товаре' })).toHaveCount(1);
  await expect(page.locator('[data-demo-provenance="product"]')).toHaveCount(0);
  await expect(page.locator('[data-demo-product-meta="product"], [data-demo-technical-sku]')).toHaveCount(0);
  const productMeta = page.locator('.summary > .product_meta');
  await expect(productMeta).toBeVisible();
  await expect(productMeta.locator('.sku_wrapper')).toHaveCount(0);
  await expect(productMeta.locator('.posted_in a')).toHaveAttribute('href', /\/product-category\//);
  await expect(productShell).not.toContainText(/демо|демонстрац|Paper SCR|AZ-DEMO-/i);

  await expect(page.locator('p.stock')).toContainText('Наличие уточняется');
  const cartForm = page.locator('form.cart');
  await expect(cartForm).toHaveCount(1);
  await expect(cartForm).toHaveAttribute('method', 'post');
  const productUrl = new URL(page.url());
  const formAction = new URL(await cartForm.evaluate((form: HTMLFormElement) => form.action));
  expect(formAction.origin).toBe(productUrl.origin);
  expect(formAction.pathname).toBe(productUrl.pathname);
  expect(formAction.search).toBe('');
  expect(formAction.hash).toBe('');

  const addToCartSubmit = cartForm.locator('button.single_add_to_cart_button[name="add-to-cart"]');
  await expect(addToCartSubmit).toHaveCount(1);
  await expect(addToCartSubmit).toHaveAttribute('type', 'submit');
  await expect(addToCartSubmit).toHaveAttribute('value', productId!);
  await expect(addToCartSubmit).toHaveText('Добавить в корзину');
  const quantityInput = cartForm.locator('.quantity input.qty');
  await expect(quantityInput).toHaveCount(1);
  const [galleryBox, summaryBox, quantityBox, submitBox] = await Promise.all([
    productShell.locator(':scope > .woocommerce-product-gallery').boundingBox(),
    productShell.locator(':scope > .summary').boundingBox(),
    quantityInput.boundingBox(),
    addToCartSubmit.boundingBox(),
  ]);
  expect(galleryBox).toBeTruthy();
  expect(summaryBox).toBeTruthy();
  expect(quantityBox).toBeTruthy();
  expect(submitBox).toBeTruthy();
  expect(quantityBox!.height).toBeGreaterThanOrEqual(44);
  expect(submitBox!.height).toBeGreaterThanOrEqual(48);
  const controlsOverlap = !(
    quantityBox!.x + quantityBox!.width <= submitBox!.x
    || submitBox!.x + submitBox!.width <= quantityBox!.x
    || quantityBox!.y + quantityBox!.height <= submitBox!.y
    || submitBox!.y + submitBox!.height <= quantityBox!.y
  );
  expect(controlsOverlap, 'Quantity and add-to-cart controls must not overlap').toBe(false);
  if ((page.viewportSize()?.width ?? 0) > 900) {
    expect(summaryBox!.x).toBeGreaterThan(galleryBox!.x + galleryBox!.width - 1);
  } else {
    expect(summaryBox!.y).toBeGreaterThanOrEqual(galleryBox!.y + galleryBox!.height - 1);
  }
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
