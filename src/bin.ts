#!/usr/bin/env node

import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import { log } from './log';
import { getPlatformApiToken, platformRunner, runner } from './runner';
import {
  getVersion,
  isDockerMode,
  isSitemapPageGenMode,
  isLocalDebugMode,
  isPlatformDebugMode,
} from './utils';
import { sendFinalizeToAPI } from './api';
import { config, configure, isPlatformModeConfig } from './config';
import { runInDocker } from './docker-runner';
import { generatePagesFromSitemap } from './generatePagesFromSitemap';

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
  if (isSitemapPageGenMode()) {
    await generatePagesFromSitemap();

    return;
  }

  if (isDockerMode()) {
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
    await configure({
      localDebugMode: isLocalDebugMode(),
    });

    if (isPlatformModeConfig(config)) {
      log.process(
        'info',
        'general',
        `🚀 Starting Lost Pixel in 'platform' mode`,
      );
      log.process(
        'info',
        'general',
        process.env.LOST_PIXEL_PLATFORM_DEBUG_MODE,
      );
      log.process('info', 'general', process.env.GITHUB_WORKFLOW);
      log.process('info', 'general', isPlatformDebugMode());

      if (isPlatformDebugMode()) {
        log.process(
          'info',
          'general',
          '🔩 Running in Platform debug mode. lost-pixel.config.ts|js & GitHub action yml will be printed to console.',
        );
        log.process('info', 'general', '🗃️ Config object:');
        log.process('info', 'general', JSON.stringify(config, null, 2));

        // Extend here with reading the path to workflow and printing it
        const workflowFilePath = process.env.GITHUB_WORKFLOW;

        if (workflowFilePath) {
          // eslint-disable-next-line max-depth
          try {
            const workflowFileContent = fs.readFileSync(
              path.resolve(workflowFilePath),
              'utf8',
            );

            log.process(
              'info',
              'general',
              `📄 Workflow file (${workflowFilePath}) content:`,
            );
            log.process('info', 'general', workflowFileContent);
          } catch {
            log.process(
              'error',
              'general',
              `❌ Failed to read workflow file at ${workflowFilePath}`,
            );
          }
        }
      }

      const apiToken = await getPlatformApiToken(config);

      if (commandArgs.includes('finalize')) {
        await sendFinalizeToAPI(config, apiToken);
      } else {
        await platformRunner(config, apiToken);
      }
    } else {
      log.process(
        'info',
        'general',
        `🚀 Starting Lost Pixel in 'generateOnly' mode`,
      );

      await runner(config);
    }
  }
})();
