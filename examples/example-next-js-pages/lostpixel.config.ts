// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/app', name: 'app' },
      { path: '/next-app', name: 'next-app' },
      { path: '/next-app?name=App', name: 'next-app-with-query-param' },
      { path: '/fetch', name: 'fetch-static-props' },
      { path: '/client-fetch', name: 'fetch-client' },
    ],
    pageUrl: 'http://localhost:3000',
  },
  generateOnly: true,
  failOnDifference: true,
};
