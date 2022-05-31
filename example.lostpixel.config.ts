import { CustomProjectConfig } from './src/config';

export const config: CustomProjectConfig = {
  storybookUrl: 'examples/storybook-build/storybook-static',
  generateOnly: true,
  shotConcurrency: 10,
  lostPixelProjectId: 'project-xxx',
  ciBuildId: process.env.GITHUB_RUN_ID,
  ciBuildNumber: process.env.GITHUB_RUN_NUMBER,
  repository: process.env.REPOSITORY,
  commitRef: process.env.COMMIT_REF,
  commitRefName: process.env.COMMIT_REF,
  commitHash: process.env.COMMIT_HASH,
  s3: {
    endPoint: 's3.amazonaws.com',
    accessKey: 'xxx',
    secretKey: 'xxxxx',
    bucketName: 'lostpixel-demo',
  },
};
