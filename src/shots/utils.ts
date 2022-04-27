import { Page, Request } from 'playwright';
import { config } from '../config';

const checkIgnoreUrls = (url: string, ignoreUrls: string[]) => {
  for (const ignoreUrl of ignoreUrls) {
    if (url.includes(ignoreUrl)) {
      return true;
    }
  }

  return false;
};

export const waitForNetworkRequests = ({
  page,
  logger,
  timeout = config.timeouts.networkRequests,
  waitForFirstRequest = config.waitForFirstRequest,
  waitForLastRequest = config.waitForLastRequest,
  ignoreUrls = [],
}: {
  page: Page;
  logger: (message: string, ...rest: unknown[]) => void;
  timeout?: number;
  waitForFirstRequest?: number;
  waitForLastRequest?: number;
  ignoreUrls?: string[];
}) =>
  new Promise((resolve, reject) => {
    let requestCounter = 0;
    const requests = new Set<Request>();
    let lastRequestTimeoutId: NodeJS.Timeout;

    const timeoutId = setTimeout(() => {
      const pendingUrls = [...requests].map((request) => request.url());
      logger('Pending requests:', pendingUrls);

      cleanup();
      reject(new Error('Timeout'));
    }, timeout);

    const firstRequestTimeoutId = setTimeout(() => {
      cleanup();
      resolve(true);
    }, waitForFirstRequest);

    const onRequest = (request: Request) => {
      if (!checkIgnoreUrls(request.url(), ignoreUrls)) {
        clearTimeout(firstRequestTimeoutId);
        clearTimeout(lastRequestTimeoutId);
        requestCounter++;
        requests.add(request);
        logger(`+ ${request.url()}`);
      }
    };

    const onRequestFinished = async (request: Request) => {
      clearTimeout(lastRequestTimeoutId);

      if (!checkIgnoreUrls(request.url(), ignoreUrls)) {
        const failure = request.failure();
        const response = await request.response();

        requestCounter--;
        requests.delete(request);

        const statusText = failure
          ? failure.errorText
          : `${response?.status()} ${response?.statusText()}`;
        logger(`- ${request.url()} [${statusText}]`);
      }

      lastRequestTimeoutId = setTimeout(() => {
        if (requestCounter === 0) {
          cleanup();
          resolve(true);
        }
      }, waitForLastRequest);
    };

    function cleanup() {
      clearTimeout(timeoutId);
      clearTimeout(firstRequestTimeoutId);
      clearTimeout(lastRequestTimeoutId);
      page.removeListener('request', onRequest);
      page.removeListener('requestfinished', onRequestFinished);
      page.removeListener('requestfailed', onRequestFinished);
    }

    page.on('request', onRequest);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);
  });

export const resizeViewportToFullscreen = async ({ page }: { page: Page }) => {
  const height = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const body = document.body;
        const html = document.documentElement;

        resolve(
          Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
          ),
        );
      }),
  );

  await page.setViewportSize({
    width: page.viewportSize()?.width || 800,
    height,
  });
};
