import type * as z from 'zod';
import {
  type BrowserSchema,
  type MaskSchema,
  type ShotItemSchema,
  type ShotModeSchema,
} from './schemas';

export type BrowserName = z.infer<typeof BrowserSchema>;

export type ShotMode = z.infer<typeof ShotModeSchema>;

export type Mask = z.infer<typeof MaskSchema>;

export type ShotItem = z.infer<typeof ShotItemSchema>;

export type ExtendedShotItem = ShotItem & {
  uniqueName: string;
  hash: string;
};
