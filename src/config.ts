import { existsSync } from 'fs';
import { configFileNameBase } from './constants';
import { log } from './utils';

type BaseConfig = {
  lostPixelUrl: string;
  storybookUrl: string;
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
  s3EndPoint: string;
  s3EndPointPort?: number;
  s3EndPointSsl: boolean;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3SessionToken?: string;
  s3BucketName: string;
  s3BaseUrl?: string;
};

const requiredConfigProps: Array<keyof FullConfig> = [
  'lostPixelProjectId',
  'ciBuildId',
  'ciBuildNumber',
  'repository',
  'commitRef',
  'commitRefName',
  'commitHash',
  's3EndPoint',
  's3EndPointSsl',
  's3Region',
  's3AccessKey',
  's3SecretKey',
  's3BucketName',
];

export type FullConfig = BaseConfig & ProjectConfig;
export type CustomProjectConfig = Partial<BaseConfig> & ProjectConfig;

const defaultConfig: BaseConfig = {
  lostPixelUrl: 'https://app.lost-pixel.com/api/callback',
  storybookUrl: 'storybook-static',
  imagePathBaseline: '.lostpixel/baseline/',
  imagePathCurrent: '.lostpixel/current/',
  imagePathDifference: '.lostpixel/difference/',
};

export let config: FullConfig;

const checkConfig = () => {
  requiredConfigProps.forEach((prop) => {
    if (!config[prop]) {
      log(`Error: Missing required configuration property: ${prop}`);
      process.exit(1);
    }
  });
};

const loadProjectConfig = (): CustomProjectConfig => {
  if (existsSync(`${configFileNameBase}.js`)) {
    const projectConfig = require(`${configFileNameBase}.js`);
    return projectConfig;
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
