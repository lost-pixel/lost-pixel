// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  ladleShots: {
    ladleUrl: 'http://localhost:61000',
    breakpoints: [368, 1024],
  },
  generateOnly: true,
  failOnDifference: true,
};
