import { log } from '../log';
import { getVersion } from '../utils';
import { executeDockerRun } from './utils';

export const runInDocker = async () => {
  const version = getVersion();
  if (version) {
    log(`Running in docker: lost-pixel:${version}`);
    try {
      await executeDockerRun({ version });
    } catch (error: unknown) {
      log(error);
    }
  } else {
    log(
      'Seems like lost-pixel is missing in your package.json. Running lost-pixel@latest',
    );
  }
};
