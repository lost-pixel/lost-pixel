import { Client as MinioClient, ItemBucketMetadata } from 'minio';
import { Comparison, log } from './utils';
import axios from 'axios';
import {
  PullRequestEvent,
  CheckSuiteRequestedEvent,
  CheckRunRerequestedEvent,
} from '@octokit/webhooks-types';

type WebhookEvent =
  | PullRequestEvent
  | CheckSuiteRequestedEvent
  | CheckRunRerequestedEvent;

export const apiClient = axios.create({
  headers: {
    'Content-type': 'application/json',
    'X-API-KEY': process.env.LOST_PIXEL_API_KEY || '--unknown--',
  },
});

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
  event: WebhookEvent;
}) => {
  log('Sending to API');

  const response = await apiClient.post(
    process.env.LOST_PIXEL_URL || 'http://localhost:3000',
    {
      projectId: process.env.LOST_PIXEL_PROJECT_ID,
      buildId: process.env.CI_BUILD_ID,
      buildNumber: process.env.CI_BUILD_NUMBER,
      branchRef: process.env.COMMIT_REF,
      branchName: process.env.COMMIT_REF_NAME,
      owner: event.repository.owner.name,
      repoName: event.repository.name,
      commit: process.env.COMMIT_HASH,
      buildMeta: event,
      comparisons,
    },
  );

  if (response.status !== 200) {
    throw new Error(
      `Failed to send to API. Status: ${response.status} ${response.statusText}`,
    );
  }

  log('Successfully sent to API');
};
