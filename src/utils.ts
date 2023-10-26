import {
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import * as crypto from 'node:crypto';
import type { Buffer } from 'node:buffer';
import { normalize, join } from 'node:path';
import { PostHog } from 'posthog-node';
import { v4 as uuid } from 'uuid';
import { type BrowserType, chromium, firefox, webkit } from 'playwright-core';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { config } from './config';
import { log } from './log';
import type { ShotItem } from './types';

export type ParsedYargs = {
  _: ['update', 'meta', 'docker', 'local'];
  m: 'update';
};

type FilenameWithPath = {
  name: string;
  path: string;
};

type FilenameWithAllPaths = {
  name: string;
  path: string;
  pathCurrent?: string;
};

type Files = {
  baseline: FilenameWithPath[];
  current: FilenameWithPath[];
  difference: FilenameWithPath[];
};

export type Changes = {
  difference: FilenameWithAllPaths[];
  deletion: FilenameWithAllPaths[];
  addition: FilenameWithAllPaths[];
};

const POST_HOG_API_KEY = 'phc_RDNnzvANh1mNm9JKogF9UunG3Ky02YCxWP9gXScKShk';

export const isUpdateMode = (): boolean => {
  // @ts-expect-error TBD
  const args = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  return (
    args._.includes('update') ||
    args.m === 'update' ||
    process.env.LOST_PIXEL_MODE === 'update'
  );
};

export const isDockerMode = (): boolean => {
  // @ts-expect-error TBD
  const args = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  return args._.includes('docker') || process.env.LOST_PIXEL_DOCKER === 'true';
};

export const shallGenerateMeta = (): boolean => {
  // @ts-expect-error TBD
  const args = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  return (
    args._.includes('meta') || process.env.LOST_PIXEL_GENERATE_META === 'true'
  );
};

export const getChanges = (files: Files): Changes => {
  return {
    difference: files.difference
      .map((file) => ({
        ...file,
        pathCurrent: files.current.find(({ name }) => name === file.name)?.path, // Keep track of custom shots path
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    deletion: files.baseline
      .filter(
        (file1) => !files.current.some((file2) => file1.name === file2.name),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
    addition: files.current
      .filter(
        (file1) => !files.baseline.some((file2) => file1.name === file2.name),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
};

type ExtendFileName = {
  fileName: string;
  extension: 'after' | 'before' | 'difference';
};

export const extendFileName = ({ fileName, extension }: ExtendFileName) => {
  const parts = fileName.split('.').filter((part) => part !== '');
  const extensionIndex = parts.length - 1;

  if (parts.length === 1) {
    return `${extension}.${parts[0]}`;
  }

  if (parts.length === 0) {
    return extension;
  }

  parts[extensionIndex] = `${extension}.${parts[extensionIndex]}`;

  return parts.join('.');
};

export const createShotsFolders = () => {
  const paths = [
    config.imagePathBaseline,
    config.imagePathCurrent,
    config.imagePathDifference,
  ];

  for (const path of paths) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }

  const ignoreFile = normalize(
    join(config.imagePathBaseline, '..', '.gitignore'),
  );

  if (!existsSync(ignoreFile)) {
    writeFileSync(ignoreFile, 'current\ndifference\n');
  }
};

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const removeFilesInFolder = (path: string, excludePaths?: string[]) => {
  const files = readdirSync(path);

  const filesPathsIgnoringExclude = files
    .map((file) => join(path, file))
    .filter((filePath) => !excludePaths?.includes(filePath));

  log.process(
    'info',
    'general',
    `Removing ${filesPathsIgnoringExclude.length} files from ${path}`,
  );

  for (const filePath of filesPathsIgnoringExclude) {
    unlinkSync(filePath);
  }
};

export const getBrowser = (): BrowserType => {
  switch (config.browser) {
    case 'chromium': {
      return chromium;
    }

    case 'firefox': {
      return firefox;
    }

    case 'webkit': {
      return webkit;
    }

    default: {
      return chromium;
    }
  }
};

export const getVersion = (): string | void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const packageJson: { version: string } = require('../package.json');

    return packageJson.version;
  } catch {}
};

const fileNameWithoutExtension = (fileName: string): string => {
  return fileName.split('.').slice(0, -1).join('.');
};

export const readDirIntoShotItems = (path: string): ShotItem[] => {
  const files = readdirSync(path);

  return files
    .filter((name) => name.endsWith('.png'))
    .map((fileNameWithExt): ShotItem => {
      const fileName = fileNameWithoutExtension(fileNameWithExt);

      return {
        id: fileName,
        shotName: fileName,
        shotMode: 'custom',
        filePathBaseline: join(config.imagePathBaseline, fileNameWithExt),
        filePathCurrent: join(path, fileNameWithExt),
        filePathDifference: join(config.imagePathDifference, fileNameWithExt),
        url: fileName,
        // TODO: custom shots take thresholds only from config - not possible to source configs from individual story
        threshold: config.threshold,
      };
    });
};

const sendTelemetryData = async (properties: {
  runDuration?: number;
  shotsNumber?: number;
  error?: unknown;
}) => {
  const client = new PostHog(POST_HOG_API_KEY);
  const id: string = uuid();

  try {
    log.process('info', 'general', 'Sending anonymized telemetry data.');

    const version = getVersion() as string;
    const modes = [];

    if (config.storybookShots) modes.push('storybook');

    if (config.ladleShots) modes.push('ladle');

    if (config.pageShots) modes.push('pages');

    if (config.customShots) modes.push('custom');

    if (properties.error) {
      client.capture({
        distinctId: id,
        event: 'lost-pixel-error',
        properties: { ...properties },
      });
    } else {
      client.capture({
        distinctId: id,
        event: 'lost-pixel-run',
        properties: { ...properties, version, modes },
      });
    }

    await client.shutdownAsync();
  } catch (error: unknown) {
    log.process('error', 'general', 'Error when sending telemetry data', error);
  }
};

export const parseHrtimeToSeconds = (hrtime: [number, number]) => {
  const seconds = (hrtime[0] + hrtime[1] / 1e9).toFixed(3);

  return seconds;
};

export const exitProcess = async (properties: {
  runDuration?: number;
  shotsNumber?: number;
  error?: unknown;
  exitCode?: 0 | 1;
}) => {
  if (process.env.LOST_PIXEL_DISABLE_TELEMETRY === '1') {
    process.exit(properties.exitCode ?? 1);
  } else {
    await sendTelemetryData(properties).finally(() => {
      process.exit(properties.exitCode ?? 1);
    });
  }
};

const hashBuffer = (buffer: Buffer): string => {
  const hashSum = crypto.createHash('sha256');

  hashSum.update(buffer);

  return hashSum.digest('hex');
};

export const hashFile = (filePath: string): string => {
  const file = readFileSync(filePath);

  return hashBuffer(file);
};
