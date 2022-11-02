// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './examples/example-storybook-v6.5-storystore-v7/storybook-static',
  },
  generateOnly: true,
  failOnDifference: true,
  browser:'firefox'
};
