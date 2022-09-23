import { logMemory } from './log';
import { config } from './config';
import { sendToAPI } from './api';
import type { WebhookEvent } from './types';

export const sendResultToAPI = async ({
  success,
  event,
}: {
  success: boolean;
  event?: WebhookEvent;
}) => {
  if (config.generateOnly) {
    return;
  }

  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI({
    action: 'next',
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
