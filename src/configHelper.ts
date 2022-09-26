import { bundleRequire } from 'bundle-require'

export const loadTSProjectConfigFile = async (
  configFilepath: string,
): Promise<unknown> => {
  const { mod } = await bundleRequire({
    filepath: configFilepath,
  })

  return mod?.default ?? mod?.config;
};

// Things that I have tried
// leveraging moduleTypes like
/*
moduleTypes: {
  [baseName]: "cjs"
}
*/
// worked for typescript but not for js config files

// Vite load like this
// https://github.com/vitejs/vite/blob/9acb8391574350389e60b6639db29e042dfc9a67/packages/vite/src/node/config.ts#L915
// creates tmp file for esm: https://github.com/vitejs/vite/blob/9acb8391574350389e60b6639db29e042dfc9a67/packages/vite/src/node/config.ts#L1051
// and tests like this
// https://github.com/vitejs/vite/blob/9acb8391574350389e60b6639db29e042dfc9a67/playground/resolve-config/__tests__/resolve-config.spec.ts#L9
//