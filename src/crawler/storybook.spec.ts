/* eslint-disable no-lone-blocks */

import { createShotsFolders, getBrowser } from '../utils';
import { configure } from '../config';
import { defaultTestConfig } from '../testUtils';
import {
  collectStories,
  collectStoriesViaStoriesJson,
  collectStoriesViaWindowApi,
  getIframeUrl,
  getStoryBookUrl,
} from './storybook';
import { launchStaticWebServer } from './utils';

const storyBookUrl = getStoryBookUrl(
  'examples/example-storybook-v6.4/storybook-static',
);

const storyBookV7Url = getStoryBookUrl(
  'examples/example-storybook-v6.5-storystore-v7/storybook-static',
);

beforeAll(async () => {
  await configure({
    ...defaultTestConfig,
    timeouts: {
      fetchStories: 2000,
    },
  });

  createShotsFolders();
  process.env.FETCH_STORIES_TIMEOUT = '2000';
});

describe(getStoryBookUrl, () => {
  it('should return a full StoryBook URL', () => {
    expect(getStoryBookUrl('/storybook-static')).toBe(
      'file:///storybook-static',
    );

    expect(getStoryBookUrl('/another/path/storybook-static')).toBe(
      'file:///another/path/storybook-static',
    );

    expect(getStoryBookUrl('relative/path/storybook-static')).toBe(
      `file://${process.cwd()}/relative/path/storybook-static`,
    );

    expect(getStoryBookUrl('file:///path/storybook-static')).toBe(
      'file:///path/storybook-static',
    );

    expect(getStoryBookUrl('http://localhost:8080')).toBe(
      'http://localhost:8080',
    );

    expect(getStoryBookUrl('https://example.com/storybook')).toBe(
      'https://example.com/storybook',
    );
  });
});

describe(getIframeUrl, () => {
  it('should attach the iframe document to the URL', () => {
    expect(getIframeUrl('https://example.com/storybook')).toBe(
      'https://example.com/storybook/iframe.html',
    );

    expect(getIframeUrl('https://example.com/storybook/')).toBe(
      'https://example.com/storybook/iframe.html',
    );
  });
});

describe(collectStories, () => {
  it('should collect stories from StoryBook', async () => {
    const browser = await getBrowser().launch();
    const context = await browser.newContext();

    {
      const { server, url } = await launchStaticWebServer(storyBookUrl);
      expect(await collectStoriesViaWindowApi(context, url)).toMatchSnapshot(
        'ViaWindowApi',
      );
      server.close();
    }

    {
      const { server, url } = await launchStaticWebServer(storyBookV7Url);
      expect(await collectStoriesViaWindowApi(context, url)).toMatchSnapshot(
        'ViaWindowApi StoryStore v7',
      );
      server.close();
    }

    {
      const { server, url } = await launchStaticWebServer(storyBookV7Url);
      expect(await collectStoriesViaStoriesJson(context, url)).toMatchSnapshot(
        'ViaStoriesJson',
      );
      server.close();
    }

    await browser.close();
  }, 10_000);

  it('should fail when using invalid path to StoryBook', async () => {
    const browser = await getBrowser().launch();
    const context = await browser.newContext();

    await expect(async () =>
      collectStoriesViaWindowApi(context, 'this/path/does/not/exist'),
    ).rejects.toThrow('ERR_FILE_NOT_FOUND');

    await browser.close();
  });

  it('should fail when using invalid URL to StoryBook', async () => {
    const browser = await getBrowser().launch();
    const context = await browser.newContext();

    await expect(async () =>
      collectStoriesViaWindowApi(context, 'http://localhost:99999'),
    ).rejects.toThrow('invalid URL');

    await browser.close();
  });

  it('should timeout when using invalid URL to StoryBook', async () => {
    const browser = await getBrowser().launch();
    const context = await browser.newContext();

    await expect(async () =>
      collectStoriesViaWindowApi(context, `${storyBookUrl}/nothing/here`),
    ).rejects.toThrow('ERR_FILE_NOT_FOUND');

    await browser.close();
  });

  it('should fail if no stories found', async () => {
    const browser = await getBrowser().launch();
    const context = await browser.newContext();

    await expect(async () =>
      collectStoriesViaWindowApi(context, `${storyBookUrl}/index.html`, true),
    ).rejects.toThrow('Timeout 2000ms exceeded');

    await browser.close();
  }, 10_000);
});
