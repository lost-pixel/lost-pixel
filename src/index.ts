import { collect } from './collect';
import { createShots } from './createShots';
import { log } from './utils';

const requiredEnvVars = [
  'LOST_PIXEL_PROJECT_ID',
  'CI_BUILD_ID',
  'CI_BUILD_NUMBER',
  'S3_END_POINT',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET_NAME',
  'REPOSITORY',
  'COMMIT_REF',
  'COMMIT_REF_NAME',
  'COMMIT_HASH',
  'STORYBOOK_PATH',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    log(`Error: Missing required env var: ${envVar}`);
    process.exit(1);
  }
});

(async () => {
  await createShots();

  await collect();
})();
