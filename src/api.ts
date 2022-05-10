import { log } from './utils';
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

export const sendToAPI = async (requestName: string, payload: unknown) => {
  log(`Sending to API [${requestName}]`);

  try {
    const response = await apiClient.post(config.lostPixelUrl, payload);

    if (response.status !== 200) {
      log(
        `Error: Failed to send to API [${requestName}]. Status: ${response.status} ${response.statusText}`,
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

  log(`Successfully sent to API [${requestName}]`);
};
