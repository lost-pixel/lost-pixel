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
        breakpoints: [360, 500],
      },
      { path: '/next-app', name: 'next-app' },
    ],
    baseUrl: 'http://127.0.0.1:3000',
    pagesJsonUrl: 'http://127.0.0.1:3000/lost-pixel.json',
    breakpoints: [768, 1024],
  },
  generateOnly: true,
  failOnDifference: true,
};
