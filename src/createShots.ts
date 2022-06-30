import path from 'node:path';
import { config } from './config';
import { collectStories, generateShotItems } from './crawler/storybook';
import { log } from './log';
import { ShotItem, takeScreenShots } from './shots/shots';
import { removeFilesInFolder } from './utils';

export const createShots = async () => {
  const {
    pagePaths,
    pageBaselineUrl,
    storybookUrl,
    imagePathCurrent,
    imagePathDifference,
  } = config;
  let shotItems: ShotItem[] = [];

  if (storybookUrl) {
    const collection = await collectStories(storybookUrl);

    removeFilesInFolder(imagePathCurrent);
    removeFilesInFolder(imagePathDifference);
    if (!collection?.stories || collection.stories.length === 0) {
      throw new Error('Error: Stories not found');
    }

    log(`Found ${collection.stories.length} stories`);

    shotItems = generateShotItems(storybookUrl, collection.stories);
    log(`Prepared ${shotItems.length} stories for screenshots`);

    await takeScreenShots(shotItems);

    log('Screenshots done!');
  }

  if (pagePaths && pageBaselineUrl) {
    shotItems = pagePaths.map((pagePath) => {
      return {
        id: pagePath,
        url: path.join(pageBaselineUrl, pagePath),
        filePathBaseline: `${path.join(
          config.imagePathBaseline,
          pagePath,
        )}.png`,
        filePathCurrent: `${path.join(config.imagePathCurrent, pagePath)}.png`,
        filePathDifference: `${path.join(
          config.imagePathDifference,
          pagePath,
        )}.png`,
        threshold: 0,
      };
    });

    log(`Prepared ${shotItems.length} stories for screenshots`);

    await takeScreenShots(shotItems);

    log('Screenshots done!');
  }

  return shotItems;
};
