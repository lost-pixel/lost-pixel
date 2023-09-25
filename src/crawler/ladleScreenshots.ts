import path from 'node:path';
import axios from 'axios';
import { config, type Mask } from '../config';
import type { ShotItem } from '../types';
import { selectBreakpoints, generateSizeLabel } from '../shots/utils';
import type { Story } from './storybook';

export const generateLadleShotItems = (
  baseUrl: string,
  isLocalServer: boolean,
  ladleStories: Story[],
  mask?: Mask[],
  modeBreakpoints?: number[],
): ShotItem[] => {
  const ladleUrl = isLocalServer ? `${baseUrl}/index.html` : baseUrl;

  return ladleStories.flatMap((ladleStory): ShotItem[] => {
    const configLevelBreakpoints = config.breakpoints ?? [];

    const breakpoints = selectBreakpoints(
      configLevelBreakpoints,
      modeBreakpoints,
      ladleStory.parameters?.lostpixel?.breakpoints,
    );

    const shotItem: ShotItem = {
      shotMode: 'ladle',
      id: ladleStory.story,
      shotName: config.shotNameGenerator
        ? config.shotNameGenerator({ ...ladleStory, shotMode: 'ladle' })
        : ladleStory.id,
      url: `${ladleUrl}?story=${ladleStory.story}&mode=preview`,
      filePathBaseline: `${path.join(
        config.imagePathBaseline,
        ladleStory.story,
      )}.png`,
      filePathCurrent: `${path.join(
        config.imagePathCurrent,
        ladleStory.story,
      )}.png`,
      filePathDifference: `${path.join(
        config.imagePathDifference,
        ladleStory.story,
      )}.png`,
      threshold: config.threshold,
      mask: mask ?? [],
    };

    if (!breakpoints || breakpoints.length === 0) {
      return [shotItem];
    }

    return breakpoints.map((breakpoint) => {
      const sizeLabel = generateSizeLabel(breakpoint);

      return {
        ...shotItem,
        id: `${ladleStory.story}${sizeLabel}`,
        shotName: `${ladleStory.story}${sizeLabel}`,
        breakpoint,
        breakpointGroup: ladleStory.story,
        url: `${ladleUrl}?story=${ladleStory.story}&mode=preview&width=${breakpoint}`,
        filePathBaseline: `${path.join(
          config.imagePathBaseline,
          ladleStory.story,
        )}${sizeLabel}.png`,
        filePathCurrent: `${path.join(
          config.imagePathCurrent,
          ladleStory.story,
        )}${sizeLabel}.png`,
        filePathDifference: `${path.join(
          config.imagePathDifference,
          ladleStory.story,
        )}${sizeLabel}.png`,
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
