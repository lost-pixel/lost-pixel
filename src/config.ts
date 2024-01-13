import { existsSync } from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import get from 'lodash.get';
import type { BrowserContextOptions, Page } from 'playwright-core';
import { loadProjectConfigFile, loadTSProjectConfigFile } from './configHelper';
import { log } from './log';
import type { ShotMode } from './types';
import type { ParsedYargs } from './utils';

type BaseConfig = {
  /**
   * Browser to use: chromium, firefox, or webkit
   * @default 'chromium'
   */
  browser: Browser | Browser[];

  /**
   * URL of the Lost Pixel API endpoint
   * @default 'https://api.lost-pixel.com'
   */
  lostPixelPlatform: string;

  /**
   * API key for the Lost Pixel platform
   */
  apiKey?: string;

  /**
   * Enable Storybook mode
   */
  storybookShots?: {
    /**
     * URL of the Storybook instance or local folder
     * @default 'storybook-static'
     */
    storybookUrl: string;

    /**
     * Define areas for all stories where differences will be ignored
     */
    mask?: Mask[];

    /**
     * Define custom breakpoints for storybook tests
     * @default []
     * @example
     * [
     *  { width: 320, height: 480 },
     * { width: 768, height: 1024 },
     * { width: 1280, height: 720 },
     * ]
     */
    breakpoints?: number[];
  };

  /**
   * Enable Ladle mode
   */
  ladleShots?: {
    /**
     * URL of the Ladle served instance
     * @default 'http://localhost:61000'
     */
    ladleUrl: string;

    /**
     * Define areas for all stories where differences will be ignored
     */
    mask?: Mask[];

    /**
     * Define custom breakpoints for ladle tests
     * @default []
     * @example
     * [
     *  { width: 320, height: 480 },
     * { width: 768, height: 1024 },
     * { width: 1280, height: 720 },
     * ]
     */
    breakpoints?: number[];
  };

  histoireShots?: {
    /**
     * URL of the Ladle served instance
     * @default 'http://localhost:61000'
     */
    histoireUrl: string;

    /**
     * Define areas for all stories where differences will be ignored
     */
    mask?: Mask[];

    /**
     * Define custom breakpoints for ladle tests
     * @default []
     * @example
     * [
     *  { width: 320, height: 480 },
     * { width: 768, height: 1024 },
     * { width: 1280, height: 720 },
     * ]
     */
    breakpoints?: number[];
  };

  /**
   * Enable Page mode
   */
  pageShots?: {
    /**
     * Paths to take screenshots of
     */
    pages: PageScreenshotParameter[];
    /**
     * Url that must return a JSON compatible with `PageScreenshotParameter[]`. It is useful when you want to autogenerate the pages that you want to run lost-pixel on. Can be used together with `pages` as both are composed into a single run.
     */
    pagesJsonUrl?: string;

    /**
     * Url that must return a JSON compatible with `PageScreenshotParameter[]`. It is useful when you want to autogenerate the pages that you want to run lost-pixel on. Can be used together with `pages` as both are composed into a single run.
     */
    pagesJsonRefiner?: (
      pages: PageScreenshotParameter[],
    ) => PageScreenshotParameter[];

    /**
     * Base URL of the running application (e.g. http://localhost:3000)
     */
    baseUrl: string;

    /**
     * Define areas for all pages where differences will be ignored
     */
    mask?: Mask[];

    /**
     * Define custom breakpoints for pages tests
     * @default []
     * @example
     * [
     *  { width: 320, height: 480 },
     * { width: 768, height: 1024 },
     * { width: 1280, height: 720 },
     * ]
     */
    breakpoints?: number[];
  };

  /**
   * Enable Custom mode
   */
  customShots?: {
    /**
     * Path to current shots folder
     *
     * This path cannot be the same as the `imagePathCurrent` path
     */
    currentShotsPath: string;

    /**
     * Define custom breakpoints for custom shots tests
     * @default []
     * @example
     * [
     *  { width: 320, height: 480 },
     * { width: 768, height: 1024 },
     * { width: 1280, height: 720 },
     * ]
     */
    breakpoints?: number[];
  };

  /**
   * Path to the baseline image folder
   * @default '.lostpixel/baseline/'
   */
  imagePathBaseline: string;

  /**
   * Define custom breakpoints for all tests
   * @default []
   * @example
   * [
   *  { width: 320, height: 480 },
   * { width: 768, height: 1024 },
   * { width: 1280, height: 720 },
   * ]
   */
  breakpoints?: number[];

  /**
   * Path to the current image folder
   * @default '.lostpixel/current/'
   */
  imagePathCurrent: string;

  /**
   * Path to the difference image folder
   * @default '.lostpixel/difference/'
   */
  imagePathDifference: string;

  /**
   * Number of concurrent shots to take
   * @default 5
   */
  shotConcurrency: number;

  /**
   * Number of concurrent screenshots to compare
   * @default 10
   */
  compareConcurrency: number;

  /**
   * Which comparison engine to use for diffing images
   * @default 'pixelmatch'
   */
  compareEngine: 'pixelmatch' | 'odiff';

  /**
   * Timeouts for various stages of the test
   */
  timeouts: {
    /**
     * Timeout for fetching stories from Storybook
     * @default 30_000
     */
    fetchStories?: number;

    /**
     * Timeout for loading the state of the page
     * @default 30_000
     */
    loadState?: number;

    /**
     * Timeout for waiting for network requests to finish
     * @default 30_000
     */
    networkRequests?: number;
  };

  /**
   * Time to wait before taking a screenshot
   * @default 1_000
   */
  waitBeforeScreenshot: number;

  /**
   * Time to wait for the first network request to start
   * @default 1_000
   */
  waitForFirstRequest: number;

  /**
   * Time to wait for the last network request to start
   * @default 1_000
   */
  waitForLastRequest: number;

  /**
   * Threshold for the difference between the baseline and current image
   *
   * Values between 0 and 1 are interpreted as percentage of the image size
   *
   * Values greater or equal to 1 are interpreted as pixel count.
   * @default 0
   */
  threshold: number;

  /**
   * Whether to set the GitHub status check on process start or not
   *
   * Setting this option to `true` makes only sense if the repository settings have pending status checks disabled
   * @default false
   */
  setPendingStatusCheck: boolean;

  /**
   * How often to retry a shot for a stable result
   * @default 0
   */
  flakynessRetries: number;

  /**
   * Time to wait between flakyness retries
   * @default 2_000
   */
  waitBetweenFlakynessRetries: number;
};

