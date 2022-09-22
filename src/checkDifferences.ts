import { existsSync } from 'node:fs';
import { mapLimit } from 'async';
import { compareImages } from './compare/compare';
import { log } from './log';
import { config } from './config';
import type { ShotItem } from './types';

export const checkDifferences = async (shotItems: ShotItem[]) => {
  log.process('info', `Comparing ${shotItems.length} screenshots`);

  const total = shotItems.length;
  let differenceCount = 0;
  let noBaselinesCount = 0;

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.compareConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = (message: string) => {
        log.item(shotItem.shotName, index, total).process('info', message);
      };

      logger(`Comparing '${shotItem.id}'`);

      const baselineImageExists = existsSync(shotItem.filePathBaseline);

      if (!baselineImageExists) {
        logger('Baseline image missing. Will be treated as addition.');
        noBaselinesCount++;

        return;
      }

      const currentImageExists = existsSync(shotItem.filePathCurrent);

      if (!currentImageExists) {
        throw new Error(
          `Error: Missing current image: ${shotItem.filePathCurrent}`,
        );
      }

      const { pixelDifference, pixelDifferencePercentage, isWithinThreshold } =
        await compareImages(
          shotItem.threshold,
          shotItem.filePathBaseline,
          shotItem.filePathCurrent,
          shotItem.filePathDifference,
        );

      if (pixelDifference > 0) {
        const percentage = (pixelDifferencePercentage * 100).toFixed(2);

        if (isWithinThreshold) {
          logger(
            `Difference of ${pixelDifference} pixels (${percentage}%) found but within threshold.`,
          );
        } else {
          differenceCount++;
          logger(
            `Difference of ${pixelDifference} pixels (${percentage}%) found. Difference image saved to: ${shotItem.filePathDifference}`,
          );
        }
      } else {
        logger('No difference found.');
      }
    },
  );

  log.process('info', 'Comparison done!');

  return { differenceCount, noBaselinesCount };
};
