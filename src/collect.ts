import { mapLimit } from 'async';
import type { UploadedObjectInfo } from 'minio';
import { uploadFile } from './upload';
import { getChanges, getImageList, prepareComparisonList } from './utils';
import { config, MEDIA_UPLOAD_CONCURRENCY } from './config';
import { log } from './log';
import type { UploadFile } from './types';

export const collect = async () => {
  if (config.generateOnly) {
    return;
  }

  log('Collecting files');

  const baseline = getImageList(config.imagePathBaseline);
  const current = getImageList(config.imagePathCurrent);
  const difference = getImageList(config.imagePathDifference);

  if (baseline === null && current === null) {
    throw new Error(
      'Error: No baseline or current images found. Check paths configuration.',
    );
  }

  log(`Found ${baseline?.length ?? 0} baseline images`);
  log(`Found ${current?.length ?? 0} current images`);
  log(`Found ${difference?.length ?? 0} difference images`);

  const files = {
    baseline: baseline ?? [],
    current: current ?? [],
    difference: difference ?? [],
  };

  const changes = getChanges(files);

  log(`Preparing comparison list`);

  const s3BaseUrl =
    config.s3.baseUrl ??
    `https://${config.s3.bucketName}.${config.s3.endPoint}`;

  const [comparisons, uploadList] = prepareComparisonList({
    changes,
    baseUrl: [s3BaseUrl, config.lostPixelProjectId, config.ciBuildId].join('/'),
  });

  log(`Uploading ${uploadList.length} files`);

  await mapLimit<UploadFile, UploadedObjectInfo>(
    uploadList,
    MEDIA_UPLOAD_CONCURRENCY,
    async ({ uploadPath, filePath, metaData }: UploadFile) =>
      uploadFile({
        uploadPath,
        filePath,
        metaData,
      }),
  );

  log(JSON.stringify(comparisons, null, 2));

  return comparisons;
};
