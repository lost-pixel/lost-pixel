import path from 'node:path';
import kebabCase from 'lodash.kebabcase';
import type { BrowserContext, BrowserType } from 'playwright-core';
import { readFileSync } from 'fs-extra';
import type { ShotItem } from '../types';
import { config, isPlatformModeConfig, type Mask } from '../config';
import { getBrowser } from '../utils';
import { log } from '../log';
import { generateLabel, selectBreakpoints } from '../shots/utils';
import { notSupported } from '../constants';

type ExtraShots = {
  name?: string;
  args?: Record<string, unknown>; // Additional args for the snapshot
  prefix?: string; // Prefix for the snapshot name
  suffix?: string; // Suffix for the snapshot name
};
export type StoryParameters = {
  lostpixel?: {
    disable?: boolean;
    threshold?: number;
    waitBeforeScreenshot?: number;
    mask?: Mask[];
    breakpoints?: number[];
    args?: Record<string, unknown>; // Args for the story
    extraShots?: ExtraShots[]; // Additional snapshots for the story
    elementLocator?: string;
  };
  viewport?: {
    width?: number;
    height?: number;
  };
  fileName?: string;
};

export type Story = {
  id: string;
  kind: string;
  story: string;
  name?: string;
  title?: string;
  importPath?: string;
  parameters?: StoryParameters & {
    storyshots?: {
      disable?: boolean;
    };
  };
};

type StorybookPreviewApi = {
  ready: () => Promise<void>;
  extract?: () => Promise<Record<string, Story>>;
};

type StorybookClientApi = {
  raw?: () => Story[];
  storyStore?: {
    cacheAllCSFFiles: () => Promise<void>;
  };
};

type StoriesJson = {
  v: number;
  stories: Story[];
};

type WindowObject = typeof window & {
  __STORYBOOK_PREVIEW__: StorybookPreviewApi;
  __STORYBOOK_CLIENT_API__: StorybookClientApi;
};

type CrawlerResult = {
  stories: Story[] | undefined;
};

export const getStoryBookUrl = (url: string) => {
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file://')
  ) {
    return url;
  }

  if (url.startsWith('/')) {
    return `file://${url}`;
  }

  return `file://${path.normalize(path.join(process.cwd(), url))}`;
};

export const getIframeUrl = (url: string) =>
  url.endsWith('/') ? `${url}iframe.html` : `${url}/iframe.html`;

export const collectStoriesViaWindowApi = async (
  context: BrowserContext,
  url: string,
  isIframeUrl?: boolean,
) => {
  const page = await context.newPage();
  const iframeUrl = isIframeUrl
    ? getStoryBookUrl(url)
    : getIframeUrl(getStoryBookUrl(url));

  await page.goto(iframeUrl);

  await page.waitForFunction(
    () => (window as WindowObject).__STORYBOOK_PREVIEW__,
    null,
    {
      timeout: config.timeouts.fetchStories,
    },
  );

  // Storybook >= 8 expose a new preview API that has a `ready` method to be awaited before proceeding
  const isV8OrAbove = await page.evaluate(async () => {
    const { __STORYBOOK_PREVIEW__: api } = window as WindowObject;

    return api.ready !== undefined;
  });

  if (isV8OrAbove) {
    // SB v8 and above
    await page.evaluate(async () => {
      const { __STORYBOOK_PREVIEW__: api } = window as WindowObject;

      if (api.ready) {
        await api.ready();
      }
    });
  } else {
    // SB v7 and below
    await page.waitForFunction(
      () => (window as WindowObject).__STORYBOOK_CLIENT_API__,
      null,
      {
        timeout: config.timeouts.fetchStories,
      },
    );

    await page.evaluate(async () => {
      const { __STORYBOOK_CLIENT_API__: api } = window as WindowObject;

      if (api.storyStore) {
        await api.storyStore.cacheAllCSFFiles?.();
      }
    });
  }

  const result = await page.evaluate(async (): Promise<CrawlerResult> => {
    const parseParameters = <T>(
      parameters: T,
      level = 0,
    ): T | 'UNSUPPORTED_DEPTH' | 'UNSUPPORTED_TYPE' => {
      if (level > 10) {
        return 'UNSUPPORTED_DEPTH';
      }

      if (Array.isArray(parameters)) {
        // @ts-expect-error FIXME
        return parameters.map((value) =>
          parseParameters<unknown>(value, level + 1),
        );
      }

      if (
        typeof parameters === 'string' ||
        typeof parameters === 'number' ||
        typeof parameters === 'boolean' ||
        parameters === undefined ||
        typeof parameters === 'function' ||
        parameters instanceof RegExp ||
        parameters instanceof Date ||
        parameters === null
      ) {
        return parameters;
      }

      if (typeof parameters === 'object' && parameters !== null) {
        // @ts-expect-error FIXME
        // eslint-disable-next-line unicorn/no-array-reduce
        return Object.keys(parameters).reduce<T>((acc, key: keyof T) => {
          // @ts-expect-error FIXME
          acc[key] = parseParameters(parameters[key], level + 1);

          return acc;
        }, {});
      }

      return 'UNSUPPORTED_TYPE';
    };

    const mapStories = (stories: Story[]): Story[] =>
      stories.map((story) => {
        const parameters = parseParameters(
          story.parameters as Record<string, unknown>,
        ) as Story['parameters'];

        return {
          id: story.id,
          kind: story.kind,
          story: story.story,
          importPath: parameters?.fileName,
          parameters,
        };
      });

    const {
      __STORYBOOK_PREVIEW__: previewApi,
      __STORYBOOK_CLIENT_API__: clientApi,
    } = window as WindowObject;

    let stories: Story[] = [];

    if (previewApi.extract) {
      const items = await previewApi.extract();

      stories = mapStories(Object.values(items));
    } else if (clientApi.raw) {
      // Fallback for 6.4 and below
      stories = mapStories(clientApi.raw());
    }

    return { stories };
  });

  return result;
};

