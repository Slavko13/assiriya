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
  await expect(loginForm).toHaveAttribute('method', 'post');
  const formAction = new URL(await loginForm.evaluate((form: HTMLFormElement) => form.action));
  expect(formAction.origin).toBe(new URL(page.url()).origin);
  expect(formAction.pathname).toBe('/my-account/');
  expect(formAction.search).toBe('');
  expect(formAction.hash).toBe('');

  const username = loginForm.locator('#username');
  await expect(username).toBeVisible();
  await expect(username).toHaveAttribute('name', 'username');
  await expect(username).toHaveAttribute('type', 'text');
  await expect(username).toHaveAttribute('autocomplete', 'username');
  await expect(username).toHaveAttribute('required', '');
  await expect(username).toHaveAttribute('aria-required', 'true');

  const password = loginForm.locator('#password');
  await expect(password).toBeVisible();
  await expect(password).toHaveAttribute('name', 'password');
  await expect(password).toHaveAttribute('type', 'password');
  await expect(password).toHaveAttribute('autocomplete', 'current-password');
  await expect(password).toHaveAttribute('required', '');
  await expect(password).toHaveAttribute('aria-required', 'true');

  const rememberLabel = loginForm.locator('label.woocommerce-form-login__rememberme');
  await expect(rememberLabel).toHaveCount(1);
  await expect(rememberLabel).toBeVisible();
  const rememberCheckbox = loginForm.locator(
    'label.woocommerce-form-login__rememberme > input#rememberme[name="rememberme"]',
  );
  await expect(rememberCheckbox).toHaveCount(1);
  await expect(rememberCheckbox).toHaveAttribute('type', 'checkbox');
  await expect(rememberCheckbox).toHaveAttribute('value', 'forever');
  await expect(rememberCheckbox).toHaveAccessibleName(/\S/);
  await expect(rememberCheckbox).not.toBeChecked();
  const rememberText = loginForm.locator(
    'label.woocommerce-form-login__rememberme > input#rememberme[name="rememberme"] + span',
  );
  await expect(rememberText).toHaveCount(1);
  await expect(rememberText).toBeVisible();
  await expect(rememberText).toContainText(/\S/);
  await rememberText.click();
  await expect(rememberCheckbox).toBeChecked();
  await rememberText.click();
  await expect(rememberCheckbox).not.toBeChecked();

  const loginButton = loginForm.locator('button[name="login"]');
  await expect(loginButton).toBeVisible();
  await expect(loginButton).toHaveAttribute('type', 'submit');

  const nonce = loginForm.locator('input[name="woocommerce-login-nonce"]');
  await expect(nonce).toHaveCount(1);
  await expect(nonce).toHaveAttribute('type', 'hidden');
  expect(await nonce.inputValue()).not.toBe('');

  const referer = loginForm.locator('input[name="_wp_http_referer"]');
  await expect(referer).toHaveCount(1);
  await expect(referer).toHaveValue('/my-account/');

  const lostPasswordLink = loginForm.locator('.lost_password a');
  await expect(lostPasswordLink).toHaveCount(1);
  const lostPasswordHref = await lostPasswordLink.getAttribute('href');
  expect(lostPasswordHref).toBeTruthy();
  const lostPasswordUrl = new URL(lostPasswordHref!, page.url());
  expect(lostPasswordUrl.origin).toBe(new URL(page.url()).origin);
  expect(lostPasswordUrl.pathname).toBe('/my-account/lost-password/');
  expect(lostPasswordUrl.search).toBe('');
  expect(lostPasswordUrl.hash).toBe('');

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
