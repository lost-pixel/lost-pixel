import { join } from 'path';
import { config } from './config';

export const shotConcurrency = Number(process.env.SHOT_CONCURRENCY) || 5;

export const relativeImagePathBaseline =
  process.env.IMAGE_PATH_BASELINE || '.lostpixel/baseline/';

export const imagePathBaseline = join(
  config.imagePathRoot,
  relativeImagePathBaseline,
);

export const relativeImagePathCurrent =
  process.env.IMAGE_PATH_CURRENT || '.lostpixel/current/';

export const imagePathCurrent = join(
  config.imagePathRoot,
  relativeImagePathCurrent,
);

export const relativeImagePathDifference =
  process.env.IMAGE_PATH_DIFFERENCE || '.lostpixel/difference/';

export const imagePathDifference = join(
  config.imagePathRoot,
  relativeImagePathDifference,
);
