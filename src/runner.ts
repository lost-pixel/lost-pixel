import fse from 'fs-extra';

import { checkDifferences } from './checkDifferences';
import { collect } from './collect';
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
import { sendResultToAPI } from './upload';
import { sendInitToAPI } from './sendInit';
import { log } from './log';

export const runner = async () => {
  const executionStart = process.hrtime();

  try {
    if (config.setPendingStatusCheck && !config.generateOnly) {
      await sendInitToAPI();
    }

    if (isUpdateMode()) {
      if (!config.generateOnly) {
        log.process(
          'error',
          'Running lost-pixel in update mode requires the generateOnly option to be set to true',
        );
        process.exit(1);
      }

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

    if (config.generateOnly) {
      exitProcess({
        shotsNumber: shotItems.length,
        runDuration: Number(parseHrtimeToSeconds(executionStop)),
        exitCode: 0,
      });
    } else {
      const comparisons = await collect();

      await sendResultToAPI({
        success: true,
        comparisons,
        event: getEventData(config.eventFilePath),
        durations: {
          runDuration: Number(parseHrtimeToSeconds(executionStop)),
          differenceComparisonsDuration: Number(
            parseHrtimeToSeconds(checkDifferenceStop),
          ),
          shotsCreationDuration: Number(
            parseHrtimeToSeconds(checkDifferenceStop),
          ),
        },
      });
    }
  } catch (error: unknown) {
    const executionStop = process.hrtime(executionStart);

    if (error instanceof Error) {
      log.process('error', error.message);
    } else {
      log.process('error', error);
    }

    if (config.generateOnly) {
      exitProcess({
        runDuration: Number(parseHrtimeToSeconds(executionStop)),
        error,
      });
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

export const platformRunner = async () => {
  const executionStart = process.hrtime();

  if (isUpdateMode()) {
    log.process(
      'error',
      'Running lost-pixel in update mode is not compatible with the platform runner',
    );
    process.exit(1);
  }

  if (config.generateOnly) {
    log.process(
      'error',
      'Running lost-pixel in generateOnly mode is not compatible with the platform runner',
    );
    process.exit(1);
  }

  try {
    if (config.setPendingStatusCheck) {
      await sendInitToAPI();
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
