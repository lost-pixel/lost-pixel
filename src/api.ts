import axios from 'axios';
import { log } from './log';
import { config } from './config';

type ApiAction = 'init' | 'next' | 'finalize';

export const apiClient = axios.create({
  headers: {
    'Content-type': 'application/json',
  },
});

export const sendToAPI = async (
  action: ApiAction,
  payload: {
    projectId: string;
    branchName: string;
    repoOwner: string;
    repoName: string;
    commit: string;
  } & Record<string, unknown>,
) => {
  log.process('info', `Sending to API [${action}]`);

  try {
    const response = await apiClient.post(
      `${config.lostPixelPlatform}/api/${action}`,
      payload,
    );

    if (response.status !== 200) {
      log.process(
        'error',
        `Error: Failed to send to API [${action}]. Status: ${response.status} ${response.statusText}`,
      );

      process.exit(1);
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

  log.process('info', `Successfully sent to API [${action}]`);
};
