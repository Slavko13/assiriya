import { expect, type Locator } from '@playwright/test';

type LoopCardOptions = {
  kind: 'demo' | 'standard';
  expectedReference?: string;
};

export async function expectLoopCardPresentation(card: Locator, options: LoopCardOptions): Promise<void> {
  await expect(card).toHaveClass(/\baz-loop-product-card\b/);
  await expect(card).toHaveClass(new RegExp(`\\baz-loop-product-card--${options.kind}\\b`));
  await expect(card).toHaveCSS('display', 'flex');
  await expect(card).toHaveCSS('flex-direction', 'column');

  const productLink = card.locator('.woocommerce-loop-product__link');
  const title = card.locator('.woocommerce-loop-product__title');
  const image = productLink.locator('img').first();
  const price = productLink.locator('.price');
  const action = card.locator(':scope > a.button').first();
  await expect(productLink).toHaveCount(1);
  await expect(title).toBeVisible();
  await expect(title).toContainText(/\S/);
  await expect(image).toBeVisible();
  await expect(price).toBeVisible();
  await expect(price).toContainText(/\S/);
  await expect(action).toBeVisible();

  const imageState = await image.evaluate((element: HTMLImageElement) => ({
    alt: element.alt.trim(),
    src: element.currentSrc || element.src,
  }));
  expect(imageState.src).not.toBe('');
  expect(
    imageState.alt.length > 0 || imageState.src.includes('placeholder'),
    'Loop image needs meaningful alt text or the Woo placeholder',
  ).toBe(true);

  const reference = card.locator('[data-loop-product-reference]');
  if (options.kind === 'demo') {
    const brand = card.locator('[data-loop-product-brand]');
    await expect(brand).toHaveCount(1);
    await expect(brand).toContainText(/\S/);
    await expect(reference).toHaveCount(1);
    await expect(reference).toHaveAttribute('data-reference-kind', 'article');
    await expect(reference).toContainText(/^Артикул:\s*\S/);
    await expect(card.locator('[data-demo-provenance="product"]')).toBeVisible();
    await expect(card).not.toContainText(/AZ-DEMO-/);
  } else {
    await expect(card.locator('[data-demo-provenance="product"]')).toHaveCount(0);
    await expect(card).not.toHaveClass(/\baz-loop-product-card--demo\b/);
    if (options.expectedReference) {
      await expect(reference).toHaveCount(1);
      await expect(reference).toHaveAttribute('data-reference-kind', 'sku');
      await expect(reference).toHaveText(`SKU: ${options.expectedReference}`);
    }
  }

  const [cardBox, priceBox, actionBox] = await Promise.all([
    card.boundingBox(),
    price.boundingBox(),
    action.boundingBox(),
  ]);
  expect(cardBox).toBeTruthy();
  expect(priceBox).toBeTruthy();
  expect(actionBox).toBeTruthy();
  expect(actionBox!.height).toBeGreaterThanOrEqual(48);
  expect(actionBox!.x).toBeGreaterThanOrEqual(cardBox!.x - 1);
  expect(actionBox!.x + actionBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
  expect(actionBox!.y).toBeGreaterThanOrEqual(priceBox!.y + priceBox!.height - 1);

  const actionClipping = await action.evaluate((element: HTMLElement) => ({
    horizontal: element.scrollWidth > element.clientWidth + 1,
    vertical: element.scrollHeight > element.clientHeight + 1,
  }));
  expect(actionClipping).toEqual({ horizontal: false, vertical: false });
}

export async function expectLoopGridPresentation(productList: Locator, viewportWidth: number): Promise<void> {
  await expect(productList).toHaveCSS('display', 'grid');
  const cards = productList.locator(':scope > li.product');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  const [listBox, firstBox] = await Promise.all([productList.boundingBox(), cards.first().boundingBox()]);
  expect(listBox).toBeTruthy();
  expect(firstBox).toBeTruthy();

  if (viewportWidth <= 600) {
    expect(firstBox!.width).toBeGreaterThanOrEqual(listBox!.width - 2);
    if (count > 1) {
      const secondBox = await cards.nth(1).boundingBox();
      expect(secondBox).toBeTruthy();
      expect(secondBox!.y).toBeGreaterThanOrEqual(firstBox!.y + firstBox!.height - 1);
    }
  } else if (viewportWidth > 900) {
    expect(firstBox!.width).toBeGreaterThanOrEqual(270);
    expect(firstBox!.width).toBeLessThanOrEqual(330);
  }
}
