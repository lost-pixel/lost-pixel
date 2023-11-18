import { existsSync } from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import get from 'lodash.get';
import type { BrowserContextOptions, Page } from 'playwright-core';
import z from 'zod';
import { loadProjectConfigFile, loadTSProjectConfigFile } from './configHelper';
import { log } from './log';
import type { ShotMode } from './types';
import type { ParsedYargs } from './utils';

const MaskSchema = z.object({
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
  selector: z.string(),
});

const PageScreenshotParameterSchema = z.object({
  /**
   * Path to the page to take a screenshot of (e.g. /login)
   */
  path: z.string(),

  /**
   * Unique name for the page
   */
  name: z.string(),

  /**
   * Time to wait before taking a screenshot
   * @default 1_000
   */
  waitBeforeScreenshot: z.number().default(1000),

  /**
   * Threshold for the difference between the baseline and current image
   *
   * Values between 0 and 1 are interpreted as percentage of the image size
   *
   * Values greater or equal to 1 are interpreted as pixel count.
   * @default 0
   */
  threshold: z.number().default(0),

  /**
   * Define custom breakpoints for the page as width in pixels
   * @default []
   * @example
   * [ 320, 768, 1280 ]
   */
  breakpoints: z.array(z.number()),

  /**
   * Define a custom viewport for the page
   * @default { width: 1280, height: 720 }
   */
  viewport: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),

  /**
   * Define areas for the page where differences will be ignored
   */
  mask: z.array(MaskSchema).optional(),
});

const StorybookShotsSchema = z.object({
  /**
   * URL of the Storybook instance or local folder
   * @default 'storybook-static'
   */
  storybookUrl: z.string(),

  /**
   * Define areas for all stories where differences will be ignored
   */
  mask: z.array(MaskSchema).optional(),

  /**
   * Define custom breakpoints for all Storybook shots as width in pixels
   * @default []
   * @example
   * [ 320, 768, 1280 ]
   */
  breakpoints: z.array(z.number()).optional(),
});

const LadleShotsSchema = z.object({
  /**
   * URL of the Ladle served instance
   * @default 'http://localhost:61000'
   */
  ladleUrl: z.string(),

  /**
   * Define areas for all stories where differences will be ignored
   */
  mask: z.array(MaskSchema).optional(),

  /**
   * Define custom breakpoints for all Ladle shots as width in pixels
   * @default []
   * @example
   * [ 320, 768, 1280 ]
   */
  breakpoints: z.array(z.number()).default([]).optional(),
});

const HistoireShotsSchema = z.object({
  /**
   * URL of the Histoire served instance
   * @default 'http://localhost:61000'
   */
  histoireUrl: z.string(),

  /**
   * Define areas for all stories where differences will be ignored
   */
  mask: z.array(MaskSchema).optional(),

  /**
   * Define custom breakpoints for all Histoire shots as width in pixels
   * @default []
   * @example
   * [ 320, 768, 1280 ]
   */
  breakpoints: z.array(z.number()).optional(),
});

const PageShotsSchema = z.object({
  /**
   * Paths to take screenshots of
   */
  pages: z.array(PageScreenshotParameterSchema),

  /**
   * Url that must return a JSON compatible with `PageScreenshotParameter[]`. It is useful when you want to autogenerate the pages that you want to run lost-pixel on. Can be used together with `pages` as both are composed into a single run.
   */
  pagesJsonUrl: z.string().optional(),

  /**
   * Base URL of the running application (e.g. http://localhost:3000)
   */
  baseUrl: z.string(),

  /**
   * Define areas for all pages where differences will be ignored
   */
  mask: z.array(MaskSchema).optional(),

  /**
   * Define custom breakpoints for all page shots as width in pixels
   * @default []
   * @example
   * [ 320, 768, 1280 ]
   */
  breakpoints: z.array(z.number()).optional(),
});

const CustomShotsSchema = z.object({
  /**
   * Path to current shots folder
   *
   * This path cannot be the same as the `imagePathCurrent` path
   */
  currentShotsPath: z.string(),
});

const ShotModeSchema = z.enum([
  'storybook',
  'ladle',
  'histoire',
  'page',
  'custom',
]);

const StoryLikeSchema = z.object({
  shotMode: ShotModeSchema,
  id: z.string().optional(),
  kind: z.string().optional(),
  story: z.string().optional(),
  shotName: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
});

const TimeoutsSchema = z.object({
  /**
   * Timeout for fetching stories
   * @default 30_000
   */
  fetchStories: z.number().default(30_000),

  /**
   * Timeout for loading the state of the page
   * @default 30_000
   */
  loadState: z.number().default(30_000),

  /**
   * Timeout for waiting for network requests to finish
   * @default 30_000
   */
  networkRequests: z.number().default(30_000),
});

