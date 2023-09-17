#!/usr/bin/env node

import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import { log } from './log';
import { getPlatformApiToken, platformRunner, runner } from './runner';
import { getVersion } from './utils';
import { sendFinalizeToAPI } from './api';
import { config, configure } from './config';
import { runInDocker } from './docker-runner';

type CommandArgs = ['docker', 'init-js', 'init-ts', 'finalize'];

const args = yargs(hideBin(process.argv)).parse();
// @ts-expect-error TBD
const commandArgs = args._ as CommandArgs;

const version = getVersion();

if (version) {
  log.process('info', 'general', `Version: ${version}`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  if (commandArgs.includes('docker')) {
    await runInDocker();
  } else if (commandArgs.includes('init-js')) {
    log.process('info', 'general', 'Initializing javascript lost-pixel config');

    await fs.copy(
      path.join(
        __dirname,
        '..',
        'config-templates',
        'example.lostpixel.config.js',
      ),
      path.join(process.cwd(), './lostpixel.config.js'),
    );
    log.process('info', 'general', '✅ Config successfully initialized');
  } else if (commandArgs.includes('init-ts')) {
    log.process('info', 'general', 'Initializing typescript lost-pixel config');

    // Replace local type resolution with module resolution
    const file = fs.readFileSync(
      path.join(
        __dirname,
        '..',
        'config-templates',
        'example.lostpixel.config.ts',
      ),
    );
    const modifiedFile = file.toString().replace('../src/config', 'lost-pixel');

    fs.writeFileSync(
      path.join(process.cwd(), './lostpixel.config.ts'),
      modifiedFile,
    );
    log.process('info', 'general', '✅ Config successfully initialized');
  } else {
    await configure();

    if (config.generateOnly) {
      log.process(
        'info',
        'general',
        `🚀 Starting Lost Pixel in 'generateOnly' mode`,
      );

      await runner(config);
    } else {
      log.process(
        'info',
        'general',
        `🚀 Starting Lost Pixel in 'platform' mode`,
      );

      const apiToken = await getPlatformApiToken(config);

      if (commandArgs.includes('finalize')) {
        await sendFinalizeToAPI(config, apiToken);
      } else {
        await platformRunner(config, apiToken);
      }
    }
  }
})();
