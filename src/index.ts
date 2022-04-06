import { checkDifferences } from './checkDifferences';
import { collect } from './collect';
import { createShots } from './createShots';
import { createShotsFolders, log } from './utils';
import { configure, config, FullConfig } from './config';

configure();

const requiredConfigProps: Array<keyof FullConfig> = [
  'lostPixelProjectId',
  'ciBuildId',
  'ciBuildNumber',
  's3EndPoint',
  's3AccessKey',
  's3SecretKey',
  's3BucketName',
  'repository',
  'commitRef',
  'commitRefName',
  'commitHash',
];

requiredConfigProps.forEach((prop) => {
  if (!config[prop]) {
    log(`Error: Missing required configuration property: ${prop}`);
    process.exit(1);
  }
});

(async () => {
  createShotsFolders();
  const shotItems = await createShots();
  await checkDifferences(shotItems);
  await collect();
})();
