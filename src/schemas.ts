import * as z from 'zod';
import type { BrowserContextOptions } from 'playwright-core';

export const BrowserSchema = z.enum(['chromium', 'firefox', 'webkit']);

export const ShotModeSchema = z.enum([
  'storybook',
  'ladle',
  'histoire',
  'page',
  'custom',
]);

export const MaskSchema = z.object({
  /**
   * CSS selector for the element to mask
   * Examples:
   * - `#my-id`: Selects the element with the id `my-id`
   * - `.my-class`: Selects all elements with the class `my-class`
   * - `div`: Selects all `div` elements
   * - `div.my-class`: Selects all `div` elements with the class `my-class`
   * - `li:nth-child(2n)`: Selects all even `li` elements
   * - `[data-testid="hero-banner"]`: Selects all elements with the attribute `data-testid` set to `hero-banner`
   * - `div > p`: Selects all `p` elements that are direct children of a `div` element
   */
  selector: z.string(),
});

export const ShotItemSchema = z.object({
  shotMode: ShotModeSchema,
  id: z.string(),
  shotName: z.string(),
  url: z.string(),
  filePathBaseline: z.string(),
  filePathCurrent: z.string(),
  filePathDifference: z.string(),
  browserConfig: z.custom<BrowserContextOptions>().optional(),
  threshold: z.number(),
  waitBeforeScreenshot: z.number().optional(),
  importPath: z.string().optional(),
  mask: z.array(MaskSchema).optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number().optional(),
    })
    .optional(),
  breakpoint: z.number().optional(),
  breakpointGroup: z.string().optional(),
  elementLocator: z.string().optional(),
  waitForSelector: z.string().optional(),
});
