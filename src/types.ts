import type { ItemBucketMetadata } from 'minio';
import type {
  PullRequestEvent,
  CheckSuiteRequestedEvent,
  CheckRunRerequestedEvent,
} from '@octokit/webhooks-types';
import type { BrowserContextOptions } from 'playwright';
import type { ShotMode } from './config';

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

export type UploadFile = {
  uploadPath: string;
  filePath: string;
  metaData: ItemBucketMetadata;
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

export type FilenameWithPath = {
  name: string;
  path: string;
};
