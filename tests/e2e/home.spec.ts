import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { expectHomeProductCardPresentation, expectHomeProductRailPresentation } from './product-card';
import { captureStableVisual } from './visual';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

const demoCheckoutMessage = 'Онлайн-оформление заказа временно недоступно.';
const demoCheckoutButtonLabel = 'Оформление заказа временно недоступно';

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

async function clickOutsideDialogRect(page: Page, dialog: Locator): Promise<void> {
  const point = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const inset = 4;
    const candidates = [
      { x: inset, y: inset },
      { x: window.innerWidth - inset, y: inset },
      { x: inset, y: window.innerHeight - inset },
      { x: window.innerWidth - inset, y: window.innerHeight - inset },
    ];
    const outside = candidates.find(
      ({ x, y }) => x < rect.left || x > rect.right || y < rect.top || y > rect.bottom,
    );
    if (!outside) throw new Error('No viewport corner is outside the dialog rectangle');
    return outside;
  });
  await page.mouse.click(point.x, point.y);
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
  test('transfers homepage skip-link focus across public viewports', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    const initialUrl = new URL(page.url());

    await page.keyboard.press('Tab');
    const skipLink = page.locator('.az-skip-link[href="#primary"]');
    await expect(skipLink).toHaveCount(1);
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeInViewport({ ratio: 1 });
    expect(await skipLink.evaluate((element) => element.matches(':focus-visible'))).toBe(true);

    await page.keyboard.press('Enter');
    const targetUrl = new URL(page.url());
    expect(targetUrl.origin).toBe(initialUrl.origin);
    expect(targetUrl.pathname).toBe(initialUrl.pathname);
    expect(targetUrl.search).toBe(initialUrl.search);
    expect(targetUrl.hash).toBe('#primary');
    const primary = page.locator('main#primary[tabindex="-1"]');
    await expect(primary).toHaveCount(1);
    await expect(primary).toBeVisible();
    await expect(primary).toBeFocused();

    expectNoRuntimeErrors(runtimeErrors);
  });

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

    const decorativePreheadings = page.locator(
      '.az-vin__visual > div > span, .az-business__copy > span, .az-dialog__eyebrow',
    );
    await expect(decorativePreheadings).toHaveCount(0);
    await expect(page.locator('.az-vin__visual h2')).toHaveText(/Нужна помощь\s+с подбором\?/);
    await expect(page.locator('#business h2#az-business-title')).toBeVisible();
    await expect(page.locator('dialog[data-contact-dialog] h2#az-contact-title')).toHaveText('Связаться с нами');
    await expect(page.locator('dialog[data-status-dialog-modal] h2#az-status-title')).toHaveText(
      'Функция временно недоступна',
    );

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

    const currentOrigin = new URL(page.url()).origin;
    const primaryDestinations = [
      ['Масла и жидкости', '/product-category/masla-i-zhidkosti/'],
      ['Запчасти для ТО', '/product-category/zapchasti-dlya-to/'],
      ['Для автосервисов', '/business/'],
    ] as const;
    for (const [label, pathname] of primaryDestinations) {
      const link = page.locator('.az-primary-menu a').filter({ hasText: label });
      await expect(link).toHaveCount(1);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      const destination = new URL(href!, page.url());
      expect(destination.origin).toBe(currentOrigin);
      expect(destination.pathname).toBe(pathname);
    }
    const oilsNavHref = await page.locator('.az-primary-menu a').filter({ hasText: 'Масла и жидкости' }).getAttribute('href');
    const oilsPromo = page.locator('.az-hero__promo a.az-button');
    await expect(oilsPromo).toHaveText('Смотреть масла →');
    await expect(oilsPromo).toHaveAttribute('href', oilsNavHref!);
    if (!/^(?:localhost|127\.0\.0\.1)$/i.test(new URL(page.url()).hostname)) {
      await expect(page.locator('a[href*="localhost"], a[href*="127.0.0.1"], a[href*="//caddy"]')).toHaveCount(0);
    }
    await expect(page.locator('body')).not.toContainText(/демо|демонстрац|Paper SCR|AZ-DEMO-/i);

    if (testInfo.project.name === 'desktop-chrome-1440') {
      await expect(navToggle).toBeHidden();
      await expect(navPanel).toBeVisible();
    } else {
      await expect(navToggle).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navPanel).toBeHidden();
    }

    const maintenanceCollection = page.locator('[data-home-product-collection="maintenance"]');
    const stockCollection = page.locator('[data-home-product-collection="stock"]');
    await expect(maintenanceCollection).toHaveCount(1);
    await expect(stockCollection).toHaveCount(1);
    await expect(page.locator('.az-product-filters')).toHaveCount(0);
    await expect(maintenanceCollection.locator('[data-home-collection-copy="maintenance"]')).toContainText(/\S/);
    await expect(stockCollection.locator('[data-home-collection-copy="stock"]')).toContainText(/\S/);

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    await expectHomeProductRailPresentation(maintenanceCollection.locator('.az-product-row'), viewportWidth);
    await expectHomeProductRailPresentation(stockCollection.locator('.az-product-row'), viewportWidth);

    const productCards = page.locator('[data-home-product-card]');
    const productCount = await productCards.count();
    expect(productCount, 'The homepage must render WooCommerce product cards').toBeGreaterThan(0);

    for (let index = 0; index < productCount; index += 1) {
      await expect(productCards.nth(index)).toHaveAttribute('data-product-id', /^\d+$/);
    }

    const demoTitle = 'Масляный фильтр MANN-FILTER W 914/2';
    const demoCard = page
      .locator('[data-home-product-collection="maintenance"] [data-home-product-card]')
      .filter({ has: page.getByRole('link', { name: demoTitle, exact: true }) });
    await expect(demoCard).toHaveCount(1);
    await expect(demoCard).toBeVisible();
    const demoProductId = await demoCard.getAttribute('data-product-id');
    expect(demoProductId).toMatch(/^\d+$/);

    await expectHomeProductCardPresentation(demoCard, {
      kind: 'demo',
      expectedBrand: 'MANN-FILTER',
      expectedReference: 'W 914/2',
      expectedProductId: demoProductId!,
    });

    const demoTitleLink = demoCard.locator('.az-product-card__title');
    const demoMediaLink = demoCard.locator('.az-product-card__media');
    await expect(demoTitleLink).toHaveText(demoTitle);
    await expect(demoTitleLink).toHaveAttribute('href', /\/product\//);
    const demoPermalink = await demoTitleLink.getAttribute('href');
    expect(demoPermalink).toBeTruthy();
    await expect(demoMediaLink).toHaveAttribute('href', demoPermalink!);

    await expect(demoCard.locator('[data-home-product-brand]')).toHaveText('MANN-FILTER');
    const demoArticle = demoCard.locator('[data-home-product-reference]');
    await expect(demoArticle).toHaveText('Артикул: W 914/2');
    await expect(demoArticle).not.toContainText('AZ-DEMO-');
    const demoAction = demoCard.locator(
      '.az-product-card__action > .button.product_type_simple.add_to_cart_button.ajax_add_to_cart',
    );
    await expect(demoAction).toHaveCount(1);
    await expect(demoAction).toBeVisible();
    await expect(demoAction).toHaveText('Добавить в корзину');
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

      const spacePathname = new URL(page.url()).pathname;
      const spaceScrollY = await page.evaluate(() => window.scrollY);
      await page.keyboard.press('Space');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      await expect(navLabel).toHaveText('Закрыть меню');
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
      await expect(navToggle).toBeFocused();
      expect(new URL(page.url()).pathname).toBe(spacePathname);
      expect(await page.evaluate(() => window.scrollY)).toBe(spaceScrollY);
      await page.keyboard.press('Space');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navLabel).toHaveText('Открыть меню');
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navToggle).toBeFocused();
      expect(new URL(page.url()).pathname).toBe(spacePathname);
      expect(await page.evaluate(() => window.scrollY)).toBe(spaceScrollY);

      await page.keyboard.press('Escape');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(navToggle).toBeFocused();

      const internalNavSourceUrl = new URL(page.url());
      const internalVinLink = navPanel.locator('a.az-nav-cta--quiet[href="#vin-request"]');
      const internalVinTarget = page.locator('section#vin-request[tabindex="-1"]');
      await expect(internalVinLink).toHaveCount(1);
      await expect(internalVinTarget).toHaveCount(1);
      await page.keyboard.press('Enter');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toBeVisible();
      await expect(internalVinLink).toHaveAccessibleName('Подбор по VIN');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(internalVinLink).toBeFocused();
      await expect(internalVinLink).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navLabel).toHaveText('Открыть меню');
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      await expect(internalVinTarget).toBeVisible();
      await expect(internalVinTarget).toBeFocused();
      const internalNavTargetUrl = new URL(page.url());
      expect(internalNavTargetUrl.origin).toBe(internalNavSourceUrl.origin);
      expect(internalNavTargetUrl.pathname).toBe(internalNavSourceUrl.pathname);
      expect(internalNavTargetUrl.search).toBe(internalNavSourceUrl.search);
      expect(internalNavTargetUrl.hash).toBe('#vin-request');
      await page.evaluate(() => {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      });
      expect(new URL(page.url()).hash).toBe('');

      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toBeVisible();
      await expect(internalVinLink).toBeVisible();
      await internalVinLink.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      const pointerNavTargetUrl = new URL(page.url());
      expect(pointerNavTargetUrl.origin).toBe(internalNavSourceUrl.origin);
      expect(pointerNavTargetUrl.pathname).toBe(internalNavSourceUrl.pathname);
      expect(pointerNavTargetUrl.search).toBe(internalNavSourceUrl.search);
      expect(pointerNavTargetUrl.hash).toBe('#vin-request');
      await page.evaluate(() => {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      });
      expect(new URL(page.url()).hash).toBe('');

      const outsidePointerUrl = page.url();
      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      await navPanel.click({ position: { x: 2, y: 2 } });
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      const outsideNavTarget = page.locator('main#primary h1').first();
      await expect(outsideNavTarget).toBeVisible();
      await outsideNavTarget.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navLabel).toHaveText('Открыть меню');
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      expect(page.url()).toBe(outsidePointerUrl);

      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toBeVisible();
      const outsideNavLink = page.locator('main#primary a.az-hero__vin[href="#vin-request"]');
      await expect(outsideNavLink).toHaveCount(1);
      await expect(outsideNavLink).toBeVisible();
      await outsideNavLink.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      const outsideLinkUrl = new URL(page.url());
      const beforeOutsideLinkUrl = new URL(outsidePointerUrl);
      expect(outsideLinkUrl.origin).toBe(beforeOutsideLinkUrl.origin);
      expect(outsideLinkUrl.pathname).toBe(beforeOutsideLinkUrl.pathname);
      expect(outsideLinkUrl.search).toBe(beforeOutsideLinkUrl.search);
      expect(outsideLinkUrl.hash).toBe('#vin-request');

      const mobileViewport = page.viewportSize();
      expect(mobileViewport).toBeTruthy();
      const breakpointUrl = page.url();
      await navToggle.click();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
      await page.setViewportSize({ width: 901, height: mobileViewport!.height });
      await expect(navToggle).toBeHidden();
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navLabel).toHaveText('Открыть меню');
      await page.setViewportSize(mobileViewport!);
      await expect(navToggle).toBeVisible();
      await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(navPanel).not.toHaveClass(/\bis-open\b/);
      await expect(navPanel).toBeHidden();
      await expect(navLabel).toHaveText('Открыть меню');
      await expect(navToggle).toHaveAccessibleName('Открыть меню');
      expect(page.url()).toBe(breakpointUrl);
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
    await expect(contactDialog).toHaveClass(/\baz-dialog--contact\b/);
    await expect(contactDialog).toHaveAttribute('aria-describedby', 'az-contact-intro');
    await expect(contactDialog).toHaveAccessibleName('Связаться с нами');
    await expect(contactDialog.locator('[data-contact-intro]')).toHaveText(
      'Выберите удобный способ связи.',
    );
    await expect(contactDialog).not.toContainText(/Ежедневно|Автозакуп → Главная/);
    await expect(page.locator('.az-service-nav__hours')).toHaveCount(0);
    await expect(contactDialog.locator('.az-dialog__note')).toHaveCount(0);
    const contactLinks = contactDialog.locator('a.az-dialog__contact[data-contact-method]');
    await expect(contactLinks).toHaveCount(2);
    const phoneLink = contactDialog.locator('[data-contact-method="phone"]');
    const emailLink = contactDialog.locator('[data-contact-method="email"]');
    await expect(phoneLink).toBeVisible();
    await expect(emailLink).toBeVisible();
    await expect(phoneLink.locator('[data-contact-label]')).toHaveText('Телефон');
    await expect(emailLink.locator('[data-contact-label]')).toHaveText('Электронная почта');
    const phoneText = (await phoneLink.locator('[data-contact-value]').innerText()).trim();
    const emailText = (await emailLink.locator('[data-contact-value]').innerText()).trim();
    await expect(phoneLink).toHaveAttribute('href', `tel:${phoneText.replace(/[^+\d]/g, '')}`);
    await expect(emailLink).toHaveAttribute('href', `mailto:${emailText}`);
    for (const link of [phoneLink, emailLink]) {
      await expect(link.locator('.az-dialog__contact-icon .az-icon')).toHaveCount(1);
      const box = await link.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(64);
    }
    const contactDialogBox = await contactDialog.boundingBox();
    expect(contactDialogBox).toBeTruthy();
    expect(contactDialogBox!.width).toBeLessThanOrEqual(430);
    const contactClose = contactDialog.getByRole('button', { name: 'Закрыть', exact: true });
    await expect(contactClose).toHaveCount(1);
    await expect(contactClose).toBeFocused();
    await captureStableVisual(page, testInfo, `contact-dialog-${testInfo.project.name}.png`);
    await contactClose.focus();
    await page.keyboard.press('Enter');
    await expect(contactDialog).toBeHidden();
    expect(await contactDialog.getAttribute('open')).toBeNull();
    await expect(contactTrigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(contactDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(contactDialog).toBeHidden();
    expect(await contactDialog.getAttribute('open')).toBeNull();
    await expect(contactTrigger).toBeFocused();
    if (testInfo.project.name !== 'desktop-chrome-1440') {
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
    }

    await page.keyboard.press('Enter');
    await expect(contactDialog).toBeVisible();
    await contactDialog.locator('#az-contact-title').click();
    await expect(contactDialog).toBeVisible();
    await clickOutsideDialogRect(page, contactDialog);
    await expect(contactDialog).toBeHidden();
    expect(await contactDialog.getAttribute('open')).toBeNull();
    await expect(contactTrigger).toBeFocused();
    if (testInfo.project.name !== 'desktop-chrome-1440') {
      await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(navPanel).toBeVisible();
      await expect(navToggle).toHaveAccessibleName('Закрыть меню');
    }

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
    await expect(statusDialog).toHaveAccessibleName('Функция временно недоступна');
    await expect(statusDialog.locator('[data-status-copy]')).toHaveText(
      'Уточните доступные способы получения у менеджера.',
    );
    const statusClose = statusDialog.getByRole('button', { name: 'Закрыть', exact: true });
    await expect(statusClose).toHaveCount(1);
    await expect(statusClose).toBeFocused();
    await captureStableVisual(page, testInfo, `status-dialog-${testInfo.project.name}.png`);
    await statusClose.focus();
    await expect(statusClose).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(statusDialog).toBeHidden();
    expect(await statusDialog.getAttribute('open')).toBeNull();
    await expect(cityTrigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(statusDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(statusDialog).toBeHidden();
    expect(await statusDialog.getAttribute('open')).toBeNull();
    await expect(cityTrigger).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(statusDialog).toBeVisible();
    await statusDialog.locator('#az-status-title').click();
    await expect(statusDialog).toBeVisible();
    await clickOutsideDialogRect(page, statusDialog);
    await expect(statusDialog).toBeHidden();
    expect(await statusDialog.getAttribute('open')).toBeNull();
    await expect(cityTrigger).toBeFocused();

    await oilsPromo.click();
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname).toBe('/product-category/masla-i-zhidkosti/');
    await expect(page.locator('body')).toHaveClass(/tax-product_cat/);

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
        message: 'Подбор по автомобилю временно недоступен. Перейдите в каталог или воспользуйтесь поиском.',
      },
      {
        selector: '#vin-request button[data-status-dialog="vin"]',
        message: 'Онлайн-заявка по VIN временно недоступна. Свяжитесь с нами для подбора детали.',
      },
      {
        selector: '#business button[data-status-dialog="b2b"]',
        message: 'Чтобы обсудить условия для автосервиса, свяжитесь с нами.',
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
      await expect(statusDialog).toHaveAccessibleName('Функция временно недоступна');
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

  test('turns a successful homepage add action into a canonical cart link', async ({ page }) => {
    const runtimeErrors = watchRuntimeErrors(page);
    let addRequestCount = 0;
    page.on('request', (request) => {
      const requestUrl = new URL(request.url());
      if (request.method() === 'POST' && requestUrl.searchParams.get('wc-ajax') === 'add_to_cart') {
        addRequestCount += 1;
      }
    });
    await page.goto('/', { waitUntil: 'networkidle' });

    const addToCart = page.locator('.az-product-card a.add_to_cart_button[data-product_id]').first();
    await expect(addToCart, 'At least one purchasable in-stock product is required').toBeVisible();
    const sourceCardFromAction = addToCart.locator('xpath=ancestor::article[@data-product-id][1]');
    await expect(sourceCardFromAction).toHaveCount(1);
    const sourceProductId = await sourceCardFromAction.getAttribute('data-product-id');
    expect(sourceProductId).toMatch(/^\d+$/);
    const sourceCard = page.locator(`[data-home-product-card][data-product-id="${sourceProductId}"]`).first();
    await expect(sourceCard).toHaveCount(1);
    await expect(addToCart).toHaveAttribute('data-product_id', sourceProductId!);
    await expect(addToCart).toHaveAttribute('data-quantity', '1');
    const sourceTitleLink = sourceCard.locator('.az-product-card__title');
    const sourceProductName = (await sourceTitleLink.innerText()).trim();
    const sourceProductHref = await sourceTitleLink.getAttribute('href');
    expect(sourceProductName).not.toBe('');
    expect(sourceProductHref).toBeTruthy();
    await addToCart.evaluate((element) => element.setAttribute('data-test-original-home-action', ''));
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
    expect(addRequest.headers()['content-type']).toMatch(/^application\/x-www-form-urlencoded(?:;|$)/i);
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
    expect(addRequestCount).toBe(1);

    const cartLink = page.locator('a.az-cart-link');
    const cartBadge = cartLink.locator('#az-cart-count');
    const expectHeaderCartState = async (count: number, context: string) => {
      await expect(cartLink, `${context}: one header cart link is required`).toHaveCount(1);
      await expect(cartLink, `${context}: the header cart link must remain visible`).toBeVisible();
      await expect(cartLink, `${context}: the label and badge relation must remain exact`).toHaveAttribute(
        'aria-labelledby',
        'az-cart-action-label az-cart-count',
      );
      await expect(cartBadge, `${context}: the badge must remain visible`).toBeVisible();
      await expect(cartBadge, `${context}: the visible badge must match the session cart`).toHaveText(
        String(count),
      );
      await expect(cartLink, `${context}: the computed name must include the rendered count`).toHaveAccessibleName(
        `Корзина ${count}`,
      );
    };
    await expectHeaderCartState(1, 'After the first AJAX addition');

    const cartHref = await cartLink.getAttribute('href');
    expect(cartHref).toBeTruthy();
    const cartUrl = new URL(cartHref!, page.url());
    expect(cartUrl.origin).toBe(new URL(page.url()).origin);
    expect(cartUrl.pathname).toBe('/cart/');
    expect(cartUrl.search).toBe('');
    expect(cartUrl.hash).toBe('');

    const actionArea = sourceCard.locator('.az-product-card__action');
    const transformedAction = actionArea.locator('a[data-home-cart-link][data-test-original-home-action]');
    await expect(transformedAction).toHaveCount(1);
    await expect(transformedAction).toHaveText('Перейти в корзину');
    await expect(transformedAction).toHaveAccessibleName('Перейти в корзину');
    await expect(transformedAction).toHaveAttribute('href', cartUrl.href);
    await expect(transformedAction).not.toHaveClass(/\b(?:add_to_cart_button|ajax_add_to_cart|added|loading)\b/);
    await expect(transformedAction).not.toHaveAttribute('data-product_id', /.+/);
    await expect(transformedAction).not.toHaveAttribute('data-quantity', /.+/);
    await expect(actionArea.locator('a.added_to_cart.wc-forward')).toHaveCount(0);
    await expect(transformedAction).toBeFocused();

    await transformedAction.click();
    await page.waitForLoadState('networkidle');
    expect(page.url(), 'The cart link must open the exact canonical WooCommerce URL').toBe(cartUrl.href);
    expect(addRequestCount, 'The cart link must not send a second add-to-cart request').toBe(1);
    await expectHeaderCartState(1, 'After full navigation to the cart');
    const cartItems = page.locator('.woocommerce-cart-form__cart-item, .wc-block-cart-items__row');
    await expect(cartItems).toHaveCount(1);
    const cartItem = cartItems.first();
    await expect(cartItem).toContainText(sourceProductName);
    const cartProductLink = cartItem.locator('.product-name a, a.wc-block-components-product-name');
    await expect(cartProductLink).toHaveCount(1);
    await expect(cartProductLink).toHaveText(sourceProductName);
    await expect(cartProductLink).toHaveAttribute('href', sourceProductHref!);
    const cartQuantity = cartItem.locator('input.qty, .wc-block-components-quantity-selector__input');
    await expect(cartQuantity).toHaveCount(1);
    await expect(cartQuantity).toHaveValue('1');
    await expectExactDemoCheckoutNotice(page);

    await page.goBack({ waitUntil: 'networkidle' });
    expect(new URL(page.url()).pathname).toBe('/');
    const homepageReload = await page.reload({ waitUntil: 'networkidle' });
    expect(homepageReload?.ok(), 'The homepage reload must return a successful document response').toBe(true);
    const reloadedSourceCard = page.locator(`[data-home-product-card][data-product-id="${sourceProductId}"]`).first();
    await expect(reloadedSourceCard).toHaveCount(1);
    const serverCartAction = reloadedSourceCard.locator('.az-product-card__action > a[data-home-cart-link]');
    await expect(serverCartAction).toHaveCount(1);
    await expect(serverCartAction).toHaveText('Перейти в корзину');
    await expect(serverCartAction).toHaveAttribute('href', cartUrl.href);
    await expect(reloadedSourceCard.locator('.az-product-card__action > a.add_to_cart_button')).toHaveCount(0);
    await expect(reloadedSourceCard.locator('.az-product-card__action > a.added_to_cart')).toHaveCount(0);
    await serverCartAction.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe(cartUrl.href);
    expect(addRequestCount).toBe(1);

    const canonicalCartUrl = cartUrl.href;
    const reloadResponse = await page.reload({ waitUntil: 'networkidle' });
    expect(reloadResponse?.ok(), 'The canonical cart reload must return a successful document response').toBe(true);
    expect(page.url(), 'The reload must preserve the exact canonical cart URL').toBe(canonicalCartUrl);
    await expectHeaderCartState(1, 'After an immediate canonical cart reload');
    await expect(cartItems).toHaveCount(1);
    const reloadedCartItem = cartItems.first();
    await expect(reloadedCartItem).toContainText(sourceProductName);
    const reloadedProductLink = reloadedCartItem.locator(
      '.product-name a, a.wc-block-components-product-name',
    );
    await expect(reloadedProductLink).toHaveCount(1);
    await expect(reloadedProductLink).toHaveText(sourceProductName);
    await expect(reloadedProductLink).toHaveAttribute('href', sourceProductHref!);
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
    expect(page.url(), 'The checkout link must open the exact canonical WooCommerce URL').toBe(checkoutUrl.href);
    await expectHeaderCartState(1, 'After full navigation to checkout');
    await expectExactDemoCheckoutNotice(page);
    const classicDisabledButton = page.getByRole('button', { name: demoCheckoutButtonLabel, exact: true });
    if (await classicDisabledButton.count()) {
      await expect(classicDisabledButton).toBeDisabled();
      await expect(classicDisabledButton).toHaveAttribute('aria-disabled', 'true');
      await expect(classicDisabledButton).toHaveText(demoCheckoutButtonLabel);
    } else {
      await expect(page.locator('.wp-block-woocommerce-checkout')).toBeVisible();
    }

    await page.goBack({ waitUntil: 'networkidle' });
    expect(page.url(), 'Browser Back must restore the exact canonical cart URL').toBe(canonicalCartUrl);
    await expectHeaderCartState(1, 'After browser Back from checkout to the cart');
    await expect(cartItems).toHaveCount(1);
    const historyCartItem = cartItems.first();
    await expect(historyCartItem).toContainText(sourceProductName);
    const historyProductLink = historyCartItem.locator(
      '.product-name a, a.wc-block-components-product-name',
    );
    await expect(historyProductLink).toHaveCount(1);
    await expect(historyProductLink).toHaveText(sourceProductName);
    await expect(historyProductLink).toHaveAttribute('href', sourceProductHref!);
    await expectExactDemoCheckoutNotice(page);

    await page.goForward({ waitUntil: 'networkidle' });
    expect(page.url(), 'Browser Forward must restore the exact canonical checkout URL').toBe(checkoutUrl.href);
    await expectHeaderCartState(1, 'After browser Forward from the cart to checkout');
    await expectExactDemoCheckoutNotice(page);
    const forwardClassicDisabledButton = page.getByRole('button', {
      name: demoCheckoutButtonLabel,
      exact: true,
    });
    if (await forwardClassicDisabledButton.count()) {
      await expect(forwardClassicDisabledButton).toBeDisabled();
      await expect(forwardClassicDisabledButton).toHaveAttribute('aria-disabled', 'true');
      await expect(forwardClassicDisabledButton).toHaveText(demoCheckoutButtonLabel);
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
