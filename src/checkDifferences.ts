import { existsSync } from 'node:fs';
import { mapLimit } from 'async';
import { compareImages } from './compare/compare';
import { log } from './log';
import { config, isPlatformModeConfig } from './config';
import type { ShotItem } from './types';
import { featureNotSupported } from './utils';

type ComparisonResult = {
  pixelDifference: number;
  pixelDifferencePercentage: number;
  isWithinThreshold: boolean;
};

export type Difference = {
  status: 'added' | 'changed' | 'equivalent';
  comparisonResult?: ComparisonResult;
};

export const checkDifference = async ({
  item: [index, shotItem],
  total,
}: {
  item: [number, ShotItem];
  total?: number;
}): Promise<Difference> => {
  const logger = (message: string) => {
    log
      .item({
        shotMode: shotItem.shotMode,
        uniqueItemId: shotItem.shotName,
        itemIndex: index,
        totalItems: total ?? 1,
      })
      .process('info', 'general', message);
  };

  logger(`Comparing '${shotItem.id}'`);

  const baselineImageExists = existsSync(shotItem.filePathBaseline);

  if (!baselineImageExists) {
    logger('Baseline image missing. Will be treated as addition.');

    return { status: 'added' };
  }

  const currentImageExists = existsSync(shotItem.filePathCurrent);

  if (!currentImageExists) {
    throw new Error(
      `Error: Missing current image: ${shotItem.filePathCurrent}`,
    );
  }

  const comparisonResult = await compareImages(
    shotItem.threshold,
    shotItem.filePathBaseline,
    shotItem.filePathCurrent,
    shotItem.filePathDifference,
  );

  if (comparisonResult.pixelDifference > 0) {
    const percentage = (
      comparisonResult.pixelDifferencePercentage * 100
    ).toFixed(2);

    if (comparisonResult.isWithinThreshold) {
      logger(
        `Difference of ${comparisonResult.pixelDifference} pixels (${percentage}%) found but within threshold.`,
      );

      return { status: 'equivalent', comparisonResult };
    }

    logger(
      `Difference of ${comparisonResult.pixelDifference} pixels (${percentage}%) found. Difference image saved to: ${shotItem.filePathDifference}`,
    );

    return { status: 'changed', comparisonResult };
  }

  logger('No difference found.');

  return { status: 'equivalent', comparisonResult };
};

export type Differences = {
  noBaselinesItems: ShotItem[];
  aboveThresholdDifferenceItems: ShotItem[];
  comparisonResults: Record<string, ComparisonResult>;
};

export const checkDifferences = async (
  shotItems: ShotItem[],
): Promise<Differences> => {
  if (isPlatformModeConfig(config)) {
    return featureNotSupported('checkDifferences()');
  }

  log.process(
    'info',
    'general',
    `Comparing ${shotItems.length} screenshots using '${config.compareEngine}' as compare engine`,
  );

  const differences: Differences = {
    aboveThresholdDifferenceItems: [],
    comparisonResults: {},
    noBaselinesItems: [],
  };

  await mapLimit<[number, ShotItem], void>(
    shotItems.entries(),
    config.compareConcurrency,
    async (item: [number, ShotItem]) => {
      const difference = await checkDifference({
        item,
        total: shotItems.length,
      });

      addDifferenceToDifferences({
        difference,
        differences,
        shotItem: item[1]
      })
    },
  );

  log.process('info', 'general', 'Comparison done!');

  return differences;
};

export const addDifferenceToDifferences = ({
  difference,
  differences,
  shotItem
}: {
  shotItem: ShotItem,
  differences: Differences,
  difference: Difference
}) => {
  if (difference.status === 'added')
    differences.noBaselinesItems.push(shotItem);
  else if (difference.status === 'changed')
    differences.aboveThresholdDifferenceItems.push(shotItem);

  if (difference.comparisonResult)
    differences.comparisonResults[shotItem.id] =
      difference.comparisonResult;
}