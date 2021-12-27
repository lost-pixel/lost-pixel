import { Client as MinioClient, ItemBucketMetadata } from 'minio';
import { Comparison, log } from './utils';
import axios from 'axios';

const minio = new MinioClient({
  endPoint: process.env.S3_END_POINT || '--unknown--',
  accessKey: process.env.S3_ACCESS_KEY || '--unknown--',
  secretKey: process.env.S3_SECRET_KEY || '--unknown--',
  port: process.env.S3_END_POINT_PORT
    ? Number(process.env.S3_END_POINT_PORT)
    : 443,
  useSSL: process.env.S3_END_POINT_SSL === '0' ? false : true,
});

export type UploadFile = {
  uploadPath: string;
  filePath: string;
  metaData: ItemBucketMetadata;
};

export const uploadFile = async ({
  uploadPath,
  filePath,
  metaData,
}: UploadFile) => {
  log(`Uploading '${filePath}' to '${uploadPath}'`);

  return minio.fPutObject(
    process.env.S3_BUCKET_NAME || '--unknown--',
    uploadPath,
    filePath,
    metaData,
  );
};

export const sendToAPI = async ({
  comparisons,
  event,
}: {
  comparisons: Comparison[];
  event: Record<string, unknown>;
}) => {
  log('Sending to API');

  const response = await axios.post(
    process.env.LOST_PIXEL_URL || 'http://localhost:3000',
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.LOST_PIXEL_API_KEY || '--unknown--',
      },
      body: JSON.stringify({
        projectId: process.env.LOST_PIXEL_PROJECT_ID,
        buildNumber: process.env.CI_BUILD_ID,
        branchName: process.env.COMMIT_REF,
        commit: process.env.COMMIT_HASH,
        buildMeta: event,
        comparisons,
      }),
    },
  );

  if (!response.data.success) {
    throw new Error(
      `Failed to send to API. Status: ${response.status} ${response.statusText}`,
    );
  }

  log(`Successfully sent to API with response: ${response.status}`);
};
