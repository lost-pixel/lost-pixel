import path from 'node:path';
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
