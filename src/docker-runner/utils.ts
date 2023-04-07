import execa from 'execa';
import shell from 'shelljs';
import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';

const isDockerInstalled = () => {
  if (!shell.which('docker')) {
    throw new Error('Docker is not installed');
  }
};

const isLostPixelImageDownloaded = async ({ version }: { version: string }) => {
  isDockerInstalled();
  const { exitCode, stdout, stderr } = await execa('docker', [
    'images',
    '-q',
    `lostpixel/lost-pixel:${version}`,
  ]);

  if (exitCode !== 0) {
    throw new Error(`Not successful docker operation, ${stderr}`);
  }

  return stdout.trim().length > 0;
};

const downloadImageIfNotExistent = async ({ version }: { version: string }) => {
  const doesImageExist = await isLostPixelImageDownloaded({
    version,
  });

  if (!doesImageExist) {
    await execa('docker', ['pull', `lostpixel/lost-pixel:v${version}`]);
  }
};

type ParsedYargs = {
  configDir: 'string';
};

export const executeDockerRun = async ({ version }: { version: string }) => {
  await downloadImageIfNotExistent({ version });

  // @ts-expect-error TBD
  const argv = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  const args = [
    'run',
    '--rm',
    '-it',
    '-e WORKSPACE=/workspace',
    '-e DOCKER=1',
    `-e LOST_PIXEL_CONFIG_DIR=${argv.configDir}`,
    `lostpixel/lost-pixel:v${version}`,
  ];

  return execa('docker', args, { shell: true, stdio: 'inherit' });
};
