import { expect, type Locator } from '@playwright/test';

type LoopCardOptions = {
  kind: 'demo' | 'standard';
  expectedReference?: string;
};

type HomeCardOptions = {
  kind: 'demo' | 'standard';
  expectedBrand?: string;
  expectedReference?: string;
  expectedProductId?: string;
  expectedProvenance?: string;
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

export async function expectHomeProductCardPresentation(
  card: Locator,
  options: HomeCardOptions,
): Promise<void> {
  await expect(card).toHaveAttribute('data-home-product-card', '');
  await expect(card).toHaveClass(new RegExp(`\\baz-product-card--${options.kind}\\b`));
  await expect(card).toHaveCSS('display', 'flex');
  await expect(card).toHaveCSS('flex-direction', 'column');
  if (options.expectedProductId) {
    await expect(card).toHaveAttribute('data-product-id', options.expectedProductId);
  } else {
    await expect(card).toHaveAttribute('data-product-id', /^\d+$/);
  }

  const media = card.locator('.az-product-card__media');
  const image = media.locator('img').first();
  const title = card.locator('.az-product-card__title');
  const price = card.locator('.az-product-card__price');
  const action = card.locator('.az-product-card__action > .button').first();
  await expect(media).toHaveCount(1);
  await expect(image).toBeVisible();
  await expect(title).toBeVisible();
  await expect(title).toContainText(/\S/);
  await expect(price).toBeVisible();
  await expect(price).toContainText(/\S/);
  await expect(action).toBeVisible();

  const permalink = await title.getAttribute('href');
  expect(permalink).toBeTruthy();
  await expect(media).toHaveAttribute('href', permalink!);
  const imageState = await image.evaluate((element: HTMLImageElement) => ({
    alt: element.alt.trim(),
    src: element.currentSrc || element.src,
  }));
  expect(imageState.src).not.toBe('');
  expect(
    imageState.alt.length > 0 || imageState.src.includes('placeholder'),
    'Homepage product image needs meaningful alt text or the Woo placeholder',
  ).toBe(true);

  const brand = card.locator('[data-home-product-brand]');
  if (options.expectedBrand) {
    await expect(brand).toHaveCount(1);
    await expect(brand).toHaveText(options.expectedBrand);
  }

  const reference = card.locator('[data-home-product-reference]');
  if (options.expectedReference) {
    await expect(reference).toHaveCount(1);
    await expect(reference).toHaveAttribute(
      'data-reference-kind',
      options.kind === 'demo' ? 'article' : 'sku',
    );
    await expect(reference).toHaveText(
      `${options.kind === 'demo' ? 'Артикул' : 'SKU'}: ${options.expectedReference}`,
    );
  }

  const provenance = card.locator('[data-demo-provenance="product"]');
  if (options.kind === 'demo') {
    await expect(provenance).toHaveCount(1);
    await expect(provenance).toHaveText(
      options.expectedProvenance ?? 'Демонстрационный товар · цена и наличие не подтверждены',
    );
    await expect(card).not.toContainText(/AZ-DEMO-/);
  } else {
    await expect(provenance).toHaveCount(0);
    await expect(card).not.toContainText(/демонстрацион|AZ-DEMO-/i);
  }

  await expect(
    card.locator('.az-product-card__favorite, .az-product-card__stock, .az-product-card__note'),
  ).toHaveCount(0);
  await expect(card).not.toContainText(/(?:Демо:\s*)?(?:Есть|Нет) в наличии|под заказ|Срок уточняется/i);

  const [cardBox, actionBox] = await Promise.all([card.boundingBox(), action.boundingBox()]);
  expect(cardBox).toBeTruthy();
  expect(actionBox).toBeTruthy();
  expect(actionBox!.height).toBeGreaterThanOrEqual(48);
  expect(actionBox!.x).toBeGreaterThanOrEqual(cardBox!.x - 1);
  expect(actionBox!.x + actionBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height + 1);

  for (const element of [title, reference, provenance, action]) {
    if (await element.count()) {
      const clipping = await element.evaluate((node: HTMLElement) => ({
        horizontal: node.scrollWidth > node.clientWidth + 1,
        vertical: node.scrollHeight > node.clientHeight + 1,
      }));
      expect(clipping).toEqual({ horizontal: false, vertical: false });
    }
  }
}

export async function expectHomeProductRailPresentation(
  productRow: Locator,
  viewportWidth: number,
): Promise<void> {
  const cards = productRow.locator(':scope > [data-home-product-card]');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(cards.nth(index)).not.toHaveCSS('display', 'none');
  }

  if (viewportWidth <= 600) {
    await expect(productRow).toHaveCSS('display', 'flex');
    expect(await productRow.evaluate((element) => getComputedStyle(element).scrollSnapType)).toContain('x');
    if (count > 1) {
      expect(await productRow.evaluate((element) => element.scrollWidth)).toBeGreaterThan(
        await productRow.evaluate((element) => element.clientWidth),
      );
      await cards.last().scrollIntoViewIfNeeded();
      await expect(cards.last()).toBeInViewport({ ratio: 0.5 });
      await productRow.evaluate((element) => element.scrollTo({ left: 0, behavior: 'instant' }));
    }
    return;
  }

  await expect(productRow).toHaveCSS('display', 'grid');
  if (viewportWidth > 900 && count >= 5) {
    const boxes = await Promise.all(
      Array.from({ length: 5 }, (_, index) => cards.nth(index).boundingBox()),
    );
    boxes.forEach((box) => expect(box).toBeTruthy());
    boxes.slice(1).forEach((box) => expect(Math.abs(box!.y - boxes[0]!.y)).toBeLessThanOrEqual(1));
  }
}
