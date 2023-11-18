import type { Page, Request } from 'playwright-core';
import { config } from '../config';
import type { log } from '../log';

const checkIgnoreUrls = (url: string, ignoreUrls: string[]) => {
  for (const ignoreUrl of ignoreUrls) {
    if (url.includes(ignoreUrl)) {
      return true;
    }
  }

  return false;
};

export const waitForNetworkRequests = async ({
  page,
  logger,
  timeout = config.timeouts.networkRequests,
  waitForFirstRequest = config.waitForFirstRequest,
  waitForLastRequest = config.waitForLastRequest,
  ignoreUrls = [],
}: {
  page: Page;
  logger: ReturnType<typeof log.item>;
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

      logger.process('info', 'network', 'Pending requests:', pendingUrls);

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
        logger.browser('info', 'network', `+ ${request.url()}`);
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
          : `${response?.status() ?? 'unknown'} ${
              response?.statusText() ?? 'unknown'
            }`;

        logger.browser('info', 'network', `- ${request.url()} [${statusText}]`);
      }

      lastRequestTimeoutId = setTimeout(() => {
        // `requestCounter` can be below 0 if requests have completed before they were being tracked
        if (requestCounter <= 0) {
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
  const viewport = await page.evaluate(
    async () =>
      new Promise<{ height: number; width: number }>((resolve) => {
        const body = document.body;
        const html = document.documentElement;

        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight,
        );

        const width = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth,
        );

        resolve({ height, width });
      }),
  );

  await page.setViewportSize({
    width: Math.max(page.viewportSize()?.width ?? 800, viewport.width),
    height: viewport.height,
  });
};

export const selectBreakpoints = (
  topLevelBreakpoints?: number[],
  modeBreakpoints?: number[],
  shotBreakpoints?: number[],
) => {
  if (shotBreakpoints && shotBreakpoints.length > 0) {
    return shotBreakpoints;
  }

  if (modeBreakpoints && modeBreakpoints.length > 0) {
    return modeBreakpoints;
  }

  return topLevelBreakpoints ?? [];
};

export const generateSizeLabel = (breakpoint: number): string => {
  const widthLabel = breakpoint > 0 ? `w${breakpoint}px` : '';

  const sizeLabel = `__[${widthLabel}]`;

  return sizeLabel;
};
