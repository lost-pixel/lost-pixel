// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    breakpoints: [320, 768],
  },
  generateOnly: true,
  failOnDifference: true,
};