export type Browser = 'chromium' | 'firefox' | 'webkit';

export type Mask = {
  /**
   * CSS selector for the element to mask
   * Examples:
   * - `#my-id`: Selects the element with the id `my-id`
   * - `.my-class`: Selects all elements with the class `my-class`
   * - `div`: Selects all `div` elements
   * - `div.my-class`: Selects all `div` elements with the class `my-class`
   * - `li:nth-child(2n)`: Selects all even `li` elements
   * - `[data-testid="hero-banner"]`: Selects all elements with the attribute `data-testid` set to `hero-banner`
   * - `div > p`: Selects all `p` elements that are direct children of a `div` element
   */
  selector: string;
};

export type PageScreenshotParameter = {
  /**
   * Path to the page to take a screenshot of (e.g. /login)
   */
  path: string;

  /**
   * Unique name for the page
   */
  name: string;

  /**
   * Time to wait before taking a screenshot
   * @default 1_000
   */
  waitBeforeScreenshot?: number;

  /**
   * Threshold for the difference between the baseline and current image
   *
   * Values between 0 and 1 are interpreted as percentage of the image size
   *
   * Values greater or equal to 1 are interpreted as pixel count.
   * @default 0
   */
  threshold?: number;

  /**
   * Define custom breakpoints for individual page
   * @default []
   * @example
   * [
   *  { width: 320, height: 480 },
   * { width: 768, height: 1024 },
   * { width: 1280, height: 720 },
   * ]
   */
  breakpoints?: number[];

  /**
   * Define a custom viewport for the page
   * @default { width: 1280, height: 720 }
   */
  viewport?: {
    width?: number;
    height?: number;
  };

  /**
   * Define areas for the page where differences will be ignored
   */
  mask?: Mask[];
};

type StoryLike = {
  shotMode: ShotMode;
  id?: string;
  kind?: string;
  story?: string;
  shotName?: string;
  parameters?: Record<string, unknown>;
};

