import { firefox } from 'playwright';

export type Story = {
  id: string;
  kind: string;
  story: string;
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

(async () => {
  const browser = await firefox.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/iframe.html');

  await page.waitForFunction(
    () => (window as WindowObject).__STORYBOOK_CLIENT_API__,
    {
      timeout: 30_000,
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
            }));

            res({ stories });
          } else {
            throw new Error('Stories not found');
          }
        };

        fetchStories();
      }),
  );

  console.log(result);
  await browser.close();
})();
