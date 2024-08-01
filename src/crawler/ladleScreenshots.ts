import path from 'node:path';
import axios from 'axios';
import type { BrowserType } from 'playwright-core';
import { config, isPlatformModeConfig, type Mask } from '../config';
import type { ShotItem } from '../types';
import { selectBreakpoints, generateLabel } from '../shots/utils';
import { notSupported } from '../constants';
import type { Story } from './storybook';

type LadleStoryConfig = {
  name: string;
  filePath: string;
  meta: Record<string, unknown>;
};

export const generateLadleShotItems = (
  baseUrl: string,
  isLocalServer: boolean,
  ladleStories: Story[],
  mask?: Mask[],
  modeBreakpoints?: number[],
  browser?: BrowserType,
): ShotItem[] => {
  const ladleUrl = isLocalServer ? `${baseUrl}/index.html` : baseUrl;

  return ladleStories
    .filter((story) => story.parameters?.lostpixel?.disable !== true)
    .filter((story) =>
      config.filterShot
        ? config.filterShot({ ...story, shotMode: 'ladle' })
        : true,
    )
    .flatMap((ladleStory): ShotItem[] => {
      const shotName =
        config.shotNameGenerator?.({ ...ladleStory, shotMode: 'ladle' }) ??
        ladleStory.id;
      let label = generateLabel({ browser });
      let fileNameWithExt = `${shotName}${label}.png`;

      const shotItem: ShotItem = {
        shotMode: 'ladle',
        id: `${ladleStory.story}${label}`,
        shotName: `${shotName}${label}`,
        importPath: ladleStory.importPath,
        url: `${ladleUrl}?story=${ladleStory.story}&mode=preview`,
        filePathBaseline: isPlatformModeConfig(config)
          ? notSupported
          : path.join(config.imagePathBaseline, fileNameWithExt),
        filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
        filePathDifference: isPlatformModeConfig(config)
          ? notSupported
          : path.join(config.imagePathDifference, fileNameWithExt),
        threshold:
          ladleStory.parameters?.lostpixel?.threshold ?? config.threshold,
        waitBeforeScreenshot:
          ladleStory.parameters?.lostpixel?.waitBeforeScreenshot ??
          config.waitBeforeScreenshot,
        mask: [
          ...(mask ?? []),
          ...(ladleStory.parameters?.lostpixel?.mask ?? []),
        ],
        elementLocator:
          ladleStory.parameters?.lostpixel?.elementLocator ??
          config?.storybookShots?.elementLocator ??
          '',
        waitForSelector:
          config?.ladleShots?.waitForSelector ?? '[data-storyloaded]',
      };

      const breakpoints = selectBreakpoints(
        config.breakpoints,
        modeBreakpoints,
        ladleStory.parameters?.lostpixel?.breakpoints,
      );

      if (breakpoints.length === 0) {
        return [shotItem];
      }

      return breakpoints.map((breakpoint) => {
        label = generateLabel({ breakpoint, browser });
        fileNameWithExt = `${shotName}${label}.png`;

        return {
          ...shotItem,
          id: `${ladleStory.story}${label}`,
          shotName: `${ladleStory.story}${label}`,
          breakpoint,
          breakpointGroup: ladleStory.story,
          url: `${ladleUrl}?story=${ladleStory.story}&mode=preview&width=${breakpoint}`,
          filePathBaseline: isPlatformModeConfig(config)
            ? notSupported
            : path.join(config.imagePathBaseline, fileNameWithExt),
          filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
          filePathDifference: isPlatformModeConfig(config)
            ? notSupported
            : path.join(config.imagePathDifference, fileNameWithExt),
          viewport: { width: breakpoint },
        };
      });
    });
};

export const collectLadleStories = async (ladleUrl: string) => {
  const {
    data,
  }: {
    data: {
      stories: LadleStoryConfig[];
    };
  } = await axios.get(`${ladleUrl}/meta.json`);

  const collection: Story[] = [];

  for (const [key, storyConfig] of Object.entries(data.stories)) {
    collection.push({
      id: key,
      story: key,
      kind: key,
      importPath: storyConfig.filePath,
      parameters: storyConfig.meta,
    });
  }

  return collection;
};
