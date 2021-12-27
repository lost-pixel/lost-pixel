import { uploadFile } from './upload';
import { getChanges, getImageList, prepareComparisonList } from './utils';

const requiredEnvVars = [
  'LOST_PIXEL_URL',
  'LOST_PIXEL_PROJECT_ID',
  'CI_BUILD_ID',
  'S3_END_POINT',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET_NAME',
  'S3_BASE_URL',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
});

const run = async () => {
  const files = {
    reference: getImageList(
      process.env.IMAGE_PATH_REFERENCE || './.loki/reference/',
    ),
    current: getImageList(process.env.IMAGE_PATH_CURRENT || './.loki/current/'),
    difference: getImageList(
      process.env.IMAGE_PATH_DIFFERENCE || './.loki/difference/',
    ),
  };

  const changes = getChanges(files);

  const [comparisons, uploadList] = prepareComparisonList({
    changes,
    baseUrl: process.env.S3_BASE_URL || '--unknown--',
  });

  const uploadPromises = uploadList.map(uploadFile);

  await Promise.all(uploadPromises);
};

run();
