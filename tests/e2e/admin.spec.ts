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
const adminWritesAllowed = process.env.E2E_ALLOW_ADMIN_WRITES === '1';

test.describe('WordPress administration', () => {
	test.describe.configure({ mode: 'serial' });
  test.skip(
    !adminUser || !adminPassword || !adminWritesAllowed,
    'Set the admin credential pair and E2E_ALLOW_ADMIN_WRITES=1 only for an owned local/disposable target.',
  );

  async function logIn(page: Page): Promise<void> {
    await page.goto('/wp-login.php');
    await page.locator('#user_login').fill(adminUser!);
    await page.locator('#user_pass').fill(adminPassword!);

    await Promise.all([
      page.waitForURL(/\/wp-admin(?:\/|$)/),
      page.locator('#wp-submit').click(),
    ]);
  }

  async function submitCategoryIds(page: Page, categoryIds: string[]): Promise<void> {
    await page.goto('/wp-admin/admin.php?page=avtozakup');
    const categorySelect = page.locator('#category_ids');
    await expect(categorySelect).toBeVisible();
    await categorySelect.evaluate((element, ids) => {
      const select = element as HTMLSelectElement;
      const form = select.form;
      if (!form) {
        throw new Error('Category select must belong to the Settings form');
      }

      select.disabled = true;
      ids.forEach((id) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = select.name;
        input.value = id;
        form.appendChild(input);
      });
    }, categoryIds);
    await Promise.all([
      page.waitForURL(/settings-updated=true/),
      page.locator('#submit').click(),
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

  test('keeps selected category identities isolated from unselected legacy terms', async ({ page }, testInfo) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await logIn(page);
    await page.goto('/wp-admin/admin.php?page=avtozakup');

    const categoryOptions = await page.locator('#category_ids option').evaluateAll((options) =>
      options.map((option) => {
        const label = (option.textContent ?? '').trim();
        const labelMatch = label.match(/^(.*) \(#(\d+)\)$/);
        return {
          id: (option as HTMLOptionElement).value,
          name: labelMatch?.[1]?.trim() ?? '',
          labelId: labelMatch?.[2] ?? '',
          selected: (option as HTMLOptionElement).selected,
        };
      }),
    );
    expect(categoryOptions.length).toBeGreaterThanOrEqual(8);
    expect(categoryOptions.every(({ id, labelId, name }) => labelId === id && name !== '')).toBe(true);
    const selectedOptions = categoryOptions.filter(({ selected }) => selected);
    const selectedIds = selectedOptions.map(({ id }) => id);
    const unselectedIds = new Set(categoryOptions.filter(({ selected }) => !selected).map(({ id }) => id));

    expect(selectedIds).toHaveLength(8);
    expect(selectedIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);
    expect(new Set(selectedIds).size).toBe(8);

    const selectedNames = new Set(selectedOptions.map(({ name }) => name));
    const legacyDuplicateIds = categoryOptions
      .filter(({ name, selected }) => !selected && selectedNames.has(name))
      .map(({ id }) => id);
    testInfo.annotations.push({ type: 'legacy-duplicate-category-count', description: String(legacyDuplicateIds.length) });

    await page.goto('/', { waitUntil: 'networkidle' });
    const homeCategories = await page.locator('#catalog .az-category-card').evaluateAll((cards) =>
      cards.map((card) => ({
        id: card.getAttribute('data-category-id') ?? '',
        href: (card as HTMLAnchorElement).href,
      })),
    );
    const homeIds = homeCategories.map(({ id }) => id);
    expect(homeIds).toHaveLength(8);
    expect([...homeIds].sort()).toEqual([...selectedIds].sort());
    expect(homeIds.filter((id) => unselectedIds.has(id))).toEqual([]);
    expect(legacyDuplicateIds.filter((id) => homeIds.includes(id))).toEqual([]);

    const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
    expect(shopUrl).toBeTruthy();
    await page.goto(shopUrl!, { waitUntil: 'networkidle' });
    const shopCategories = await page.locator('.az-shop-categories .az-category-card').evaluateAll((cards) =>
      cards.map((card) => ({
        id: card.getAttribute('data-category-id') ?? '',
        href: (card as HTMLAnchorElement).href,
      })),
    );
    expect(shopCategories).toEqual(homeCategories);

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });

  test('enforces the top-level eight-category boundary and restores the original order', async ({ page }, testInfo) => {
    testInfo.setTimeout(60_000);
    const runtimeErrors = watchRuntimeErrors(page);
    const marker = Date.now();
    const rootName = `E2E корневая категория ${marker}`;
    const childName = `E2E дочерняя категория ${marker}`;
    let restNonce = '';
    let rootCategoryId = 0;
    let childCategoryId = 0;
    let originalCaptured = false;
    let originalCategoryIds: string[] = [];

    await logIn(page);
    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');
    const requestHeaders = { 'X-WP-Nonce': restNonce };

    try {
      await page.goto('/', { waitUntil: 'networkidle' });
      originalCategoryIds = await page.locator('#catalog .az-category-card').evaluateAll((cards) =>
        cards.map((card) => card.getAttribute('data-category-id') ?? ''),
      );
      originalCaptured = true;
      expect(originalCategoryIds).toHaveLength(8);
      expect(originalCategoryIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);

      await page.goto('/wp-admin/admin.php?page=avtozakup');
      await expect(page.locator('#category_ids + .description')).toHaveText('Можно выбрать до 8 категорий верхнего уровня.');
      const existingRootCategoryIds = await page.locator('#category_ids option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );
      expect(existingRootCategoryIds.length).toBeGreaterThanOrEqual(8);
      const selectedBefore = await page.locator('#category_ids option:checked').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );
      expect([...selectedBefore].sort()).toEqual([...originalCategoryIds].sort());

      const rootResponse = await page.request.post('/wp-json/wc/v3/products/categories', {
        headers: requestHeaders,
        data: {
          name: rootName,
          slug: `e2e-root-category-${marker}`,
          parent: 0,
        },
      });
      expect(rootResponse.ok(), await rootResponse.text()).toBeTruthy();
      const rootCategory = await rootResponse.json();
      rootCategoryId = Number(rootCategory.id);
      expect(rootCategoryId).toBeGreaterThan(0);
      expect(Number(rootCategory.parent)).toBe(0);

      const childResponse = await page.request.post('/wp-json/wc/v3/products/categories', {
        headers: requestHeaders,
        data: {
          name: childName,
          slug: `e2e-child-category-${marker}`,
          parent: rootCategoryId,
        },
      });
      expect(childResponse.ok(), await childResponse.text()).toBeTruthy();
      const childCategory = await childResponse.json();
      childCategoryId = Number(childCategory.id);
      expect(childCategoryId).toBeGreaterThan(0);
      expect(Number(childCategory.parent)).toBe(rootCategoryId);

      await page.goto('/wp-admin/admin.php?page=avtozakup');
      await expect(page.locator(`#category_ids option[value="${rootCategoryId}"]`)).toHaveCount(1);
      await expect(page.locator(`#category_ids option[value="${childCategoryId}"]`)).toHaveCount(0);

      const submittedRootIds = [String(rootCategoryId), ...originalCategoryIds];
      expect(new Set(submittedRootIds).size).toBe(9);
      const expectedCategoryIds = submittedRootIds.slice(0, 8);
      await submitCategoryIds(page, [
        String(childCategoryId),
        submittedRootIds[0],
        ...submittedRootIds,
      ]);

      const selectedAfter = await page.locator('#category_ids option:checked').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );
      expect([...selectedAfter].sort()).toEqual([...expectedCategoryIds].sort());
      await expect(page.locator(`#category_ids option[value="${childCategoryId}"]`)).toHaveCount(0);

      await page.goto('/', { waitUntil: 'networkidle' });
      const homeCategories = await page.locator('#catalog .az-category-card').evaluateAll((cards) =>
        cards.map((card) => ({
          id: card.getAttribute('data-category-id') ?? '',
          href: (card as HTMLAnchorElement).href,
        })),
      );
      expect(homeCategories.map(({ id }) => id)).toEqual(expectedCategoryIds);
      expect(homeCategories.some(({ id }) => id === String(childCategoryId))).toBe(false);

      const shopUrl = await page.locator('.az-catalog-button').getAttribute('href');
      expect(shopUrl).toBeTruthy();
      await page.goto(shopUrl!, { waitUntil: 'networkidle' });
      const shopCategories = await page.locator('.az-shop-categories .az-category-card').evaluateAll((cards) =>
        cards.map((card) => ({
          id: card.getAttribute('data-category-id') ?? '',
          href: (card as HTMLAnchorElement).href,
        })),
      );
      expect(shopCategories).toEqual(homeCategories);
    } finally {
      try {
        if (originalCaptured) {
          await submitCategoryIds(page, originalCategoryIds);
          await page.goto('/', { waitUntil: 'networkidle' });
          const restoredCategoryIds = await page.locator('#catalog .az-category-card').evaluateAll((cards) =>
            cards.map((card) => card.getAttribute('data-category-id') ?? ''),
          );
          expect(restoredCategoryIds).toEqual(originalCategoryIds);
        }
      } finally {
        try {
          if (childCategoryId > 0 && restNonce) {
            const deleteResponse = await page.request.delete(
              `/wp-json/wc/v3/products/categories/${childCategoryId}?force=true`,
              { headers: requestHeaders },
            );
            expect(deleteResponse.ok(), await deleteResponse.text()).toBeTruthy();
            const verifyCleanupResponse = await page.request.get(
              `/wp-json/wc/v3/products/categories/${childCategoryId}`,
              { headers: requestHeaders },
            );
            expect(verifyCleanupResponse.status()).toBe(404);
          }
        } finally {
          if (rootCategoryId > 0 && restNonce) {
            const deleteResponse = await page.request.delete(
              `/wp-json/wc/v3/products/categories/${rootCategoryId}?force=true`,
              { headers: requestHeaders },
            );
            expect(deleteResponse.ok(), await deleteResponse.text()).toBeTruthy();
            const verifyCleanupResponse = await page.request.get(
              `/wp-json/wc/v3/products/categories/${rootCategoryId}`,
              { headers: requestHeaders },
            );
            expect(verifyCleanupResponse.status()).toBe(404);
          }
        }
      }
    }

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

      await page.goto(`/?s=${encodeURIComponent(productName)}&post_type=product`, { waitUntil: 'networkidle' });
      const strictSearchUrl = new URL(page.url());
      expect(strictSearchUrl.searchParams.get('s')).toBe(productName);
      expect(strictSearchUrl.searchParams.getAll('post_type')).toEqual(['product']);
      await expect(page.locator('[data-product-search-empty]')).toHaveCount(0);
      await expect(page.locator('[data-product-search-count]')).toHaveText('Найдено товаров: 1');

      const searchProducts = page.locator('ul.products li.product');
      await expect(searchProducts).toHaveCount(1);
      const searchProduct = page.locator(`ul.products li.product.post-${productId}`);
      await expect(searchProduct).toHaveCount(1);
      await expect(searchProduct).toBeVisible();
      await expect(searchProduct.locator('.woocommerce-loop-product__title')).toHaveText(productName);
      await expect(searchProduct.locator('[data-demo-provenance="product"]')).toHaveCount(0);
      const searchAction = searchProduct.locator('.add_to_cart_button');
      await expect(searchAction).toHaveCount(1);
      await expect(searchAction).toBeVisible();
      await expect(searchAction).toContainText(/\S/);
      await expect(searchAction).not.toContainText(/демо/i);
      const searchProductLink = searchProduct.locator('.woocommerce-loop-product__link');
      await expect(searchProductLink).toHaveAttribute('href', createdProduct.permalink);

      await Promise.all([
        page.waitForURL(createdProduct.permalink),
        searchProductLink.click(),
      ]);
      await page.waitForLoadState('networkidle');
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
