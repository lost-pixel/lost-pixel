import { Browser, BrowserContextOptions } from 'playwright';
import { mapLimit } from 'async';
import { getBrowser, isUpdateMode, log, sleep } from '../utils';
import { resizeViewportToFullscreen, waitForNetworkRequests } from './utils';
import { config } from '../config';
import path from 'path';

export type ShotItem = {
  id: string;
  url: string;
  filePathBaseline: string;
  filePathCurrent: string;
  filePathDifference: string;
  browserConfig?: BrowserContextOptions;
  threshold: number;
};

const takeScreenShot = async ({
  browser,
  shotItem,
  logger,
}: {
  browser: Browser;
  shotItem: ShotItem;
  logger: (message: string, ...rest: unknown[]) => void;
}) => {
  const context = await browser.newContext(shotItem.browserConfig);
  const page = await context.newPage();

  await page.goto(shotItem.url);

  try {
    await page.waitForLoadState('load', {
      timeout: config.timeouts.loadState,
    });
  } catch (e) {
    logger(`Timeout while waiting for page load state: ${shotItem.url}`);
  }

  try {
    await waitForNetworkRequests({
      page,
      logger,
      ignoreUrls: ['/__webpack_hmr'],
    });
  } catch (e) {
    logger(`Timeout while waiting for all network requests: ${shotItem.url}`);
  }

  if (config.beforeScreenshot) {
    await config.beforeScreenshot(page, { id: shotItem.id });
  }

  let fullScreenMode = true;

  try {
    await resizeViewportToFullscreen({ page });
    fullScreenMode = false;
  } catch (error) {
    log(`Could not resize viewport to fullscreen: ${shotItem.id}`);
  }

  await sleep(config.waitBeforeScreenshot);

  await page.screenshot({
    path: shotItem.filePathCurrent,
    fullPage: fullScreenMode,
    animations: 'disabled',
  });
  if (isUpdateMode()) {
    await page.screenshot({
      path: shotItem.filePathBaseline,
      fullPage: fullScreenMode,
      animations: 'disabled',
    });
  }

  await context.close();

  const videoPath = await page.video()?.path();

  if (videoPath) {
    const dirname = path.dirname(videoPath);
    const ext = videoPath.split('.').pop();
    const newVideoPath = `${dirname}/${shotItem.id}.${ext}`;
    await page.video()?.saveAs(newVideoPath);
    await page.video()?.delete();

    logger(`Video of '${shotItem.id}' recorded and saved to '${newVideoPath}`);
  }
};

export const takeScreenShots = async (shotItems: ShotItem[]) => {
  const browser = await getBrowser().launch();
  const total = shotItems.length;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.shotConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = (message: string, ...rest: unknown[]) =>
        log(`[${index + 1}/${total}] ${message}`, ...rest);

      logger(`Taking screenshot of '${shotItem.id}'`);

      const startTime = new Date().getTime();
      await takeScreenShot({ browser, shotItem, logger });
      const endTime = new Date().getTime();
      const elapsedTime = Number((endTime - startTime) / 1000).toFixed(3);

      logger(
        `Screenshot of '${shotItem.id}' taken and saved to '${shotItem.filePathCurrent}' in ${elapsedTime}s`,
      );
    },
  );

  await browser.close();
};
