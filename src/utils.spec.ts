import { getChanges, extendFileName, prepareComparisonList } from './utils';

describe(getChanges, () => {
  it('should reflect no difference', () => {
    expect(
      getChanges({
        reference: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        current: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    });

    expect(
      getChanges({
        reference: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        current: [
          { path: '/test', name: 'b.png' },
          { path: '/test', name: 'a.png' },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    });
  });

  it('should highlight added files', () => {
    expect(
      getChanges({
        reference: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        current: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
          { path: '/test', name: 'd.png' },
          { path: '/test', name: 'c.png' },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [
        { path: '/test', name: 'c.png' },
        { path: '/test', name: 'd.png' },
      ],
    });
  });

  it('should highlight removed files', () => {
    expect(
      getChanges({
        reference: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
          { path: '/test', name: 'c.png' },
          { path: '/test', name: 'd.png' },
        ],
        current: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'd.png' },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [
        { path: '/test', name: 'b.png' },
        { path: '/test', name: 'c.png' },
      ],
      addition: [],
    });
  });

  it('should highlight changed files', () => {
    expect(
      getChanges({
        reference: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        current: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        difference: [{ path: '/test', name: 'b.png' }],
      }),
    ).toEqual({
      difference: [{ path: '/test', name: 'b.png' }],
      deletion: [],
      addition: [],
    });
  });

  it('should highlight added/remove/changed files', () => {
    expect(
      getChanges({
        reference: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'b.png' },
        ],
        current: [
          { path: '/test', name: 'a.png' },
          { path: '/test', name: 'd.png' },
          { path: '/test', name: 'c.png' },
        ],
        difference: [{ path: '/test', name: 'a.png' }],
      }),
    ).toEqual({
      difference: [{ path: '/test', name: 'a.png' }],
      deletion: [{ path: '/test', name: 'b.png' }],
      addition: [
        { path: '/test', name: 'c.png' },
        { path: '/test', name: 'd.png' },
      ],
    });
  });
});

describe(prepareComparisonList, () => {
  it('should return empty list if no changes found', () => {
    const changes = getChanges({
      reference: [
        { path: '/test', name: 'a.png' },
        { path: '/test', name: 'b.png' },
      ],
      current: [
        { path: '/test', name: 'a.png' },
        { path: '/test', name: 'b.png' },
      ],
      difference: [],
    });

    expect(
      prepareComparisonList({
        changes,
        baseUrl: 'https://s3',
      }),
    ).toEqual([[], []]);
  });

  it('should build comparisons', () => {
    const changes = getChanges({
      reference: [
        { path: '/test', name: 'a.png' },
        { path: '/test', name: 'b.png' },
      ],
      current: [
        { path: '/test', name: 'a.png' },
        { path: '/test', name: 'd.png' },
        { path: '/test', name: 'c.png' },
      ],
      difference: [{ path: '/test', name: 'a.png' }],
    });

    expect(
      prepareComparisonList({
        changes,
        baseUrl: 'https://s3',
      }),
    ).toEqual([
      [
        { afterImageUrl: 'https://s3/c.after.png', type: 'ADDITION' },
        { afterImageUrl: 'https://s3/d.after.png', type: 'ADDITION' },
        { beforeImageUrl: 'https://s3/b.before.png', type: 'DELETION' },
        {
          afterImageUrl: 'https://s3/a.after.png',
          beforeImageUrl: 'https://s3/a.before.png',
          type: 'DIFFERENCE',
        },
      ],
      [
        {
          filePath: '/test/c.png',
          metaData: {
            'content-type': 'image/png',
            original: '/test/c.png',
            type: 'ADDITION',
          },
          path: 'c.after.png',
        },
        {
          filePath: '/test/d.png',
          metaData: {
            'content-type': 'image/png',
            original: '/test/d.png',
            type: 'ADDITION',
          },
          path: 'd.after.png',
        },
        {
          filePath: '/test/b.png',
          metaData: {
            'content-type': 'image/png',
            original: '/test/b.png',
            type: 'DELETION',
          },
          path: 'b.before.png',
        },
        {
          filePath: '/test/a.png',
          metaData: {
            'content-type': 'image/png',
            original: '/test/a.png',
            type: 'DIFFERENCE',
          },
          path: 'a.before.png',
        },
        {
          filePath: '/test/a.png',
          metaData: {
            'content-type': 'image/png',
            original: '/test/a.png',
            type: 'DIFFERENCE',
          },
          path: 'a.after.png',
        },
      ],
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
