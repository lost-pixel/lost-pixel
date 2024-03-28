import path from 'node:path';
import { mapLimit } from 'async';
import type {
  Browser,
  BrowserContextOptions,
  BrowserType,
  PageScreenshotOptions,
} from 'playwright-core';
import { log } from '../log';
import { getBrowser, hashFile, sleep } from '../utils';
import { config } from '../config';
import type { ShotItem } from '../types';
import { resizeViewportToFullscreen, waitForNetworkRequests } from './utils';

const takeScreenShot = async ({
  browser,
  shotItem,
  logger,
}: {
  browser: Browser;
  shotItem: ShotItem;
  logger: ReturnType<typeof log.item>;
}): Promise<boolean> => {
  const modifiedBrowserConfig: BrowserContextOptions = {
    ...shotItem.browserConfig,
    ignoreHTTPSErrors: true,
  };
  const context = await browser.newContext(modifiedBrowserConfig);
  const page = await context.newPage();
  let success = false;

  page.on('pageerror', (exception) => {
    logger.browser('error', 'general', 'Uncaught exception:', exception);
  });

  page.on('console', async (message) => {
    const values: unknown[] = [];

    try {
      for (const arg of message.args()) {
        // eslint-disable-next-line no-await-in-loop
        values.push(await arg.jsonValue());
      }
    } catch (error: unknown) {
      logger.browser(
        'error',
        'console',
        'Error while collecting console output',
        error,
      );
    }

    logger.browser('info', 'console', String(values.shift()), ...values);
  });

  try {
    await page.goto(shotItem.url);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      logger.process(
        'error',
        'timeout',
        `Timeout while loading page: ${shotItem.url}`,
      );
    } else {
      logger.process('error', 'general', 'Page loading failed', error);
    }
  }

  try {
    await page.waitForLoadState('load', {
      timeout: config.timeouts.loadState,
    });
  } catch (error: unknown) {
    logger.process(
      'error',
      'timeout',
      `Timeout while waiting for page load state: ${shotItem.url}`,
      error,
    );
  }

  if (shotItem.shotMode === 'ladle') {
    try {
      await page.waitForSelector('[data-storyloaded]');
    } catch (error: unknown) {
      logger.process(
        'error',
        'timeout',
        `Timeout while waiting for Ladle story to load: ${shotItem.url}`,
        error,
      );
    }
  }

  try {
    await waitForNetworkRequests({
      page,
      logger,
      ignoreUrls: ['/__webpack_hmr'],
    });
  } catch (error: unknown) {
    logger.process(
      'error',
      'timeout',
      `Timeout while waiting for all network requests: ${shotItem.url}`,
      error,
    );
  }

  if (config.beforeScreenshot) {
    await config.beforeScreenshot(page, {
      shotMode: shotItem.shotMode,
      id: shotItem.id,
      shotName: shotItem.shotName,
    });
  }

  let fullScreenMode = true;

  await sleep(shotItem?.waitBeforeScreenshot ?? config.waitBeforeScreenshot);

  try {
    if (shotItem.viewport) {
      const currentViewport = page.viewportSize();

      await page.setViewportSize({
        width: shotItem.viewport.width,
        height: currentViewport?.height ?? 500,
      });

      fullScreenMode = true;
    } else {
      await resizeViewportToFullscreen({ page });
      fullScreenMode = false;
    }
  } catch (error: unknown) {
    logger.process(
      'error',
      'general',
      `Could not resize viewport to fullscreen: ${shotItem.shotName}`,
      error,
    );
  }

  let retryCount = 0;
  let lastShotHash;

  try {
    while (retryCount <= config.flakynessRetries) {
      const { elementLocator } = shotItem;

      let screenshotOptions: PageScreenshotOptions = {
        path: shotItem.filePathCurrent,
        animations: 'disabled',
        mask: shotItem.mask
          ? shotItem.mask.map((mask) => page.locator(mask.selector))
          : [],
      };

      // add fullPage option if no elementLocator is set
      if (elementLocator) {
        // eslint-disable-next-line no-await-in-loop
        await page.locator(elementLocator).screenshot(screenshotOptions);
      } else {
        screenshotOptions = { ...screenshotOptions, fullPage: fullScreenMode };
        // eslint-disable-next-line no-await-in-loop
        await page.screenshot(screenshotOptions);
      }

      const currentShotHash = hashFile(shotItem.filePathCurrent);

      if (lastShotHash) {
        logger.process(
          'info',
          'general',
          `Screenshot of '${shotItem.shotName}' taken (Retry ${retryCount}). Hash: ${currentShotHash} - Previous hash: ${lastShotHash}`,
        );

        if (lastShotHash === currentShotHash) {
          break;
        }
      }

      lastShotHash = currentShotHash;

      if (retryCount < config.flakynessRetries) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(config.waitBetweenFlakynessRetries);
      }

      retryCount++;
    }

    success = true;
  } catch (error: unknown) {
    logger.process('error', 'general', 'Error when taking screenshot', error);
  }

  await context.close();

  const videoPath = await page.video()?.path();

  if (videoPath) {
    const dirname = path.dirname(videoPath);
    const ext = videoPath.split('.').pop() ?? 'webm';
    const newVideoPath = `${dirname}/${shotItem.shotName}.${ext}`;

    await page.video()?.saveAs(newVideoPath);
    await page.video()?.delete();

    logger.process(
      'info',
      'general',
      `Video of '${shotItem.shotName}' recorded and saved to '${newVideoPath}`,
    );
  }

  return success;
};

export const takeScreenShots = async (
  shotItems: ShotItem[],
  _browser?: BrowserType,
) => {
  const browser = await (_browser ?? getBrowser()).launch();
  const total = shotItems.length;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.shotConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = log.item({
        shotMode: shotItem.shotMode,
        uniqueItemId: shotItem.shotName,
        itemIndex: index,
        totalItems: total,
      });

      logger.process(
        'info',
        'general',

        `Taking screenshot of '${shotItem.shotName} ${
          shotItem.breakpoint ? `[${shotItem.breakpoint}]` : ''
        }'`,
      );

      const startTime = Date.now();

      const result = await takeScreenShot({ browser, shotItem, logger });
      const endTime = Date.now();
      const elapsedTime = Number((endTime - startTime) / 1000).toFixed(3);

      if (result) {
        logger.process(
          'info',
          'general',
          `Screenshot of '${shotItem.shotName}' taken and saved to '${shotItem.filePathCurrent}' in ${elapsedTime}s`,
        );
      } else {
        logger.process(
          'info',
          'general',
          `Screenshot of '${shotItem.shotName}' failed and took ${elapsedTime}s`,
        );
      }
    },
  );

  await browser.close();
};
