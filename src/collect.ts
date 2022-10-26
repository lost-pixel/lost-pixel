import { getImageList } from './utils';
import { config } from './config';
import { log } from './log';

export const collect = async () => {
  if (config.generateOnly) {
    return;
  }

  log.process('info', 'general', 'Collecting files');

  const baseline = getImageList(config.imagePathBaseline);
  const current = getImageList(config.imagePathCurrent);

  if (baseline === null && current === null) {
    throw new Error(
      'Error: No baseline or current images found. Check paths configuration.',
    );
  }

  log.process(
    'info',
    'general',
    `Found ${baseline?.length ?? 0} baseline images`,
  );
  log.process(
    'info',
    'general',
    `Found ${current?.length ?? 0} current images`,
  );

  return {
    baseline: baseline ?? [],
    current: current ?? [],
  };
};
