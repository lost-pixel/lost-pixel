import path from 'node:path';
import kebabCase from 'lodash.kebabcase';
import { BrowserContext } from 'playwright';
import { readFileSync } from 'fs-extra';
import { ShotItem } from '../shots/shots';
import { config } from '../config';
import { getBrowser } from '../utils';
import { log } from '../log';

export type StoryParameters = {
  lostpixel?: {
    disable?: boolean;
    threshold?: number;
  };
  viewport?: {
    width?: number;
    height?: number;
  };
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

interface StorybookClientApi {
  raw?: () => Story[];
  storyStore?: {
    cacheAllCSFFiles: () => Promise<void>;
  };
}

type StoriesJson = {
  v: number;
  stories: Story[];
};

type WindowObject = typeof window & {
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

  const result = await page.evaluate(
    async () =>
      new Promise<CrawlerResult>((resolve) => {
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
            typeof parameters === 'undefined' ||
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

        const fetchStories = () => {
          const { __STORYBOOK_CLIENT_API__: api } = window as WindowObject;

          if (api.raw) {
            const stories: Story[] = api.raw().map((item) => ({
              id: item.id,
              kind: item.kind,
              story: item.story,
              parameters: parseParameters(
                item.parameters as Record<string, unknown>,
              ) as Story['parameters'],
            }));

            resolve({ stories });
            return;
          }

          resolve({ stories: [] });
        };

        fetchStories();
      }),
  );

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
    log('Trying to collect stories via window object');
    const result = await collectStoriesViaWindowApi(context, url);
    await browser.close();
    return result;
  } catch {
    log('Fallback to /stories.json');
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

const generateFilename = (story: Story) =>
  [story.kind, story.story].map((value) => kebabCase(value)).join('--');

const generateBrowserConfig = (story: Story) => {
  const browserConfig = config.configureBrowser?.(story);

  if (story.parameters?.viewport && browserConfig) {
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

export const generateStorybookShotItems = (
  baseUrl: string,
  stories: Story[],
): ShotItem[] => {
  const iframeUrl = getIframeUrl(getStoryBookUrl(baseUrl));

  const shotItems = stories
    .filter((story) => story.parameters?.lostpixel?.disable !== true)
    .filter((story) => story.parameters?.storyshots?.disable !== true)
    .filter((story) => (config.filterStory ? config.filterStory(story) : true))
    .map((story) => {
      const fileName = config.imageFilenameGenerator
        ? config.imageFilenameGenerator(story)
        : generateFilename(story);

      const fileNameWithExt = `${fileName}.png`;

      return {
        id: story.id,
        url: `${iframeUrl}?id=${story.id}&viewMode=story`,
        filePathBaseline: path.join(config.imagePathBaseline, fileNameWithExt),
        filePathCurrent: path.join(config.imagePathCurrent, fileNameWithExt),
        filePathDifference: path.join(
          config.imagePathDifference,
          fileNameWithExt,
        ),
        browserConfig: generateBrowserConfig(story),
        threshold: story.parameters?.lostpixel?.threshold ?? config.threshold,
      };
    });

  return shotItems;
};
