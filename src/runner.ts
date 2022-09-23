import fse from 'fs-extra';

import { checkDifferences } from './checkDifferences';
import { createShots } from './createShots';
import {
  createShotsFolders,
  exitProcess,
  getEventData,
  isUpdateMode,
  parseHrtimeToSeconds,
  removeFilesInFolder,
} from './utils';
import { config } from './config';
import { getApiToken, sendInitToAPI, sendResultToAPI } from './api';
import { log } from './log';

export const runner = async () => {
  const executionStart = process.hrtime();

  try {
    if (isUpdateMode()) {
      log.process(
        'info',
        'Running lost-pixel in update mode. Baseline screenshots will be updated',
      );
    }

    log.process('info', 'Creating shot folders');
    const createShotsStart = process.hrtime();

    createShotsFolders();

    log.process('info', 'Creating shots');
    const shotItems = await createShots();

    const createShotsStop = process.hrtime(createShotsStart);

    log.process(
      'info',
      `Creating shots took ${parseHrtimeToSeconds(createShotsStop)} seconds`,
    );

    if (config.generateOnly && shotItems.length === 0) {
      log.process('info', `Exiting process with nothing to compare.`);
      exitProcess({ shotsNumber: shotItems.length });
    }

    log.process('info', 'Checking differences');
    const checkDifferenceStart = process.hrtime();
    const { differenceCount, noBaselinesCount } = await checkDifferences(
      shotItems,
    );

    if (isUpdateMode()) {
      removeFilesInFolder(config.imagePathBaseline);
      fse.copySync(config.imagePathCurrent, config.imagePathBaseline);
    }

    if (
      (differenceCount > 0 || noBaselinesCount > 0) &&
      config.failOnDifference
    ) {
      log.process(
        'info',
        `Exiting process with ${differenceCount} found differences & ${noBaselinesCount} baselines to update`,
      );

      if (config.generateOnly) {
        exitProcess({ shotsNumber: shotItems.length });
      }
    }

    const checkDifferenceStop = process.hrtime(checkDifferenceStart);

    log.process(
      'info',
      `Checking differences took ${parseHrtimeToSeconds(
        checkDifferenceStop,
      )} seconds`,
    );

    const executionStop = process.hrtime(executionStart);

    log.process(
      'info',
      `Lost Pixel run took ${parseHrtimeToSeconds(executionStop)} seconds`,
    );

    exitProcess({
      shotsNumber: shotItems.length,
      runDuration: Number(parseHrtimeToSeconds(executionStop)),
      exitCode: 0,
    });
  } catch (error: unknown) {
    const executionStop = process.hrtime(executionStart);

    if (error instanceof Error) {
      log.process('error', error.message);
    } else {
      log.process('error', error);
    }

    exitProcess({
      runDuration: Number(parseHrtimeToSeconds(executionStop)),
      error,
    });
  }
};

export const platformRunner = async () => {
  const executionStart = process.hrtime();

  if (isUpdateMode()) {
    log.process(
      'error',
      'Running lost-pixel in update mode requires the generateOnly option to be set to true',
    );
    process.exit(1);
  }

  try {
    const result = await getApiToken();
    const { apiToken } = result;
    console.log(apiToken);

    if (config.setPendingStatusCheck) {
      await sendInitToAPI(apiToken);
    }

    log.process('info', 'Creating shot folders');
    const createShotsStart = process.hrtime();

    createShotsFolders();

    log.process('info', 'Creating shots');
    // const shotItems = await createShots();

    const createShotsStop = process.hrtime(createShotsStart);

    log.process(
      'info',
      `Creating shots took ${parseHrtimeToSeconds(createShotsStop)} seconds`,
    );

    const executionStop = process.hrtime(executionStart);

    log.process(
      'info',
      `Lost Pixel run took ${parseHrtimeToSeconds(executionStop)} seconds`,
    );

    await sendResultToAPI({
      success: true,
      event: getEventData(config.eventFilePath),
    });
  } catch (error: unknown) {
    // const executionStop = process.hrtime(executionStart);

    if (error instanceof Error) {
      log.process('error', error.message);
    } else {
      log.process('error', error);
    }

    await sendResultToAPI({
      success: false,
      event: getEventData(config.eventFilePath),
    });

    process.exit(1);
  }
};
