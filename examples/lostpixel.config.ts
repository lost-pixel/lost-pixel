// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  // storybookShots: {
  //   storybookUrl: './lost-pixel-example-barebone/storybook-static',
  // },
  // msw:[
  //   handlers: [
  //     rest.get('/user', (req, res, ctx) => {
  //       return res(
  //         ctx.json({
  //           firstName: 'Neil',
  //           lastName: 'Maverick',
  //         })
  //       )
  //     }),
  //     rest.get('/a', (req, res, ctx) => {
  //       return res(
  //         ctx.json({
  //           firstName: 'Neil',
  //           lastName: 'Maverick',
  //         })
  //       )
  //     }),
  //     rest.get('/b', (req, res, ctx) => {
  //       return res(
  //         ctx.json({
  //           firstName: 'Neil',
  //           lastName: 'Maverick',
  //         })
  //       )
  //     }),
  //     rest.get('/c', (req, res, ctx) => {
  //       return res(
  //         ctx.json({
  //           firstName: 'Neil',
  //           lastName: 'Maverick',
  //         })
  //       )
  //     }),
  //   ]
  // ],
  pageShots: {
    pages: [
      { path:'/app',name:'app' },
      // { path:'/next-app',name:'next-app',params:{viewports:[{height:1200,widht:8000},{height:800,widht:400},{height:500,widht:8000}] },
      // { path:'/next-app',name:'next-app' ,params:{viewport:[580,100],waitBeforeScreen:1000}}, // higher specificiy than config 
      // { path:'/next-app',name:'next-app',params:{viewport:[360,100], mockLostPixel:{
      //   handlers: [
      //     rest.get('/user', (req, res, ctx) => {
      //       return res(
      //         ctx.json({
      //           firstName: 'Neil',
      //           lastName: 'Maverick',
      //         })
      //       )
      //     }),
      //   ]
      // },}, },
      // { path:'/next-app',name:'next-app',params:{viewport:[360,100], msw:{
      //   handlers: [
      //     rest.get('/user', (req, res, ctx) => {
      //       return res(
      //         ctx.json({
      //           firstName: 'Dimitri',
      //         })
      //       )
      //     }),
      //   ]
      // },}, },
      { path:'/next-app?name=App',name:'next-app-with-query-param' },
      { path:'/fetch',name:'fetch' },
      { path:'/client-fetch',name:'fetch-client' },
      { path:'/msw',name:'msw' },
    ],
    pageBaselineUrl:'http://localhost:3000',
  },
  generateOnly: true,
  // failOnDifference: true,
};


// global config !GLOBAL
// page/story/ladle story config !LOCAL


// ------------------------------
// 1. install msw & configure msw on the project
// 2. setup your handlers on global level
// 3  in lost pixel you override your global handlers with msw param