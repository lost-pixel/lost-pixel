import { Changes } from './diff';
import { readdirSync } from 'fs';
import { UploadFile } from './upload';

type ExtendFileName = { fileName: string; extension: 'after' | 'before' };

export const extendFileName = ({ fileName, extension }: ExtendFileName) => {
  const parts = fileName.split('.').filter((part) => part !== '');
  const extensionIndex = parts.length - 1;

  if (parts.length === 1) {
    return `${extension}.${parts[0]}`;
  } else if (parts.length === 0) {
    return extension;
  }

  parts[extensionIndex] = `${extension}.${parts[extensionIndex]}`;

  return parts.join('.');
};

type ComparisonType = 'ADDITION' | 'DELETION' | 'DIFFERENCE';

type CreateUploadItem = {
  path: string;
  filePath: string;
  type: ComparisonType;
};

const createUploadItem = ({
  path,
  filePath,
  type,
}: CreateUploadItem): UploadFile => ({
  path,
  filePath,
  metaData: {
    'content-type': 'image/png',
    type,
    original: filePath,
  },
});

type Comparison = {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  type: ComparisonType;
};

type PrepareComparisonList = {
  changes: Changes;
  baseUrl: string;
};

export const prepareComparisonList = ({
  changes,
  baseUrl,
}: PrepareComparisonList): [Comparison[], UploadFile[]] => {
  const comparisonList: Comparison[] = [];
  const uploadList: UploadFile[] = [];

  changes.addition.forEach((file) => {
    const afterFile = extendFileName({ fileName: file, extension: 'after' });
    const type = 'ADDITION';

    comparisonList.push({
      type,
      afterImageUrl: [baseUrl, afterFile].join('/'),
    });

    uploadList.push(
      createUploadItem({
        path: afterFile,
        filePath: file,
        type,
      }),
    );
  });

  changes.deletion.forEach((file) => {
    const beforeFile = extendFileName({ fileName: file, extension: 'before' });
    const type = 'DELETION';

    comparisonList.push({
      type,
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
    });

    uploadList.push(
      createUploadItem({
        path: beforeFile,
        filePath: file,
        type,
      }),
    );
  });

  changes.difference.forEach((file) => {
    const beforeFile = extendFileName({ fileName: file, extension: 'before' });
    const afterFile = extendFileName({ fileName: file, extension: 'after' });
    const type = 'DIFFERENCE';

    comparisonList.push({
      type,
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
      afterImageUrl: [baseUrl, afterFile].join('/'),
    });

    uploadList.push(
      createUploadItem({
        path: beforeFile,
        filePath: file,
        type,
      }),
    );

    uploadList.push(
      createUploadItem({
        path: afterFile,
        filePath: file,
        type,
      }),
    );
  });

  return [comparisonList, uploadList];
};

export const getImageList = (path: string): string[] => {
  const files = readdirSync(path);

  return files.filter((file) => file.endsWith('.png'));
};
