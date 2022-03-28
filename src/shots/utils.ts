import { Page, Request } from 'playwright';
import { log } from '../utils';

export const waitForNetworkRequests = ({
  page,
  logger,
  timeout = 30_000,
  waitForFirstRequest = 1_000,
}: {
  page: Page;
  logger: typeof log;
  timeout?: number;
  waitForFirstRequest?: number;
}) =>
  new Promise((resolve, reject) => {
    let requestCounter = 0;
    let requests = new Set<Request>();

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
      clearTimeout(firstRequestTimeoutId);

      requestCounter++;
      requests.add(request);
      logger(`+ ${request.url()}`);
    };

    const onRequestFinished = (request: Request) => {
      requestCounter--;
      requests.delete(request);
      logger(`- ${request.url()}`);

      if (requestCounter === 0) {
        cleanup();
        resolve(true);
      }
    };

    function cleanup() {
      clearTimeout(timeoutId);
      page.removeListener('request', onRequest);
      page.removeListener('requestfinished', onRequestFinished);
      page.removeListener('requestfailed', onRequestFinished);
    }

    page.on('request', onRequest);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);
  });
