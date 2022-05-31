import { CustomProjectConfig } from './src/config';

export const config: CustomProjectConfig = {
  storybookUrl: 'examples/storybook-build/storybook-static',
  generateOnly: true,
  shotConcurrency: 10,
  lostPixelProjectId: 'project-xxx',
  ciBuildId: '1',
  ciBuildNumber: '1',
  repository: 'demo',
  commitRef: 'main',
  commitRefName: 'main',
  commitHash: '123',
  s3: {
    endPoint: 's3.amazonaws.com',
    accessKey: 'xxx',
    secretKey: 'xxxxx',
    bucketName: 'lostpixel-demo',
  },
};
