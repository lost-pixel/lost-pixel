import type {
  PullRequestEvent,
  CheckSuiteRequestedEvent,
  CheckRunRerequestedEvent,
} from '@octokit/webhooks-types';
import type { BrowserContextOptions } from 'playwright';

export type ShotMode = 'storybook' | 'ladle' | 'page' | 'custom';

export type WebhookEvent =
  | PullRequestEvent
  | CheckSuiteRequestedEvent
  | CheckRunRerequestedEvent;

export type ComparisonType = 'ADDITION' | 'DELETION' | 'DIFFERENCE';

export type Comparison = {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  differenceImageUrl?: string;
  type: ComparisonType;
  path: string;
  name: string;
};

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
};
