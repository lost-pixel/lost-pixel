import { Client as MinioClient, ItemBucketMetadata } from 'minio';
import { Comparison, log, logMemory } from './utils';
import axios from 'axios';
import {
  PullRequestEvent,
  CheckSuiteRequestedEvent,
  CheckRunRerequestedEvent,
} from '@octokit/webhooks-types';
import { config } from './config';

export type WebhookEvent =
  | PullRequestEvent
  | CheckSuiteRequestedEvent
  | CheckRunRerequestedEvent;

export const apiClient = axios.create({
  headers: {
    'Content-type': 'application/json',
  },
});

let minio: MinioClient;

const setupMinio = () =>
  new MinioClient({
    endPoint: config.s3.endPoint,
    region: config.s3.region || undefined,
    accessKey: config.s3.accessKey,
    secretKey: config.s3.secretKey,
    sessionToken: config.s3.sessionToken || undefined,
    port: config.s3.port ? Number(config.s3.port) : 443,
    useSSL: config.s3.ssl,
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

  if (!minio) {
    minio = setupMinio();
  }

  return new Promise((resolve, reject) => {
    minio.fPutObject(
      config.s3.bucketName,
      uploadPath,
      filePath,
      metaData,
      (err, objInfo) => {
        if (err) {
          reject(err);
        } else {
          resolve(objInfo);
        }
      },
    );
  });
};

export const sendToAPI = async ({
  success,
  comparisons,
  event,
}: {
  success: boolean;
  comparisons?: Comparison[];
  event?: WebhookEvent;
}) => {
  log('Sending to API');

  const [repoOwner, repoName] = config.repository.split('/');

  try {
    const response = await apiClient.post(config.lostPixelUrl, {
      projectId: config.lostPixelProjectId,
      buildId: config.ciBuildId,
      buildNumber: config.ciBuildNumber,
      branchRef: config.commitRef,
      branchName: config.commitRefName,
      repoOwner,
      repoName,
      commit: config.commitHash,
      buildMeta: event,
      comparisons: comparisons || [],
      success,
      log: logMemory,
    });

    if (response.status !== 200) {
      log(
        `Error: Failed to send to API. Status: ${response.status} ${response.statusText}`,
      );

      process.exit(1);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      log('API response: ', error.response?.data || error.message);
    } else if (error instanceof Error) {
      log(error.message);
    } else {
      log(error);
    }

    process.exit(1);
  }

  log('Successfully sent to API');
};
