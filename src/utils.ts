import { Changes } from './diff';

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
    comparisonList.push({
      type: 'ADDITION',
      afterImageUrl: [baseUrl, file].join('/'),
    });
  });

  changes.deletion.forEach((file) => {
    comparisonList.push({
      type: 'DELETION',
      beforeImageUrl: [baseUrl, file].join('/'),
    });
  });

  changes.difference.forEach((file) => {
    comparisonList.push({
      type: 'DIFFERENCE',
      beforeImageUrl: [baseUrl, file].join('/'),
      afterImageUrl: [baseUrl, file].join('/'),
    });
  });

  return comparisonList;
};
