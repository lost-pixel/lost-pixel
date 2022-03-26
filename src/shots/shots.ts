import { Browser, firefox } from 'playwright';

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

  await Promise.all(
    shotItems.map(async (shotItem) => {
      await takeScreenShot(browser, shotItem);
    }),
  );

  await browser.close();
};
