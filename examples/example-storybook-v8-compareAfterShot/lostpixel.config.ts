// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    breakpoints: [320, 768],
  },
  generateOnly: true,
  failOnDifference: true,

  compareAfterShot: true,
  flakynessRetries: 10,
  // These times are greatly reduced due to compareAfterShot!
  waitBetweenFlakynessRetries: 200,
  waitBeforeScreenshot: 0,
  waitForFirstRequest: 0,
  waitForLastRequest: 0,
};
