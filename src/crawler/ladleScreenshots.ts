import path from 'node:path';
import axios from 'axios';
import { config } from '../config';
import { ShotItem } from '../shots/shots';
import { Story } from './storybook';

export const generateLadleShotItems = (
  ladleUrl: string,
  ladleStories: Story[],
): ShotItem[] => {
  return ladleStories.map((ladleStory) => {
    return {
      id: ladleStory.story,
      url: `${ladleUrl}/?story=${ladleStory.story}&mode=preview`,
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
      threshold: 0,
    };
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
