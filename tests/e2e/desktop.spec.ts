import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { compareRenderedPixels } from './visual';

test('visual artifact comparison retains only explicitly bounded pixel noise', async ({ page }) => {
  const dataUrls = await page.evaluate(() => {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('az-icon');
    icon.style.cssText = 'position:fixed;left:4px;top:0;width:3px;height:1px;display:block';
    document.body.append(icon);

    const createPng = (width: number, changedPixels: number[] = [], channelDelta = 0): string => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not create test canvas');
      }
      const pixels = context.createImageData(width, 1);
      for (let pixel = 0; pixel < width; pixel += 1) {
        const offset = pixel * 4;
        pixels.data[offset] = 100 + (changedPixels.includes(pixel) ? channelDelta : 0);
        pixels.data[offset + 1] = 110;
        pixels.data[offset + 2] = 120;
        pixels.data[offset + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
      return canvas.toDataURL('image/png');
    };

    return {
      baseline: createPng(20),
      boundedBaseline: createPng(70),
      sixtyFourByOne: createPng(70, Array.from({ length: 64 }, (_, index) => index), 1),
      sixtyFiveByOne: createPng(70, Array.from({ length: 65 }, (_, index) => index), 1),
      oneByTwo: createPng(20, [0], 2),
      twoBySixtyFourInsideSvg: createPng(20, [4, 5], 64),
      threeBySixtyFourInsideSvg: createPng(20, [4, 5, 6], 64),
      twoBySixtyFourOutsideSvg: createPng(20, [0, 1], 64),
      twoBySixtyFiveInsideSvg: createPng(20, [4, 5], 65),
      differentSize: createPng(21),
    };
  });
  const decode = (dataUrl: string): Buffer => {
    const encoded = dataUrl.split(',', 2)[1];
    if (!encoded) {
      throw new Error('Canvas PNG data URL did not contain a payload');
    }
    return Buffer.from(encoded, 'base64');
  };
  const baseline = decode(dataUrls.baseline);

  await expect(compareRenderedPixels(page, baseline, Buffer.from(baseline))).resolves.toEqual({
    equivalent: true,
    changedPixels: 0,
    maxChannelDelta: 0,
    retention: 'exact',
  });
  const boundedBaseline = decode(dataUrls.boundedBaseline);
  await expect(compareRenderedPixels(page, boundedBaseline, decode(dataUrls.sixtyFourByOne))).resolves.toEqual({
    equivalent: true,
    changedPixels: 64,
    maxChannelDelta: 1,
    retention: 'bounded-channel-noise',
  });
  await expect(compareRenderedPixels(page, boundedBaseline, decode(dataUrls.sixtyFiveByOne))).resolves.toMatchObject({
    equivalent: false,
    changedPixels: 65,
    maxChannelDelta: 1,
  });
  await expect(compareRenderedPixels(page, baseline, decode(dataUrls.oneByTwo))).resolves.toMatchObject({
    equivalent: false,
    changedPixels: 1,
    maxChannelDelta: 2,
  });
  await expect(compareRenderedPixels(page, baseline, decode(dataUrls.twoBySixtyFourInsideSvg))).resolves.toEqual({
    equivalent: true,
    changedPixels: 2,
    maxChannelDelta: 64,
    retention: 'inline-svg-antialias-noise',
  });
  await expect(compareRenderedPixels(page, baseline, decode(dataUrls.threeBySixtyFourInsideSvg))).resolves.toMatchObject({
    equivalent: false,
    changedPixels: 3,
    maxChannelDelta: 64,
  });
  await expect(compareRenderedPixels(page, baseline, decode(dataUrls.twoBySixtyFourOutsideSvg))).resolves.toMatchObject({
    equivalent: false,
    changedPixels: 1,
    maxChannelDelta: 64,
  });
  await expect(compareRenderedPixels(page, baseline, decode(dataUrls.twoBySixtyFiveInsideSvg))).resolves.toMatchObject({
    equivalent: false,
    changedPixels: 1,
    maxChannelDelta: 65,
  });
  await expect(compareRenderedPixels(page, baseline, decode(dataUrls.differentSize))).resolves.toMatchObject({
    equivalent: false,
    maxChannelDelta: 255,
  });
});

test('theme entrypoints expose a visible skip-link focus transfer', async ({ page }) => {
  for (const route of ['/', '/delivery/', '/shop/']) {
    await page.goto(route, { waitUntil: 'networkidle' });

    await page.keyboard.press('Tab');
    const skipLink = page.locator('.az-skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeInViewport({ ratio: 1 });
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
    expect(hasOutline || hasFocusRing, `Focused skip link should expose a focus style on ${route}`).toBe(true);

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#primary$/);
    const primary = page.locator('main#primary[tabindex="-1"]');
    await expect(primary).toHaveCount(1);
    await expect(primary).toBeVisible();
    await expect(primary).toBeFocused();
  }
});

test('compact header keeps account and cart links named', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const accountLink = page.locator('.az-account-actions > a:first-child');
  const accountLabel = accountLink.locator('span');
  await expect(accountLink).toHaveCount(1);
  await expect(accountLink).toBeVisible();
  await expect(accountLink).toHaveAttribute('aria-labelledby', 'az-account-action-label');
  await expect(accountLabel).toHaveCount(1);
  await expect(accountLabel).toHaveAttribute('id', 'az-account-action-label');
  await expect(accountLabel).toBeHidden();
  await expect(accountLink).toHaveAccessibleName('Войти');

  const cartLink = page.locator('.az-account-actions > a.az-cart-link');
  const cartLabel = cartLink.locator('span');
  const cartCount = cartLink.locator('b');
  await expect(cartLink).toHaveCount(1);
  await expect(cartLink).toBeVisible();
  await expect(cartLink).toHaveAttribute('aria-labelledby', 'az-cart-action-label az-cart-count');
  await expect(cartLabel).toHaveCount(1);
  await expect(cartLabel).toHaveAttribute('id', 'az-cart-action-label');
  await expect(cartLabel).toBeHidden();
  await expect(cartCount).toHaveCount(1);
  await expect(cartCount).toHaveAttribute('id', 'az-cart-count');
  await expect(cartCount).toBeVisible();
  const cartCountText = (await cartCount.innerText()).trim();
  expect(cartCountText).toMatch(/^\d+$/);
  await expect(cartLink).toHaveAccessibleName(`Корзина ${cartCountText}`);

  for (const [link, pathname] of [
    [accountLink, '/my-account/'],
    [cartLink, '/cart/'],
  ] as const) {
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    const url = new URL(href!, page.url());
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect(url.pathname).toBe(pathname);
    expect(url.search).toBe('');
    expect(url.hash).toBe('');
  }

  const accessibility = await new AxeBuilder({ page }).include('.az-header').analyze();
  const blockingViolations = accessibility.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );
  expect(
    blockingViolations,
    `Serious/critical compact-header axe violations:\n${JSON.stringify(blockingViolations, null, 2)}`,
  ).toEqual([]);
});
