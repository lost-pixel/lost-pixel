import { createShotsFolders } from '../utils';
import { type PageScreenshotParameter, configure } from '../config';
import { defaultTestConfig } from '../testUtils';
import { generatePageShotItems } from './pageScreenshots';

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

describe(generatePageShotItems, () => {
  it('should generate shot items for pages without breakpoints', () => {
    const baseUrl = 'https://example.com';

    const pages: PageScreenshotParameter[] = [
      {
        name: 'home',
        path: '/',
      },
      {
        name: 'about',
        path: '/about',
      },
    ];

    const shotItems = generatePageShotItems(pages, baseUrl);

    expect(shotItems).toMatchSnapshot('PagesWithoutBreakpoints');
  });

  it('should generate shot items for pages with breakpoints', () => {
    const baseUrl = 'https://example.com';

    const pages: PageScreenshotParameter[] = [
      {
        name: 'home',
        path: '/',
        breakpoints: [480, 768],
      },
      {
        name: 'about',
        path: '/about',
        breakpoints: [480, 768],
      },
    ];

    const shotItems = generatePageShotItems(pages, baseUrl);

    expect(shotItems).toMatchSnapshot('PagesWithBreakpoints');
  });
});
