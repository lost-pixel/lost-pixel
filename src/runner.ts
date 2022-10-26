import fse from 'fs-extra';

import { checkDifferences } from './checkDifferences';
import { createShots } from './createShots';
import {
  createShotsFolders,
  exitProcess,
  // getEventData,
  hashFile,
  isUpdateMode,
  parseHrtimeToSeconds,
  removeFilesInFolder,
} from './utils';
import type { FullConfig, PlatformModeConfig } from './config';
import type { ShotConfig } from './api';
import { getApiToken, prepareUpload, processShots, sendInitToAPI } from './api';
import { log } from './log';
import type { ShotItem } from './types';
import { uploadRequiredShots } from './upload';

export const runner = async (config: FullConfig) => {
  const executionStart = process.hrtime();

  try {
    if (isUpdateMode()) {
      log.process(
        'info',
        'Running lost-pixel in update mode. Baseline screenshots will be updated',
      );
    }

    log.process('info', '📂 Creating shot folders');
    const createShotsStart = process.hrtime();

    createShotsFolders();

    log.process('info', '📸 Creating shots');
    const shotItems = await createShots();

    const createShotsStop = process.hrtime(createShotsStart);

    log.process(
      'info',
      `Creating shots took ${parseHrtimeToSeconds(createShotsStop)} seconds`,
    );

    if (config.generateOnly && shotItems.length === 0) {
      log.process('info', `👋 Exiting process with nothing to compare.`);
      exitProcess({ shotsNumber: shotItems.length });
    }

    log.process('info', '🔍 Checking differences');
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
        `👋 Exiting process with ${differenceCount} found differences & ${noBaselinesCount} baselines to update`,
      );

      if (config.generateOnly) {
        exitProcess({ shotsNumber: shotItems.length });
      }
    }

    const checkDifferenceStop = process.hrtime(checkDifferenceStart);

    log.process(
      'info',
      `⏱ Checking differences took ${parseHrtimeToSeconds(
        checkDifferenceStop,
      )} seconds`,
    );

    const executionStop = process.hrtime(executionStart);

    log.process(
      'info',
      `⏱ Lost Pixel run took ${parseHrtimeToSeconds(executionStop)} seconds`,
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

export const getPlatformApiToken = async (config: PlatformModeConfig) => {
  if (!config.apiKey) {
    log.process(
      'error',
      `Running Lost Pixel in 'platform' mode requires an API key`,
    );
    process.exit(1);
  }

  if (isUpdateMode()) {
    log.process(
      'error',
      `Running Lost Pixel in 'update' mode requires the 'generateOnly' option to be set to true`,
    );
    process.exit(1);
  }

  try {
    const result = await getApiToken(config);

    return result.apiToken;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.process('error', error.message);
    } else {
      log.process('error', error);
    }

    process.exit(1);
  }
};

export const platformRunner = async (
  config: PlatformModeConfig,
  apiToken: string,
) => {
  const executionStart = process.hrtime();

  try {
    if (config.setPendingStatusCheck) {
      await sendInitToAPI(config, apiToken);
    }

    log.process('info', '📂 Creating shot folders');
    const createShotsStart = process.hrtime();

    createShotsFolders();

    log.process('info', '📸 Creating shots');
    const shotItems = await createShots();

    const createShotsStop = process.hrtime(createShotsStart);

    log.process(
      'info',
      `⏱  Creating shots took ${parseHrtimeToSeconds(createShotsStop)} seconds`,
    );

    const fileHashMap = new Map<string, ShotItem>();
    const fileNamesWithHashes = shotItems.map((shotItem) => {
      const hash = hashFile(shotItem.filePathCurrent);

      fileHashMap.set(hash, shotItem);

      return {
        name: `${shotItem.shotMode}/${shotItem.shotName}`,
        hash,
      };
    });

    const { requiredFileHashes, uploadToken } = await prepareUpload(
      config,
      apiToken,
      fileNamesWithHashes,
    );

    log.process(
      'info',
      [
        `🏙 `,
        `${shotItems.length} shot(s) in total.`,
        `${
          shotItems.length - requiredFileHashes.length
        } shot(s) already exist on platform.`,
        `${requiredFileHashes.length} shot(s) will be uploaded.`,
      ].join(' '),
    );

    await uploadRequiredShots(
      config,
      apiToken,
      uploadToken,
      requiredFileHashes,
      fileHashMap,
    );

    // TODO: read in thresholds of indivdual shot configs
    const shotsConfig: ShotConfig[] = [];

    await processShots(config, apiToken, uploadToken, shotsConfig);

    const executionStop = process.hrtime(executionStart);

    log.process(
      'info',
      `⏱  Lost Pixel run took ${parseHrtimeToSeconds(executionStop)} seconds`,
    );
  } catch (error: unknown) {
    // TODO
    // const executionStop = process.hrtime(executionStart);

    if (error instanceof Error) {
      log.process('error', error.message);
    } else {
      log.process('error', error);
    }

    // await sendResultToAPI({
    //   success: false,
    //   apiToken,
    //   event: getEventData(config.eventFilePath),
    // });

    process.exit(1);
  }
};
