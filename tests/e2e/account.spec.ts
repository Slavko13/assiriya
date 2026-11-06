import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { captureStableVisual } from './visual';

type RuntimeErrors = {
  console: string[];
  page: string[];
};

type ComputedFocusStyle = {
  boxShadow: string;
  outlineColor: string;
  outlineStyle: string;
  outlineWidth: string;
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

async function readComputedFocusStyle(control: Locator): Promise<ComputedFocusStyle> {
  return control.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
}

function hasVisibleCssColor(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === '' || normalized === 'transparent') return false;
  const rgba = normalized.match(/rgba\(([^)]+)\)/);
  if (!rgba) return true;
  const commaParts = rgba[1].split(',').map((part) => part.trim());
  if (commaParts.length === 4) return Number.parseFloat(commaParts[3]) > 0;
  const slashParts = rgba[1].split('/').map((part) => part.trim());
  return slashParts.length !== 2 || Number.parseFloat(slashParts[1]) > 0;
}

async function expectComputedFocusStyle(
  control: Locator,
  unfocusedStyle: ComputedFocusStyle,
): Promise<void> {
  await expect(control).toBeFocused();
  expect(await control.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  const focusStyle = await readComputedFocusStyle(control);
  const shadowColor = focusStyle.boxShadow.match(/rgba?\([^)]+\)/)?.[0] ?? focusStyle.boxShadow;
  const shadowGeometry = [...focusStyle.boxShadow.matchAll(/(-?\d*\.?\d+)px/g)].map((match) =>
    Math.abs(Number.parseFloat(match[1])),
  );
  const hasVisibleBoxShadow =
    focusStyle.boxShadow !== unfocusedStyle.boxShadow &&
    focusStyle.boxShadow !== 'none' &&
    hasVisibleCssColor(shadowColor) &&
    shadowGeometry.some((value) => value > 0);
  const outlineChanged =
    focusStyle.outlineStyle !== unfocusedStyle.outlineStyle ||
    focusStyle.outlineWidth !== unfocusedStyle.outlineWidth ||
    focusStyle.outlineColor !== unfocusedStyle.outlineColor;
  const hasVisibleOutline =
    outlineChanged &&
    focusStyle.outlineStyle !== 'none' &&
    Number.parseFloat(focusStyle.outlineWidth) > 0 &&
    hasVisibleCssColor(focusStyle.outlineColor);
  expect(
    hasVisibleBoxShadow || hasVisibleOutline,
    'Keyboard focus should expose a non-transparent ring with non-zero geometry',
  ).toBe(true);
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

  const passwordToggle = loginForm.locator(
    '.password-input > #password + button.show-password-input[aria-describedby="password"]',
  );
  await expect(passwordToggle).toHaveCount(1);
  await expect(passwordToggle).toBeVisible();
  await expect(passwordToggle).toHaveAttribute('type', 'button');
  const revealLabel = (await passwordToggle.getAttribute('aria-label'))?.trim();
  expect(revealLabel).toBeTruthy();
  await expect(passwordToggle).toHaveAccessibleName(revealLabel!);
  await passwordToggle.click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(passwordToggle).not.toHaveAttribute('aria-label', revealLabel!);
  const concealLabel = (await passwordToggle.getAttribute('aria-label'))?.trim();
  expect(concealLabel).toBeTruthy();
  await expect(passwordToggle).toHaveAccessibleName(concealLabel!);
  await passwordToggle.click();
  await expect(password).toHaveAttribute('type', 'password');
  await expect(passwordToggle).toHaveAttribute('aria-label', revealLabel!);
  await expect(passwordToggle).toHaveAccessibleName(revealLabel!);

  await password.focus();
  await expect(password).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(passwordToggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(password).toHaveAttribute('type', 'text');
  await expect(passwordToggle).toHaveAttribute('aria-label', concealLabel!);
  await expect(passwordToggle).toHaveAccessibleName(concealLabel!);
  await expect(password).toBeFocused();
  expect(await password.inputValue()).toBe('');
  await page.keyboard.press('Tab');
  await expect(passwordToggle).toBeFocused();
  await page.keyboard.press('Space');
  await expect(password).toHaveAttribute('type', 'password');
  await expect(passwordToggle).toHaveAttribute('aria-label', revealLabel!);
  await expect(passwordToggle).toHaveAccessibleName(revealLabel!);
  await expect(password).toBeFocused();
  expect(await password.inputValue()).toBe('');
  expect(new URL(page.url()).pathname).toBe('/my-account/');

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
  const rememberAccessibleName = (await rememberText.innerText()).trim();
  expect(rememberAccessibleName).toBeTruthy();
  await expect(rememberCheckbox).toHaveAccessibleName(rememberAccessibleName);
  await rememberText.click();
  await expect(rememberCheckbox).toBeChecked();
  await rememberText.click();
  await expect(rememberCheckbox).not.toBeChecked();

  await password.focus();
  const rememberUnfocusedStyle = await readComputedFocusStyle(rememberCheckbox);
  await page.keyboard.press('Tab');
  await expect(passwordToggle).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(rememberCheckbox).toBeFocused();
  await expectComputedFocusStyle(rememberCheckbox, rememberUnfocusedStyle);
  await page.keyboard.press('Space');
  await expect(rememberCheckbox).toBeChecked();
  await expect(rememberCheckbox).toBeFocused();
  await expect(rememberCheckbox).toHaveAccessibleName(rememberAccessibleName);
  await page.keyboard.press('Space');
  await expect(rememberCheckbox).not.toBeChecked();
  await expect(rememberCheckbox).toBeFocused();
  await expect(rememberCheckbox).toHaveAccessibleName(rememberAccessibleName);
  expect(await username.inputValue()).toBe('');
  expect(await password.inputValue()).toBe('');
  expect(new URL(page.url()).pathname).toBe('/my-account/');

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

  const loginTabStops = [username, password, passwordToggle, rememberCheckbox, loginButton, lostPasswordLink];
  for (const tabStop of loginTabStops) {
    await expect(tabStop).toHaveCount(1);
    await expect(tabStop).toBeVisible();
    await expect(tabStop).toHaveAccessibleName(/\S/);
  }
  const tabOrderUrl = page.url();
  const expectLoginTraversalState = async () => {
    expect(page.url()).toBe(tabOrderUrl);
    expect(await username.inputValue()).toBe('');
    expect(await password.inputValue()).toBe('');
    await expect(password).toHaveAttribute('type', 'password');
    await expect(rememberCheckbox).not.toBeChecked();
  };
  await password.focus();
  const usernameUnfocusedStyle = await readComputedFocusStyle(username);
  await page.keyboard.press('Shift+Tab');
  await expectComputedFocusStyle(username, usernameUnfocusedStyle);
  for (let index = 1; index < loginTabStops.length; index += 1) {
    const unfocusedStyle = await readComputedFocusStyle(loginTabStops[index]);
    await page.keyboard.press('Tab');
    await expectComputedFocusStyle(loginTabStops[index], unfocusedStyle);
  }
  await expectLoginTraversalState();
  for (let index = loginTabStops.length - 2; index >= 0; index -= 1) {
    await page.keyboard.press('Shift+Tab');
    await expect(loginTabStops[index]).toBeFocused();
  }
  await expectLoginTraversalState();

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

test('opens the guest lost-password entrypoint without submitting recovery', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page);
  const recoveryPosts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/my-account/lost-password/') {
      recoveryPosts.push(request.url());
    }
  });

  const accountResponse = await page.goto('/my-account/', { waitUntil: 'networkidle' });
  expect(accountResponse?.ok()).toBeTruthy();
  const accountUrl = new URL(page.url());
  const loginForm = page.locator('form.woocommerce-form-login');
  const loginButton = loginForm.locator('button[name="login"][type="submit"]');
  const lostPasswordLink = loginForm.locator('.lost_password a');
  await expect(loginButton).toHaveCount(1);
  await expect(loginButton).toBeVisible();
  await expect(lostPasswordLink).toHaveCount(1);
  await loginButton.focus();
  await expect(loginButton).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(lostPasswordLink).toBeFocused();
  await expect(lostPasswordLink).toBeVisible();
  await expect(lostPasswordLink).toHaveAccessibleName(/\S/);
  expect(await lostPasswordLink.evaluate((element) => element.matches(':focus-visible'))).toBe(true);

  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.keyboard.press('Enter');
  const navigationResponse = await navigationPromise;
  expect(navigationResponse?.ok()).toBeTruthy();
  expect(navigationResponse?.request().method()).toBe('GET');
  const recoveryUrl = new URL(page.url());
  expect(recoveryUrl.origin).toBe(accountUrl.origin);
  expect(recoveryUrl.pathname).toBe('/my-account/lost-password/');
  expect(recoveryUrl.search).toBe('');
  expect(recoveryUrl.hash).toBe('');

  const recoveryForm = page.locator('form.woocommerce-ResetPassword.lost_reset_password');
  await expect(recoveryForm).toHaveCount(1);
  await expect(recoveryForm).toBeVisible();
  await expect(recoveryForm).toHaveAttribute('method', 'post');
  const recoveryAction = new URL(
    await recoveryForm.evaluate((form: HTMLFormElement) => form.action),
  );
  expect(recoveryAction.origin).toBe(recoveryUrl.origin);
  expect(recoveryAction.pathname).toBe('/my-account/lost-password/');
  expect(recoveryAction.search).toBe('');
  expect(recoveryAction.hash).toBe('');

  const identifier = recoveryForm.locator(
    'input#user_login[name="user_login"][type="text"][autocomplete="username"]',
  );
  await expect(identifier).toHaveCount(1);
  await expect(identifier).toBeVisible();
  await expect(identifier).toHaveAttribute('required', '');
  await expect(identifier).toHaveAttribute('aria-required', 'true');
  await expect(identifier).toHaveAccessibleName(/\S/);
  await expect(identifier).toHaveValue('');

  const resetMarker = recoveryForm.locator('input[name="wc_reset_password"][type="hidden"]');
  await expect(resetMarker).toHaveCount(1);
  await expect(resetMarker).toHaveValue('true');
  const nonce = recoveryForm.locator(
    'input#woocommerce-lost-password-nonce[name="woocommerce-lost-password-nonce"][type="hidden"]',
  );
  await expect(nonce).toHaveCount(1);
  expect(await nonce.inputValue()).not.toBe('');
  await expect(recoveryForm.locator('input[name="_wp_http_referer"][type="hidden"]')).toHaveValue(
    '/my-account/lost-password/',
  );
  const submit = recoveryForm.locator('button[type="submit"]');
  await expect(submit).toHaveCount(1);
  await expect(submit).toBeVisible();
  await expect(submit).toHaveAccessibleName(/\S/);

  await submit.focus();
  await expect(submit).toBeFocused();
  const identifierUnfocusedStyle = await readComputedFocusStyle(identifier);
  await page.keyboard.press('Shift+Tab');
  await expectComputedFocusStyle(identifier, identifierUnfocusedStyle);
  const submitUnfocusedStyle = await readComputedFocusStyle(submit);
  await page.keyboard.press('Tab');
  await expectComputedFocusStyle(submit, submitUnfocusedStyle);
  await expect(identifier).toHaveValue('');
  expect(recoveryPosts).toEqual([]);
  expect(page.url()).toBe(recoveryUrl.href);

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

  await expect(identifier).toHaveValue('');
  expect(recoveryPosts).toEqual([]);
  expect(page.url()).toBe(recoveryUrl.href);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});

