import { extendFileName, prepareComparisonList } from './utils';
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
      { afterImageUrl: 'https://s3/c.after.png', type: 'ADDITION' },
      { afterImageUrl: 'https://s3/d.after.png', type: 'ADDITION' },
      { beforeImageUrl: 'https://s3/b.before.png', type: 'DELETION' },
      {
        afterImageUrl: 'https://s3/a.after.png',
        beforeImageUrl: 'https://s3/a.before.png',
        type: 'DIFFERENCE',
      },
    ]);
  });
});

describe(extendFileName, () => {
  it('should extend file names', () => {
    expect(extendFileName({ fileName: 'a.png', extension: 'after' })).toEqual(
      'a.after.png',
    );

    expect(
      extendFileName({ fileName: 'another.one.png', extension: 'after' }),
    ).toEqual('another.one.after.png');

    expect(
      extendFileName({ fileName: 'One More .png', extension: 'before' }),
    ).toEqual('One More .before.png');
  });

  it('should handle irregular file names', () => {
    expect(extendFileName({ fileName: '.png', extension: 'after' })).toEqual(
      'after.png',
    );

    expect(extendFileName({ fileName: 'test', extension: 'after' })).toEqual(
      'after.test',
    );

    expect(extendFileName({ fileName: '', extension: 'before' })).toEqual(
      'before',
    );
  });
});
