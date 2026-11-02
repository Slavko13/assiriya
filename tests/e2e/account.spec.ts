import AxeBuilder from '@axe-core/playwright';
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

test('exposes the canonical guest My Account entrypoint without claiming authentication', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'networkidle' });

  const accountLink = page.locator('.az-account-actions > a').first();
  await expect(accountLink).toHaveCount(1);
  const accountHref = await accountLink.getAttribute('href');
  expect(accountHref).toBeTruthy();
  const accountUrl = new URL(accountHref!, page.url());
  expect(accountUrl.origin).toBe(new URL(page.url()).origin);
  expect(accountUrl.pathname).toBe('/my-account/');
  expect(accountUrl.search).toBe('');
  expect(accountUrl.hash).toBe('');

  if (testInfo.project.name === 'desktop-chrome-1440') {
    await expect(accountLink).toBeVisible();
    await expect(accountLink).toContainText('Войти');
  } else {
    await expect(accountLink).toBeHidden();
  }

  const accountResponse = await page.goto(accountHref!, { waitUntil: 'networkidle' });
  expect(accountResponse?.ok()).toBeTruthy();
  expect(new URL(page.url()).pathname).toBe('/my-account/');
  await expect(page.locator('body')).toHaveClass(/woocommerce-account/);

  const loginForm = page.locator('form.woocommerce-form-login');
  await expect(loginForm).toHaveCount(1);
  await expect(loginForm).toBeVisible();
  await expect(loginForm.locator('#username')).toBeVisible();
  await expect(loginForm.locator('#password')).toBeVisible();
  await expect(loginForm.locator('button[name="login"]')).toBeVisible();

  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);

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
});
