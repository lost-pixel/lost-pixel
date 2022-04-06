import path from 'path';
import { firefox } from 'playwright';
import {
  imagePathBaseline,
  imagePathCurrent,
  imagePathDifference,
} from '../constants';
import { ShotItem } from '../shots/shots';
import kebabCase from 'lodash.kebabcase';

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
  const browser = await firefox.launch();
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
        timeout: Number(process.env.FETCH_STORIES_TIMEOUT) || 30_000,
      },
    );

    const result = await page.evaluate(
      () =>
        new Promise<CrawlerResult>((res) => {
          const fetchStories = () => {
            const { __STORYBOOK_CLIENT_API__: api } = window as WindowObject;

            if (api.raw) {
              const stories: Story[] = api.raw().map((item) => ({
                id: item.id,
                kind: item.kind,
                story: item.story,
                parameters: item.parameters,
              }));

              res({ stories });
            }
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

export const generateShotItems = (
  baseUrl: string,
  stories: Story[],
): ShotItem[] => {
  const iframeUrl = getIframeUrl(getStoryBookUrl(baseUrl));

  const shotItems = stories
    .filter((story) => story.parameters?.lostpixel?.disable !== true)
    .filter((story) => story.parameters?.storyshots?.disable !== true)
    .map((story) => {
      const fileName = `${generateFilename(story)}.png`;

      return {
        id: story.id,
        url: `${iframeUrl}?id=${story.id}&viewMode=story`,
        filePathBaseline: path.join(imagePathBaseline, fileName),
        filePathCurrent: path.join(imagePathCurrent, fileName),
        filePathDifference: path.join(imagePathDifference, fileName),
      };
    });

  return shotItems;
};
