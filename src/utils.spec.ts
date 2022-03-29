import { join } from 'path';
import { getChanges, extendFileName, prepareComparisonList } from './utils';
import {
  imagePathCurrent,
  imagePathBaseline,
  imagePathDifference,
} from './constants';

process.env.LOST_PIXEL_PROJECT_ID = 'lorem-ipsum';
process.env.CI_BUILD_ID = '456';

describe(getChanges, () => {
  it('should reflect no difference', () => {
    expect(
      getChanges({
        baseline: ['a.png', 'b.png'],
        current: ['a.png', 'b.png'],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    });

    expect(
      getChanges({
        baseline: ['a.png', 'b.png'],
        current: ['b.png', 'a.png'],
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
        baseline: ['a.png', 'b.png'],
        current: ['a.png', 'b.png', 'd.png', 'c.png'],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: ['c.png', 'd.png'],
    });
  });

  it('should highlight removed files', () => {
    expect(
      getChanges({
        baseline: ['a.png', 'b.png', 'c.png', 'd.png'],
        current: ['a.png', 'd.png'],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: ['b.png', 'c.png'],
      addition: [],
    });
  });

  it('should highlight changed files', () => {
    expect(
      getChanges({
        baseline: ['a.png', 'b.png'],
        current: ['a.png', 'b.png'],
        difference: ['b.png'],
      }),
    ).toEqual({
      difference: ['b.png'],
      deletion: [],
      addition: [],
    });
  });

  it('should highlight added/remove/changed files', () => {
    expect(
      getChanges({
        baseline: ['a.png', 'b.png'],
        current: ['a.png', 'd.png', 'c.png'],
        difference: ['a.png'],
      }),
    ).toEqual({
      difference: ['a.png'],
      deletion: ['b.png'],
      addition: ['c.png', 'd.png'],
    });
  });
});

describe(prepareComparisonList, () => {
  it('should return empty list if no changes found', () => {
    const changes = getChanges({
      baseline: ['a.png', 'b.png'],
      current: ['a.png', 'b.png'],
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
      baseline: ['a.png', 'b.png'],
      current: ['a.png', 'd.png', 'c.png'],
      difference: ['a.png'],
    });

    expect(
      prepareComparisonList({
        changes,
        baseUrl: 'https://s3',
      }),
    ).toEqual([
      [
        {
          afterImageUrl: 'https://s3/c.after.png',
          type: 'ADDITION',
          path: '.lostpixel/baseline/c.png',
        },
        {
          afterImageUrl: 'https://s3/d.after.png',
          type: 'ADDITION',
          path: '.lostpixel/baseline/d.png',
        },
        {
          beforeImageUrl: 'https://s3/b.before.png',
          type: 'DELETION',
          path: '.lostpixel/baseline/b.png',
        },
        {
          afterImageUrl: 'https://s3/a.after.png',
          beforeImageUrl: 'https://s3/a.before.png',
          differenceImageUrl: 'https://s3/a.difference.png',
          type: 'DIFFERENCE',
          path: '.lostpixel/baseline/a.png',
        },
      ],
      [
        {
          filePath: join(imagePathCurrent, 'c.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(imagePathCurrent, 'c.png'),
            type: 'ADDITION',
          },
          uploadPath: 'lorem-ipsum/456/c.after.png',
        },
        {
          filePath: join(imagePathCurrent, 'd.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(imagePathCurrent, 'd.png'),
            type: 'ADDITION',
          },
          uploadPath: 'lorem-ipsum/456/d.after.png',
        },
        {
          filePath: join(imagePathBaseline, 'b.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(imagePathBaseline, 'b.png'),
            type: 'DELETION',
          },
          uploadPath: 'lorem-ipsum/456/b.before.png',
        },
        {
          filePath: join(imagePathBaseline, 'a.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(imagePathBaseline, 'a.png'),
            type: 'DIFFERENCE',
          },
          uploadPath: 'lorem-ipsum/456/a.before.png',
        },
        {
          filePath: join(imagePathCurrent, 'a.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(imagePathCurrent, 'a.png'),
            type: 'DIFFERENCE',
          },
          uploadPath: 'lorem-ipsum/456/a.after.png',
        },
        {
          filePath: join(imagePathDifference, 'a.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(imagePathDifference, 'a.png'),
            type: 'DIFFERENCE',
          },
          uploadPath: 'lorem-ipsum/456/a.difference.png',
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
