import path from 'node:path';
import axios, { isAxiosError } from 'axios';
import { z } from 'zod';
import type { BrowserType } from 'playwright-core';
import { log } from '../log';
import { type Mask, type PageScreenshotParameter, config } from '../config';
import type { ShotItem } from '../types';
import { selectBreakpoints, generateLabel } from '../shots/utils';

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
  modeBreakpoints?: number[],
  browser?: BrowserType,
): ShotItem[] => {
  const names = pages.map((page) => page.name);
  const uniqueNames = new Set(names);

  if (names.length !== uniqueNames.size) {
    throw new Error('Error: Page names must be unique');
  }

  return pages.flatMap((page): ShotItem[] => {
    const shotName =
      config.shotNameGenerator?.({ ...page, shotMode: 'page' }) ?? page.name;
    let label = generateLabel({ browser });
    let fileNameWithExt = `${shotName}${label}.png`;

    const baseShotItem: ShotItem = {
      shotMode: 'page',
      id: `${shotName}${label}`,
      shotName: `${shotName}${label}`,
      url: path.join(baseUrl, page.path),
      filePathBaseline: path.join(config.imagePathBaseline, fileNameWithExt),
      filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
      filePathDifference: path.join(
        config.imagePathDifference,
        fileNameWithExt,
      ),
      browserConfig: generateBrowserConfig(page),
      threshold: page.threshold ?? config.threshold,
      waitBeforeScreenshot:
        page.waitBeforeScreenshot ?? config.waitBeforeScreenshot,
      mask: [...(mask ?? []), ...(page.mask ?? [])],
    };

    const breakpoints = selectBreakpoints(
      config.breakpoints,
      modeBreakpoints,
      page.breakpoints,
    );

    if (!breakpoints || breakpoints.length === 0) {
      return [baseShotItem];
    }

    return breakpoints.map((breakpoint) => {
      label = generateLabel({ breakpoint, browser });
      fileNameWithExt = `${shotName}${label}.png`;

      return {
        ...baseShotItem,
        id: `${shotName}${label}`,
        shotName: `${shotName}${label}`,
        breakpoint,
        breakpointGroup: page.name,
        url: path.join(baseUrl, page.path),
        filePathBaseline: path.join(config.imagePathBaseline, fileNameWithExt),
        filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
        filePathDifference: path.join(
          config.imagePathDifference,
          fileNameWithExt,
        ),
        viewport: { width: breakpoint },
        browserConfig: generateBrowserConfig({
          ...page,
          viewport: { width: breakpoint },
        }),
      };
    });
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

    log.process(
      'error',
      'general',
      'Error validating the loaded pages structure',
    );
    log.process('error', 'general', validatePages.error);

    return [];
  } catch (error: unknown) {
    if (isAxiosError(error) || error instanceof Error) {
      log.process(
        'error',
        'network',
        `Error when fetching data: ${error.message}`,
      );
    }

    return [];
  }
};
