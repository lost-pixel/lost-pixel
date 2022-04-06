import { sendToAPI, uploadFile } from './upload';
import {
  getChanges,
  getEventData,
  getImageList,
  log,
  prepareComparisonList,
} from './utils';
import { config } from './config';

export const collect = async () => {
  log('Collecting files');

  const baseline = getImageList(config.imagePathBaseline);
  const current = getImageList(config.imagePathCurrent);
  const difference = getImageList(config.imagePathDifference);

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
      config.s3.baseUrl ||
      `https://${config.s3.bucketName}.${config.s3.endPoint}`;

    const [comparisons, uploadList] = prepareComparisonList({
      changes,
      baseUrl: [
        s3BaseUrl,
        config.lostPixelProjectId,
        config.ciBuildNumber,
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
