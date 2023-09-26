import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { mapLimit } from 'async';
import { compareImages } from './compare/compare';
import { log } from './log';
import { config } from './config';
import type { ShotItem } from './types';
import { shallGenerateMeta } from './utils';

export const checkDifferences = async (shotItems: ShotItem[]) => {
  log.process(
    'info',
    'general',
    `Comparing ${shotItems.length} screenshots using '${config.compareEngine}' as compare engine`,
  );

  const total = shotItems.length;
  const noBaselinesItems: ShotItem[] = [];
  const aboveThresholdDifferenceItems: ShotItem[] = [];

  const comparisonResults: Record<
    string,
    {
      pixelDifference: number;
      pixelDifferencePercentage: number;
      isWithinThreshold: boolean;
    }
  > = {};

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.compareConcurrency,
    async (item: [number, ShotItem]) => {
      const [index, shotItem] = item;
      const logger = (message: string) => {
        log
          .item({
            shotMode: shotItem.shotMode,
            uniqueItemId: shotItem.shotName,
            itemIndex: index,
            totalItems: total,
          })
          .process('info', 'general', message);
      };

      logger(`Comparing '${shotItem.id}'`);

      const baselineImageExists = existsSync(shotItem.filePathBaseline);

      if (!baselineImageExists) {
        logger('Baseline image missing. Will be treated as addition.');
        noBaselinesItems.push(shotItem);

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

      if (shallGenerateMeta()) {
        comparisonResults[shotItem.id] = {
          pixelDifference,
          pixelDifferencePercentage,
          isWithinThreshold,
        };
      }

      if (pixelDifference > 0) {
        const percentage = (pixelDifferencePercentage * 100).toFixed(2);

        if (isWithinThreshold) {
          logger(
            `Difference of ${pixelDifference} pixels (${percentage}%) found but within threshold.`,
          );
        } else {
          aboveThresholdDifferenceItems.push(shotItem);
          logger(
            `Difference of ${pixelDifference} pixels (${percentage}%) found. Difference image saved to: ${shotItem.filePathDifference}`,
          );
        }
      } else {
        logger('No difference found.');
      }
    },
  );

  if (shallGenerateMeta()) {
    log.process(
      'info',
      'general',
      `Writing meta file with ${
        Object.entries(comparisonResults).length
      } items.`,
    );
    writeFileSync(
      `${path.join(config.imagePathCurrent, 'meta')}.json`,
      JSON.stringify(comparisonResults, null, 2),
    );
  }

  log.process('info', 'general', 'Comparison done!');

  return { aboveThresholdDifferenceItems, noBaselinesItems };
};
