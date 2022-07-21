// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './lost-pixel-example-barebone/storybook-static',
  },
  pageShots: {
    pages: [
      { path:'/app',name:'app' },
      { path:'/next-app',name:'next-app' },
      { path:'/next-app?name=App',name:'next-app-with-query-param' },
      { path:'/fetch',name:'fetch-static-props' },
      { path:'/client-fetch',name:'fetch-client' },
    ],
    pageBaselineUrl:'http://localhost:3000',
  },
  ladleShots:{
    ladleUrl:'http://localhost:61000'
  },
  generateOnly: true,
  failOnDifference: true,
};
