import { Client as MinioClient } from 'minio';
import { log, logMemory } from './log';
import { config } from './config';
import { sendToAPI } from './api';
import type { Comparison, UploadFile, WebhookEvent } from './types';

let minio: MinioClient;

export const uploadFile = async ({
  uploadPath,
  filePath,
  metaData,
}: UploadFile) => {
  if (config.generateOnly) {
    return;
  }

  log.process('info', `Uploading '${filePath}' to '${uploadPath}'`);

  if (!minio) {
    minio = new MinioClient({
      endPoint: config.s3.endPoint,
      region: config.s3.region ?? undefined,
      accessKey: config.s3.accessKey,
      secretKey: config.s3.secretKey,
      sessionToken: config.s3.sessionToken ?? undefined,
      port: config.s3.port ? Number(config.s3.port) : 443,
      useSSL: config.s3.ssl,
    });
  }

  return new Promise((resolve, reject) => {
    if (config.generateOnly) {
      reject(new Error('Generate only mode'));

      return;
    }

    minio.fPutObject(
      config.s3.bucketName,
      uploadPath,
      filePath,
      metaData,
      (error, objectInfo) => {
        if (error) {
          log.process(
            'error',
            `Error uploading '${filePath}' to '${uploadPath}'`,
          );
          log.process('error', error);
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
  durations,
}: {
  success: boolean;
  comparisons?: Comparison[];
  event?: WebhookEvent;
  durations?: {
    runDuration: number;
    shotsCreationDuration: number;
    differenceComparisonsDuration: number;
  };
}) => {
  if (config.generateOnly) {
    return;
  }

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
    durations,
  });
};