export type ProjectConfig = {
  /**
   * Project ID
   */
  lostPixelProjectId: string;

  /**
   * CI build ID
   */
  ciBuildId: string;

  /**
   * CI build number
   */
  ciBuildNumber: string;

  /**
   * Git repository name (e.g. 'lost-pixel/lost-pixel-storybook')
   */
  repository: string;

  /**
   * Git branch name (e.g. 'main')
   */
  commitRefName: string;

  /**
   * Git commit SHA (e.g. 'b9b8b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9')
   */
  commitHash: string;

  /**
   * Flag that decides if images should be uploaded to S3 bucket or just generated (non-SaaS self-hosted mode)
   */
  generateOnly?: boolean;

  /**
   * Flag that decides if process should exit if a difference is found
   */
  failOnDifference?: boolean;

  /**
   * File path to event.json file
   */
  eventFilePath?: string;

  /**
   * Global shot filter
   */
  filterShot?: (input: StoryLike) => boolean;

  /**
   * Shot and file name generator for images
   */
  shotNameGenerator?: (input: StoryLike) => string;

  /**
   * Configure browser context options
   */
  configureBrowser?: (input: StoryLike) => BrowserContextOptions;

  /**
   * Configure page before screenshot
   */
  beforeScreenshot?: (page: Page, input: StoryLike) => Promise<void>;
};

export type GenerateOnlyModeProjectConfig = Omit<
  ProjectConfig,
  | 'lostPixelProjectId'
  | 'ciBuildId'
  | 'ciBuildNumber'
  | 'repository'
  | 'commitRefName'
  | 'commitHash'
> &
  Partial<Pick<ProjectConfig, 'lostPixelProjectId'>> & {
    generateOnly: true;
  };

const requiredConfigProps: Array<keyof ProjectConfig> = [
  'lostPixelProjectId',
  'ciBuildId',
  'ciBuildNumber',
  'repository',
  'commitRefName',
  'commitHash',
];

export const MEDIA_UPLOAD_CONCURRENCY = 10;

export type FullConfig =
  | (BaseConfig & ProjectConfig)
  | (BaseConfig & GenerateOnlyModeProjectConfig);

export type PlatformModeConfig = BaseConfig & ProjectConfig;

export type CustomProjectConfig =
  | (Partial<BaseConfig> & GenerateOnlyModeProjectConfig)
  | (Partial<BaseConfig> & ProjectConfig);

export const isLocalDebugMode = (): boolean => {
  // @ts-expect-error TBD
  const args = yargs(hideBin(process.argv)).parse() as ParsedYargs;

  return args._.includes('local') || process.env.LOST_PIXEL_LOCAL === 'true';
};

const defaultConfig: BaseConfig = {
  browser: 'chromium',
  lostPixelPlatform: 'https://api.lost-pixel.com',
  imagePathBaseline: '.lostpixel/baseline/',
  imagePathCurrent: '.lostpixel/current/',
  imagePathDifference: '.lostpixel/difference/',
  shotConcurrency: 5,
  compareConcurrency: 10,
  compareEngine: 'pixelmatch',
  timeouts: {
    fetchStories: 30_000,
    loadState: 30_000,
    networkRequests: 30_000,
  },
  waitBeforeScreenshot: 1000,
  waitForFirstRequest: 1000,
  waitForLastRequest: 1000,
  threshold: 0,
  setPendingStatusCheck: false,
  flakynessRetries: 0,
  waitBetweenFlakynessRetries: 2000,
};

const githubConfigDefaults: Partial<ProjectConfig> = {
  ciBuildId: process.env.CI_BUILD_ID,
  ciBuildNumber: process.env.CI_BUILD_NUMBER,
  repository: process.env.REPOSITORY,
  commitRefName: process.env.COMMIT_REF_NAME,
  commitHash: process.env.COMMIT_HASH,
};

export let config: FullConfig;

const checkConfig = () => {
  const missingProps: string[] = [];

  for (const prop of requiredConfigProps) {
    if (!get(config, prop)) {
      missingProps.push(prop);
    }
  }

  if (missingProps.length > 0) {
    log.process(
      'error',
      'config',
      `Error: Missing required config properties: ${missingProps.join(', ')}`,
    );
    process.exit(1);
  }

  if (
    config.customShots?.currentShotsPath &&
    path.relative(
      path.resolve(config.imagePathCurrent),
      path.resolve(config.customShots.currentShotsPath),
    ) === ''
  ) {
    log.process(
      'error',
      'config',
      `Error: 'customShots.currentShotsPath' cannot be equal to 'imagePathCurrent'`,
    );
    process.exit(1);
  }
};

