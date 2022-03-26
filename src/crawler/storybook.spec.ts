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
});
