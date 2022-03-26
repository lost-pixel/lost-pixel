import { Browser, firefox } from 'playwright';
import { mapLimit } from 'async';
import { log } from '../utils';
import { shotConcurrency } from '../constants';

export type ShotItem = {
  id: string;
  url: string;
  filePath: string;
};

const takeScreenShot = async (browser: Browser, shotItem: ShotItem) => {
  const page = await browser.newPage();
  await page.goto(shotItem.url);
  await page.waitForLoadState();
  await page.screenshot({ path: shotItem.filePath });
};

export const takeScreenShots = async (shotItems: ShotItem[]) => {
  const browser = await firefox.launch();
  const total = shotItems.length;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    shotConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const progress = `${index + 1}/${total}`;

      log(`[${progress}] Taking screenshot of ${shotItem.id}`);
      await takeScreenShot(browser, shotItem);
      log(
        `[${progress}] Screenshot of ${shotItem.id} taken and saved to ${shotItem.filePath}`,
      );
    },
  );

  await browser.close();
};
