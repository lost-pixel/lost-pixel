import { existsSync } from 'fs';
import { log } from './utils';
import get from 'lodash.get';
import path from 'path';

type BaseConfig = {
  lostPixelUrl: string;
  storybookUrl: string;
  imagePathRoot: string;
  imagePathBaseline: string;
  imagePathCurrent: string;
  imagePathDifference: string;
};

export type ProjectConfig = {
  lostPixelProjectId: string;
  ciBuildId: string;
  ciBuildNumber: string;
  repository: string;
  commitRef: string;
  commitRefName: string;
  commitHash: string;
  s3: {
    endPoint: string;
    port?: number;
    ssl?: boolean;
    region?: string;
    accessKey: string;
    secretKey: string;
    sessionToken?: string;
    bucketName: string;
    baseUrl?: string;
  };
};

const requiredConfigProps: Array<keyof FullConfig> = [
  'lostPixelProjectId',
  'ciBuildId',
  'ciBuildNumber',
  'repository',
  'commitRef',
  'commitRefName',
  'commitHash',
  's3',
];

const requiredS3ConfigProps: Array<keyof FullConfig['s3']> = [
  'endPoint',
  'accessKey',
  'secretKey',
  'bucketName',
];

export type FullConfig = BaseConfig & ProjectConfig;
export type CustomProjectConfig = Partial<BaseConfig> & ProjectConfig;

const defaultConfig: BaseConfig = {
  lostPixelUrl: 'https://app.lost-pixel.com/api/callback',
  storybookUrl: 'storybook-static',
  imagePathRoot: '',
  imagePathBaseline: '.lostpixel/baseline/',
  imagePathCurrent: '.lostpixel/current/',
  imagePathDifference: '.lostpixel/difference/',
};

export let config: FullConfig;

const checkConfig = () => {
  const missingProps: string[] = [];

  const requiredProps = [
    ...requiredConfigProps,
    ...requiredS3ConfigProps.map((prop) => `s3.${prop}`),
  ];

  requiredProps.forEach((prop) => {
    if (!get(config, prop)) {
      missingProps.push(prop);
    }
  });

  if (missingProps.length > 0) {
    log(
      `Error: Missing required configuration properties: ${missingProps.join(
        ', ',
      )}`,
    );
    process.exit(1);
  }
};

const configFileNameBase = path.join(process.cwd(), 'lostpixel.config');

const loadProjectConfig = (): CustomProjectConfig => {
  if (existsSync(`${configFileNameBase}.js`)) {
    const projectConfig = require(`${configFileNameBase}.js`);
    return projectConfig;
  } else if (existsSync(`${configFileNameBase}.ts`)) {
    try {
      require('ts-node/register');
      const imported = require(`${configFileNameBase}.ts`);

      return imported.default || imported.config;
    } catch (error) {
      console.error(
        `Please install "ts-node" to use a TypeScript configuration file`,
      );
      process.exit(1);
    }
  }

  throw new Error("Couldn't find project config file 'lostpixel.config.js'");
};

export const configure = () => {
  const projectConfig = loadProjectConfig();

  config = {
    ...defaultConfig,
    ...projectConfig,
  };

  checkConfig();
};
