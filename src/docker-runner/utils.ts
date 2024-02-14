import execa from 'execa';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { isLocalDebugMode, isUpdateMode, shallGenerateMeta } from '../utils';

type ParsedYargs = {
  configDir?: string;
  dockerArgs?: string;
};

export const executeDockerRun = async ({ version }: { version: string }) => {
  const isUpdateModeEnabled = isUpdateMode();
  const isGenerateMetaEnabled = shallGenerateMeta();
  const isLocalDebugModeEnabled = isLocalDebugMode();

  const argv = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  const args = [
    'run',
    '--rm',
    // TODO: remove interactive mode for now, while it clashes with Tauri execution
    // '-it',
    `-v ${process.cwd()}:${process.cwd()}`,
    `-e WORKSPACE=${process.cwd()}`,
    '-e DOCKER=1',
    argv.configDir ? `-e LOST_PIXEL_CONFIG_DIR=${argv.configDir}` : '',
    isUpdateModeEnabled ? '-e LOST_PIXEL_MODE=update' : '',
    isGenerateMetaEnabled ? '-e LOST_PIXEL_GENERATE_META=true' : '',
    isLocalDebugModeEnabled ? '-e LOST_PIXEL_LOCAL=true' : '',
    // Usage: npx lost-pixel docker --dockerArgs="x y -z"
    ...(argv.dockerArgs ? argv.dockerArgs.split(' ').filter(arg => arg.trim()) : []),
    `lostpixel/lost-pixel:v${version}`,
  ];

  return execa('docker', args, { shell: true, stdio: 'inherit' });
};
