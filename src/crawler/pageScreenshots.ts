import path from 'node:path';
import axios, { isAxiosError } from 'axios';
import { z } from 'zod';
import { log } from '../log';
import { type Mask, type PageScreenshotParameter, config } from '../config';
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
  mask?: Mask[],
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
      mask: [...(mask ?? []), ...(page.mask ?? [])],
    };
  });
};

export const getPagesFromExternalLoader = async () => {
  try {
    if (!config.pageShots?.pagesJsonUrl) {
      return [];
    }

    log.browser(
      'info',
      'general',
      'Loading pages via external loader file supplied in pagesJsonUrl',
    );

    const { data: pages } = await axios.get<PageScreenshotParameter[]>(
      config.pageShots.pagesJsonUrl,
    );
    const pagesArraySchema = z.array(
      z.object({
        path: z.string(),
        name: z.string(),
        waitBeforeScreenshot: z.number().optional(),
        threshold: z.number().optional(),
        mask: z
          .array(
            z.object({
              selector: z.string(),
            }),
          )
          .optional(),
        viewport: z
          .object({
            width: z.string(),
            height: z.string(),
          })
          .optional(),
      }),
    );

    const validatePages = pagesArraySchema.safeParse(pages);

    if (validatePages.success) {
      return pages;
    }

    log.browser(
      'error',
      'general',
      'Error validating the loaded pages structure',
    );
    log.browser('error', 'general', validatePages.error);

    return [];
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      log.browser(
        'error',
        'network',
        `Error when fetching data: ${error.message}`,
      );
    }

    return [];
  }
};
