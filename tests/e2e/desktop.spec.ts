import { expect, test } from '@playwright/test';

test('homepage exposes a visible keyboard focus entry point', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  await page.keyboard.press('Tab');
  const skipLink = page.locator('.az-skip-link');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveAttribute('href', '#primary');

  const focusStyle = await skipLink.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });
  const hasOutline = focusStyle.outlineStyle !== 'none' && focusStyle.outlineWidth !== '0px';
  const hasFocusRing = focusStyle.boxShadow !== 'none';
  expect(hasOutline || hasFocusRing, 'Focused skip link should expose a visible outline or focus ring').toBe(true);

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#primary$/);
  await expect(page.locator('main#primary')).toBeVisible();
});
