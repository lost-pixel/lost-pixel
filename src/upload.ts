import { mapLimit } from 'async';
import { MEDIA_UPLOAD_CONCURRENCY } from './config';
import type { PlatformModeConfig } from './config';
import type { ExtendedShotItem } from './types';
import { uploadShot } from './api';
import { log } from './log';
import { parseHrtimeToSeconds } from './utils';

export const uploadRequiredShots = async (
  config: PlatformModeConfig,
  apiToken: string,
  uploadToken: string,
  requiredFileHashes: string[],
  extendedShotItems: ExtendedShotItem[],
) => {
  if (requiredFileHashes.length > 0) {
    log.process('info', 'api', '📤 Uploading shots');

    const uploadStart = process.hrtime();

    await mapLimit<[number, ExtendedShotItem], void>(
      extendedShotItems.entries(),
      MEDIA_UPLOAD_CONCURRENCY,
      async ([index, shotItem]: [number, ExtendedShotItem]) => {
        const logger = log.item({
          shotMode: shotItem.shotMode,
          uniqueItemId: shotItem.shotName,
          itemIndex: index,
          totalItems: requiredFileHashes.length,
        });

        await uploadShot(
          config,
          apiToken,
          uploadToken,
          `${shotItem.shotMode}/${shotItem.shotName}`,
          shotItem.filePathCurrent,
          logger,
        );
      },
    );

    const uploadStop = process.hrtime(uploadStart);

    log.process(
      'info',
      'api',
      `📤 Uploading shots took ${parseHrtimeToSeconds(uploadStop)} seconds`,
    );
  }

  return true;
};