const configDirBase = process.env.LOST_PIXEL_CONFIG_DIR ?? process.cwd();

const configFileNameBase = path.join(
  path.isAbsolute(configDirBase) ? '' : process.cwd(),
  configDirBase,
  'lostpixel.config',
);

const loadProjectConfig = async (): Promise<CustomProjectConfig> => {
  log.process('info', 'config', 'Loading project config ...');
  log.process('info', 'config', 'Current working directory:', process.cwd());

  if (process.env.LOST_PIXEL_CONFIG_DIR) {
    log.process(
      'info',
      'config',
      'Defined config directory:',
      process.env.LOST_PIXEL_CONFIG_DIR,
    );
  }

  const configExtensions = ['ts', 'js', 'cjs', 'mjs'];
  const configExtensionsString = configExtensions.join('|');

  log.process(
    'info',
    'config',
    'Looking for config file:',
    `${configFileNameBase}.(${configExtensionsString})`,
  );

  const configFiles = configExtensions
    .map((ext) => `${configFileNameBase}.${ext}`)
    .filter((file) => existsSync(file));

  if (configFiles.length === 0) {
    log.process(
      'error',
      'config',
      `Couldn't find project config file 'lostpixel.config.(${configExtensionsString})'`,
    );
    process.exit(1);
  }

  if (configFiles.length > 1) {
    log.process(
      'info',
      'config',
      '✅ Found multiple config files, taking:',
      configFiles[0],
    );
  } else {
    log.process('info', 'config', '✅ Found config file:', configFiles[0]);
  }

  const configFile = configFiles[0];

  try {
    const imported = (await loadProjectConfigFile(
      configFile,
    )) as CustomProjectConfig;

    return imported;
  } catch {
    log.process(
      'error',
      'config',
      'Loading config using ESBuild failed, using fallback option',
    );

    try {
      if (existsSync(`${configFileNameBase}.js`)) {
        const projectConfig =
          // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
          require(`${configFileNameBase}.js`) as CustomProjectConfig;

        log.process(
          'info',
          'config',
          '✅ Successfully loaded configuration from:',
          `${configFileNameBase}.js`,
        );

        return projectConfig;
      }

      if (existsSync(`${configFileNameBase}.ts`)) {
        const imported = (await loadTSProjectConfigFile(
          configFile,
        )) as CustomProjectConfig;

        log.process(
          'info',
          'config',
          '✅ Successfully loaded configuration from:',
          `${configFileNameBase}.ts`,
        );

        return imported;
      }

      log.process(
        'error',
        'config',
        "Couldn't find project config file 'lostpixel.config.js'",
      );
      process.exit(1);
    } catch (error) {
      log.process(
        'error',
        'config',
        `Failed to load config file: ${configFile}`,
      );
      log.process('error', 'config', error);
      process.exit(1);
    }
  }
};

export const configure = async (customProjectConfig?: CustomProjectConfig) => {
  if (customProjectConfig) {
    config = {
      ...defaultConfig,
      ...customProjectConfig,
    };

    return;
  }

  const projectConfig = await loadProjectConfig();

  config = {
    ...(!projectConfig.generateOnly && { ...githubConfigDefaults }),
    ...defaultConfig,
    ...projectConfig,
  };

  if (isLocalDebugMode()) {
    config.generateOnly = true;
    config.lostPixelProjectId = undefined;

    const urlChunks = ['http://', 'https://', '127.0.0.1'];

    if (
      config.pageShots?.baseUrl &&
      urlChunks.some((urlChunk) =>
        config?.pageShots?.baseUrl.includes(urlChunk),
      )
    ) {
      const url = new URL(config.pageShots.baseUrl);

      url.hostname = 'localhost';
      config.pageShots.baseUrl = url.toString();
    }
  }

  // Default to Storybook mode if no mode is defined
  if (
    !config.storybookShots &&
    !config.pageShots &&
    !config.ladleShots &&
    !config.histoireShots &&
    !config.customShots
  ) {
    config.storybookShots = {
      storybookUrl: 'storybook-static',
    };
  }

  if (!config.generateOnly) {
    checkConfig();
  }
};
