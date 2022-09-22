import axios from 'axios';
import { log } from './log';
import { config } from './config';

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

type ApiPayload<A extends ApiAction, P extends Record<string, unknown>> = {
  action: A;
  payload: P;
};

type ApiPayloads =
  | ApiPayload<'getApiToken', ApiPayloadGetApiToken>
  | ApiPayload<'init', ApiPayloadInit>;

export const sendToAPI = async (parameters: ApiPayloads) => {
  log.process('info', `Sending to API [${parameters.action}]`);

  try {
    const response = await apiClient.post(
      `${config.lostPixelPlatform}${apiRoutes[parameters.action]}`,
      parameters.payload,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey ?? ''}`,
        },
      },
    );

    if (response.status !== 200) {
      log.process(
        'error',
        `Error: Failed to send to API [${parameters.action}]. Status: ${response.status} ${response.statusText}`,
      );

      process.exit(1);
    }

    const outdatedApiRequest = response?.headers?.['x-api-version-warning'];

    if (outdatedApiRequest) {
      log.process(
        'info',
        [
          '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
          `~~ ${outdatedApiRequest}`,
          '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        ].join('\n'),
      );
    }
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

  log.process('info', `Successfully sent to API [${parameters.action}]`);
};
