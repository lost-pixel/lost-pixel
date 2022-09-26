import { mapLimit } from 'async';
import { MEDIA_UPLOAD_CONCURRENCY } from './config';
import type { PlatformModeConfig } from './config';
import type { ShotItem } from './types';
import { uploadShot } from './api';
import { log } from './log';
import { parseHrtimeToSeconds } from './utils';

export const uploadRequiredShots = async (
  config: PlatformModeConfig,
  apiToken: string,
  uploadToken: string,
  requiredFileHashes: string[],
  fileHashMap: Map<string, ShotItem>,
) => {
  if (requiredFileHashes.length > 0) {
    log.process('info', '📤 Uploading shots');

    const uploadStart = process.hrtime();

    await mapLimit<[number, string], void>(
      requiredFileHashes.entries(),
      MEDIA_UPLOAD_CONCURRENCY,
      async ([index, hash]: [number, string]) => {
        const shotItem = fileHashMap.get(hash);

        if (!shotItem) {
          throw new Error(`Could not find shot item for hash ${hash}`);
        }

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
          shotItem.shotName,
          shotItem.filePathCurrent,
          logger,
        );
      },
    );

    const uploadStop = process.hrtime(uploadStart);

    log.process(
      'info',
      `📤 Uploading shots took ${parseHrtimeToSeconds(uploadStop)} seconds`,
    );
  }

  return true;
};
