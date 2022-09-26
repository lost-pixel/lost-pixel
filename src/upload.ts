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

    await mapLimit<string, void>(
      requiredFileHashes,
      MEDIA_UPLOAD_CONCURRENCY,
      async (hash: string) => {
        const shotItem = fileHashMap.get(hash);

        if (!shotItem) {
          throw new Error(`Could not find shot item for hash ${hash}`);
        }

        await uploadShot(
          config,
          apiToken,
          uploadToken,
          shotItem.shotName,
          shotItem.filePathCurrent,
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
