import fse from 'fs-extra';

import { checkDifferences } from './checkDifferences';
import { collect } from './collect';
import { createShots } from './createShots';
import {
  createShotsFolders,
  getEventData,
  isUpdateMode,
  removeFilesInFolder,
} from './utils';
import { config, configure } from './config';
import { sendResultToAPI } from './upload';
import { sendInitToAPI } from './sendInit';
import { log } from './log';

export const runner = async () => {
  await configure();
  log('Successfully loaded the configuration!');
  try {
    if (config.setPendingStatusCheck && config.generateOnly) {
      await sendInitToAPI();
    }

    if (isUpdateMode()) {
      if (!config.generateOnly) {
        log(
          'Running lost-pixel in update mode requires the generateOnly option to be set to true',
        );
        process.exit(1);
      }

      log(
        'Running lost-pixel in update mode. Baseline screenshots will be updated',
      );
    }

    log('Creating shot folders');
    createShotsFolders();

    log('Creating shots');
    const shotItems = await createShots();

    if (config.generateOnly && shotItems.length === 0) {
      log(`Exiting process with nothing to compare.`);
      process.exit(1);
    }

    log('Checking differences');
    const { differenceCount } = await checkDifferences(shotItems);

    if (isUpdateMode()) {
      removeFilesInFolder(config.imagePathBaseline);
      fse.copySync(config.imagePathCurrent, config.imagePathBaseline);
    }

    if (differenceCount > 0 && config.failOnDifference) {
      log(`Exiting process with ${differenceCount} found differences`);
      process.exit(1);
    }

    if (!config.generateOnly) {
      const comparisons = await collect();
      await sendResultToAPI({
        success: true,
        comparisons,
        event: getEventData(config.eventFilePath),
      });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(error.message);
    } else {
      log(error);
    }

    if (!config.generateOnly) {
      await sendResultToAPI({
        success: false,
        event: getEventData(config.eventFilePath),
      });
    }

    process.exit(1);
  }
};
