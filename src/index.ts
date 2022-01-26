import { sendToAPI, uploadFile } from './upload';
import {
  getChanges,
  getEventData,
  getImageList,
  imagePathCurrent,
  imagePathDifference,
  imagePathReference,
  log,
  prepareComparisonList,
} from './utils';

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
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
});

const run = async () => {
  log('Collecting files');

  const reference = getImageList(imagePathReference);
  const current = getImageList(imagePathCurrent);
  const difference = getImageList(imagePathDifference);

  if (reference === null && current === null) {
    throw new Error(
      'No reference or current images found. Check paths configuration.',
    );
  }

  log(`Found ${reference?.length ?? 0} reference images`);
  log(`Found ${current?.length ?? 0} current images`);
  log(`Found ${difference?.length ?? 0} difference images`);

  const files = {
    reference: reference || [],
    current: current || [],
    difference: difference || [],
  };

  try {
    const changes = getChanges(files);

    log(`Preparing comparison list`);

    const s3BaseUrl =
      process.env.S3_BASE_URL ||
      `https://${process.env.S3_BUCKET_NAME}.${process.env.S3_END_POINT}`;

    const [comparisons, uploadList] = prepareComparisonList({
      changes,
      baseUrl: [
        s3BaseUrl,
        process.env.LOST_PIXEL_PROJECT_ID,
        process.env.CI_BUILD_ID,
      ].join('/'),
    });

    await sendToAPI({
      comparisons,
      event: getEventData(process.env.EVENT_PATH || '/event.json'),
    });

    log(`Uploading ${uploadList.length} files`);

    const uploadPromises = uploadList.map(uploadFile);

    await Promise.all(uploadPromises);

    log(JSON.stringify(comparisons, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(error.message);
    } else {
      log(error);
    }

    process.exit(1);
  }
};

run();
