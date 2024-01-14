import path from 'node:path';
import axios from 'axios';
import type { BrowserType } from 'playwright-core';
import { config, isPlatformModeConfig, type Mask } from '../config';
import type { ShotItem } from '../types';
import { selectBreakpoints, generateLabel } from '../shots/utils';
import { notSupported } from '../constants';
import type { Story } from './storybook';

export const generateLadleShotItems = (
  baseUrl: string,
  isLocalServer: boolean,
  ladleStories: Story[],
  mask?: Mask[],
  modeBreakpoints?: number[],
  browser?: BrowserType,
): ShotItem[] => {
  const ladleUrl = isLocalServer ? `${baseUrl}/index.html` : baseUrl;

  return ladleStories.flatMap((ladleStory): ShotItem[] => {
    const shotName =
      config.shotNameGenerator?.({ ...ladleStory, shotMode: 'ladle' }) ??
      ladleStory.id;
    let label = generateLabel({ browser });
    let fileNameWithExt = `${shotName}${label}.png`;

    const shotItem: ShotItem = {
      shotMode: 'ladle',
      id: `${ladleStory.story}${label}`,
      shotName: `${shotName}${label}`,
      url: `${ladleUrl}?story=${ladleStory.story}&mode=preview`,
      filePathBaseline: isPlatformModeConfig(config)
        ? notSupported
        : path.join(config.imagePathBaseline, fileNameWithExt),
      filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
      filePathDifference: isPlatformModeConfig(config)
        ? notSupported
        : path.join(config.imagePathDifference, fileNameWithExt),
      threshold: config.threshold,
      mask: mask ?? [],
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
    data: ladleMeta,
  }: {
    data: {
      stories: {
        id: string;
      };
    };
  } = await axios.get(`${ladleUrl}/meta.json`);

  const collection: Story[] | undefined = Object.keys(ladleMeta.stories).map(
    (storyKey) => ({ id: storyKey, story: storyKey, kind: storyKey }),
  );

  return collection;
};
