import path from 'path';
import { collectStories } from './storybook';

('http://localhost:8080/iframe.html');

const storyBookUrl =
  'file://' +
  path.normalize(
    path.join(process.cwd(), 'examples/storybook-demo/storybook-static'),
  );

describe(collectStories, () => {
  it('should collect stories from StoryBook', async () => {
    expect(await collectStories(storyBookUrl)).toMatchSnapshot();
  });

  it('should fail when using invalid path to StoryBook', () => {
    expect(() => collectStories('this/path/does/not/exist')).rejects.toThrow(
      'Invalid url',
    );
  });

  it('should fail when using invalid url to StoryBook', () => {
    expect(() => collectStories('http://localhost:99999')).rejects.toThrow(
      'Invalid url',
    );
  });

  it('should timeout when using invalid url to StoryBook', () => {
    expect(() =>
      collectStories(`${storyBookUrl}/nothing/here`),
    ).rejects.toThrow('NS_ERROR_FILE_NOT_FOUND');
  });
});
