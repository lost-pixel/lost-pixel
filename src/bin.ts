#!/usr/bin/env node

import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import { log } from './utils';

type CommandArgs = ['init-js', 'init-ts'];

const args = yargs(hideBin(process.argv)).parse();
const commandArgs = args._ as CommandArgs;

if (commandArgs.includes('init-js')) {
  log('Initializing javascript lost-pixel config');

  fs.copy(
    path.join(
      __dirname,
      '..',
      'config-templates',
      'example.lostpixel.config.js',
    ),
    path.join(process.cwd(), './lostpixel.config.js'),
  );
  log('✅ Config successfully initialized');
} else if (commandArgs.includes('init-ts')) {
  log('Initializing typescript lost-pixel config');

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
  log('✅ Config successfully initialized');
} else {
  require('./runner');
}
