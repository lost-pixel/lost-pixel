import { prepareComparisonList } from './utils';
import { getChanges } from './diff';

describe(prepareComparisonList, () => {
  it('should return empty list if no changes found', () => {
    const changes = getChanges({
      reference: ['a.png', 'b.png'],
      current: ['a.png', 'b.png'],
      difference: [],
    });

    expect(
      prepareComparisonList({
        changes,
        baseUrl: 'https://s3',
      }),
    ).toEqual([]);
  });

  it('should build comparisons', () => {
    const changes = getChanges({
      reference: ['a.png', 'b.png'],
      current: ['a.png', 'd.png', 'c.png'],
      difference: ['a.png'],
    });

    expect(
      prepareComparisonList({
        changes,
        baseUrl: 'https://s3',
      }),
    ).toEqual([
      { afterImageUrl: 'https://s3/c.png', type: 'ADDITION' },
      { afterImageUrl: 'https://s3/d.png', type: 'ADDITION' },
      { beforeImageUrl: 'https://s3/b.png', type: 'DELETION' },
      {
        afterImageUrl: 'https://s3/a.png',
        beforeImageUrl: 'https://s3/a.png',
        type: 'DIFFERENCE',
      },
    ]);
  });
});
