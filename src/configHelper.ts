import { bundleRequire } from 'bundle-require';
import type { Service } from 'ts-node';
import { log } from './log';

export const loadProjectConfigFile = async (
  configFilepath: string,
): Promise<unknown> => {
  try {
    const { mod } = await bundleRequire<{
      default?: unknown;
      config?: unknown;
    }>({
      filepath: configFilepath,
      esbuildOptions: {
        logLevel: 'info',
      },
    });

    return mod?.default ?? mod?.config ?? mod;
  } catch (error: unknown) {
    log.process('error', 'config', error);
    throw new Error("Couldn't load config file");
  }
};

let tsNodeService: Service;

const setupTsNode = async (): Promise<Service> => {
  if (tsNodeService) {
    return tsNodeService;
  }

  try {
    const tsNode = await import('ts-node');

    tsNodeService = tsNode.register({
      transpileOnly: true,
      compilerOptions: {
        module: 'commonjs',
      },
    });

    return tsNodeService;
  } catch (error: unknown) {
    // @ts-expect-error Error type definition is missing 'code'
    if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error.code)) {
      log.process(
        'error',
        'config',
        `Please install "ts-node" to use a TypeScript configuration file`,
      );
      process.exit(1);
    }

    process.exit(1);
  }
};

export const loadTSProjectConfigFile = async (
  configFilepath: string,
): Promise<unknown> => {
  await setupTsNode();
  tsNodeService.enabled(true);

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const imported: Record<string, unknown> = require(configFilepath);

  tsNodeService.enabled(false);

  return imported?.default ?? imported?.config;
};
