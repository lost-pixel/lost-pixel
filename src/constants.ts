import path from 'path';

export const shotsPath = process.env.SHOTS_PATH?.startsWith('/')
  ? process.env.SHOTS_PATH
  : path.join(process.cwd(), '.lostpixel');

export const shotsBaselinePath = `${shotsPath}/baseline`;

export const shotsCurrentPath = `${shotsPath}/current`;

export const shotsDifferencePath = `${shotsPath}/difference`;

export const shotConcurrency = Number(process.env.SHOT_CONCURRENCY) || 5;