export const collectStoriesViaStoriesJson = async (
  context: BrowserContext,
  url: string,
) => {
  const storiesJsonUrl = url.endsWith('/')
    ? `${url}stories.json`
    : `${url}/stories.json`;

  let storiesJson: StoriesJson;

  if (storiesJsonUrl.startsWith('file://')) {
    try {
      const file = readFileSync(storiesJsonUrl.slice(7));

      storiesJson = JSON.parse(file.toString()) as StoriesJson;
    } catch {
      throw new Error(`Cannot load file ${storiesJsonUrl}`);
    }
  } else {
    const result = await context.request.get(storiesJsonUrl);

    storiesJson = (await result.json()) as StoriesJson;
  }

  if (typeof storiesJson.stories === 'object') {
    return {
      stories: Object.values(storiesJson.stories),
    };
  }

  throw new Error(`Cannot load resource ${storiesJsonUrl}`);
};

export const collectStories = async (url: string) => {
  const browser = await getBrowser().launch();
  const context = await browser.newContext();

  try {
    log.process(
      'info',
      'general',
      'Trying to collect stories via window object',
    );
    const result = await collectStoriesViaWindowApi(context, url);

    await browser.close();

    return result;
  } catch (error: unknown) {
    log.process('info', 'general', 'Fallback to /stories.json');
    log.process('error', 'general', error);
  }

  try {
    const result = await collectStoriesViaStoriesJson(context, url);

    await browser.close();

    return result;
  } catch (error: unknown) {
    await browser.close();
    throw error;
  }
};

const generateBrowserConfig = (story: Story) => {
  const browserConfig =
    config.configureBrowser?.({
      ...story,
      shotMode: 'storybook',
    }) ?? {};

  if (story.parameters?.viewport) {
    browserConfig.viewport = browserConfig.viewport ?? {
      width: 1280,
      height: 720,
    };
    browserConfig.viewport = {
      ...browserConfig.viewport,
      ...story.parameters.viewport,
    };
  }

  return browserConfig;
};

const generateStoryUrl = (
  iframeUrl: string,
  storyId: string,
  args?: Record<string, unknown>,
  breakpoint?: number,
): string => {
  let url = `${iframeUrl}?id=${storyId}&viewMode=story`;

  if (args) {
    const argsString = Object.entries(args)
      .map(([key, value]) => `${key}:${value as string}`)
      .join(';');

    url += `&args=${argsString}`;
  }

  if (breakpoint !== undefined) {
    url += `&width=${breakpoint}`;
  }

  return url;
};

const generateFilename = (
  kind: string,
  story: string,
  prefix?: string,
  suffix?: string,
) => {
  return [prefix, kebabCase(kind), kebabCase(story), kebabCase(suffix)]
    .filter(Boolean)
    .join('--');
};

