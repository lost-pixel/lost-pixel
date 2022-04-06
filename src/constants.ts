import path, { join } from 'path';

export const configFileNameBase = path.join(process.cwd(), 'lostpixel.config');

export const shotConcurrency = Number(process.env.SHOT_CONCURRENCY) || 5;

export const imagePathBase = process.env.IMAGE_PATH_BASE || '';

export const relativeImagePathBaseline =
  process.env.IMAGE_PATH_BASELINE || '.lostpixel/baseline/';

export const imagePathBaseline = join(imagePathBase, relativeImagePathBaseline);

export const relativeImagePathCurrent =
  process.env.IMAGE_PATH_CURRENT || '.lostpixel/current/';

export const imagePathCurrent = join(imagePathBase, relativeImagePathCurrent);

export const relativeImagePathDifference =
  process.env.IMAGE_PATH_DIFFERENCE || '.lostpixel/difference/';

export const imagePathDifference = join(
  imagePathBase,
  relativeImagePathDifference,
);
