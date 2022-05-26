#!/usr/bin/env node

import { log } from './utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs-extra';
import path from 'path';

const { _: wildcardArgs } = yargs(hideBin(process.argv)).parse();

if (wildcardArgs.includes('init-js')) {
  log('Initializing javascript lost-pixel config');
  fs.copy(
    path.join(__dirname, '../example.lostpixel.config.js'),
    path.join(__dirname, '../lostpixel.config.js'),
  );
  log('✅ Config successfully initialized');
} else if (wildcardArgs.includes('init-ts')) {
  log('Initializing typescript lost-pixel config');
  fs.copySync(
    path.join(__dirname, '../example.lostpixel.config.ts'),
    path.join(__dirname, '../lostpixel.config.ts'),
  );
  log('✅ Config successfully initialized');
} else {
  require('./runner');
}
