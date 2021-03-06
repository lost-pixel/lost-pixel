import { config } from './config';
import {
  collectStories,
  generateStorybookShotItems,
} from './crawler/storybook';
import { generatePageShotItems } from './crawler/pageScreenshots';
import { log } from './log';
import { ShotItem, takeScreenShots } from './shots/shots';
import { removeFilesInFolder } from './utils';
import { launchStaticWebServer } from './crawler/utils';

export const createShots = async () => {
  const { storybookShots, pageShots, imagePathCurrent, imagePathDifference } =
    config;
  let storybookShotItems: ShotItem[] = [];
  let pageShotItems: ShotItem[] = [];

  removeFilesInFolder(imagePathCurrent);
  removeFilesInFolder(imagePathDifference);

  if (storybookShots) {
    const { storybookUrl } = storybookShots;

    let storybookWebUrl = storybookUrl;
    let localServer;

    if (
      !storybookUrl.startsWith('http://') &&
      !storybookUrl.startsWith('https://')
    ) {
      const staticWebServer = await launchStaticWebServer(storybookUrl);
      storybookWebUrl = staticWebServer.url;
      localServer = staticWebServer.server;
    }

    try {
      const collection = await collectStories(storybookWebUrl);

      if (!collection?.stories || collection.stories.length === 0) {
        throw new Error('Error: Stories not found');
      }

      log(`Found ${collection.stories.length} stories`);

      storybookShotItems = generateStorybookShotItems(
        storybookWebUrl,
        collection.stories,
      );

      log(`Prepared ${storybookShotItems.length} stories for screenshots`);

      await takeScreenShots(storybookShotItems);
      localServer?.close();
    } catch (error: unknown) {
      localServer?.close();
      throw error;
    }

    log('Screenshots done!');
  }

  if (pageShots) {
    const { pages, pageBaselineUrl } = pageShots;

    pageShotItems = generatePageShotItems(pages, pageBaselineUrl);
    log(`Prepared ${pageShotItems.length} pages for screenshots`);

    await takeScreenShots(pageShotItems);
    log('Screenshots done!');
  }

  return [...storybookShotItems, ...pageShotItems];
};
