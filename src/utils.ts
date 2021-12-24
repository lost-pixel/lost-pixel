import { Changes } from './diff';

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

type Comparison = {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  type: 'ADDITION' | 'DELETION' | 'DIFFERENCE';
};

type PrepareComparisonList = {
  changes: Changes;
  baseUrl: string;
};

export const prepareComparisonList = ({
  changes,
  baseUrl,
}: PrepareComparisonList): Comparison[] => {
  const comparisonList: Comparison[] = [];

  changes.addition.forEach((file) => {
    const afterFile = extendFileName({ fileName: file, extension: 'after' });
    comparisonList.push({
      type: 'ADDITION',
      afterImageUrl: [baseUrl, afterFile].join('/'),
    });
  });

  changes.deletion.forEach((file) => {
    const beforeFile = extendFileName({ fileName: file, extension: 'before' });
    comparisonList.push({
      type: 'DELETION',
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
    });
  });

  changes.difference.forEach((file) => {
    const beforeFile = extendFileName({ fileName: file, extension: 'before' });
    const afterFile = extendFileName({ fileName: file, extension: 'after' });
    comparisonList.push({
      type: 'DIFFERENCE',
      beforeImageUrl: [baseUrl, beforeFile].join('/'),
      afterImageUrl: [baseUrl, afterFile].join('/'),
    });
  });

  return comparisonList;
};
