import path from 'node:path';
import axios from 'axios';
import type { BrowserType } from 'playwright-core';
import { log } from '../log';
import { config, isPlatformModeConfig } from '../config';
import { type ShotItem } from '../types';
import { notSupported } from '../constants';
import { generateLabel } from '../shots/utils';
import micromatch from 'micromatch';

type HistoireStory = {
  id: string;
  title: string;
  group: string | undefined;
  layout: {
    type: string;
    width: string;
  };
  relativePath: string;
  variants?: HistoireStory[];
};

type HistoireResponse = {
  stories: HistoireStory[];
};

const generateShotItemsForStory = (
  story: HistoireStory,
  baseUrl: string,
  browser?: BrowserType,
): ShotItem[] => {
  const shotItems: ShotItem[] = [];

  // Treat stories without variants as if they had a single variant
  const variants = story.variants ?? [story];

  for (const variant of variants) {
    const shotName =
      config.shotNameGenerator?.({ ...variant, shotMode: 'histoire' }) ??
      `${story.id}_${variant.title}`;
    const label = generateLabel({ browser });
    const fileNameWithExt = `${shotName}${label}.png`;

    shotItems.push({
      shotMode: 'histoire',
      id: `${story.id}_${variant.id}${label}`,
      shotName: `${shotName}${label}`,
      url: `${baseUrl}/__sandbox.html?storyId=${story.id}&variantId=${variant.id}`,
      filePathBaseline: isPlatformModeConfig(config)
        ? notSupported
        : path.join(config.imagePathBaseline, fileNameWithExt),
      filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
      filePathDifference: isPlatformModeConfig(config)
        ? notSupported
        : path.join(config.imagePathDifference, fileNameWithExt),
      threshold: config.threshold,
      waitForSelector: config?.histoireShots?.waitForSelector,
    });
  }

  return shotItems.filter((story) => story.id !== 'full-config');
};

export const generateHistoireShotItems = (
  baseUrl: string,
  stories: HistoireStory[],
  browser?: BrowserType,
): ShotItem[] => {
  return stories.flatMap((story) =>
    generateShotItemsForStory(story, baseUrl, browser),
  );
};

export const collectHistoireStories = async (histoireUrl: string) => {
  const jsonUrl = `${histoireUrl}/histoire.json`;

  log.process('info', 'general', `\n=== [Histoire Mode] ${jsonUrl} ===\n`);
  const response = await axios.get<HistoireResponse>(jsonUrl);

  const filteredStories = response.data.stories.filter(
    (story) =>
      !micromatch.isMatch(
        story.relativePath,
        config.histoireShots?.exclude || [],
      ),
  );
  // Ignore the full-config story from Histoire as it is just JSON
  return filteredStories;
};
