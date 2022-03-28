import { Page, Request } from 'playwright';
import { log } from '../utils';

export const waitForNetworkRequests = ({
  page,
  timeout = 30_000,
}: {
  page: Page;
  timeout?: number;
}) =>
  new Promise((resolve, reject) => {
    let requestCounter = 0;
    let requests = new Set<Request>();

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout'));
    }, timeout);

    const onRequest = (request: Request) => {
      requestCounter++;
      requests.add(request);
      log('+ ' + request.url());
    };

    const onRequestFinished = (request: Request) => {
      requestCounter--;
      requests.delete(request);
      log('- ' + request.url());

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
