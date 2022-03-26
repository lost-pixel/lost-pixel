import path from 'path';
import { collectStories, getStoryBookUrl } from './storybook';

const storyBookUrl = getStoryBookUrl(
  'examples/storybook-demo/storybook-static',
);

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

describe(collectStories, () => {
  it('should collect stories from StoryBook', async () => {
    expect(await collectStories(storyBookUrl)).toMatchSnapshot();
  });

  it('should fail when using invalid path to StoryBook', () => {
    expect(() => collectStories('this/path/does/not/exist')).rejects.toThrow(
      'Invalid url',
    );
  });

  it('should fail when using invalid URL to StoryBook', () => {
    expect(() => collectStories('http://localhost:99999')).rejects.toThrow(
      'Invalid url',
    );
  });

  it('should timeout when using invalid URL to StoryBook', () => {
    expect(() =>
      collectStories(`${storyBookUrl}/nothing/here`),
    ).rejects.toThrow('NS_ERROR_FILE_NOT_FOUND');
  });
});
