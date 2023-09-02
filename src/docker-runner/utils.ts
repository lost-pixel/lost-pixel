import execa from 'execa';
import shell from 'shelljs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const isDockerInstalled = () => {
  if (!shell.which('docker')) {
    throw new Error('Docker is not installed');
  }
};

type ParsedYargs = {
  configDir: 'string';
};

export const executeDockerRun = async ({ version }: { version: string }) => {
  isDockerInstalled();

  // @ts-expect-error TBD
  const argv = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  const args = [
    'run',
    '--rm',
    '-it',
    `-v ${process.cwd()}:${process.cwd()}`,
    `-e WORKSPACE=${process.cwd()}`,
    '-e DOCKER=1',
    argv.configDir ? `-e LOST_PIXEL_CONFIG_DIR=${argv.configDir}` : '',
    `lostpixel/lost-pixel:v${version}`,
  ];

  return execa('docker', args, { shell: true, stdio: 'inherit' });
};
