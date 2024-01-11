 // @ts-nocheck 
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  histoireShots:{
    histoireUrl: './.histoire/dist',

  },
  threshold:0.04,
  generateOnly: true,
  failOnDifference: true,
};
