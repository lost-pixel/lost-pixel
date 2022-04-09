import {
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { UploadFile, WebhookEvent } from './upload';
import { normalize, join } from 'path';
import { config } from './config';
import { Service } from 'ts-node';
import { BrowserType, chromium, firefox, webkit } from 'playwright';

// eslint-disable-next-line no-console
export const log = console.log;

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
  } else if (parts.length === 0) {
    return extension;
  }

  parts[extensionIndex] = `${extension}.${parts[extensionIndex]}`;

  return parts.join('.');
};

type ComparisonType = 'ADDITION' | 'DELETION' | 'DIFFERENCE';

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

export type Comparison = {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  differenceImageUrl?: string;
  type: ComparisonType;
  path: string;
  name: string;
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

  changes.addition.forEach((fileName) => {
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
  });

  changes.deletion.forEach((fileName) => {
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
  });

  changes.difference.forEach((fileName) => {
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
    );

    uploadList.push(
      createUploadItem({
        uploadFileName: afterFile,
        path: config.imagePathCurrent,
        fileName,
        type,
      }),
    );

    uploadList.push(
      createUploadItem({
        uploadFileName: differenceFile,
        path: config.imagePathDifference,
        fileName,
        type,
      }),
    );
  });

  return [comparisonList, uploadList];
};

export const getImageList = (path: string): string[] | null => {
  try {
    const files = readdirSync(path);

    return files.filter((name) => name.endsWith('.png'));
  } catch (error) {
    log(error);
    return null;
  }
};

export const getEventData = (path: string): WebhookEvent | undefined => {
  try {
    return require(path);
  } catch (error) {
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

  paths.forEach((path) => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  });

  const ignoreFile = normalize(
    join(config.imagePathBaseline, '..', '.gitignore'),
  );

  if (!existsSync(ignoreFile)) {
    writeFileSync(ignoreFile, 'current\ndifference\n');
  }
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const removeFilesInFolder = (path: string) => {
  const files = readdirSync(path);
  log(`Removing ${files.length} files from ${path}`);

  files.forEach((file) => {
    const filePath = join(path, file);
    unlinkSync(filePath);
  });
};

let tsNodeService: Service;

export const setupTsNode = async (): Promise<Service> => {
  if (tsNodeService) {
    return tsNodeService;
  }

  try {
    const tsNode = await import('ts-node');

    tsNodeService = tsNode.register({
      transpileOnly: true,
    });

    return tsNodeService;
  } catch (error) {
    // @ts-expect-error Error type definition is missing 'code'
    if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error.code)) {
      log(`Please install "ts-node" to use a TypeScript configuration file`);
      // @ts-expect-error Error type definition is missing 'message'
      log(error.message);
      process.exit(1);
    }

    throw error;
  }
};

export const loadTSProjectConfigFile = async (
  configFilepath: string,
): Promise<unknown> => {
  await setupTsNode();
  tsNodeService.enabled(true);
  const imported = require(configFilepath);
  tsNodeService.enabled(false);

  return imported.default || imported.config;
};

export const getBrowser = (): BrowserType => {
  switch (config.browser) {
    case 'chromium':
      return chromium;
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
  }
};