const BaseConfigSchema = z.object({
  /**
   * Browser to use: chromium, firefox, or webkit
   * @default 'chromium'
   */
  browser: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),

  /**
   * Enable Storybook mode
   */
  storybookShots: StorybookShotsSchema.optional(),

  /**
   * Enable Ladle mode
   */
  ladleShots: LadleShotsSchema.optional(),

  /**
   * Enable Histoire mode
   */
  histoireShots: HistoireShotsSchema.optional(),

  /**
   * Enable Page mode
   */
  pageShots: PageShotsSchema.optional(),

  /**
   * Enable Custom mode
   */
  customShots: CustomShotsSchema.optional(),

  /**
   * Path to the current image folder
   * @default '.lostpixel/current/'
   */
  imagePathCurrent: z.string().default('.lostpixel/current/'),

  /**
   * Define custom breakpoints for all tests as width in pixels
   * @default []
   * @example
   * [ 320, 768, 1280 ]
   */
  breakpoints: z.array(z.number()).default([]),

  /**
   * Number of concurrent shots to take
   * @default 5
   */
  shotConcurrency: z.number().default(5),

  /**
   * Timeouts for various stages of the test
   */
  timeouts: TimeoutsSchema.default({
    fetchStories: 30_000,
    loadState: 30_000,
    networkRequests: 30_000,
  }),

  /**
   * Time to wait before taking a screenshot
   * @default 1_000
   */
  waitBeforeScreenshot: z.number().default(1000),

  /**
   * Time to wait for the first network request to start
   * @default 1_000
   */
  waitForFirstRequest: z.number().default(1000),

  /**
   * Time to wait for the last network request to start
   * @default 1_000
   */
  waitForLastRequest: z.number().default(1000),

  /**
   * Threshold for the difference between the baseline and current image
   *
   * Values between 0 and 1 are interpreted as percentage of the image size
   *
   * Values greater or equal to 1 are interpreted as pixel count.
   * @default 0
   */
  threshold: z.number().default(0),

  /**
   * How often to retry a shot for a stable result
   * @default 0
   */
  flakynessRetries: z.number().default(0),

  /**
   * Time to wait between flakyness retries
   * @default 2_000
   */
  waitBetweenFlakynessRetries: z.number().default(2000),

  /**
   * Global shot filter
   */
  filterShot: z
    .function()
    .args(StoryLikeSchema)
    .returns(z.boolean())
    .optional(),

  /**
   * Shot and file name generator for images
   */
  shotNameGenerator: z
    .function()
    .args(StoryLikeSchema)
    .returns(z.string())
    .optional(),

  /**
   * Configure browser context options
   */
  configureBrowser: z
    .function()
    .args(StoryLikeSchema)
    .returns(z.any())
    .optional(),

  /**
   * Configure page before screenshot
   */
  beforeScreenshot: z
    .function()
    .args(z.any(), StoryLikeSchema)
    .returns(z.promise(z.void()))
    .optional(),
});

export const PlatformModeConfigSchema = BaseConfigSchema.extend({
  /**
   * URL of the Lost Pixel API endpoint
   * @default 'https://api.lost-pixel.com'
   */
  lostPixelPlatform: z.string().default('https://api.lost-pixel.com'),

  /**
   * API key for the Lost Pixel platform
   */
  apiKey: z.string(),

  /**
   * Project ID
   */
  lostPixelProjectId: z.string(),

  /**
   * CI build ID
   */
  // @ts-expect-error If not set, it will be caught during config validation
  ciBuildId: z.string().default(process.env.CI_BUILD_ID),

  /**
   * CI build number
   */
  // @ts-expect-error If not set, it will be caught during config validation
  ciBuildNumber: z.string().default(process.env.CI_BUILD_NUMBER),

  /**
   * Git repository name (e.g. 'lost-pixel/lost-pixel-storybook')
   */
  // @ts-expect-error If not set, it will be caught during config validation
  repository: z.string().default(process.env.REPOSITORY),

  /**
   * Git branch name (e.g. 'main')
   */
  // @ts-expect-error If not set, it will be caught during config validation
  commitRefName: z.string().default(process.env.COMMIT_REF_NAME),

  /**
   * Git commit SHA (e.g. 'b9b8b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9b9')
   */
  // @ts-expect-error If not set, it will be caught during config validation
  commitHash: z.string().default(process.env.COMMIT_HASH),

  /**
   * File path to event.json file
   */
  eventFilePath: z.string().optional(),

  /**
   * Whether to set the GitHub status check on process start or not
   *
   * Setting this option to `true` makes only sense if the repository settings have pending status checks disabled
   * @default false
   */
  setPendingStatusCheck: z.boolean().default(false),
});

export const GenerateOnlyModeConfigSchema = BaseConfigSchema.extend({
  /**
   * Run in local mode
   * @deprecated Defaults to running in generateOnly mode
   */
  generateOnly: z.boolean().optional(),

  /**
   * Flag that decides if process should exit if a difference is found
   */
  failOnDifference: z.boolean().optional(),

  /**
   * Path to the baseline image folder
   * @default '.lostpixel/baseline/'
   */
  imagePathBaseline: z.string().default('.lostpixel/baseline/'),

  /**
   * Path to the difference image folder
   * @default '.lostpixel/difference/'
   */
  imagePathDifference: z.string().default('.lostpixel/difference/'),

  /**
   * Number of concurrent screenshots to compare
   * @default 10
   */
  compareConcurrency: z.number().default(10),

  /**
   * Which comparison engine to use for diffing images
   * @default 'pixelmatch'
   */
  compareEngine: z.enum(['pixelmatch', 'odiff']).default('pixelmatch'),
});

// use partial() specifically for the inferred type
export const ConfigSchema = z.union([
  PlatformModeConfigSchema.extend({
    timeouts: TimeoutsSchema.partial(),
  }).partial(),
  GenerateOnlyModeConfigSchema.extend({
    timeouts: TimeoutsSchema.partial(),
  }).partial(),
]);

type BaseConfig = {
  /**
   * Browser to use: chromium, firefox, or webkit
   * @default 'chromium'
   */
  browser: 'chromium' | 'firefox' | 'webkit';

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
