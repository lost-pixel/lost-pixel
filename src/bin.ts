#!/usr/bin/env node

import { log } from './utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import path from 'path';

type CommandArgs = ['init-js', 'init-ts'];

const args = yargs(hideBin(process.argv)).parse();
const commandArgs = args._ as CommandArgs;

if (commandArgs.includes('init-js')) {
  log('Initializing javascript lost-pixel config');
  log('__dirname', __dirname);
  log('workdir', process.cwd());

  fs.copy(
    path.join(__dirname, '../example.lostpixel.config.js'),
    path.join(__dirname, '../lostpixel.config.js'),
  );
  log('✅ Config successfully initialized');
} else if (commandArgs.includes('init-ts')) {
  log('Initializing typescript lost-pixel config');
  log('__dirname', __dirname);
  log('workdir', process.cwd());

  // replace local type resolution with module resolution
  const file = fs.readFileSync(
    path.join(__dirname, '../example.lostpixel.config.ts'),
  );
  const modifiedFile = file
    .toString()
    .replace('./src/config', 'lost-pixel-action');

  fs.writeFileSync(
    path.join(__dirname, '../lostpixel.config.ts'),
    modifiedFile,
  );
  log('✅ Config successfully initialized');
} else {
  require('./runner');
}
