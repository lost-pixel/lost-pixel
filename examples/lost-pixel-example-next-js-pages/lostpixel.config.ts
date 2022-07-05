// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path:'/app',name:'app' },
      { path:'/my-app',name:'my-app' },
      { path:'/my-app?name=App',name:'my-app-with-query-param' },
      { path:'/fetch',name:'fetch-static-props' },
      { path:'/client-fetch',name:'fetch-client' },
    ],
    pageBaselineUrl:'http://localhost:3000',
  },
  generateOnly: true,
  failOnDifference: true,
};
