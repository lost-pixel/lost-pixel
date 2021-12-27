import { uploadFile } from './upload';
import {
  getChanges,
  getImageList,
  imagePathCurrent,
  imagePathDifference,
  imagePathReference,
  prepareComparisonList,
} from './utils';

const requiredEnvVars = [
  'LOST_PIXEL_URL',
  'LOST_PIXEL_API_KEY',
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
  const reference = getImageList(imagePathReference);
  const current = getImageList(imagePathCurrent);
  const difference = getImageList(imagePathDifference);

  if (reference === null && current === null) {
    throw new Error(
      'No reference or current images found. Check paths configuration.',
    );
  }

  const files = {
    reference: reference || [],
    current: current || [],
    difference: difference || [],
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
