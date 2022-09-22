import path from 'node:path';
import { mapLimit } from 'async';
import type { Browser } from 'playwright';
import { log } from '../log';
import { getBrowser, sleep } from '../utils';
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
  const context = await browser.newContext(shotItem.browserConfig);
  const page = await context.newPage();
  let success = false;

  page.on('pageerror', (exception) => {
    logger.browser('error', 'Uncaught exception:', exception);
  });

  page.on('console', async (message) => {
    const values = [];

    try {
      for (const arg of message.args()) {
        // eslint-disable-next-line no-await-in-loop
        values.push(await arg.jsonValue());
      }
    } catch (error: unknown) {
      logger.browser('console', 'Error while collecting console output', error);
    }

    logger.browser('console', String(values.shift()), ...values);
  });

  try {
    await page.goto(shotItem.url);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      logger.process('error', `Timeout while loading page: ${shotItem.url}`);
    } else {
      logger.process('error', 'Page loading failed', error);
    }
  }

  try {
    await page.waitForLoadState('load', {
      timeout: config.timeouts.loadState,
    });
  } catch {
    logger.process(
      'error',
      `Timeout while waiting for page load state: ${shotItem.url}`,
    );
  }

  try {
    await waitForNetworkRequests({
      page,
      logger,
      ignoreUrls: ['/__webpack_hmr'],
    });
  } catch {
    logger.process(
      'error',
      `Timeout while waiting for all network requests: ${shotItem.url}`,
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
    await resizeViewportToFullscreen({ page });
    fullScreenMode = false;
  } catch {
    logger.process(
      'error',
      `Could not resize viewport to fullscreen: ${shotItem.shotName}`,
    );
  }

  try {
    await page.screenshot({
      path: shotItem.filePathCurrent,
      fullPage: fullScreenMode,
      animations: 'disabled',
      mask: shotItem.mask
        ? shotItem.mask.map((mask) => page.locator(mask.selector))
        : [],
    });

    success = true;
  } catch (error: unknown) {
    logger.process('error', 'Error when taking screenshot', error);
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
      `Video of '${shotItem.shotName}' recorded and saved to '${newVideoPath}`,
    );
  }

  return success;
};

export const takeScreenShots = async (shotItems: ShotItem[]) => {
  const browser = await getBrowser().launch();
  const total = shotItems.length;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.shotConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = log.item(shotItem.shotName, index, total);

      logger.process('info', `Taking screenshot of '${shotItem.shotName}'`);

      const startTime = Date.now();

      const result = await takeScreenShot({ browser, shotItem, logger });
      const endTime = Date.now();
      const elapsedTime = Number((endTime - startTime) / 1000).toFixed(3);

      if (result) {
        logger.process(
          'info',
          `Screenshot of '${shotItem.shotName}' taken and saved to '${shotItem.filePathCurrent}' in ${elapsedTime}s`,
        );
      } else {
        logger.process(
          'info',
          `Screenshot of '${shotItem.shotName}' failed and took ${elapsedTime}s`,
        );
      }
    },
  );

  await browser.close();
};
