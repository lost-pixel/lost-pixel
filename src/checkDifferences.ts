import { existsSync } from 'fs';
import { compareImages } from './compare/compare';
import { ShotItem } from './shots/shots';
import { log } from './utils';

export const checkDifferences = async (shotItems: ShotItem[]) => {
  log(`Comparing ${shotItems.length} screenshots`);

  shotItems.forEach(async (shotItem) => {
    log(`Comparing '${shotItem.id}'`);

    const currentImageExists = existsSync(shotItem.filePathCurrent);

    if (!currentImageExists) {
      log(`Error: Missing current image: ${shotItem.filePathCurrent}`);
      process.exit(1);
    }

    const pixelDifference = await compareImages(
      shotItem.filePathBaseline,
      shotItem.filePathCurrent,
      shotItem.filePathDifference,
    );

    if (pixelDifference > 0) {
      log(
        `Difference of ${pixelDifference} pixels found. Difference image saved to: ${shotItem.filePathDifference}`,
      );
    } else {
      log(`No difference found.`);
    }
  });
};
