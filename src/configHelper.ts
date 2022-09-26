import { bundleRequire } from 'bundle-require';

export const loadProjectConfigFile = async (
  configFilepath: string,
): Promise<unknown> => {
  const { mod } = await bundleRequire<{
    default?: unknown;
    config?: unknown;
  }>({
    filepath: configFilepath,
  });

  return mod?.default ?? mod?.config;
};
