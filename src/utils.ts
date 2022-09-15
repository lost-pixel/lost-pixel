import {
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { normalize, join } from 'node:path';
import { PostHog } from 'posthog-node';
import { v4 as uuid } from 'uuid';
import { BrowserType, chromium, firefox, webkit } from 'playwright';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { config } from './config';
import { log } from './log';
import {
  Comparison,
  ComparisonType,
  ShotItem,
  UploadFile,
  WebhookEvent,
} from './types';

type ParsedYargs = {
  _: ['update'];
  m: 'update';
};

export const isUpdateMode = (): boolean => {
  // @ts-expect-error TBD
  const args = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  return (
    args._.includes('update') ||
    args.m === 'update' ||
    process.env.LOST_PIXEL_MODE === 'update'
  );
};

export type Files = {
  baseline: string[];
  current: string[];
  difference: string[];
};

export type Changes = {
  difference: string[];
  deletion: string[];
  addition: string[];
};

export const getChanges = (files: Files): Changes => {
  return {
    difference: files.difference.sort(),
    deletion: files.baseline
      .filter((file) => !files.current.includes(file))
      .sort(),
    addition: files.current
      .filter((file) => !files.baseline.includes(file))
      .sort(),
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

type CreateUploadItem = {
  uploadFileName: string;
  path: string;
  fileName: string;
  type: ComparisonType;
};

const createUploadItem = ({
  uploadFileName,
  path,
  fileName,
  type,
}: CreateUploadItem): UploadFile => {
  if (config.generateOnly) {
    throw new Error("Can't create upload item when generateOnly is true");
  }

  const filePath = normalize(join(path, fileName));

  return {
    uploadPath: join(
      config.lostPixelProjectId,
      config.ciBuildId,
      uploadFileName,
    ),
    filePath,
    metaData: {
      'content-type': 'image/png',
      'x-amz-acl': 'public-read',
      type,
      original: filePath,
    },
  };
};

type PrepareComparisonList = {
  changes: Changes;
  baseUrl: string;
};

export const prepareComparisonList = ({
  changes,
  baseUrl,
}: PrepareComparisonList): [Comparison[], UploadFile[]] => {
  const comparisonList: Comparison[] = [];
  const uploadList: UploadFile[] = [];

  for (const fileName of changes.addition) {
    const afterFile = extendFileName({
      fileName,
      extension: 'after',
    });
    const type = 'ADDITION';

    comparisonList.push({
      type,
      afterImageUrl: [baseUrl, afterFile].join('/'),
      path: join(config.imagePathBaseline, fileName),
      name: fileName,
    });

    uploadList.push(
      createUploadItem({
        uploadFileName: afterFile,
        path: config.imagePathCurrent,
        fileName,
        type,
      }),
    );
  }

  for (const fileName of changes.deletion) {
    const beforeFile = extendFileName({
      fileName,
      extension: 'before',
    });
    const type = 'DELETION';

    comparisonList.push({
      type,
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
      path: join(config.imagePathBaseline, fileName),
      name: fileName,
    });

    uploadList.push(
      createUploadItem({
        uploadFileName: beforeFile,
        path: config.imagePathBaseline,
        fileName,
        type,
      }),
    );
  }

  for (const fileName of changes.difference) {
    const beforeFile = extendFileName({
      fileName,
      extension: 'before',
    });
    const afterFile = extendFileName({
      fileName,
      extension: 'after',
    });
    const differenceFile = extendFileName({
      fileName,
      extension: 'difference',
    });
    const type = 'DIFFERENCE';

    comparisonList.push({
      type,
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
      afterImageUrl: [baseUrl, afterFile].join('/'),
      differenceImageUrl: [baseUrl, differenceFile].join('/'),
      path: join(config.imagePathBaseline, fileName),
      name: fileName,
    });

    uploadList.push(
      createUploadItem({
        uploadFileName: beforeFile,
        path: config.imagePathBaseline,
        fileName,
        type,
      }),
      createUploadItem({
        uploadFileName: afterFile,
        path: config.imagePathCurrent,
        fileName,
        type,
      }),
      createUploadItem({
        uploadFileName: differenceFile,
        path: config.imagePathDifference,
        fileName,
        type,
      }),
    );
  }

  return [comparisonList, uploadList];
};

export const getImageList = (path: string): string[] | undefined => {
  try {
    const files = readdirSync(path);

    return files.filter((name) => name.endsWith('.png'));
  } catch (error: unknown) {
    log(error);

    return undefined;
  }
};

export const getEventData = (path?: string): WebhookEvent | undefined => {
  if (!path) {
    return undefined;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
    return require(path);
  } catch (error: unknown) {
    log(error);

    return undefined;
  }
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

export const removeFilesInFolder = (path: string) => {
  const files = readdirSync(path);

  log(`Removing ${files.length} files from ${path}`);

  for (const file of files) {
    const filePath = join(path, file);

    unlinkSync(filePath);
  }
};

export const getBrowser = (): BrowserType => {
  switch (config.browser) {
    case 'chromium':
      return chromium;
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    default:
      return chromium;
  }
};

export const getVersion = (): string | void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const packageJson: { version: string } = require('../package.json');

    return packageJson.version;
  } catch {}
};

export const fileNameWithoutExtension = (fileName: string): string => {
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
        threshold: config.threshold,
      };
    });
};

export const sendTelemetryData = (properties: {
  runDuration?: number;
  shotsNumber?: number;
  error?: unknown;
}) => {
  const client = new PostHog(
    'phc_RDNnzvANh1mNm9JKogF9UunG3Ky02YCxWP9gXScKShk',
    {
      host: 'https://app.posthog.com',
    },
  );
  const id: string = uuid();

  try {
    log('Sending anonymized telemetry data.');

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
      client.shutdown();
    }
  } catch (error: unknown) {
    log('Error when sending telemetry data', error);
  }
};

export const parseHrtimeToSeconds = (hrtime: [number, number]) => {
  const seconds = (hrtime[0] + hrtime[1] / 1e9).toFixed(3);

  return seconds;
};

export const exitProcess = (properties: {
  runDuration?: number;
  shotsNumber?: number;
  error?: unknown;
  exitCode?: 0 | 1;
}) => {
  if (process.env.LOST_PIXEL_DISABLE_TELEMETRY !== '1') {
    sendTelemetryData(properties);
  }

  process.exit(properties.exitCode ?? 1);
};
