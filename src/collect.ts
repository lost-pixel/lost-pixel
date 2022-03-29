import { sendToAPI, uploadFile } from './upload';
import {
  getChanges,
  getEventData,
  getImageList,
  imagePathCurrent,
  imagePathDifference,
  imagePathBaseline,
  log,
  prepareComparisonList,
} from './utils';

export const collect = async () => {
  log('Collecting files');

  const baseline = getImageList(imagePathBaseline);
  const current = getImageList(imagePathCurrent);
  const difference = getImageList(imagePathDifference);

  if (baseline === null && current === null) {
    log(
      'Error: No baseline or current images found. Check paths configuration.',
    );

    process.exit(1);
  }

  log(`Found ${baseline?.length ?? 0} baseline images`);
  log(`Found ${current?.length ?? 0} current images`);
  log(`Found ${difference?.length ?? 0} difference images`);

  const files = {
    baseline: baseline || [],
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
      event: process.env.EVENT_PATH
        ? getEventData(process.env.EVENT_PATH)
        : undefined,
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
