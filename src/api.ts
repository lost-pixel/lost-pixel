import { createReadStream } from 'node:fs';
import FormData from 'form-data';
import axios from 'axios';
import { log, logMemory } from './log';
import type { LogMemory } from './log';
import type { PlatformModeConfig } from './config';
import { getVersion } from './utils';

type ApiAction =
  | 'getApiToken'
  | 'init'
  | 'finalize'
  | 'prepareUpload'
  | 'uploadShot'
  | 'processShots'
  | 'recordLogs';

const version = getVersion();

export const apiClient = axios.create({
  headers: {
    'Content-type': 'application/json',
    'x-api-version': '3',
    'x-client-version': version ?? 'unknown',
  },
});

const apiRoutes: Record<ApiAction, string> = {
  getApiToken: '/auth/get-api-token',
  init: '/app/init',
  finalize: '/app/finalize',
  prepareUpload: '/file/prepare-upload',
  uploadShot: '/file/upload-shot',
  processShots: '/app/process-shots',
  recordLogs: '/app/record-logs',
};

type ApiPayloadGetApiToken = {
  projectId: string;
};

type ApiPayloadInit = {
  commit: string;
  branchName: string;
  buildNumber: string;
};

type ApiPayloadFinalize = {
  projectId: string;
  branchName: string;
  commit: string;
  buildNumber: string;
};

type ApiPayloadPrepareUpload = {
  branchName: string;
  commit: string;
  buildNumber: string;
  currentShots: Array<{
    name: string;
    hash: string;
  }>;
};

type ApiPayloadUploadShot = {
  uploadToken: string;
  name: string;
  file: string;
};

export type ShotConfig = {
  name: string;
  threshold?: number;
};

type ApiPayloadProcessShots = {
  uploadToken: string;
  config: {
    threshold?: number;
    shots?: ShotConfig[];
  };
  log: LogMemory;
};

type ApiPayloadRecordLogs = {
  commit: string;
  branchName: string;
  buildNumber: string;
  log: LogMemory;
};

type ApiPayload<A extends ApiAction, P extends Record<string, unknown>> = {
  action: A;
  apiToken?: string;
  payload: P;
};

type ApiPayloads =
  | ApiPayload<'getApiToken', ApiPayloadGetApiToken>
  | ApiPayload<'init', ApiPayloadInit>
  | ApiPayload<'finalize', ApiPayloadFinalize>
  | ApiPayload<'prepareUpload', ApiPayloadPrepareUpload>
  | ApiPayload<'uploadShot', ApiPayloadUploadShot>
  | ApiPayload<'processShots', ApiPayloadProcessShots>
  | ApiPayload<'recordLogs', ApiPayloadRecordLogs>;

export const sendToAPI = async <T extends Record<string, unknown>>(
  config: PlatformModeConfig,
  parameters: ApiPayloads,
  fileKey?: string,
  customLogger?: ReturnType<typeof log.item>,
): Promise<T> => {
  const logger = customLogger?.process ?? log.process;

  logger('info', 'api', `⚡️ Sending to API [${parameters.action}]`);

  try {
    let payload: ApiPayloads['payload'] | FormData = parameters.payload;

    if (fileKey) {
      const form = new FormData();

      for (const [key, element] of Object.entries(parameters.payload)) {
        if (key === fileKey) {
          form.append(key, createReadStream(element as string));
        } else {
          form.append(key, element);
        }
      }

      payload = form;
    }

    const response = await apiClient.post(
      `${config.lostPixelPlatform}${apiRoutes[parameters.action]}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${parameters.apiToken ?? ''}`,
          'x-api-key': config.apiKey ?? 'undefined',
        },
      },
    );

    if (response.status !== 200 && response.status !== 201) {
      logger(
        'error',
        'api',
        `Error: Failed to send to API [${parameters.action}]. Status: ${response.status} ${response.statusText}`,
      );

      process.exit(1);
    }

    const outdatedApiRequest = response?.headers?.['x-api-version-warning'];

    if (
      outdatedApiRequest &&
      (parameters.action === 'prepareUpload' ||
        parameters.action === 'finalize')
    ) {
      logger(
        'info',
        'api',
        [
          '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
          `~~ ⚠️  ${outdatedApiRequest}`,
          '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        ].join('\n'),
      );
    }

    logger('info', 'api', `🤘 Successfully sent to API [${parameters.action}]`);

    return response.data as T;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger(
        'error',
        'api',
        'API response: ',
        error.response?.data || error.message,
      );
    } else if (error instanceof Error) {
      logger('error', 'api', error.message);
    } else {
      logger('error', 'api', error);
    }

    if (parameters.action === 'getApiToken') {
      process.exit(1);
    }

    throw error;
  }
};

export const getApiToken = async (config: PlatformModeConfig) => {
  return sendToAPI<{ apiToken: string }>(config, {
    action: 'getApiToken',
    payload: {
      projectId: config.lostPixelProjectId,
    },
  });
};

export const sendInitToAPI = async (
  config: PlatformModeConfig,
  apiToken: string,
) => {
  return sendToAPI(config, {
    action: 'init',
    apiToken,
    payload: {
      commit: config.commitHash,
      branchName: config.commitRefName,
      buildNumber: config.ciBuildNumber,
    },
  });
};

export const sendFinalizeToAPI = async (
  config: PlatformModeConfig,
  apiToken: string,
) => {
  return sendToAPI(config, {
    action: 'finalize',
    apiToken,
    payload: {
      projectId: config.lostPixelProjectId,
      branchName: config.commitRefName,
      commit: config.commitHash,
      buildNumber: config.ciBuildNumber,
    },
  });
};

export const prepareUpload = async (
  config: PlatformModeConfig,
  apiToken: string,
  shotNamesWithHashes: Array<{
    name: string;
    hash: string;
  }>,
) => {
  return sendToAPI<{ requiredFileHashes: string[]; uploadToken: string }>(
    config,
    {
      action: 'prepareUpload',
      apiToken,
      payload: {
        branchName: config.commitRefName,
        commit: config.commitHash,
        buildNumber: config.ciBuildNumber,
        currentShots: shotNamesWithHashes,
      },
    },
  );
};

export const uploadShot = async (
  config: PlatformModeConfig,
  apiToken: string,
  uploadToken: string,
  name: string,
  file: string,
  logger?: ReturnType<typeof log.item>,
) => {
  return sendToAPI<{
    success: true;
    details: {
      projectId: string;
      commit: string;
      buildNumber: string;
      branchName: string;
      name: string;
    };
  }>(
    config,
    {
      action: 'uploadShot',
      apiToken,
      payload: {
        uploadToken,
        name,
        file,
      },
    },
    'file',
    logger,
  );
};

export const processShots = async (
  config: PlatformModeConfig,
  apiToken: string,
  uploadToken: string,
  shotsConfig?: ApiPayloadProcessShots['config']['shots'],
) => {
  return sendToAPI<{ success: true }>(config, {
    action: 'processShots',
    apiToken,
    payload: {
      uploadToken,
      config: {
        shots: shotsConfig,
        threshold: config.threshold,
      },
      log: logMemory,
    },
  });
};

export const sendRecordLogsToAPI = async (
  config: PlatformModeConfig,
  apiToken: string,
) => {
  return sendToAPI(config, {
    action: 'recordLogs',
    apiToken,
    payload: {
      branchName: config.commitRefName,
      buildNumber: config.ciBuildNumber,
      commit: config.commitHash,
      log: logMemory,
    },
  });
};
