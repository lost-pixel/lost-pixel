import { config } from './config';
import { sendToAPI } from './api';
import { log } from './log';

export const sendFinalizeToAPI = async () => {
  if (config.generateOnly) {
    log.process(
      'info',
      'Running lost-pixel in generateOnly mode. Skipping sending finalize.',
    );

    return;
  }

  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI({
    action: 'finalize',
    payload: {
      projectId: config.lostPixelProjectId,
      branchName: config.commitRefName,
      repoOwner,
      repoName,
      commit: config.commitHash,
    },
  });
};
