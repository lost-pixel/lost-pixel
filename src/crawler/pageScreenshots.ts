import path from 'node:path';
import { config, PageScreenshotParameter } from '../config';
import { ShotItem } from '../shots/shots';

export const generatePageShotItems = (
  pages: PageScreenshotParameter[],
  pageBaselineUrl: string,
): ShotItem[] => {
  const names = pages.map((page) => page.name);
  const uniqueNames = new Set(names);

  if (names.length !== uniqueNames.size) {
    throw new Error('Error: Page names must be unique');
  }

  return pages.map((page) => {
    return {
      id: page.name,
      url: path.join(pageBaselineUrl, page.path),
      filePathBaseline: `${path.join(config.imagePathBaseline, page.name)}.png`,
      filePathCurrent: `${path.join(config.imagePathCurrent, page.name)}.png`,
      filePathDifference: `${path.join(
        config.imagePathDifference,
        page.name,
      )}.png`,
      threshold: 0,
    };
  });
};
