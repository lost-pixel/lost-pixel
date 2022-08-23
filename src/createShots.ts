import {
  collectLadleStories,
  generateLadleShotItems,
} from './crawler/ladleScreenshots';
import { config } from './config';
import {
  collectStories,
  generateStorybookShotItems,
} from './crawler/storybook';
import { generatePageShotItems } from './crawler/pageScreenshots';
import { log } from './log';
import { takeScreenShots } from './shots/shots';
import { removeFilesInFolder } from './utils';
import { launchStaticWebServer } from './crawler/utils';
import { ShotItem } from './types';

export const createShots = async () => {
  const {
    ladleShots,
    storybookShots,
    pageShots,
    imagePathCurrent,
    imagePathDifference,
  } = config;
  let storybookShotItems: ShotItem[] = [];
  let pageShotItems: ShotItem[] = [];
  let ladleShotItems: ShotItem[] = [];

  removeFilesInFolder(imagePathCurrent);
  removeFilesInFolder(imagePathDifference);

  if (ladleShots) {
    const { ladleUrl } = ladleShots;
    const collection = await collectLadleStories(ladleUrl);

    if (!collection || collection.length === 0) {
      throw new Error('Error: Stories not found');
    }

    log(`Found ${collection.length} ladle stories`);

    ladleShotItems = generateLadleShotItems(ladleUrl, collection);

    log(`Prepared ${ladleShotItems.length} ladle stories for screenshots`);

    await takeScreenShots(ladleShotItems);

    log('Screenshots done!');
  }

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
    const { pages, pageUrl } = pageShots;

    pageShotItems = generatePageShotItems(pages, pageUrl);
    log(`Prepared ${pageShotItems.length} pages for screenshots`);

    await takeScreenShots(pageShotItems);
    log('Screenshots done!');
  }

  return [...storybookShotItems, ...pageShotItems, ...ladleShotItems];
};
