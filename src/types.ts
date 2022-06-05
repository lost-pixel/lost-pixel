import { ItemBucketMetadata } from 'minio';
import {
  PullRequestEvent,
  CheckSuiteRequestedEvent,
  CheckRunRerequestedEvent,
} from '@octokit/webhooks-types';

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
