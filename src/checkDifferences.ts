import { existsSync } from 'fs';
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
  });
};
