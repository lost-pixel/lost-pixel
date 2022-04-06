import { checkDifferences } from './checkDifferences';
import { collect } from './collect';
import { createShots } from './createShots';
import { createShotsFolders } from './utils';
import { configure } from './config';

(async () => {
  configure();
  createShotsFolders();
  const shotItems = await createShots();
  await checkDifferences(shotItems);
  await collect();
})();
