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

const adminUser = process.env.WP_ADMIN_USER;
const adminPassword = process.env.WP_ADMIN_PASSWORD;

test.describe('WordPress administration', () => {
	test.describe.configure({ mode: 'serial' });
  test.skip(!adminUser || !adminPassword, 'Set WP_ADMIN_USER and WP_ADMIN_PASSWORD to run the admin smoke test.');

  async function logIn(page: Page): Promise<void> {
    await page.goto('/wp-login.php');
    await page.locator('#user_login').fill(adminUser!);
    await page.locator('#user_pass').fill(adminPassword!);

    await Promise.all([
      page.waitForURL(/\/wp-admin(?:\/|$)/),
      page.locator('#wp-submit').click(),
    ]);
  }

  test('logs in and exposes the Автозакуп menu without modifying data', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);

    await logIn(page);

    await expect(page.locator('body.wp-admin')).toBeVisible();
    await expect(page.locator('#wpadminbar')).toBeVisible();

    const avtozakupMenu = page.locator('#toplevel_page_avtozakup');
    await expect(avtozakupMenu).toBeVisible();
    await expect(avtozakupMenu).toContainText('Автозакуп');

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });

  test('saves homepage presentation content and restores the original value', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await logIn(page);
    await page.goto('/wp-admin/admin.php?page=avtozakup');

    const heroTitle = page.locator('#hero_title');
    await expect(heroTitle).toBeVisible();
    const originalTitle = await heroTitle.inputValue();
    const marker = `E2E проверка редактирования ${Date.now()}`;

    try {
      await heroTitle.fill(marker);
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);
      await expect(page.locator('#hero_title')).toHaveValue(marker);

      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('.az-hero h1')).toContainText(marker);
    } finally {
      await page.goto('/wp-admin/admin.php?page=avtozakup');
      await page.locator('#hero_title').fill(originalTitle);
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);
    }

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });

  test('keeps user-owned products outside demo presentation semantics', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    const marker = Date.now();
    const productName = `E2E user product ${marker}`;
    const sku = `USER-E2E-${marker}`;
    let restNonce = '';
    let productId = 0;

    await logIn(page);
    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');
    const requestHeaders = { 'X-WP-Nonce': restNonce };

    try {
      const productResponse = await page.request.post('/wp-json/wc/v3/products', {
        headers: requestHeaders,
        data: {
          name: productName,
          slug: `e2e-user-product-${marker}`,
          sku,
          type: 'simple',
          status: 'publish',
          catalog_visibility: 'visible',
          regular_price: '4321',
          manage_stock: true,
          stock_quantity: 3,
          short_description: 'User-owned short description.',
          description: 'User-owned long description.',
        },
      });
      expect(productResponse.ok(), await productResponse.text()).toBeTruthy();
      const createdProduct = await productResponse.json();
      productId = Number(createdProduct.id);
      expect(productId).toBeGreaterThan(0);
      expect(createdProduct.permalink).toBeTruthy();

      await page.goto('/shop/?orderby=date', { waitUntil: 'networkidle' });
      const loopProduct = page.locator(`li.product.post-${productId}`);
      await expect(loopProduct).toBeVisible();
      await expect(loopProduct.locator('[data-demo-provenance="product"]')).toHaveCount(0);
      const loopAction = loopProduct.locator('.add_to_cart_button');
      await expect(loopAction).toHaveCount(1);
      await expect(loopAction).toBeVisible();
      await expect(loopAction).toContainText(/\S/);
      await expect(loopAction).not.toContainText(/демо/i);

      await page.goto(createdProduct.permalink, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toHaveClass(/single-product/);
      await expect(page.locator('h1.product_title')).toHaveText(productName);
      await expect(page.locator('[data-demo-provenance="product"]')).toHaveCount(0);
      await expect(page.locator('[data-demo-product-meta="product"]')).toHaveCount(0);
      await expect(page.locator('.product_meta .sku')).toHaveText(sku);
      await expect(page.locator('p.stock')).toContainText('3');
      await expect(page.locator('p.stock')).not.toContainText('Демо-наличие');
      const singleAction = page.locator('button.single_add_to_cart_button');
      await expect(singleAction).toHaveCount(1);
      await expect(singleAction).toBeVisible();
      await expect(singleAction).toContainText(/\S/);
      await expect(singleAction).not.toContainText(/демо/i);
      await expect(page.locator('.woocommerce-product-details__short-description')).toContainText('User-owned short description.');
      await expect(page.locator('.woocommerce-Tabs-panel--description')).toContainText('User-owned long description.');
      await expect(page.locator('.woocommerce-tabs .description_tab')).toContainText('Описание');
    } finally {
      if (restNonce) {
        const lookupUrl = `/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}&per_page=10`;
        let cleanupIds = productId > 0 ? [productId] : [];

        if (cleanupIds.length === 0) {
          const lookupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
          expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
          const lookupProducts = await lookupResponse.json();
          cleanupIds = lookupProducts
            .filter((product: { id?: number; sku?: string }) => product.sku === sku && Number(product.id) > 0)
            .map((product: { id: number }) => Number(product.id));
        }

        for (const cleanupId of [...new Set(cleanupIds)]) {
          const deleteProductResponse = await page.request.delete(`/wp-json/wc/v3/products/${cleanupId}?force=true`, {
            headers: requestHeaders,
          });
          expect(deleteProductResponse.ok(), await deleteProductResponse.text()).toBeTruthy();
        }

        const verifyCleanupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
        expect(verifyCleanupResponse.ok(), await verifyCleanupResponse.text()).toBeTruthy();
        const remainingProducts = await verifyCleanupResponse.json();
        expect(remainingProducts.filter((product: { sku?: string }) => product.sku === sku)).toHaveLength(0);
      }
    }

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });

  test('creates and edits WooCommerce records, renders them on the homepage, and cleans up', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    const marker = Date.now();
    const categoryName = `E2E категория ${marker}`;
    const initialProductName = `E2E товар ${marker}`;
    const updatedProductName = `${initialProductName} — изменён`;
    let restNonce = '';
    let categoryId = 0;
    let productId = 0;
    let originalCategoryIds: string[] = [];
    let originalProductIds: string[] = [];

    await logIn(page);
    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');

    const requestHeaders = { 'X-WP-Nonce': restNonce };

    try {
      const categoryResponse = await page.request.post('/wp-json/wc/v3/products/categories', {
        headers: requestHeaders,
        data: { name: categoryName, slug: `e2e-category-${marker}` },
      });
      expect(categoryResponse.ok(), await categoryResponse.text()).toBeTruthy();
      categoryId = Number((await categoryResponse.json()).id);
      expect(categoryId).toBeGreaterThan(0);

      const productResponse = await page.request.post('/wp-json/wc/v3/products', {
        headers: requestHeaders,
        data: {
          name: initialProductName,
          slug: `e2e-product-${marker}`,
          type: 'simple',
          status: 'publish',
          regular_price: '1234',
          stock_status: 'instock',
          categories: [{ id: categoryId }],
        },
      });
      expect(productResponse.ok(), await productResponse.text()).toBeTruthy();
      productId = Number((await productResponse.json()).id);
      expect(productId).toBeGreaterThan(0);

      const updateResponse = await page.request.put(`/wp-json/wc/v3/products/${productId}`, {
        headers: requestHeaders,
        data: { name: updatedProductName },
      });
      expect(updateResponse.ok(), await updateResponse.text()).toBeTruthy();
      expect((await updateResponse.json()).name).toContain(updatedProductName);

      await page.goto('/wp-admin/admin.php?page=avtozakup');
      const categorySelect = page.locator('#category_ids');
      const productSelect = page.locator('#popular_product_ids');
      await expect(categorySelect.locator(`option[value="${categoryId}"]`)).toContainText(categoryName);
      await expect(productSelect.locator(`option[value="${productId}"]`)).toContainText(updatedProductName);

      originalCategoryIds = await categorySelect.locator('option:checked').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );
      originalProductIds = await productSelect.locator('option:checked').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );

      await categorySelect.selectOption([String(categoryId), ...originalCategoryIds.slice(0, 7)]);
      await productSelect.selectOption([String(productId), ...originalProductIds.slice(0, 4)]);
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);

      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('.az-category-card', { hasText: categoryName })).toBeVisible();
      const productCard = page.locator(`.az-product-card[data-product-id="${productId}"]`);
      await expect(productCard).toBeVisible();
      await expect(productCard.locator('.az-product-card__title')).toContainText(updatedProductName);
    } finally {
      if (originalCategoryIds.length || originalProductIds.length) {
        await page.goto('/wp-admin/admin.php?page=avtozakup');
        await page.locator('#category_ids').selectOption(originalCategoryIds);
        await page.locator('#popular_product_ids').selectOption(originalProductIds);
        await Promise.all([
          page.waitForURL(/settings-updated=true/),
          page.locator('#submit').click(),
        ]);
      }

      if (productId > 0 && restNonce) {
        const deleteProductResponse = await page.request.delete(`/wp-json/wc/v3/products/${productId}?force=true`, {
          headers: requestHeaders,
        });
        expect(deleteProductResponse.ok(), await deleteProductResponse.text()).toBeTruthy();
      }

      if (categoryId > 0 && restNonce) {
        const deleteCategoryResponse = await page.request.delete(`/wp-json/wc/v3/products/categories/${categoryId}?force=true`, {
          headers: requestHeaders,
        });
        expect(deleteCategoryResponse.ok(), await deleteCategoryResponse.text()).toBeTruthy();
      }
    }

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });
});
