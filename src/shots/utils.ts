import { Page, Request } from 'playwright';
import { config } from '../config';
import { log } from '../utils';

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
  logger: typeof log;
  timeout?: number;
  waitForFirstRequest?: number;
  waitForLastRequest?: number;
  ignoreUrls?: string[];
}) =>
  new Promise((resolve, reject) => {
    let requestCounter = 0;
    let requests = new Set<Request>();
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
        const response = await request.response();
        requestCounter--;
        requests.delete(request);
        logger(
          `- ${request.url()} [${response?.status()} ${response?.statusText()}]`,
        );
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