test('presents the guest login as a branded responsive form', async ({ page }, testInfo) => {
  const runtimeErrors = watchRuntimeErrors(page);
  const loginPosts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/my-account/') {
      loginPosts.push(request.url());
    }
  });

  const response = await page.goto('/my-account/', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBe(true);
  const accountUrl = new URL(page.url());
  expect(accountUrl.pathname).toBe('/my-account/');
  expect(accountUrl.search).toBe('');
  expect(accountUrl.hash).toBe('');

  const main = page.locator('main.az-account-login-main');
  const shell = main.locator('article.az-account-login-page');
  const intro = shell.locator('.az-account-login-intro');
  const formPanel = shell.locator(':scope > .woocommerce');
  await expect(main).toHaveCount(1);
  await expect(shell).toBeVisible();
  await expect(intro.locator('.az-account-login-intro__eyebrow')).toHaveCount(0);
  await expect(intro.getByRole('heading', { level: 1, name: 'Личный кабинет' })).toBeVisible();
  await expect(intro).toContainText('Введите email или логин и пароль, чтобы продолжить.');
  await expect(formPanel.getByRole('heading', { level: 2, name: 'Вход' })).toBeVisible();

  const loginForm = formPanel.locator('form.woocommerce-form-login');
  await expect(loginForm).toHaveCount(1);
  await expect(loginForm).toBeVisible();
  await expect(loginForm).toHaveAttribute('method', 'post');
  const formAction = new URL(await loginForm.evaluate((form: HTMLFormElement) => form.action));
  expect(formAction.href).toBe(accountUrl.href);

  const username = loginForm.locator('#username[name="username"]');
  const password = loginForm.locator('#password[name="password"]');
  const passwordToggle = loginForm.locator('.password-input > button.show-password-input');
  const remember = loginForm.locator('#rememberme[name="rememberme"]');
  const loginButton = loginForm.locator('button[name="login"][type="submit"]');
  const lostPassword = loginForm.locator('.lost_password a');
  await expect(username).toHaveAccessibleName(/Email или логин/);
  await expect(password).toHaveAccessibleName(/Пароль/);
  await expect(username).toHaveAttribute('autocomplete', 'username');
  await expect(password).toHaveAttribute('autocomplete', 'current-password');
  await expect(username).toHaveAttribute('aria-required', 'true');
  await expect(password).toHaveAttribute('aria-required', 'true');
  await expect(passwordToggle).toHaveAccessibleName('Показать пароль');
  await expect(remember).toHaveAccessibleName('Запомнить меня');
  await expect(loginButton).toHaveText('Войти');
  await expect(lostPassword).toHaveText('Забыли пароль?');

  await passwordToggle.click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(passwordToggle).toHaveAccessibleName('Скрыть пароль');
  await passwordToggle.click();
  await expect(password).toHaveAttribute('type', 'password');
  await expect(passwordToggle).toHaveAccessibleName('Показать пароль');

  const nonce = loginForm.locator('input[name="woocommerce-login-nonce"][type="hidden"]');
  const referer = loginForm.locator('input[name="_wp_http_referer"][type="hidden"]');
  await expect(nonce).toHaveCount(1);
  expect(await nonce.inputValue()).not.toBe('');
  await expect(referer).toHaveValue('/my-account/');
  expect(await lostPassword.getAttribute('href')).toBe(`${accountUrl.origin}/my-account/lost-password/`);
  expect(await username.inputValue()).toBe('');
  expect(await password.inputValue()).toBe('');
  expect(loginPosts).toEqual([]);

  const controls = await page.evaluate(() => {
    const rect = (selector: string) => {
      const bounds = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
      return bounds ? { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height } : null;
    };
    return {
      intro: rect('.az-account-login-intro'),
      panel: rect('.az-account-login-page > .woocommerce'),
      username: rect('form.woocommerce-form-login #username'),
      password: rect('form.woocommerce-form-login #password'),
      toggle: rect('form.woocommerce-form-login .show-password-input'),
      submit: rect('form.woocommerce-form-login button[name="login"]'),
      clientWidth: document.documentElement.clientWidth,
      pageWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    };
  });
  expect(controls.intro).not.toBeNull();
  expect(controls.panel).not.toBeNull();
  expect(controls.username?.height).toBeGreaterThanOrEqual(48);
  expect(controls.password?.height).toBeGreaterThanOrEqual(48);
  expect(controls.toggle?.width).toBeGreaterThanOrEqual(48);
  expect(controls.toggle?.height).toBeGreaterThanOrEqual(48);
  expect(controls.submit?.height).toBeGreaterThanOrEqual(48);
  expect(Math.abs((controls.submit?.width ?? 0) - (controls.username?.width ?? 0))).toBeLessThanOrEqual(2);
  if (testInfo.project.name === 'desktop-chrome-1440') {
    expect(controls.intro!.right).toBeLessThanOrEqual(controls.panel!.left + 1);
    expect(Math.abs(controls.intro!.top - controls.panel!.top)).toBeLessThanOrEqual(1);
  } else {
    expect(controls.panel!.top).toBeGreaterThanOrEqual(controls.intro!.bottom - 1);
  }
  expect(controls.pageWidth).toBeLessThanOrEqual(controls.clientWidth + 1);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockingViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );
  expect(
    blockingViolations,
    `Serious/critical axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);

  await captureStableVisual(page, testInfo, `account-login-${testInfo.project.name}.png`);
  expect(await username.inputValue()).toBe('');
  expect(await password.inputValue()).toBe('');
  expect(loginPosts).toEqual([]);
  expect(page.url()).toBe(accountUrl.href);
  expect(runtimeErrors.console, `Browser console errors:\n${runtimeErrors.console.join('\n')}`).toEqual([]);
  expect(runtimeErrors.page, `Uncaught page errors:\n${runtimeErrors.page.join('\n')}`).toEqual([]);
});
