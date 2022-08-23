import { ItemBucketMetadata } from 'minio';
import {
  PullRequestEvent,
  CheckSuiteRequestedEvent,
  CheckRunRerequestedEvent,
} from '@octokit/webhooks-types';
import { BrowserContextOptions } from 'playwright';
import { ShotMode } from './config';

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
};
