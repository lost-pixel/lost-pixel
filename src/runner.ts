import { checkDifferences } from './checkDifferences';
import { collect } from './collect';
import { createShots } from './createShots';
import { createShotsFolders, getEventData, log } from './utils';
import { config, configure } from './config';
import { sendToAPI } from './upload';

(async () => {
  await configure();
  try {
    createShotsFolders();
    const shotItems = await createShots();
    await checkDifferences(shotItems);
    const comparisons = await collect();

    await sendToAPI({
      success: true,
      comparisons,
      event: getEventData(config.eventFilePath),
    });
  } catch (error) {
    if (error instanceof Error) {
      log(error.message);
    } else {
      log(error);
    }

    await sendToAPI({
      success: false,
      event: getEventData(config.eventFilePath),
    });

    process.exit(1);
  }
})();
