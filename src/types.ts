import type { BrowserContextOptions } from 'playwright-core';

export type ShotMode = 'storybook' | 'ladle' | 'page' | 'custom';

export type ShotItem = {
  shotMode: ShotMode;
  id: string;
  shotName: string;
  url: string;
  filePathBaseline: string;
  filePathCurrent: string;
  filePathDifference: string;
  browserConfig?: BrowserContextOptions;
  threshold: number;
  waitBeforeScreenshot?: number;
  importPath?: string;
  mask?: Array<{
    selector: string;
  }>;
  viewport?: {
    width: number;
    height?: number;
  };
  breakpoint?: number;
  breakpointGroup?: string;
};

export type ExtendedShotItem = ShotItem & {
  uniqueName: string;
  hash: string;
};
