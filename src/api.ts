import axios from 'axios';
import { log, logMemory } from './log';
import type { LogMemory } from './log';
import { config } from './config';
import type { WebhookEvent } from './types';

type ApiAction = 'getApiToken' | 'init' | 'next' | 'finalize';

export const apiClient = axios.create({
  headers: {
    'Content-type': 'application/json',
    'x-api-version': '3',
  },
});

const apiRoutes: Record<ApiAction, string> = {
  getApiToken: '/auth/get-api-token',
  init: '/app/init',
  next: '/app/next',
  finalize: '/app/finalize',
};

type ApiPayloadGetApiToken = {
  apiKey: string;
  projectIdentifier: string;
};

type ApiPayloadInit = {
  projectId: string;
  branchName: string;
  repoOwner: string;
  repoName: string;
  commit: string;
};

type ApiPayloadNext = {
  projectId: string;
  branchName: string;
  repoOwner: string;
  repoName: string;
  commit: string;
  buildId: string;
  buildNumber: string;
  branchRef: string;
  buildMeta?: WebhookEvent;
  success: boolean;
  log: LogMemory;
};

type ApiPayloadFinalize = {
  projectId: string;
  branchName: string;
  repoOwner: string;
  repoName: string;
  commit: string;
};

type ApiPayload<A extends ApiAction, P extends Record<string, unknown>> = {
  action: A;
  apiToken?: string;
  payload: P;
};

type ApiPayloads =
  | ApiPayload<'getApiToken', ApiPayloadGetApiToken>
  | ApiPayload<'init', ApiPayloadInit>
  | ApiPayload<'next', ApiPayloadNext>
  | ApiPayload<'finalize', ApiPayloadFinalize>;

export const sendToAPI = async <T extends Record<string, unknown>>(
  parameters: ApiPayloads,
): Promise<T> => {
  log.process('info', `⚡️ Sending to API [${parameters.action}]`);

  try {
    const response = await apiClient.post(
      `${config.lostPixelPlatform}${apiRoutes[parameters.action]}`,
      parameters.payload,
      {
        headers: {
          Authorization: `Bearer ${parameters.apiToken ?? ''}`,
        },
      },
    );

    if (response.status !== 200 && response.status !== 201) {
      log.process(
        'error',
        `Error: Failed to send to API [${parameters.action}]. Status: ${response.status} ${response.statusText}`,
      );

      process.exit(1);
    }

    const outdatedApiRequest = response?.headers?.['x-api-version-warning'];

    if (outdatedApiRequest && parameters.action === 'init') {
      log.process(
        'info',
        [
          '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
          `~~ ⚠️  ${outdatedApiRequest}`,
          '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        ].join('\n'),
      );
    }

    log.process('info', `🤘 Successfully sent to API [${parameters.action}]`);

    return response.data as T;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      log.process(
        'error',
        'API response: ',
        error.response?.data || error.message,
      );
    } else if (error instanceof Error) {
      log.process('error', error.message);
    } else {
      log.process('error', error);
    }

    process.exit(1);
  }
};

export const getApiToken = async () => {
  return sendToAPI<{ apiToken: string }>({
    action: 'getApiToken',
    payload: {
      apiKey: config.apiKey ?? 'undefined',
      projectIdentifier: config.lostPixelProjectId ?? 'undefined',
    },
  });
};

export const sendInitToAPI = async (apiToken: string) => {
  if (config.generateOnly) {
    return;
  }

  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI({
    action: 'init',
    apiToken,
    payload: {
      projectId: config.lostPixelProjectId,
      branchName: config.commitRefName,
      repoOwner,
      repoName,
      commit: config.commitHash,
    },
  });
};

export const sendResultToAPI = async ({
  success,
  apiToken,
  event,
}: {
  success: boolean;
  apiToken: string;
  event?: WebhookEvent;
}) => {
  if (config.generateOnly) {
    return;
  }

  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI({
    action: 'next',
    apiToken,
    payload: {
      projectId: config.lostPixelProjectId,
      buildId: config.ciBuildId,
      buildNumber: config.ciBuildNumber,
      branchRef: config.commitRef,
      branchName: config.commitRefName,
      repoOwner,
      repoName,
      commit: config.commitHash,
      buildMeta: event,
      success,
      log: logMemory,
    },
  });
};

export const sendFinalizeToAPI = async (apiToken: string) => {
  if (config.generateOnly) {
    return;
  }

  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI({
    action: 'finalize',
    apiToken,
    payload: {
      projectId: config.lostPixelProjectId,
      branchName: config.commitRefName,
      repoOwner,
      repoName,
      commit: config.commitHash,
    },
  });
};
