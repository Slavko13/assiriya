import { mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { type Page, type TestInfo } from '@playwright/test';

const visualDiffDirectory = path.resolve(process.cwd(), 'docs/qa/visual-diffs');
const visualLockPath = path.resolve(process.cwd(), 'test-results/.visual-capture.lock');
const negligiblePixelLimit = 64;
const negligibleChannelDelta = 1;
const svgAntialiasPixelLimit = 2;
const svgAntialiasChannelDelta = 64;

type PixelComparison = {
  equivalent: boolean;
  changedPixels: number;
  maxChannelDelta: number;
  retention: 'exact' | 'bounded-channel-noise' | 'inline-svg-antialias-noise' | 'material';
};

export async function compareRenderedPixels(page: Page, existing: Buffer, candidate: Buffer): Promise<PixelComparison> {
  if (existing.equals(candidate)) {
    return { equivalent: true, changedPixels: 0, maxChannelDelta: 0, retention: 'exact' };
  }

  return page.evaluate(async ({
    existingBase64,
    candidateBase64,
    pixelLimit,
    channelDelta,
    iconPixelLimit,
    iconChannelDelta,
  }) => {
    const loadBitmap = async (base64: string): Promise<ImageBitmap> => {
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      return createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    };
    let existingImage: ImageBitmap | undefined;
    let candidateImage: ImageBitmap | undefined;

    try {
      existingImage = await loadBitmap(existingBase64);
      candidateImage = await loadBitmap(candidateBase64);

      if (existingImage.width !== candidateImage.width || existingImage.height !== candidateImage.height) {
        return {
          equivalent: false,
          changedPixels: Number.POSITIVE_INFINITY,
          maxChannelDelta: 255,
          retention: 'material' as const,
        };
      }

      const iconBounds = Array.from(document.querySelectorAll<SVGElement>('svg.az-icon'))
        .filter((icon) => icon.getClientRects().length > 0)
        .map((icon) => {
          const bounds = icon.getBoundingClientRect();
          return {
            left: Math.floor(bounds.left + window.scrollX),
            top: Math.floor(bounds.top + window.scrollY),
            right: Math.ceil(bounds.right + window.scrollX),
            bottom: Math.ceil(bounds.bottom + window.scrollY),
          };
        });
      const isInsideIcon = (x: number, y: number): boolean => iconBounds.some((bounds) => (
        x >= bounds.left && x < bounds.right && y >= bounds.top && y < bounds.bottom
      ));
      const canvas = document.createElement('canvas');
      canvas.width = existingImage.width;
      canvas.height = existingImage.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new Error('Could not create a 2D context for visual artifact comparison');
      }

      context.drawImage(existingImage, 0, 0);
      const existingPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(candidateImage, 0, 0);
      const candidatePixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

      let changedPixels = 0;
      let maxChannelDelta = 0;
      let allChangesInsideIcon = true;
      for (let offset = 0; offset < existingPixels.length; offset += 4) {
        let pixelChanged = false;
        for (let channel = 0; channel < 4; channel += 1) {
          const delta = Math.abs(existingPixels[offset + channel] - candidatePixels[offset + channel]);
          if (delta > 0) {
            pixelChanged = true;
            maxChannelDelta = Math.max(maxChannelDelta, delta);
          }
        }
        if (pixelChanged) {
          changedPixels += 1;
          const pixelIndex = offset / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);
          allChangesInsideIcon = allChangesInsideIcon && isInsideIcon(x, y);
        }
        const boundedChannelNoise = changedPixels <= pixelLimit && maxChannelDelta <= channelDelta;
        const inlineSvgAntialiasNoise = changedPixels <= iconPixelLimit
          && maxChannelDelta <= iconChannelDelta
          && allChangesInsideIcon;
        if (!boundedChannelNoise && !inlineSvgAntialiasNoise) {
          return { equivalent: false, changedPixels, maxChannelDelta, retention: 'material' as const };
        }
      }

      if (changedPixels <= pixelLimit && maxChannelDelta <= channelDelta) {
        return {
          equivalent: true,
          changedPixels,
          maxChannelDelta,
          retention: 'bounded-channel-noise' as const,
        };
      }
      return {
        equivalent: true,
        changedPixels,
        maxChannelDelta,
        retention: 'inline-svg-antialias-noise' as const,
      };
    } finally {
      existingImage?.close();
      candidateImage?.close();
    }
  }, {
    existingBase64: existing.toString('base64'),
    candidateBase64: candidate.toString('base64'),
    pixelLimit: negligiblePixelLimit,
    channelDelta: negligibleChannelDelta,
    iconPixelLimit: svgAntialiasPixelLimit,
    iconChannelDelta: svgAntialiasChannelDelta,
  });
}

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
      const code = (error as NodeJS.ErrnoException).code;
      const lockIsContended = code === 'EEXIST' || (process.platform === 'win32' && code === 'EPERM');
      if (!lockIsContended) {
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

      const backgroundUrls = new Set<string>();
      for (const element of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
        if (element.getClientRects().length === 0) {
          continue;
        }
        const backgroundImage = window.getComputedStyle(element).backgroundImage;
        const urlPattern = /url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g;
        for (const match of backgroundImage.matchAll(urlPattern)) {
          const url = (match[1] || match[2] || match[3] || '').trim();
          if (url) {
            backgroundUrls.add(url);
          }
        }
      }
      await Promise.all(Array.from(backgroundUrls, async (url) => {
        const image = new Image();
        image.src = url;
        await withTimeout(image.decode(), `Background image decode ${url}`);
        if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
          throw new Error(`Background image loaded without decodable pixels: ${url}`);
        }
      }));

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
    const visualPath = path.join(visualDiffDirectory, filename);
    const candidate = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      scale: 'css',
      style: '.az-skip-link { display: none !important; }',
    });
    let existing: Buffer | undefined;
    try {
      existing = await readFile(visualPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    if (existing) {
      const comparison = await compareRenderedPixels(page, existing, candidate);
      if (comparison.equivalent) {
        testInfo.annotations.push({
          type: 'visual-artifact-retained',
          description: `${filename}: ${comparison.retention}; ${comparison.changedPixels} pixel(s), max channel delta ${comparison.maxChannelDelta}`,
        });
        return;
      }
    }

    await writeFile(visualPath, candidate);
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
