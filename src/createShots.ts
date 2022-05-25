import { config } from './config';
import { collectStories, generateShotItems } from './crawler/storybook';
import { takeScreenShots } from './shots/shots';
import { log, removeFilesInFolder, isUpdateMode } from './utils';

export const createShots = async () => {
  const collection = await collectStories(config.storybookUrl);

  removeFilesInFolder(config.imagePathCurrent);
  removeFilesInFolder(config.imagePathDifference);
  if (isUpdateMode()) {
    removeFilesInFolder(config.imagePathBaseline);
  }
  if (!collection?.stories || collection.stories.length === 0) {
    throw new Error('Error: Stories not found');
  }

  log(`Found ${collection.stories.length} stories`);

  const shotItems = generateShotItems(config.storybookUrl, collection.stories);
  log(`Prepared ${shotItems.length} stories for screenshots`);

  await takeScreenShots(shotItems);

  log('Screenshots done!');

  return shotItems;
};
