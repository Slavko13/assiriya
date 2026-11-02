import { mkdir, open, rm } from 'node:fs/promises';
import path from 'node:path';

import { type Page, type TestInfo } from '@playwright/test';

const visualDiffDirectory = path.resolve(process.cwd(), 'docs/qa/visual-diffs');
const visualLockPath = path.resolve(process.cwd(), 'test-results/.visual-capture.lock');

async function acquireVisualLock(timeoutMs = 45_000): Promise<() => Promise<void>> {
  await mkdir(path.dirname(visualLockPath), { recursive: true });
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const handle = await open(visualLockPath, 'wx');
      let released = false;
      return async () => {
        if (released) {
          return;
        }
        released = true;
        await handle.close();
        await rm(visualLockPath, { force: true });
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  throw new Error(`Timed out waiting for the visual capture lock: ${visualLockPath}`);
}

export async function captureStableVisual(page: Page, testInfo: TestInfo, filename: string): Promise<void> {
  testInfo.setTimeout(Math.max(testInfo.timeout, 120_000));
  const releaseVisualLock = await acquireVisualLock();
  let stabilizationStyle: Awaited<ReturnType<Page['addStyleTag']>> | undefined;

  try {
    stabilizationStyle = await page.addStyleTag({
      content: 'html { scroll-behavior: auto !important; }',
    });
    await page.evaluate(async (timeoutMs) => {
      const doubleFrame = (): Promise<void> => new Promise((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      });
      const sourceOf = (image: HTMLImageElement): string => image.currentSrc || image.src || '[missing src]';
      const withTimeout = (promise: Promise<unknown>, label: string): Promise<unknown> => new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
        promise.then(
          (value) => {
            window.clearTimeout(timeoutId);
            resolve(value);
          },
          (error) => {
            window.clearTimeout(timeoutId);
            reject(error);
          },
        );
      });

      if (document.fonts) {
        await withTimeout(document.fonts.ready, 'Font loading');
      }

      let scrollTop = 0;
      for (let step = 0; step < 250; step += 1) {
        const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        window.scrollTo(0, Math.min(scrollTop, documentHeight));
        await doubleFrame();
        if (scrollTop >= documentHeight - window.innerHeight) {
          break;
        }
        scrollTop += Math.max(1, Math.floor(window.innerHeight * 0.8));
        if (step === 249) {
          throw new Error(`Visual stabilization exceeded 250 scroll steps at document height ${documentHeight}px`);
        }
      }

      const images = Array.from(document.images).filter((image) => {
        const rect = image.getBoundingClientRect();
        return Boolean(sourceOf(image))
          && image.getClientRects().length > 0
          && rect.width > 0
          && rect.height > 0
          && rect.right > 0
          && rect.left < window.innerWidth;
      });
      const deadline = Date.now() + timeoutMs;
      let incomplete = images.filter((image) => !image.complete);
      while (incomplete.length > 0 && Date.now() < deadline) {
        await new Promise((resolve) => window.setTimeout(resolve, 50));
        incomplete = images.filter((image) => !image.complete);
      }
      if (incomplete.length > 0) {
        throw new Error(`Images did not finish loading: ${incomplete.map(sourceOf).join(', ')}`);
      }

      const broken = images.filter((image) => image.naturalWidth <= 0 || image.naturalHeight <= 0);
      if (broken.length > 0) {
        throw new Error(`Images loaded without decodable pixels: ${broken.map(sourceOf).join(', ')}`);
      }

      const decodeFailures = (await Promise.all(images.map(async (image) => {
        if (typeof image.decode !== 'function') {
          return '';
        }
        try {
          await withTimeout(image.decode(), `Image decode ${sourceOf(image)}`);
          return '';
        } catch {
          return sourceOf(image);
        }
      }))).filter(Boolean);
      if (decodeFailures.length > 0) {
        throw new Error(`Images failed to decode: ${decodeFailures.join(', ')}`);
      }

      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await doubleFrame();
    }, 15_000);

    await mkdir(visualDiffDirectory, { recursive: true });
    await page.screenshot({
      path: path.join(visualDiffDirectory, filename),
      fullPage: true,
      animations: 'disabled',
      style: '.az-skip-link { display: none !important; }',
    });
  } finally {
    try {
      if (stabilizationStyle) {
        await stabilizationStyle.evaluate((element) => element.remove());
      }
    } finally {
      await releaseVisualLock();
    }
  }
}
