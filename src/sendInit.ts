import { config } from './config';
import { sendToAPI } from './api';

export const sendInitToAPI = async () => {
  const [repoOwner, repoName] = config.repository.split('/');

  return sendToAPI('init', {
    projectId: config.lostPixelProjectId,
    branchName: config.commitRefName,
    repoOwner,
    repoName,
    commit: config.commitHash,
  });
};
