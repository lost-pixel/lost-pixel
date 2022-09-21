import path from 'node:path';
import { config } from '../config';
import type { PageScreenshotParameter } from '../config';
import type { ShotItem } from '../types';

const generateBrowserConfig = (page: PageScreenshotParameter) => {
  const browserConfig = config.configureBrowser?.({
    ...page,
    shotMode: 'page',
  });

  if (page.viewport && browserConfig) {
    browserConfig.viewport = browserConfig.viewport ?? {
      width: 1280,
      height: 720,
    };
    browserConfig.viewport = {
      ...browserConfig.viewport,
      ...page.viewport,
    };
  }

  return browserConfig;
};

export const generatePageShotItems = (
  pages: PageScreenshotParameter[],
  baseUrl: string,
): ShotItem[] => {
  const names = pages.map((page) => page.name);
  const uniqueNames = new Set(names);

  if (names.length !== uniqueNames.size) {
    throw new Error('Error: Page names must be unique');
  }

  return pages.map((page) => {
    return {
      shotMode: 'page',
      id: page.name,
      shotName: config.shotNameGenerator
        ? config.shotNameGenerator({ ...page, shotMode: 'page' })
        : page.name,
      url: path.join(baseUrl, page.path),
      filePathBaseline: `${path.join(config.imagePathBaseline, page.name)}.png`,
      filePathCurrent: `${path.join(config.imagePathCurrent, page.name)}.png`,
      filePathDifference: `${path.join(
        config.imagePathDifference,
        page.name,
      )}.png`,
      browserConfig: generateBrowserConfig(page),
      threshold: page.threshold ?? config.threshold,
      waitBeforeScreenshot:
        page.waitBeforeScreenshot ?? config.waitBeforeScreenshot,
    };
  });
};
