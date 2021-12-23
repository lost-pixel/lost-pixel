import { Changes } from './diff';

type Comparison = {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  type: 'ADDITION' | 'DELETION' | 'DIFFERENCE';
};

type PrepareComparisonList = {
  changes: Changes;
};

export const prepareComparisonList = ({
  changes,
}: PrepareComparisonList): Comparison[] => {
  const comparisonList: Comparison[] = [];

  changes.addition.forEach((file) => {
    comparisonList.push({
      type: 'ADDITION',
      afterImageUrl: file,
    });
  });

  changes.deletion.forEach((file) => {
    comparisonList.push({
      type: 'DELETION',
      beforeImageUrl: file,
    });
  });

  changes.difference.forEach((file) => {
    comparisonList.push({
      type: 'DIFFERENCE',
      beforeImageUrl: file,
      afterImageUrl: file,
    });
  });

  return comparisonList;
};
