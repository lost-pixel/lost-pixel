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
import { readDirIntoShotItems, removeFilesInFolder } from './utils';
import { launchStaticWebServer } from './crawler/utils';
import type { ShotItem } from './types';

export const createShots = async () => {
  const {
    ladleShots,
    storybookShots,
    pageShots,
    customShots,
    imagePathCurrent,
    imagePathDifference,
  } = config;
  let storybookShotItems: ShotItem[] = [];
  let pageShotItems: ShotItem[] = [];
  let ladleShotItems: ShotItem[] = [];
  let customShotItems: ShotItem[] = [];

  removeFilesInFolder(imagePathCurrent);
  removeFilesInFolder(imagePathDifference);

  if (ladleShots) {
    const { ladleUrl, mask } = ladleShots;

    log.process('info', `\n=== [Ladle Mode] ${ladleUrl} ===\n`);

    const collection = await collectLadleStories(ladleUrl);

    if (!collection || collection.length === 0) {
      throw new Error('Error: Stories not found');
    }

    log.process('info', `Found ${collection.length} ladle stories`);

    ladleShotItems = generateLadleShotItems(ladleUrl, collection, mask);

    log.process(
      'info',
      `Prepared ${ladleShotItems.length} ladle stories for screenshots`,
    );

    await takeScreenShots(ladleShotItems);

    log.process('info', 'Screenshots done!');
  }

  if (storybookShots) {
    const { storybookUrl, mask } = storybookShots;

    log.process('info', `\n=== [Storybook Mode] ${storybookUrl} ===\n`);

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

      log.process('info', `Found ${collection.stories.length} stories`);

      storybookShotItems = generateStorybookShotItems(
        storybookWebUrl,
        collection.stories,
        mask,
      );

      log.process(
        'info',
        `Prepared ${storybookShotItems.length} stories for screenshots`,
      );

      await takeScreenShots(storybookShotItems);
      localServer?.close();
    } catch (error: unknown) {
      localServer?.close();
      throw error;
    }

    log.process('info', 'Screenshots done!');
  }

  if (pageShots) {
    const { pages, baseUrl, mask } = pageShots;

    log.process('info', `\n=== [Page Mode] ${baseUrl} ===\n`);

    pageShotItems = generatePageShotItems(pages, baseUrl, mask);
    log.process(
      'info',
      `Prepared ${pageShotItems.length} pages for screenshots`,
    );

    await takeScreenShots(pageShotItems);
    log.process('info', 'Screenshots done!');
  }

  if (customShots) {
    const { currentShotsPath } = customShots;

    log.process('info', `\n=== [Custom Mode] ${currentShotsPath} ===\n`);

    customShotItems = readDirIntoShotItems(currentShotsPath);
    log.process('info', `Found ${customShotItems.length} custom shots`);
  }

  return [
    ...storybookShotItems,
    ...pageShotItems,
    ...ladleShotItems,
    ...customShotItems,
  ];
};
