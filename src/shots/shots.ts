import { Browser, firefox } from 'playwright';
import { log } from '../utils';

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

  await Promise.all(
    shotItems.map(async (shotItem, index) => {
      const progress = `${index + 1}/${total}`;

      log(`[${progress}] Taking screenshot of ${shotItem.id}`);
      await takeScreenShot(browser, shotItem);
      log(
        `[${progress}] Screenshot of ${shotItem.id} taken and saved to ${shotItem.filePath}`,
      );
    }),
  );

  await browser.close();
};
