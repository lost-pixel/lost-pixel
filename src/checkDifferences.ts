import { mapLimit } from 'async';
import { existsSync } from 'fs';
import { compareImages } from './compare/compare';
import { ShotItem } from './shots/shots';
import { log } from './utils';
import { config } from './config';

export const checkDifferences = async (shotItems: ShotItem[]) => {
  log(`Comparing ${shotItems.length} screenshots`);

  const total = shotItems.length;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.shotConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = (message: string) =>
        log(`[${index + 1}/${total}] ${message}`);

      logger(`Comparing '${shotItem.id}'`);

      const baselineImageExists = existsSync(shotItem.filePathBaseline);

      if (!baselineImageExists) {
        logger('Baseline image missing. Will be treated as addition.');
        return;
      }
      const currentImageExists = existsSync(shotItem.filePathCurrent);

      if (!currentImageExists) {
        logger(`Error: Missing current image: ${shotItem.filePathCurrent}`);
        process.exit(1);
      }

      const pixelDifference = await compareImages(
        shotItem.filePathBaseline,
        shotItem.filePathCurrent,
        shotItem.filePathDifference,
      );

      if (pixelDifference > 0) {
        logger(
          `Difference of ${pixelDifference} pixels found. Difference image saved to: ${shotItem.filePathDifference}`,
        );
      } else {
        logger(`No difference found.`);
      }
    },
  );

  log('Comparison done!');
};
