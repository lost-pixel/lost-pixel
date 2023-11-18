import {
  collectLadleStories,
  generateLadleShotItems,
} from './crawler/ladleScreenshots';
import { config, isPlatformModeConfig } from './config';
import {
  collectStories,
  generateStorybookShotItems,
} from './crawler/storybook';
import {
  generatePageShotItems,
  getPagesFromExternalLoader,
} from './crawler/pageScreenshots';
import { log } from './log';
import { takeScreenShots } from './shots/shots';
import { readDirIntoShotItems, removeFilesInFolder } from './utils';
import { launchStaticWebServer } from './crawler/utils';
import type { ShotItem } from './types';
import {
  collectHistoireStories,
  generateHistoireShotItems,
} from './crawler/histoireScreenshots';

export const createShots = async () => {
  const {
    ladleShots,
    histoireShots,
    storybookShots,
    pageShots,
    customShots,
    imagePathCurrent,
  } = config;
  let storybookShotItems: ShotItem[] = [];
  let ladleShotItems: ShotItem[] = [];
  let histoireShotItems: ShotItem[] = [];
  let pageShotItems: ShotItem[] = [];
  let customShotItems: ShotItem[] = [];

  removeFilesInFolder(imagePathCurrent);

  if (!isPlatformModeConfig(config)) {
    removeFilesInFolder(config.imagePathDifference);
  }

  if (ladleShots) {
    const { ladleUrl, mask } = ladleShots;

    log.process('info', 'general', `\n=== [Ladle Mode] ${ladleUrl} ===\n`);

    let ladleWebUrl = ladleUrl;
    let localServer;

    if (!ladleUrl.startsWith('http://') && !ladleUrl.startsWith('https://')) {
      const staticWebServer = await launchStaticWebServer(ladleUrl);

      ladleWebUrl = staticWebServer.url;
      localServer = staticWebServer.server;
    }

    try {
      const collection = await collectLadleStories(ladleWebUrl);

      if (!collection || collection.length === 0) {
        throw new Error('Error: Stories not found');
      }

      log.process(
        'info',
        'general',
        `Found ${collection.length} ladle stories`,
      );

      ladleShotItems = generateLadleShotItems(
        ladleWebUrl,
        Boolean(localServer),
        collection,
        mask,
        ladleShots.breakpoints,
      );

      log.process(
        'info',
        'general',
        `Prepared ${ladleShotItems.length} ladle stories for screenshots`,
      );

      await takeScreenShots(ladleShotItems);
      localServer?.close();
    } catch (error: unknown) {
      localServer?.close();
      throw error;
    }

    log.process('info', 'general', 'Screenshots done!');
  }

  if (histoireShots) {
    const { histoireUrl } = histoireShots;

    let localServer;
    let histoireWebUrl;

    if (
      !histoireUrl.startsWith('http://') &&
      !histoireUrl.startsWith('https://')
    ) {
      const staticWebServer = await launchStaticWebServer(histoireUrl);

      histoireWebUrl = staticWebServer.url;
      localServer = staticWebServer.server;
    }

    if (!histoireWebUrl) {
      throw new Error('Error: Histoire web url not found');
    }

    log.process(
      'info',
      'general',
      `\n=== [Histoire Mode] ${histoireUrl} ===\n`,
    );

    try {
      const collection = await collectHistoireStories(histoireWebUrl);

      if (!collection || collection.length === 0) {
        throw new Error('Error: Stories not found');
      }

      log.process(
        'info',
        'general',
        `Found ${collection.length} Histoire stories`,
      );

      histoireShotItems = generateHistoireShotItems(histoireWebUrl, collection);

      log.process('info', 'general', { histoireShotItems });

      log.process(
        'info',
        'general',
        `Prepared ${histoireShotItems.length} Histoire stories for screenshots`,
      );

      await takeScreenShots(histoireShotItems);
      localServer?.close();
    } catch (error: unknown) {
      localServer?.close();

      throw error;
    }

    log.process('info', 'general', 'Screenshots done!');
  }

  if (storybookShots) {
    const { storybookUrl, mask } = storybookShots;

    log.process(
      'info',
      'general',
      `\n=== [Storybook Mode] ${storybookUrl} ===\n`,
    );

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

      log.process(
        'info',
        'general',
        `Found ${collection.stories.length} stories`,
      );

      storybookShotItems = generateStorybookShotItems(
        storybookWebUrl,
        collection.stories,
        mask,
        storybookShots.breakpoints,
      );

      log.process(
        'info',
        'general',
        `Prepared ${storybookShotItems.length} stories for screenshots`,
      );

      await takeScreenShots(storybookShotItems);
      localServer?.close();
    } catch (error: unknown) {
      localServer?.close();
      throw error;
    }

    log.process('info', 'general', 'Screenshots done!');
  }

  if (pageShots) {
    const { pages: pagesFromConfig, baseUrl, mask, breakpoints } = pageShots;

    const pagesFromLoader = await getPagesFromExternalLoader();

    if (pagesFromLoader) {
      log.process(
        'info',
        'general',
        `Found ${pagesFromLoader.length} pages from external loader`,
      );
    }

    const pages = [...(pagesFromConfig || []), ...(pagesFromLoader || [])];

    log.process('info', 'general', `\n=== [Page Mode] ${baseUrl} ===\n`);

    pageShotItems = generatePageShotItems(pages, baseUrl, mask, breakpoints);
    log.process(
      'info',
      'general',
      `Prepared ${pageShotItems.length} pages for screenshots`,
    );

    await takeScreenShots(pageShotItems);
    log.process('info', 'general', 'Screenshots done!');
  }

  if (customShots) {
    const { currentShotsPath } = customShots;

    log.process(
      'info',
      'general',
      `\n=== [Custom Mode] ${currentShotsPath} ===\n`,
    );

    customShotItems = readDirIntoShotItems(currentShotsPath);
    log.process(
      'info',
      'general',
      `Found ${customShotItems.length} custom shots`,
    );
  }

  return [
    ...storybookShotItems,
    ...pageShotItems,
    ...ladleShotItems,
    ...histoireShotItems,
    ...customShotItems,
  ];
};
