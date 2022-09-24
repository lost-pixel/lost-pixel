// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/app', name: 'app' },
      {
        path: '/app',
        name: 'app-masked',
        mask: [{ selector: 'code' }, { selector: 'h2' }],
      },
      { path: '/next-app', name: 'next-app' },
    ],
    baseUrl: 'http://localhost:3000',
    pagesJsonUrl:'http://localhost:3000/lost-pixel.json'
  },
  generateOnly: true,
  failOnDifference: true,
};
