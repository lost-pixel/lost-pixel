import { readdirSync } from 'fs';
import { UploadFile } from './upload';
import { normalize, join } from 'path';

type File = {
  name: string;
  path: string;
};

export type Files = {
  reference: File[];
  current: File[];
  difference: File[];
};

export type Changes = {
  difference: File[];
  deletion: File[];
  addition: File[];
};

const sortFiles = (a: File, b: File): number => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};

export const getChanges = (files: Files): Changes => {
  return {
    difference: files.difference.sort(sortFiles),
    deletion: files.reference
      // .filter((file) => !files.current.includes(file))
      .filter(
        (file) => !files.current.find((file2) => file.name === file2.name),
      )
      .sort(sortFiles),
    addition: files.current
      // .filter((file) => !files.reference.includes(file))
      .filter(
        (file) => !files.reference.find((file2) => file.name === file2.name),
      )
      .sort(sortFiles),
  };
};

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
  file: File;
  type: ComparisonType;
};

const createUploadItem = ({
  path,
  file,
  type,
}: CreateUploadItem): UploadFile => {
  const filePath = normalize(join(file.path, file.name));

  return {
    path: join(process.env.LOST_PIXEL_PROJECT_ID || '', path),
    filePath,
    metaData: {
      'content-type': 'image/png',
      type,
      original: filePath,
    },
  };
};

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
    const afterFile = extendFileName({
      fileName: file.name,
      extension: 'after',
    });
    const type = 'ADDITION';

    comparisonList.push({
      type,
      afterImageUrl: [baseUrl, afterFile].join('/'),
    });

    uploadList.push(
      createUploadItem({
        path: afterFile,
        file,
        type,
      }),
    );
  });

  changes.deletion.forEach((file) => {
    const beforeFile = extendFileName({
      fileName: file.name,
      extension: 'before',
    });
    const type = 'DELETION';

    comparisonList.push({
      type,
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
    });

    uploadList.push(
      createUploadItem({
        path: beforeFile,
        file,
        type,
      }),
    );
  });

  changes.difference.forEach((file) => {
    const beforeFile = extendFileName({
      fileName: file.name,
      extension: 'before',
    });
    const afterFile = extendFileName({
      fileName: file.name,
      extension: 'after',
    });
    const type = 'DIFFERENCE';

    comparisonList.push({
      type,
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
      afterImageUrl: [baseUrl, afterFile].join('/'),
    });

    uploadList.push(
      createUploadItem({
        path: beforeFile,
        file,
        type,
      }),
    );

    uploadList.push(
      createUploadItem({
        path: afterFile,
        file,
        type,
      }),
    );
  });

  return [comparisonList, uploadList];
};

export const getImageList = (path: string): File[] => {
  const files = readdirSync(path);

  return files
    .filter((name) => name.endsWith('.png'))
    .map((name) => ({ name, path }));
};
