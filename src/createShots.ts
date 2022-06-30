import { config } from './config';
import {
  collectStories,
  generateStorybookShotItems,
} from './crawler/storybook';
import { generatePageShotItems } from './crawler/pageScreenshots';
import { log } from './log';
import { ShotItem, takeScreenShots } from './shots/shots';
import { removeFilesInFolder } from './utils';

export const createShots = async () => {
  const {
    pages,
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

    shotItems = generateStorybookShotItems(storybookUrl, collection.stories);
    log(`Prepared ${shotItems.length} stories for screenshots`);

    await takeScreenShots(shotItems);

    log('Screenshots done!');
  }

  if (pages && pageBaselineUrl) {
    shotItems = generatePageShotItems(pages, pageBaselineUrl);
    log(`Prepared ${shotItems.length} stories for screenshots`);

    await takeScreenShots(shotItems);

    log('Screenshots done!');
  }

  return shotItems;
};
