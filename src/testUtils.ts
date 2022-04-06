import { CustomProjectConfig } from './config';

export const defaultTestConfig: CustomProjectConfig = {
  lostPixelProjectId: 'lostpixel-test',
  ciBuildId: '123',
  ciBuildNumber: '456',
  repository: 'lostpixel/lostpixel',
  commitRef: 'main',
  commitRefName: 'main',
  commitHash: 'a40a78068c77df941a488ef774a74ca781064d1c',
  s3: {
    endPoint: 's3.amazonaws.com',
    accessKey: '11111111111',
    secretKey: '22222222222',
    bucketName: 'lostpixel-demo',
  },
};
