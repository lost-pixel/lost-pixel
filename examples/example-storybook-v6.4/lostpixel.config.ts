// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    elementLocator: '#root > *:first-child',
  },
  generateOnly: true,
  failOnDifference: true,
};
