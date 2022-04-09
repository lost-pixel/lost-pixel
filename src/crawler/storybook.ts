import path from 'path';
import { ShotItem } from '../shots/shots';
import kebabCase from 'lodash.kebabcase';
import { config } from '../config';
import { getBrowser } from '../utils';

export type Story = {
  id: string;
  kind: string;
  story: string;
  parameters?: {
    lostpixel?: {
      disable?: boolean;
    };
    storyshots?: {
      disable?: boolean;
    };
    viewport?: {
      width?: number;
      height?: number;
    };
  };
};

interface StorybookClientApi {
  raw?: () => Story[];
}

type WindowObject = typeof window & {
  __STORYBOOK_CLIENT_API__: StorybookClientApi;
};

type CrawlerResult = {
  stories: Story[] | null;
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

export const collectStories = async (
  url: string,
  isIframeUrl: boolean = false,
) => {
  const browser = await getBrowser().launch();
  const page = await browser.newPage();
  const iframeUrl = isIframeUrl
    ? getStoryBookUrl(url)
    : getIframeUrl(getStoryBookUrl(url));

  try {
    await page.goto(iframeUrl);

    await page.waitForFunction(
      () => (window as WindowObject).__STORYBOOK_CLIENT_API__,
      null,
      {
        timeout: config.timeouts.fetchStories,
      },
    );

    const result = await page.evaluate(
      () =>
        new Promise<CrawlerResult>((resolve) => {
          const parseParameters = <T>(
            parameters: T,
            level = 0,
          ): T | 'UNSUPPORTED_DEPTH' | 'UNSUPPORTED_TYPE' => {
            if (level > 10) {
              return 'UNSUPPORTED_DEPTH';
            }

            if (Array.isArray(parameters)) {
              // @ts-ignore
              return parameters.map((value) =>
                parseParameters(value, level + 1),
              );
            } else if (
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
            } else if (typeof parameters === 'object' && parameters !== null) {
              // @ts-ignore
              return Object.keys(parameters).reduce((acc, key: keyof T) => {
                // @ts-ignore
                acc[key] = parseParameters(parameters[key], level + 1);
                return acc;
              }, {} as T);
            } else {
              return 'UNSUPPORTED_TYPE';
            }
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

              return resolve({ stories });
            }

            resolve({ stories: [] });
          };

          fetchStories();
        }),
    );

    await browser.close();

    return result;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

const generateFilename = (story: Story) =>
  [story.kind, story.story].map(kebabCase).join('--');

const generateBrowserConfig = (story: Story) => {
  const browserConfig = config.configureBrowser?.(story);

  if (story.parameters?.viewport) {
    if (browserConfig) {
      browserConfig.viewport = browserConfig.viewport || {
        width: 1280,
        height: 720,
      };
      browserConfig.viewport = {
        ...browserConfig.viewport,
        ...story.parameters.viewport,
      };
    }
  }

  return browserConfig;
};

export const generateShotItems = (
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
      };
    });

  return shotItems;
};
