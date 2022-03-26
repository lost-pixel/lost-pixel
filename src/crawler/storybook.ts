import { firefox } from 'playwright';

export type Story = {
  id: string;
  kind: string;
  story: string;
  parameters: Record<string, unknown>;
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

export const collectStories = async (url: string) => {
  const browser = await firefox.launch();
  const page = await browser.newPage();
  const iframeUrl = url.endsWith('/')
    ? `${url}iframe.html`
    : `${url}/iframe.html`;

  await page.goto(iframeUrl);

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
              parameters: item.parameters,
            }));

            res({ stories });
          } else {
            throw new Error('Stories not found');
          }
        };

        fetchStories();
      }),
  );

  await browser.close();

  return result;
};