export const generateStorybookShotItems = (
  baseUrl: string,
  stories: Story[],
  mask?: Mask[],
  modeBreakpoints?: number[],
  browser?: BrowserType,
): ShotItem[] => {
  const iframeUrl = getIframeUrl(getStoryBookUrl(baseUrl));

  return stories
    .filter((story) => story.parameters?.lostpixel?.disable !== true)
    .filter((story) => story.parameters?.storyshots?.disable !== true)
    .filter((story) =>
      config.filterShot
        ? config.filterShot({ ...story, shotMode: 'storybook' })
        : true,
    )
    .flatMap((story): ShotItem[] => {
      const shotName =
        config.shotNameGenerator?.({ ...story, shotMode: 'storybook' }) ??
        generateFilename(story.kind, story.story);
      let label = generateLabel({ browser });
      let fileNameWithExt = `${shotName}${label}.png`;

      const baseShotItem: ShotItem = {
        shotMode: 'storybook',
        id: `${story.id}${label}`,
        shotName: `${shotName}${label}`,
        importPath: story.importPath,
        url: generateStoryUrl(
          iframeUrl,
          story.id,
          story.parameters?.lostpixel?.args,
        ),
        filePathBaseline: isPlatformModeConfig(config)
          ? notSupported
          : path.join(config.imagePathBaseline, fileNameWithExt),
        filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
        filePathDifference: isPlatformModeConfig(config)
          ? notSupported
          : path.join(config.imagePathDifference, fileNameWithExt),
        browserConfig: generateBrowserConfig(story),
        threshold: story.parameters?.lostpixel?.threshold ?? config.threshold,
        waitBeforeScreenshot:
          story.parameters?.lostpixel?.waitBeforeScreenshot ??
          config.waitBeforeScreenshot,
        mask: [...(mask ?? []), ...(story.parameters?.lostpixel?.mask ?? [])],
        elementLocator:
          story.parameters?.lostpixel?.elementLocator ??
          config?.storybookShots?.elementLocator ??
          '',
        waitForSelector: config?.storybookShots?.waitForSelector,
      };

      const storyLevelBreakpoints =
        story.parameters?.lostpixel?.breakpoints ?? [];

      const breakpoints = selectBreakpoints(
        config.breakpoints,
        modeBreakpoints,
        storyLevelBreakpoints,
      );

      let shotItems = [];

      if (!breakpoints || breakpoints.length === 0) {
        shotItems = [baseShotItem];
      } else {
        shotItems = breakpoints.map((breakpoint) => {
          label = generateLabel({ breakpoint, browser });
          fileNameWithExt = `${shotName}${label}.png`;

          return {
            ...baseShotItem,
            id: `${story.id}${label}`,
            shotName: `${shotName}${label}`,
            breakpoint,
            breakpointGroup: story.id,
            filePathBaseline: isPlatformModeConfig(config)
              ? notSupported
              : path.join(config.imagePathBaseline, fileNameWithExt),
            filePathCurrent: path.join(
              config.imagePathCurrent,
              fileNameWithExt,
            ),
            filePathDifference: isPlatformModeConfig(config)
              ? notSupported
              : path.join(config.imagePathDifference, fileNameWithExt),
            viewport: {
              width: breakpoint,
              height: undefined,
            },
            url: generateStoryUrl(
              iframeUrl,
              story.id,
              story.parameters?.lostpixel?.args,
              breakpoint,
            ),
            browserConfig: generateBrowserConfig({
              ...story,
              parameters: {
                ...story.parameters,
                viewport: {
                  width: breakpoint,
                },
              },
            }),
          };
        });
      }

      const extraShots =
        story.parameters?.lostpixel?.extraShots?.flatMap((snapshot) => {
          const combinedArgs = {
            ...story.parameters?.lostpixel?.args,
            ...snapshot.args,
          };
          const snapshotShotName = generateFilename(
            story.kind,
            story.story,
            snapshot.prefix,
            snapshot.suffix,
          );

          return (breakpoints?.length === 0 ? [undefined] : breakpoints).map(
            (breakpoint) => {
              label = generateLabel({ breakpoint, browser });
              fileNameWithExt = `${snapshotShotName}${label}.png`;

              return {
                ...baseShotItem,
                id: `${story.id}${label}-${snapshot.name ?? 'snapshot'}`,
                shotName: `${snapshotShotName}${label}`,
                breakpoint,
                breakpointGroup: story.id,
                filePathBaseline: isPlatformModeConfig(config)
                  ? notSupported
                  : path.join(config.imagePathBaseline, fileNameWithExt),
                filePathCurrent: path.join(
                  config.imagePathCurrent,
                  fileNameWithExt,
                ),
                filePathDifference: isPlatformModeConfig(config)
                  ? notSupported
                  : path.join(config.imagePathDifference, fileNameWithExt),
                url: generateStoryUrl(
                  iframeUrl,
                  story.id,
                  combinedArgs,
                  breakpoint,
                ),
                viewport: breakpoint
                  ? {
                      width: breakpoint,
                      height: undefined,
                    }
                  : undefined,
                browserConfig: generateBrowserConfig({
                  ...story,
                  parameters: {
                    ...story.parameters,
                    viewport: {
                      width: breakpoint,
                    },
                  },
                }),
              };
            },
          );
        }) ?? [];

      return [...shotItems, ...extraShots];
    });
};
