// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  ladleShots: {
    ladleUrl: './build',
    breakpoints: [368, 1024],
  },
  generateOnly: true,
  failOnDifference: true,
};
