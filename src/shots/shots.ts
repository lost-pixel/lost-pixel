import { Browser, firefox } from 'playwright';
import { mapLimit } from 'async';
import { log, sleep } from '../utils';
import { shotConcurrency } from '../constants';
import { waitForNetworkRequests } from './utils';

export type ShotItem = {
  id: string;
  url: string;
  filePath: string;
};

const takeScreenShot = async ({
  browser,
  shotItem,
  logger,
}: {
  browser: Browser;
  shotItem: ShotItem;
  logger: typeof log;
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(shotItem.url);

  try {
    await page.waitForLoadState('load', {
      timeout: 30_000,
    });
  } catch (e) {
    logger(`Timeout while waiting for page load state: ${shotItem.url}`);
  }

  try {
    await waitForNetworkRequests({
      page,
      timeout: 30_000,
      logger,
      ignoreUrls: ['/__webpack_hmr'],
    });
  } catch (e) {
    logger(`Timeout while waiting for all network requests: ${shotItem.url}`);
  }

  await sleep(1_000);

  await page.screenshot({
    path: shotItem.filePath,
    fullPage: true,
    animations: 'disabled',
  });

  await context.close();
};

export const takeScreenShots = async (shotItems: ShotItem[]) => {
  const browser = await firefox.launch();
  const total = shotItems.length;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    shotConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = (message: string, ...rest: unknown[]) =>
        log(`[${index + 1}/${total}] ${message}`, ...rest);

      logger(`Taking screenshot of '${shotItem.id}'`);

      const startTime = performance.now();
      await takeScreenShot({ browser, shotItem, logger });
      const endTime = performance.now();
      const elapsedTime = Number((endTime - startTime) / 1000).toFixed(3);

      logger(
        `Screenshot of '${shotItem.id}' taken and saved to '${shotItem.filePath}' in ${elapsedTime}s`,
      );
    },
  );

  await browser.close();
};
