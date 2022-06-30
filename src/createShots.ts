import { config } from './config';
import { collectStories, generateShotItems } from './crawler/storybook';
import { log } from './log';
import { ShotItem, takeScreenShots } from './shots/shots';
import { removeFilesInFolder } from './utils';

export const createShots = async () => {
  let shotItems: ShotItem[] = [];
  if (config.storybookUrl) {
    const collection = await collectStories(config.storybookUrl);

    removeFilesInFolder(config.imagePathCurrent);
    removeFilesInFolder(config.imagePathDifference);
    if (!collection?.stories || collection.stories.length === 0) {
      throw new Error('Error: Stories not found');
    }

    log(`Found ${collection.stories.length} stories`);

    shotItems = generateShotItems(config.storybookUrl, collection.stories);
    log(`Prepared ${shotItems.length} stories for screenshots`);

    await takeScreenShots(shotItems);

    log('Screenshots done!');
  }

  if (config.pageUrls) {
    // Collect page urls & make screenshots
    log({ pageUrls: config.pageUrls });
  }

  return shotItems;
};
