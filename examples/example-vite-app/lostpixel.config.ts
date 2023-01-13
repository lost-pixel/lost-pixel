import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [{ path: '', name: 'app' }],
    baseUrl: 'http://localhost:61001',
  },
  generateOnly: true,
  failOnDifference: true,
};
