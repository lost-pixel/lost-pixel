import { config, configure } from './config';
import { sendToAPI } from './api';
import { log } from './log';

export const sendFinalizeToAPI = async () => {
  await configure();
  log.process('info', 'Successfully loaded the configuration!');

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
