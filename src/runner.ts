import fse from 'fs-extra';

import { checkDifferences } from './checkDifferences';
import { createShots } from './createShots';
import {
  createShotsFolders,
  exitProcess,
  hashFile,
  isUpdateMode,
  parseHrtimeToSeconds,
  removeFilesInFolder,
} from './utils';
import type { FullConfig, PlatformModeConfig } from './config';
import type { ShotConfig } from './api';
import {
  getApiToken,
  prepareUpload,
  processShots,
  sendInitToAPI,
  sendRecordLogsToAPI,
} from './api';
import { log } from './log';
import type { ExtendedShotItem } from './types';
import { uploadRequiredShots } from './upload';

export const runner = async (config: FullConfig) => {
  const executionStart = process.hrtime();

  try {
    if (isUpdateMode()) {
      log.process(
        'info',
        'general',
        'Running lost-pixel in update mode. Baseline screenshots will be updated',
      );
    }

    log.process('info', 'general', '📂 Creating shot folders');
    const createShotsStart = process.hrtime();

    createShotsFolders();

    log.process('info', 'general', '📸 Creating shots');
    const shotItems = await createShots();

    const createShotsStop = process.hrtime(createShotsStart);

    log.process(
      'info',
      'general',
      `Creating shots took ${parseHrtimeToSeconds(createShotsStop)} seconds`,
    );

    if (config.generateOnly && shotItems.length === 0) {
      log.process(
        'info',
        'general',
        `👋 Exiting process with nothing to compare.`,
      );
      await exitProcess({ shotsNumber: shotItems.length });
    }

    log.process('info', 'general', '🔍 Checking differences');
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
        'general',
        `👋 Exiting process with ${differenceCount} found differences & ${noBaselinesCount} baselines to update`,
      );

      if (config.generateOnly) {
        await exitProcess({ shotsNumber: shotItems.length });
      }
    }

    const checkDifferenceStop = process.hrtime(checkDifferenceStart);

    log.process(
      'info',
      'general',
      `⏱  Checking differences took ${parseHrtimeToSeconds(
        checkDifferenceStop,
      )} seconds`,
    );

    const executionStop = process.hrtime(executionStart);

    log.process(
      'info',
      'general',
      `⏱  Lost Pixel run took ${parseHrtimeToSeconds(executionStop)} seconds`,
    );

    await exitProcess({
      shotsNumber: shotItems.length,
      runDuration: Number(parseHrtimeToSeconds(executionStop)),
      exitCode: 0,
    });
  } catch (error: unknown) {
    const executionStop = process.hrtime(executionStart);

    if (error instanceof Error) {
      log.process('error', 'general', error.message);
    } else {
      log.process('error', 'general', error);
    }

    await exitProcess({
      runDuration: Number(parseHrtimeToSeconds(executionStop)),
      error,
    });
  }
};

export const getPlatformApiToken = async (config: PlatformModeConfig) => {
  if (!config.apiKey) {
    log.process(
      'error',
      'general',
      `Running Lost Pixel in 'platform' mode requires an API key`,
    );
    process.exit(1);
  }

  if (isUpdateMode()) {
    log.process(
      'error',
      'general',
      `Running Lost Pixel in 'update' mode requires the 'generateOnly' option to be set to true`,
    );
    process.exit(1);
  }

  try {
    const result = await getApiToken(config);

    return result.apiToken;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.process('error', 'general', error.message);
    } else {
      log.process('error', 'general', error);
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
    log.process(
      'info',
      'general',
      [
        '📀 Using details:',
        `ciBuildId = ${config.ciBuildId}`,
        `ciBuildNumber = ${config.ciBuildNumber}`,
        `repository = ${config.repository}`,
        `commitRefName = ${config.commitRefName}`,
        `commitHash = ${config.commitHash}`,
      ].join('\n   - '),
    );

    if (config.setPendingStatusCheck) {
      await sendInitToAPI(config, apiToken);
    }

    log.process('info', 'general', '📂 Creating shot folders');
    const createShotsStart = process.hrtime();

    createShotsFolders();

    log.process('info', 'general', '📸 Creating shots');
    const shotItems = await createShots();

    const createShotsStop = process.hrtime(createShotsStart);

    log.process(
      'info',
      'general',
      `⏱  Creating shots took ${parseHrtimeToSeconds(createShotsStop)} seconds`,
    );

    const extendedShotItems: ExtendedShotItem[] = shotItems.map((shotItem) => ({
      ...shotItem,
      uniqueName: `${shotItem.shotMode}/${shotItem.shotName}`,
      hash: hashFile(shotItem.filePathCurrent),
    }));

    const { requiredFileHashes, uploadToken, uploadUrl } = await prepareUpload(
      config,
      apiToken,
      extendedShotItems.map((shotItem) => ({
        name: shotItem.uniqueName,
        hash: shotItem.hash,
      })),
    );

    log.process(
      'info',
      'general',
      [
        `🏙 `,
        `${shotItems.length} shot(s) in total.`,
        `${
          shotItems.length - requiredFileHashes.length
        } shot(s) already exist on platform.`,
        `${requiredFileHashes.length} shot(s) will be uploaded.`,
      ].join(' '),
    );

    await uploadRequiredShots({
      config,
      apiToken,
      uploadToken,
      uploadUrl,
      requiredFileHashes,
      extendedShotItems,
    });

    const shotsConfig: ShotConfig[] = shotItems.map((shotItem) => ({
      name: shotItem.shotName,
      threshold: shotItem.threshold,
    }));

    await processShots(config, apiToken, uploadToken, shotsConfig);

    const executionStop = process.hrtime(executionStart);

    log.process(
      'info',
      'general',
      `⏱  Lost Pixel run took ${parseHrtimeToSeconds(executionStop)} seconds`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.process('error', 'general', error.message);
    } else {
      log.process('error', 'general', error);
    }

    log.process('info', 'general', '🪵  Sending logs to platform.');

    await sendRecordLogsToAPI(config, apiToken);

    process.exit(1);
  }
};
