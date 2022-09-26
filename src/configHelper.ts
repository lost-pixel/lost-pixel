import { bundleRequire } from 'bundle-require';

export const loadProjectConfigFile = async (
  configFilepath: string,
): Promise<unknown> => {
  const { mod } = await bundleRequire({
    filepath: configFilepath,
  });

  return mod?.default ?? mod?.config;
};
