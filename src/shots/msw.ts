import { isNodeProcess } from 'is-node-process';
import { SetupWorkerApi, RequestHandler, rest } from 'msw';
import type { SetupServerApi } from 'msw/node';
import { log } from '../log';

const IS_BROWSER = !isNodeProcess();

export type SetupApi = SetupWorkerApi | SetupServerApi;
export type InitializeOptions =
  | Parameters<SetupWorkerApi['start']>[0]
  | Parameters<SetupServerApi['listen']>[0];

let api: SetupApi;

export function initialize(options?: InitializeOptions): SetupApi {
  log(IS_BROWSER);
  if (IS_BROWSER) {
    log('I land here');
    const { setupWorker } = require('msw');
    const worker = setupWorker();
    worker.start(options);
    api = worker;
  } else {
    const { setupServer } = require('msw/node');
    const server = setupServer();
    server.listen(options);
    api = server;
  }

  return api;
}

export function getWorker(): SetupApi {
  if (api === undefined) {
    throw new Error(
      `[MSW] Failed to retrieve the worker: no active worker found. Did you forget to call "initialize"?`,
    );
  }

  return api;
}

export function initializeWorker(options?: InitializeOptions): SetupApi {
  log(api);
  return initialize(options);
}

export const prepareHandlers = (handlers?: RequestHandler[]) => {
  if (api) {
    log('resetting handlers');
    log(handlers);
    api.resetHandlers();
  }

  api.use(
    rest.get('https://my.backend/book', (_, response, ctx) => {
      return response(
        ctx.json({
          title: 'Lord of the Flies',
          description: 'The Lord of the Flies is an epic Drama book',
        }),
      );
    }),
  );
  // Api.use(...handlers);

  // If (handlers) {
  //   api.use(...handlers);
  // }
};
