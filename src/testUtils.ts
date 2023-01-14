import type { CustomProjectConfig } from './config';

export const defaultTestConfig: CustomProjectConfig = {
  lostPixelProjectId: 'lostpixel-test',
  ciBuildId: '123',
  ciBuildNumber: '456',
  repository: 'lostpixel/lostpixel',
  commitRefName: 'main',
  commitHash: 'a40a78068c77df941a488ef774a74ca781064d1c',
};
