import { checkDifferences } from './checkDifferences';
import { collect } from './collect';
import { createShots } from './createShots';
import { createShotsFolders, log } from './utils';
import { configure } from './config';

(async () => {
  await configure();
  try {
    createShotsFolders();
    const shotItems = await createShots();
    await checkDifferences(shotItems);
    await collect();
  } catch (error) {
    if (error instanceof Error) {
      log(error.message);
    } else {
      log(error);
    }

    process.exit(1);
  }
})();
