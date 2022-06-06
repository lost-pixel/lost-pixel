import { Client as MinioClient } from 'minio';
import { log, logMemory } from './log';
import { config } from './config';
import { sendToAPI } from './api';
import { Comparison, UploadFile, WebhookEvent } from './types';

let minio: MinioClient;

const setupMinio = () =>
  new MinioClient({
    endPoint: config.s3.endPoint,
    region: config.s3.region ?? undefined,
    accessKey: config.s3.accessKey,
    secretKey: config.s3.secretKey,
    sessionToken: config.s3.sessionToken ?? undefined,
    port: config.s3.port ? Number(config.s3.port) : 443,
    useSSL: config.s3.ssl,
  });

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
      (error, objectInfo) => {
        if (error) {
          reject(error);
        } else {
          resolve(objectInfo);
        }
      },
    );
  });
};

export const sendResultToAPI = async ({
  success,
  comparisons,
  event,
}: {
  success: boolean;
  comparisons?: Comparison[];
  event?: WebhookEvent;
}) => {
  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI('result', {
    projectId: config.lostPixelProjectId,
    buildId: config.ciBuildId,
    buildNumber: config.ciBuildNumber,
    branchRef: config.commitRef,
    branchName: config.commitRefName,
    repoOwner,
    repoName,
    commit: config.commitHash,
    buildMeta: event,
    comparisons: comparisons ?? [],
    success,
    log: logMemory,
  });
};
