import { expect, test, type BrowserContext, type Page } from '@playwright/test';

import { expectHomeProductCardPresentation, expectLoopCardPresentation } from './product-card';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

type HomepageSelectionOrder = {
  categoryIds: string[];
  popularProductIds: string[];
  stockProductIds: string[];
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

  async function logInWithCredentials(page: Page, username: string, password: string): Promise<void> {
    await page.goto('/wp-login.php');
    await page.locator('#user_login').fill(username);
    await page.locator('#user_pass').fill(password);

    await Promise.all([
      page.waitForURL(/\/wp-admin(?:\/|$)/),
      page.locator('#wp-submit').click(),
    ]);
  }

  async function logIn(page: Page): Promise<void> {
    await logInWithCredentials(page, adminUser!, adminPassword!);
  }

  async function readHomepageSettingsFormSnapshot(page: Page): Promise<Array<[string, string]>> {
    await page.goto('/wp-admin/admin.php?page=avtozakup');
    return page.locator('form[action="options.php"]').evaluate((form) => (
      Array.from(new FormData(form as HTMLFormElement).entries())
        .filter(([name]) => name.startsWith('avtozakup_homepage['))
        .map(([name, value]) => [name, String(value)] as [string, string])
    ));
  }

  async function submitHomepageSelections(
    page: Page,
    selections: Partial<HomepageSelectionOrder>,
  ): Promise<void> {
    await page.goto('/wp-admin/admin.php?page=avtozakup');
    await stageHomepageSelections(page, selections);
    await Promise.all([
      page.waitForURL(/settings-updated=true/),
      page.locator('#submit').click(),
    ]);
  }

  async function stageHomepageSelections(
    page: Page,
    selections: Partial<HomepageSelectionOrder>,
  ): Promise<void> {
    const orderedFields = [
      { selector: '#category_ids', values: selections.categoryIds },
      { selector: '#popular_product_ids', values: selections.popularProductIds },
      { selector: '#stock_product_ids', values: selections.stockProductIds },
    ];
    for (const { selector, values } of orderedFields) {
      if (values === undefined) {
        continue;
      }
      const select = page.locator(selector);
      await expect(select).toBeVisible();
      await select.evaluate((element, ids) => {
        const field = element as HTMLSelectElement;
        const form = field.form;
        if (!form) {
          throw new Error('Ordered Settings select must belong to a form');
        }

        field.disabled = true;
        ids.forEach((id) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = field.name;
          input.value = id;
          form.appendChild(input);
        });
      }, values);
    }
  }

  async function readStoredHomepageSelectionOrder(page: Page): Promise<HomepageSelectionOrder> {
    await page.goto('/', { waitUntil: 'networkidle' });
    const categoryIds = await page.locator('#catalog .az-category-card').evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-category-id') ?? ''),
    );
    await page.goto('/wp-admin/admin.php?page=avtozakup');
    const [popularProductIds, stockProductIds] = await Promise.all([
      page.locator('#popular_product_ids option:checked').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      ),
      page.locator('#stock_product_ids option:checked').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      ),
    ]);

    return { categoryIds, popularProductIds, stockProductIds };
  }

  async function readRenderedHomepageSelectionOrder(page: Page): Promise<HomepageSelectionOrder> {
    await page.goto('/', { waitUntil: 'networkidle' });
    const [categoryIds, popularProductIds, stockProductIds] = await Promise.all([
      page.locator('#catalog .az-category-card').evaluateAll((cards) =>
        cards.map((card) => card.getAttribute('data-category-id') ?? ''),
      ),
      page.locator('[aria-labelledby="az-maintenance-title"] .az-product-card').evaluateAll((cards) =>
        cards.map((card) => card.getAttribute('data-product-id') ?? ''),
      ),
      page.locator('[aria-labelledby="az-stock-title"] .az-product-card').evaluateAll((cards) =>
        cards.map((card) => card.getAttribute('data-product-id') ?? ''),
      ),
    ]);

    return { categoryIds, popularProductIds, stockProductIds };
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

  test('denies Автозакуп settings to a temporary shop manager without mutating them', async ({ page, browser }) => {
    test.setTimeout(60_000);
    const runtimeErrors = watchRuntimeErrors(page);
    const marker = Date.now();
    const username = `e2e-shop-manager-${marker}`;
    const email = `${username}@example.test`;
    const password = `E2E!${marker}zQ9#`;
    let restNonce = '';
    let adminId = 0;
    let userId = 0;
    let originalSettings: Array<[string, string]> = [];
    let originalSettingsCaptured = false;
    let originalSelections: HomepageSelectionOrder | undefined;
    let restrictedContext: BrowserContext | undefined;
    let restrictedRuntimeErrors: RuntimeErrors | undefined;

    await logIn(page);
    originalSettings = await readHomepageSettingsFormSnapshot(page);
    originalSettingsCaptured = true;
    expect(originalSettings.length).toBeGreaterThan(0);
    originalSelections = await readStoredHomepageSelectionOrder(page);

    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');
    const requestHeaders = { 'X-WP-Nonce': restNonce };

    try {
      const currentUserResponse = await page.request.get('/wp-json/wp/v2/users/me?context=edit', {
        headers: requestHeaders,
      });
      expect(currentUserResponse.ok(), await currentUserResponse.text()).toBeTruthy();
      adminId = Number((await currentUserResponse.json()).id);
      expect(adminId).toBeGreaterThan(0);

      const createUserResponse = await page.request.post('/wp-json/wp/v2/users', {
        headers: requestHeaders,
        data: {
          username,
          email,
          password,
          roles: ['shop_manager'],
        },
      });
      expect(createUserResponse.ok(), await createUserResponse.text()).toBeTruthy();
      const createdUser = await createUserResponse.json();
      userId = Number(createdUser.id);
      expect(userId).toBeGreaterThan(0);
      expect(userId).not.toBe(adminId);
      expect(createdUser.username).toBe(username);
      expect(createdUser.roles).toContain('shop_manager');
      expect(createdUser.roles).not.toContain('administrator');

      restrictedContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
      const restrictedPage = await restrictedContext.newPage();
      restrictedRuntimeErrors = watchRuntimeErrors(restrictedPage);
      await logInWithCredentials(restrictedPage, username, password);

      const productsResponse = await restrictedPage.goto('/wp-admin/edit.php?post_type=product', {
        waitUntil: 'domcontentloaded',
      });
      expect(productsResponse?.status()).toBe(200);
      await expect(restrictedPage.locator('body.wp-admin')).toBeVisible();
      await expect(restrictedPage.locator('body')).toHaveClass(/post-type-product/);
      await expect(restrictedPage.locator('#posts-filter')).toBeVisible();
      await expect(restrictedPage.locator('#menu-posts-product')).toBeVisible();
      await expect(restrictedPage.locator('#toplevel_page_avtozakup')).toHaveCount(0);
      expect(restrictedRuntimeErrors.console).toEqual([]);
      expect(restrictedRuntimeErrors.page).toEqual([]);

      const deniedResponse = await restrictedPage.goto('/wp-admin/admin.php?page=avtozakup', {
        waitUntil: 'domcontentloaded',
      });
      expect(deniedResponse?.status()).toBe(403);
      const deniedUrl = new URL(restrictedPage.url());
      expect(deniedUrl.pathname).toBe('/wp-admin/admin.php');
      expect(deniedUrl.searchParams.get('page')).toBe('avtozakup');
      await expect(restrictedPage.locator('form[action="options.php"]')).toHaveCount(0);
      await expect(restrictedPage.locator('#hero_title')).toHaveCount(0);
      await expect(restrictedPage.locator('#submit')).toHaveCount(0);
      expect(restrictedRuntimeErrors.console.some((message) => /403 \(Forbidden\)/.test(message))).toBe(true);
      expect(restrictedRuntimeErrors.console.filter((message) => !/403 \(Forbidden\)/.test(message))).toEqual([]);
      expect(restrictedRuntimeErrors.page).toEqual([]);
    } finally {
      try {
        await restrictedContext?.close();
      } finally {
        try {
          if (restNonce && adminId > 0) {
            const requestHeaders = { 'X-WP-Nonce': restNonce };
            const lookupUrl = `/wp-json/wp/v2/users?search=${encodeURIComponent(username)}&context=edit&per_page=100`;
            const cleanupIds = new Set<number>(userId > 0 ? [userId] : []);
            let lookupError: unknown;
            let lookupFailed = false;

            try {
              const lookupResponse = await page.request.get(
                lookupUrl,
                { headers: requestHeaders },
              );
              expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
              const users = await lookupResponse.json();
              const exactLookupIds = users
                .filter((user: { id?: number; username?: string }) => (
                  user.username === username && Number(user.id) > 0 && Number(user.id) !== adminId
                ))
                .map((user: { id: number }) => Number(user.id));
              exactLookupIds.forEach((id: number) => cleanupIds.add(id));
              if (userId > 0) {
                expect(exactLookupIds).toContain(userId);
              }
            } catch (error) {
              lookupFailed = true;
              lookupError = error;
            }

            for (const cleanupId of cleanupIds) {
              expect(cleanupId).not.toBe(adminId);
              const deleteUserResponse = await page.request.delete(
                `/wp-json/wp/v2/users/${cleanupId}?force=true&reassign=${adminId}`,
                { headers: requestHeaders },
              );
              expect(deleteUserResponse.ok(), await deleteUserResponse.text()).toBeTruthy();
              expect((await deleteUserResponse.json()).deleted).toBe(true);
              const verifyDeletedUser = await page.request.get(`/wp-json/wp/v2/users/${cleanupId}?context=edit`, {
                headers: requestHeaders,
              });
              expect(verifyDeletedUser.status()).toBe(404);
            }

            if (lookupFailed) {
              throw lookupError;
            }

            const verifyLookupResponse = await page.request.get(
              lookupUrl,
              { headers: requestHeaders },
            );
            expect(verifyLookupResponse.ok(), await verifyLookupResponse.text()).toBeTruthy();
            const remainingUsers = await verifyLookupResponse.json();
            expect(remainingUsers.filter((user: { username?: string }) => user.username === username)).toHaveLength(0);
          }
        } finally {
          try {
            if (originalSettingsCaptured) {
              const settingsAfterDeniedAccess = await readHomepageSettingsFormSnapshot(page);
              expect(settingsAfterDeniedAccess).toEqual(originalSettings);
            }
          } finally {
            if (originalSelections) {
              const selectionsAfterDeniedAccess = await readStoredHomepageSelectionOrder(page);
              expect(selectionsAfterDeniedAccess).toEqual(originalSelections);
            }
          }
        }
      }
    }

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
    const restrictedConsoleErrors = restrictedRuntimeErrors?.console ?? [];
    expect(restrictedConsoleErrors.some((message) => /403 \(Forbidden\)/.test(message))).toBe(true);
    expect(restrictedConsoleErrors.filter((message) => !/403 \(Forbidden\)/.test(message)), `Restricted console errors:\n${restrictedConsoleErrors.join('\n')}`).toEqual([]);
    expect(restrictedRuntimeErrors?.page ?? [], `Restricted page errors:\n${restrictedRuntimeErrors?.page.join('\n') ?? ''}`).toEqual([]);
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
    const rootSlug = `e2e-root-category-${marker}`;
    const childSlug = `e2e-child-category-${marker}`;
    let restNonce = '';
    let rootCategoryId = 0;
    let childCategoryId = 0;
    let originalCaptured = false;
    let originalCategoryIds: string[] = [];
    let originalPopularProductIds: string[] = [];
    let originalStockProductIds: string[] = [];

    await logIn(page);
    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');
    const requestHeaders = { 'X-WP-Nonce': restNonce };
    const cleanupCategoryByExactSlug = async (knownId: number, slug: string): Promise<void> => {
      const lookupUrl = `/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(slug)}&per_page=100`;
      const cleanupIds = new Set<number>(knownId > 0 ? [knownId] : []);
      let lookupError: unknown;
      let lookupFailed = false;

      try {
        const lookupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
        expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
        const lookupCategories = await lookupResponse.json();
        const exactLookupIds = lookupCategories
          .filter((category: { id?: number; slug?: string }) => (
            category.slug === slug && Number(category.id) > 0
          ))
          .map((category: { id: number }) => Number(category.id));
        exactLookupIds.forEach((id: number) => cleanupIds.add(id));
        if (knownId > 0) {
          expect(exactLookupIds).toContain(knownId);
        }
      } catch (error) {
        lookupFailed = true;
        lookupError = error;
      }

      for (const cleanupId of cleanupIds) {
        const deleteResponse = await page.request.delete(
          `/wp-json/wc/v3/products/categories/${cleanupId}?force=true`,
          { headers: requestHeaders },
        );
        expect(deleteResponse.ok(), await deleteResponse.text()).toBeTruthy();
        const deletedResponse = await page.request.get(
          `/wp-json/wc/v3/products/categories/${cleanupId}`,
          { headers: requestHeaders },
        );
        expect(deletedResponse.status()).toBe(404);
      }

      if (lookupFailed) {
        throw lookupError;
      }

      const verifyCleanupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
      expect(verifyCleanupResponse.ok(), await verifyCleanupResponse.text()).toBeTruthy();
      const remainingCategories = await verifyCleanupResponse.json();
      expect(remainingCategories.filter((category: { slug?: string }) => category.slug === slug)).toHaveLength(0);
    };

    try {
      const originalSelections = await readStoredHomepageSelectionOrder(page);
      originalCategoryIds = originalSelections.categoryIds;
      originalPopularProductIds = originalSelections.popularProductIds;
      originalStockProductIds = originalSelections.stockProductIds;
      originalCaptured = true;
      expect(originalCategoryIds).toHaveLength(8);
      expect(originalPopularProductIds.length).toBeGreaterThanOrEqual(5);
      expect(originalStockProductIds.length).toBeGreaterThanOrEqual(5);
      expect(originalCategoryIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);
      expect(originalPopularProductIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);
      expect(originalStockProductIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);

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
          slug: rootSlug,
          parent: 0,
        },
      });
      expect(rootResponse.ok(), await rootResponse.text()).toBeTruthy();
      const rootCategory = await rootResponse.json();
      rootCategoryId = Number(rootCategory.id);
      expect(rootCategoryId).toBeGreaterThan(0);
      expect(rootCategory.slug).toBe(rootSlug);
      expect(Number(rootCategory.parent)).toBe(0);

      const childResponse = await page.request.post('/wp-json/wc/v3/products/categories', {
        headers: requestHeaders,
        data: {
          name: childName,
          slug: childSlug,
          parent: rootCategoryId,
        },
      });
      expect(childResponse.ok(), await childResponse.text()).toBeTruthy();
      const childCategory = await childResponse.json();
      childCategoryId = Number(childCategory.id);
      expect(childCategoryId).toBeGreaterThan(0);
      expect(childCategory.slug).toBe(childSlug);
      expect(Number(childCategory.parent)).toBe(rootCategoryId);

      await page.goto('/wp-admin/admin.php?page=avtozakup');
      await expect(page.locator(`#category_ids option[value="${rootCategoryId}"]`)).toHaveCount(1);
      await expect(page.locator(`#category_ids option[value="${childCategoryId}"]`)).toHaveCount(0);

      const submittedRootIds = [String(rootCategoryId), ...originalCategoryIds];
      expect(new Set(submittedRootIds).size).toBe(9);
      const expectedCategoryIds = submittedRootIds.slice(0, 8);
      await submitHomepageSelections(page, {
        categoryIds: [
          String(childCategoryId),
          submittedRootIds[0],
          ...submittedRootIds,
        ],
        popularProductIds: originalPopularProductIds,
        stockProductIds: originalStockProductIds,
      });

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
          const originalSelections = {
            categoryIds: originalCategoryIds,
            popularProductIds: originalPopularProductIds,
            stockProductIds: originalStockProductIds,
          };
          await submitHomepageSelections(page, originalSelections);
          const restoredStoredSelections = await readStoredHomepageSelectionOrder(page);
          expect(restoredStoredSelections).toEqual(originalSelections);
          const restoredRenderedSelections = await readRenderedHomepageSelectionOrder(page);
          expect(restoredRenderedSelections).toEqual({
            categoryIds: originalCategoryIds,
            popularProductIds: originalPopularProductIds.slice(0, 5),
            stockProductIds: originalStockProductIds.slice(0, 5),
          });
        }
      } finally {
        try {
          if (restNonce) {
            await cleanupCategoryByExactSlug(childCategoryId, childSlug);
          }
        } finally {
          if (restNonce) {
            await cleanupCategoryByExactSlug(rootCategoryId, rootSlug);
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
    const originalSelections = await readStoredHomepageSelectionOrder(page);

    const heroTitle = page.locator('#hero_title');
    await expect(heroTitle).toBeVisible();
    const originalTitle = await heroTitle.inputValue();
    const presentationFields = {
      popularTitle: page.locator('#popular_title'),
      popularText: page.locator('#popular_text'),
      stockTitle: page.locator('#stock_title'),
      stockText: page.locator('#stock_text'),
      contactPhone: page.locator('#contact_phone'),
      contactEmail: page.locator('#contact_email'),
    };
    for (const field of Object.values(presentationFields)) {
      await expect(field).toBeVisible();
    }
    const originalPresentation = {
      popularTitle: await presentationFields.popularTitle.inputValue(),
      popularText: await presentationFields.popularText.inputValue(),
      stockTitle: await presentationFields.stockTitle.inputValue(),
      stockText: await presentationFields.stockText.inputValue(),
      contactPhone: await presentationFields.contactPhone.inputValue(),
      contactEmail: await presentationFields.contactEmail.inputValue(),
    };
    await page.goto('/', { waitUntil: 'networkidle' });
    const originalRenderedTitleLines = await page.locator('#az-hero-title .az-heading-line').evaluateAll((lines) =>
      lines.map((line) => (line.textContent ?? '').trim()),
    );
    expect(originalRenderedTitleLines.length).toBeGreaterThan(0);
    await page.goto('/wp-admin/admin.php?page=avtozakup');
    const markerId = Date.now();
    const marker = `E2E проверка редактирования ${markerId}`;
    const markerCopy = {
      popularTitle: `${marker} — плановое ТО`,
      popularText: `${marker} — описание планового ТО`,
      stockTitle: `${marker} — складская подборка`,
      stockText: `${marker} — описание складской подборки`,
      contactPhone: '+7 (999) 123-45-67',
      contactEmail: `e2e-contact-${markerId}@example.test`,
    };

    try {
      await heroTitle.fill(marker);
      await presentationFields.popularTitle.fill(markerCopy.popularTitle);
      await presentationFields.popularText.fill(markerCopy.popularText);
      await presentationFields.stockTitle.fill(markerCopy.stockTitle);
      await presentationFields.stockText.fill(markerCopy.stockText);
      await presentationFields.contactPhone.fill(markerCopy.contactPhone);
      await presentationFields.contactEmail.fill(markerCopy.contactEmail);
      await stageHomepageSelections(page, originalSelections);
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);
      await expect(page.locator('#hero_title')).toHaveValue(marker);
      await expect(page.locator('#popular_title')).toHaveValue(markerCopy.popularTitle);
      await expect(page.locator('#popular_text')).toHaveValue(markerCopy.popularText);
      await expect(page.locator('#stock_title')).toHaveValue(markerCopy.stockTitle);
      await expect(page.locator('#stock_text')).toHaveValue(markerCopy.stockText);
      await expect(page.locator('#contact_phone')).toHaveValue(markerCopy.contactPhone);
      await expect(page.locator('#contact_email')).toHaveValue(markerCopy.contactEmail);

      await page.goto('/', { waitUntil: 'networkidle' });
      const mutatedRenderedTitleLines = await page.locator('#az-hero-title .az-heading-line').evaluateAll((lines) =>
        lines.map((line) => (line.textContent ?? '').trim()),
      );
      expect(mutatedRenderedTitleLines).toEqual([marker]);
      await expect(page.locator('#az-maintenance-title')).toHaveText(markerCopy.popularTitle);
      await expect(page.locator('[data-home-collection-copy="maintenance"]')).toHaveText(markerCopy.popularText);
      await expect(page.locator('#az-stock-title')).toHaveText(markerCopy.stockTitle);
      await expect(page.locator('[data-home-collection-copy="stock"]')).toHaveText(markerCopy.stockText);
      await expect(page.locator('[data-contact-method="phone"] [data-contact-value]')).toHaveText(
        markerCopy.contactPhone,
      );
      await expect(page.locator('[data-contact-method="phone"]')).toHaveAttribute(
        'href',
        `tel:${markerCopy.contactPhone.replace(/[^+\d]/g, '')}`,
      );
      await expect(page.locator('[data-contact-method="email"] [data-contact-value]')).toHaveText(
        markerCopy.contactEmail,
      );
      await expect(page.locator('[data-contact-method="email"]')).toHaveAttribute(
        'href',
        `mailto:${markerCopy.contactEmail}`,
      );

      await page.goto('/wp-admin/admin.php?page=avtozakup');
      await page.locator('#contact_phone').fill('');
      await page.locator('#contact_email').fill('');
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);
      await expect(page.locator('#contact_phone')).toHaveValue('');
      await expect(page.locator('#contact_email')).toHaveValue('');
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('[data-contact-method]')).toHaveCount(0);
      await expect(page.locator('[data-contact-intro]')).toHaveText('Контакты пока не настроены.');
      await expect(page.locator('a[href="tel:+70000000000"], a[href="mailto:info@example.invalid"]')).toHaveCount(0);
    } finally {
      await page.goto('/wp-admin/admin.php?page=avtozakup');
      await page.locator('#hero_title').fill(originalTitle);
      await page.locator('#popular_title').fill(originalPresentation.popularTitle);
      await page.locator('#popular_text').fill(originalPresentation.popularText);
      await page.locator('#stock_title').fill(originalPresentation.stockTitle);
      await page.locator('#stock_text').fill(originalPresentation.stockText);
      await page.locator('#contact_phone').fill(originalPresentation.contactPhone);
      await page.locator('#contact_email').fill(originalPresentation.contactEmail);
      await stageHomepageSelections(page, originalSelections);
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);
      await expect(page.locator('#hero_title')).toHaveValue(originalTitle);
      await expect(page.locator('#popular_title')).toHaveValue(originalPresentation.popularTitle);
      await expect(page.locator('#popular_text')).toHaveValue(originalPresentation.popularText);
      await expect(page.locator('#stock_title')).toHaveValue(originalPresentation.stockTitle);
      await expect(page.locator('#stock_text')).toHaveValue(originalPresentation.stockText);
      await expect(page.locator('#contact_phone')).toHaveValue(originalPresentation.contactPhone);
      await expect(page.locator('#contact_email')).toHaveValue(originalPresentation.contactEmail);
    }

    await page.goto('/', { waitUntil: 'networkidle' });
    const restoredRenderedTitleLines = await page.locator('#az-hero-title .az-heading-line').evaluateAll((lines) =>
      lines.map((line) => (line.textContent ?? '').trim()),
    );
    expect(restoredRenderedTitleLines).toEqual(originalRenderedTitleLines);
    await expect(page.locator('#az-maintenance-title')).toHaveText(originalPresentation.popularTitle);
    await expect(page.locator('[data-home-collection-copy="maintenance"]')).toHaveText(
      originalPresentation.popularText,
    );
    await expect(page.locator('#az-stock-title')).toHaveText(originalPresentation.stockTitle);
    await expect(page.locator('[data-home-collection-copy="stock"]')).toHaveText(
      originalPresentation.stockText,
    );
    await expect(page.locator('[data-contact-method="phone"] [data-contact-value]')).toHaveText(
      originalPresentation.contactPhone,
    );
    await expect(page.locator('[data-contact-method="phone"]')).toHaveAttribute(
      'href',
      `tel:${originalPresentation.contactPhone.replace(/[^+\d]/g, '')}`,
    );
    await expect(page.locator('[data-contact-method="email"] [data-contact-value]')).toHaveText(
      originalPresentation.contactEmail,
    );
    await expect(page.locator('[data-contact-method="email"]')).toHaveAttribute(
      'href',
      `mailto:${originalPresentation.contactEmail}`,
    );

    const restoredStoredSelections = await readStoredHomepageSelectionOrder(page);
    expect(restoredStoredSelections).toEqual(originalSelections);
    const restoredRenderedSelections = await readRenderedHomepageSelectionOrder(page);
    expect(restoredRenderedSelections).toEqual({
      categoryIds: originalSelections.categoryIds,
      popularProductIds: originalSelections.popularProductIds.slice(0, 5),
      stockProductIds: originalSelections.stockProductIds.slice(0, 5),
    });

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });

  test('keeps user-owned products outside demo semantics across catalog surfaces', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    const marker = Date.now();
    const productName = `E2E user product ${marker}`;
    const sku = `USER-E2E-${marker}`;
    const partialMarkerSku = 'AZ-DEMO-999';
    const categoryName = `E2E user category ${marker}`;
    const categorySlug = `e2e-user-category-${marker}`;
    let restNonce = '';
    let productId = 0;
    let categoryId = 0;

    await logIn(page);
    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');
    const requestHeaders = { 'X-WP-Nonce': restNonce };
    const originalSettings = await readHomepageSettingsFormSnapshot(page);

    try {
      const categoryResponse = await page.request.post('/wp-json/wc/v3/products/categories', {
        headers: requestHeaders,
        data: {
          name: categoryName,
          slug: categorySlug,
          parent: 0,
        },
      });
      expect(categoryResponse.ok(), await categoryResponse.text()).toBeTruthy();
      const createdCategory = await categoryResponse.json();
      categoryId = Number(createdCategory.id);
      expect(categoryId).toBeGreaterThan(0);
      expect(createdCategory.slug).toBe(categorySlug);

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
          categories: [{ id: categoryId }],
          short_description: 'User-owned short description.',
          description: 'User-owned long description.',
        },
      });
      expect(productResponse.ok(), await productResponse.text()).toBeTruthy();
      const createdProduct = await productResponse.json();
      productId = Number(createdProduct.id);
      expect(productId).toBeGreaterThan(0);
      expect(createdProduct.sku).toBe(sku);
      expect(createdProduct.permalink).toBeTruthy();

      await page.goto('/shop/?orderby=date', { waitUntil: 'networkidle' });
      const loopProduct = page.locator(`li.product.post-${productId}`);
      await expect(loopProduct).toBeVisible();
      await expectLoopCardPresentation(loopProduct, { kind: 'standard', expectedReference: sku });
      await expect(loopProduct.locator('[data-demo-provenance="product"]')).toHaveCount(0);
      const loopAction = loopProduct.locator('a.add_to_cart_button[data-product_id]');
      await expect(loopAction).toHaveCount(1);
      await expect(loopAction).toHaveAttribute('data-product_id', String(productId));
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
      await expectLoopCardPresentation(searchProduct, { kind: 'standard', expectedReference: sku });
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
      const productShell = page.locator('.single-product div.product').first();
      await expect(productShell).toHaveCSS('display', 'grid');
      await expect(productShell.locator(':scope > h1.product_title')).toHaveText(productName);
      await expect(productShell.locator(':scope > .az-product-identity')).toHaveCount(0);
      await expect(page.locator('[data-demo-provenance="product"]')).toHaveCount(0);
      await expect(page.locator('[data-demo-product-meta="product"]')).toHaveCount(0);
      await expect(page.locator('.product_meta .sku')).toHaveText(sku);
      await expect(page.locator('p.stock')).toContainText('3');
      await expect(page.locator('p.stock')).not.toContainText('Демо-наличие');
      const nativePriceText = await productShell.locator(':scope > .summary > .price').innerText();
      expect(Number.parseFloat(nativePriceText.replace(/[^\d,.-]/g, '').replace(',', '.'))).toBe(4321);
      const cartForm = page.locator('form.cart');
      await expect(cartForm).toHaveCount(1);
      await expect(cartForm).toHaveAttribute('method', 'post');
      const productUrl = new URL(page.url());
      const formAction = new URL(await cartForm.evaluate((form: HTMLFormElement) => form.action));
      expect(formAction.origin).toBe(productUrl.origin);
      expect(formAction.pathname).toBe(productUrl.pathname);
      expect(formAction.search).toBe('');
      expect(formAction.hash).toBe('');
      const singleAction = cartForm.locator('button.single_add_to_cart_button[name="add-to-cart"]');
      await expect(singleAction).toHaveCount(1);
      await expect(singleAction).toBeVisible();
      await expect(singleAction).toHaveAttribute('type', 'submit');
      await expect(singleAction).toHaveAttribute('value', String(productId));
      await expect(singleAction).toContainText(/\S/);
      await expect(singleAction).not.toContainText(/демо/i);
      await expect(page.locator('.woocommerce-product-details__short-description')).toContainText('User-owned short description.');
      await expect(page.locator('.woocommerce-Tabs-panel--description')).toContainText('User-owned long description.');
      await expect(page.locator('.woocommerce-tabs .description_tab')).toContainText('Описание');

      const categoryLink = page.locator('.product_meta .posted_in').getByRole('link', {
        name: categoryName,
        exact: true,
      });
      await expect(categoryLink).toHaveCount(1);
      const categoryArchiveHref = await categoryLink.getAttribute('href');
      expect(categoryArchiveHref).toBeTruthy();
      const categoryArchiveUrl = new URL(categoryArchiveHref!, page.url());
      expect(categoryArchiveUrl.origin).toBe(new URL(page.url()).origin);
      expect(categoryArchiveUrl.pathname).toBe(`/product-category/${categorySlug}/`);
      expect(categoryArchiveUrl.search).toBe('');
      expect(categoryArchiveUrl.hash).toBe('');
      await page.goto(categoryArchiveUrl.toString(), { waitUntil: 'networkidle' });
      const navigatedCategoryUrl = new URL(page.url());
      expect(navigatedCategoryUrl.origin).toBe(categoryArchiveUrl.origin);
      expect(navigatedCategoryUrl.pathname).toBe(categoryArchiveUrl.pathname);
      expect(navigatedCategoryUrl.search).toBe('');
      expect(navigatedCategoryUrl.hash).toBe('');
      await expect(page.locator('body')).toHaveClass(/tax-product_cat/);
      await expect(page.getByRole('heading', { level: 1, name: categoryName, exact: true })).toBeVisible();
      const categoryProducts = page.locator('ul.products li.product');
      await expect(categoryProducts).toHaveCount(1);
      const categoryProduct = page.locator(`ul.products li.product.post-${productId}`);
      await expect(categoryProduct).toHaveCount(1);
      await expect(categoryProduct).toBeVisible();
      await expectLoopCardPresentation(categoryProduct, { kind: 'standard', expectedReference: sku });
      await expect(categoryProduct.locator('.woocommerce-loop-product__title')).toHaveText(productName);
      await expect(categoryProduct.locator('.woocommerce-loop-product__link')).toHaveAttribute(
        'href',
        createdProduct.permalink,
      );
      await expect(categoryProduct.locator('[data-demo-provenance="product"]')).toHaveCount(0);
      const categoryAction = categoryProduct.locator('.add_to_cart_button');
      await expect(categoryAction).toHaveCount(1);
      await expect(categoryAction).toBeVisible();
      await expect(categoryAction).toContainText(/\S/);
      await expect(categoryAction).not.toContainText(/демо/i);

      const partialMarkerResponse = await page.request.put(`/wp-json/wc/v3/products/${productId}`, {
        headers: requestHeaders,
        data: {
          sku: partialMarkerSku,
          meta_data: [{ key: '_avtozakup_demo', value: '1' }],
        },
      });
      expect(partialMarkerResponse.ok(), await partialMarkerResponse.text()).toBeTruthy();
      await page.goto(createdProduct.permalink, { waitUntil: 'networkidle' });
      await expect(page.locator('body')).not.toHaveClass(/\baz-product-detail-expanded\b/);
      const partialMarkedShell = page.locator('.single-product div.product').first();
      await expect(partialMarkedShell.locator(':scope > [data-pdp-section]')).toHaveCount(0);
      await expect(partialMarkedShell.locator(':scope > .az-pdp-characteristics')).toHaveCount(0);
      await expect(page.locator('.woocommerce-product-details__short-description')).toContainText(
        'User-owned short description.',
      );
      await expect(page.locator('.woocommerce-Tabs-panel--description')).toContainText(
        'User-owned long description.',
      );
      await expect(page.locator('p.stock')).toContainText('3');
      await expect(page.locator('form.cart')).toHaveCount(1);
      await expect(page.locator('.product_meta .sku')).toHaveCount(0);
      await expect(page.locator('body')).not.toContainText(partialMarkerSku);
      const restoreSkuResponse = await page.request.put(`/wp-json/wc/v3/products/${productId}`, {
        headers: requestHeaders,
        data: { sku },
      });
      expect(restoreSkuResponse.ok(), await restoreSkuResponse.text()).toBeTruthy();
    } finally {
      try {
        if (restNonce) {
          const lookupUrl = `/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}&per_page=10`;
          const cleanupIds = new Set<number>(productId > 0 ? [productId] : []);
          let lookupError: unknown;
          let lookupFailed = false;

          try {
            const lookupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
            expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
            const lookupProducts = await lookupResponse.json();
            const exactLookupIds = lookupProducts
              .filter((product: { id?: number; sku?: string }) => product.sku === sku && Number(product.id) > 0)
              .map((product: { id: number }) => Number(product.id));
            exactLookupIds.forEach((id: number) => cleanupIds.add(id));
            if (productId > 0) {
              expect(exactLookupIds).toContain(productId);
            }
          } catch (error) {
            lookupFailed = true;
            lookupError = error;
          }

          for (const cleanupId of cleanupIds) {
            const deleteProductResponse = await page.request.delete(`/wp-json/wc/v3/products/${cleanupId}?force=true`, {
              headers: requestHeaders,
            });
            expect(deleteProductResponse.ok(), await deleteProductResponse.text()).toBeTruthy();
            const deletedProductResponse = await page.request.get(`/wp-json/wc/v3/products/${cleanupId}`, {
              headers: requestHeaders,
            });
            expect(deletedProductResponse.status()).toBe(404);
          }

          if (lookupFailed) {
            throw lookupError;
          }

          const verifyCleanupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
          expect(verifyCleanupResponse.ok(), await verifyCleanupResponse.text()).toBeTruthy();
          const remainingProducts = await verifyCleanupResponse.json();
          expect(remainingProducts.filter((product: { sku?: string }) => product.sku === sku)).toHaveLength(0);
        }
      } finally {
        try {
          if (restNonce) {
            const lookupUrl = `/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(categorySlug)}&per_page=100`;
            const cleanupIds = new Set<number>(categoryId > 0 ? [categoryId] : []);
            let lookupError: unknown;
            let lookupFailed = false;

            try {
              const lookupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
              expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
              const lookupCategories = await lookupResponse.json();
              const exactLookupIds = lookupCategories
                .filter((category: { id?: number; slug?: string }) => (
                  category.slug === categorySlug && Number(category.id) > 0
                ))
                .map((category: { id: number }) => Number(category.id));
              exactLookupIds.forEach((id: number) => cleanupIds.add(id));
              if (categoryId > 0) {
                expect(exactLookupIds).toContain(categoryId);
              }
            } catch (error) {
              lookupFailed = true;
              lookupError = error;
            }

            for (const cleanupId of cleanupIds) {
              const deleteCategoryResponse = await page.request.delete(
                `/wp-json/wc/v3/products/categories/${cleanupId}?force=true`,
                { headers: requestHeaders },
              );
              expect(deleteCategoryResponse.ok(), await deleteCategoryResponse.text()).toBeTruthy();
              const deletedCategoryResponse = await page.request.get(
                `/wp-json/wc/v3/products/categories/${cleanupId}`,
                { headers: requestHeaders },
              );
              expect(deletedCategoryResponse.status()).toBe(404);
            }

            if (lookupFailed) {
              throw lookupError;
            }

            const verifyCleanupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
            expect(verifyCleanupResponse.ok(), await verifyCleanupResponse.text()).toBeTruthy();
            const remainingCategories = await verifyCleanupResponse.json();
            expect(remainingCategories.filter((category: { slug?: string }) => category.slug === categorySlug)).toHaveLength(0);
          }
        } finally {
          const restoredSettings = await readHomepageSettingsFormSnapshot(page);
          expect(restoredSettings).toEqual(originalSettings);
        }
      }
    }

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });

  test('creates and edits WooCommerce records, renders them on the homepage, and cleans up', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    const marker = Date.now();
    const categoryName = `E2E категория ${marker}`;
    const categorySlug = `e2e-category-${marker}`;
    const initialProductName = `E2E товар ${marker}`;
    const updatedProductName = `${initialProductName} — изменён`;
    const sku = `HOME-E2E-${marker}`;
    let restNonce = '';
    let categoryId = 0;
    let productId = 0;
    let originalCaptured = false;
    let originalCategoryIds: string[] = [];
    let originalProductIds: string[] = [];
    let originalStockProductIds: string[] = [];

    await logIn(page);
    await page.goto('/wp-admin/');
    restNonce = await page.evaluate(() => {
      const settings = (window as Window & { wpApiSettings?: { nonce?: string } }).wpApiSettings;
      return settings?.nonce ?? '';
    });
    expect(restNonce, 'WordPress REST nonce should be exposed to an authenticated administrator').not.toBe('');

    const requestHeaders = { 'X-WP-Nonce': restNonce };

    try {
      const originalSelections = await readStoredHomepageSelectionOrder(page);
      originalCategoryIds = originalSelections.categoryIds;
      originalProductIds = originalSelections.popularProductIds;
      originalStockProductIds = originalSelections.stockProductIds;
      originalCaptured = true;
      expect(originalCategoryIds).toHaveLength(8);
      expect(originalProductIds.length).toBeGreaterThanOrEqual(5);
      expect(originalStockProductIds.length).toBeGreaterThanOrEqual(5);
      expect(originalCategoryIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);
      expect(originalProductIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);
      expect(originalStockProductIds.every((id) => /^\d+$/.test(id) && Number(id) > 0)).toBe(true);

      const categoryResponse = await page.request.post('/wp-json/wc/v3/products/categories', {
        headers: requestHeaders,
        data: { name: categoryName, slug: categorySlug },
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
          sku,
          regular_price: '1234',
          stock_status: 'instock',
          categories: [{ id: categoryId }],
        },
      });
      expect(productResponse.ok(), await productResponse.text()).toBeTruthy();
      const createdProduct = await productResponse.json();
      productId = Number(createdProduct.id);
      expect(productId).toBeGreaterThan(0);
      const productPermalink = String(createdProduct.permalink ?? '');
      expect(productPermalink).not.toBe('');

      const updateResponse = await page.request.put(`/wp-json/wc/v3/products/${productId}`, {
        headers: requestHeaders,
        data: { name: updatedProductName },
      });
      expect(updateResponse.ok(), await updateResponse.text()).toBeTruthy();
      const updatedProduct = await updateResponse.json();
      expect(updatedProduct.name).toBe(updatedProductName);
      expect(updatedProduct.permalink).toBe(productPermalink);

      await page.goto('/wp-admin/admin.php?page=avtozakup');
      const categorySelect = page.locator('#category_ids');
      const productSelect = page.locator('#popular_product_ids');
      await expect(categorySelect.locator(`option[value="${categoryId}"]`)).toContainText(categoryName);
      await expect(productSelect.locator(`option[value="${productId}"]`)).toContainText(updatedProductName);

      await categorySelect.selectOption([String(categoryId), ...originalCategoryIds.slice(0, 7)]);
      await productSelect.selectOption([String(productId), ...originalProductIds.slice(0, 4)]);
      await stageHomepageSelections(page, { stockProductIds: originalStockProductIds });
      await Promise.all([
        page.waitForURL(/settings-updated=true/),
        page.locator('#submit').click(),
      ]);

      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('.az-category-card', { hasText: categoryName })).toBeVisible();
      const productCards = page.locator(`.az-product-card[data-product-id="${productId}"]`);
      await expect(productCards).toHaveCount(1);
      const maintenanceSection = page.locator('[aria-labelledby="az-maintenance-title"]');
      const productCard = maintenanceSection.locator(`.az-product-card[data-product-id="${productId}"]`);
      await expect(productCard).toBeVisible();
      const productTitle = productCard.locator('.az-product-card__title');
      await expect(productTitle).toHaveText(updatedProductName);
      await expect(productTitle).toHaveAttribute('href', productPermalink);
      await expect(productCard.locator('.az-product-card__media')).toHaveAttribute('href', productPermalink);
      await expectHomeProductCardPresentation(productCard, {
        kind: 'standard',
        expectedReference: sku,
        expectedProductId: String(productId),
      });
      await expect(productCard.locator('[data-home-product-brand]')).toHaveCount(0);
      await expect(productCard.locator('[data-home-product-reference]')).toHaveText(`SKU: ${sku}`);
      await expect(productCard).not.toContainText(/демо/i);
      const productAction = productCard.locator(
        '.az-product-card__action > .button.product_type_simple.add_to_cart_button.ajax_add_to_cart',
      );
      await expect(productAction).toHaveCount(1);
      await expect(productAction).toBeVisible();
      await expect(productAction).toHaveText('Добавить в корзину');
      await expect(productAction).toHaveAttribute('data-product_id', String(productId));
      await expect(
        page.locator(`[aria-labelledby="az-stock-title"] .az-product-card[data-product-id="${productId}"]`),
      ).toHaveCount(0);
    } finally {
      try {
        if (originalCaptured) {
          const originalSelections = {
            categoryIds: originalCategoryIds,
            popularProductIds: originalProductIds,
            stockProductIds: originalStockProductIds,
          };
          await submitHomepageSelections(page, originalSelections);
          const restoredStoredSelections = await readStoredHomepageSelectionOrder(page);
          expect(restoredStoredSelections).toEqual(originalSelections);
          const restoredRenderedSelections = await readRenderedHomepageSelectionOrder(page);
          expect(restoredRenderedSelections).toEqual({
            categoryIds: originalCategoryIds,
            popularProductIds: originalProductIds.slice(0, 5),
            stockProductIds: originalStockProductIds.slice(0, 5),
          });
        }
      } finally {
        try {
          if (restNonce) {
            const lookupUrl = `/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}&per_page=10`;
            const cleanupIds = new Set<number>(productId > 0 ? [productId] : []);
            let lookupError: unknown;
            let lookupFailed = false;

            try {
              const lookupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
              expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
              const lookupProducts = await lookupResponse.json();
              const exactLookupIds = lookupProducts
                .filter((product: { id?: number; sku?: string }) => (
                  product.sku === sku && Number(product.id) > 0
                ))
                .map((product: { id: number }) => Number(product.id));
              if (productId > 0) {
                expect(exactLookupIds).toContain(productId);
              }
              exactLookupIds.forEach((id: number) => cleanupIds.add(id));
            } catch (error) {
              lookupFailed = true;
              lookupError = error;
            }

            for (const cleanupId of cleanupIds) {
              const deleteProductResponse = await page.request.delete(`/wp-json/wc/v3/products/${cleanupId}?force=true`, {
                headers: requestHeaders,
              });
              expect(deleteProductResponse.ok(), await deleteProductResponse.text()).toBeTruthy();
              const deletedProductResponse = await page.request.get(`/wp-json/wc/v3/products/${cleanupId}`, {
                headers: requestHeaders,
              });
              expect(deletedProductResponse.status()).toBe(404);
            }

            if (lookupFailed) {
              throw lookupError;
            }

            const verifyCleanupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
            expect(verifyCleanupResponse.ok(), await verifyCleanupResponse.text()).toBeTruthy();
            const remainingProducts = await verifyCleanupResponse.json();
            expect(remainingProducts.filter((product: { sku?: string }) => product.sku === sku)).toHaveLength(0);
          }
        } finally {
          if (restNonce) {
            const lookupUrl = `/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(categorySlug)}&per_page=100`;
            const cleanupIds = new Set<number>(categoryId > 0 ? [categoryId] : []);
            let lookupError: unknown;
            let lookupFailed = false;

            try {
              const lookupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
              expect(lookupResponse.ok(), await lookupResponse.text()).toBeTruthy();
              const lookupCategories = await lookupResponse.json();
              const exactLookupIds = lookupCategories
                .filter((category: { id?: number; slug?: string }) => (
                  category.slug === categorySlug && Number(category.id) > 0
                ))
                .map((category: { id: number }) => Number(category.id));
              if (categoryId > 0) {
                expect(exactLookupIds).toContain(categoryId);
              }
              exactLookupIds.forEach((id: number) => cleanupIds.add(id));
            } catch (error) {
              lookupFailed = true;
              lookupError = error;
            }

            for (const cleanupId of cleanupIds) {
              const deleteCategoryResponse = await page.request.delete(
                `/wp-json/wc/v3/products/categories/${cleanupId}?force=true`,
                { headers: requestHeaders },
              );
              expect(deleteCategoryResponse.ok(), await deleteCategoryResponse.text()).toBeTruthy();
              const deletedCategoryResponse = await page.request.get(
                `/wp-json/wc/v3/products/categories/${cleanupId}`,
                { headers: requestHeaders },
              );
              expect(deletedCategoryResponse.status()).toBe(404);
            }

            if (lookupFailed) {
              throw lookupError;
            }

            const verifyCleanupResponse = await page.request.get(lookupUrl, { headers: requestHeaders });
            expect(verifyCleanupResponse.ok(), await verifyCleanupResponse.text()).toBeTruthy();
            const remainingCategories = await verifyCleanupResponse.json();
            expect(remainingCategories.filter((category: { slug?: string }) => (
              category.slug === categorySlug
            ))).toHaveLength(0);
          }
        }
      }
    }

    expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
    expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
  });
});
