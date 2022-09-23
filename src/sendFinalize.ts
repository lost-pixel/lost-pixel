import { config } from './config';
import { sendToAPI } from './api';

export const sendFinalizeToAPI = async () => {
  if (config.generateOnly) {
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
