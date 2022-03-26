import { Browser, firefox } from 'playwright';
import { log } from '../utils';

export type ShotItem = {
  id: string;
  url: string;
  filePath: string;
};

const takeScreenShot = async (browser: Browser, shotItem: ShotItem) => {
  log(`Taking screenshot of ${shotItem.id}`);

  const page = await browser.newPage();
  await page.goto(shotItem.url);
  await page.waitForLoadState();
  await page.screenshot({ path: shotItem.filePath });

  log(`Screenshot of ${shotItem.id} taken and saved to ${shotItem.filePath}`);
};

export const takeScreenShots = async (shotItems: ShotItem[]) => {
  const browser = await firefox.launch();

  await Promise.all(
    shotItems.map(async (shotItem) => {
      await takeScreenShot(browser, shotItem);
    }),
  );

  await browser.close();
};
