import { join } from 'node:path';
import {
  getChanges,
  extendFileName,
  prepareComparisonList,
  readDirIntoShotItems,
} from './utils';
import type { Changes } from './utils';
import { configure } from './config';
import { defaultTestConfig } from './testUtils';

beforeAll(async () => {
  await configure({
    ...defaultTestConfig,
    lostPixelProjectId: 'lorem-ipsum',
    ciBuildId: '456',
  });
});

const baselineShotsPath = '.lostpixel/baseline';
const currentShotsPath = '.lostpixel/current';
const differenceShotsPath = '.lostpixel/difference';
const customShotsPath = '.lostpixel/custom';

describe(getChanges, () => {
  it('should reflect no difference', () => {
    expect(
      getChanges({
        baseline: [
          { name: 'a.png', path: baselineShotsPath },
          { name: 'b.png', path: baselineShotsPath },
        ],
        current: [
          { name: 'a.png', path: currentShotsPath },
          { name: 'b.png', path: customShotsPath },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    } as Changes);

    expect(
      getChanges({
        baseline: [
          { name: 'a.png', path: baselineShotsPath },
          { name: 'b.png', path: baselineShotsPath },
        ],
        current: [
          { name: 'b.png', path: currentShotsPath },
          { name: 'a.png', path: customShotsPath },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    } as Changes);
  });

  it('should highlight added files', () => {
    expect(
      getChanges({
        baseline: [
          { name: 'a.png', path: baselineShotsPath },
          { name: 'b.png', path: baselineShotsPath },
        ],
        current: [
          { name: 'a.png', path: currentShotsPath },
          { name: 'b.png', path: customShotsPath },
          { name: 'd.png', path: currentShotsPath },
          { name: 'c.png', path: customShotsPath },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [
        { name: 'c.png', path: customShotsPath },
        { name: 'd.png', path: currentShotsPath },
      ],
    } as Changes);
  });

  it('should highlight removed files', () => {
    expect(
      getChanges({
        baseline: [
          { name: 'a.png', path: baselineShotsPath },
          { name: 'b.png', path: baselineShotsPath },
          { name: 'c.png', path: baselineShotsPath },
          { name: 'd.png', path: baselineShotsPath },
        ],
        current: [
          { name: 'a.png', path: currentShotsPath },
          { name: 'd.png', path: customShotsPath },
        ],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [
        { name: 'b.png', path: baselineShotsPath },
        { name: 'c.png', path: baselineShotsPath },
      ],
      addition: [],
    } as Changes);
  });

  it('should highlight changed files', () => {
    expect(
      getChanges({
        baseline: [
          { name: 'a.png', path: baselineShotsPath },
          { name: 'b.png', path: baselineShotsPath },
        ],
        current: [
          { name: 'a.png', path: currentShotsPath },
          { name: 'b.png', path: customShotsPath },
        ],
        difference: [{ name: 'b.png', path: differenceShotsPath }],
      }),
    ).toEqual({
      difference: [
        {
          name: 'b.png',
          pathCurrent: customShotsPath,
          path: differenceShotsPath,
        },
      ],
      deletion: [],
      addition: [],
    } as Changes);
  });

  it('should highlight added/remove/changed files', () => {
    expect(
      getChanges({
        baseline: [
          { name: 'a.png', path: baselineShotsPath },
          { name: 'b.png', path: baselineShotsPath },
        ],
        current: [
          { name: 'a.png', path: currentShotsPath },
          { name: 'd.png', path: currentShotsPath },
          { name: 'c.png', path: customShotsPath },
        ],
        difference: [{ name: 'a.png', path: differenceShotsPath }],
      }),
    ).toEqual({
      difference: [
        {
          name: 'a.png',
          path: differenceShotsPath,
          pathCurrent: currentShotsPath,
        },
      ],
      deletion: [{ name: 'b.png', path: baselineShotsPath }],
      addition: [
        { name: 'c.png', path: customShotsPath },
        { name: 'd.png', path: currentShotsPath },
      ],
    } as Changes);
  });
});

describe(prepareComparisonList, () => {
  it('should return empty list if no changes found', () => {
    const changes = getChanges({
      baseline: [
        { name: 'a.png', path: baselineShotsPath },
        { name: 'b.png', path: baselineShotsPath },
      ],
      current: [
        { name: 'a.png', path: currentShotsPath },
        { name: 'b.png', path: customShotsPath },
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
      baseline: [
        { name: 'a.png', path: baselineShotsPath },
        { name: 'b.png', path: baselineShotsPath },
        { name: 'e.png', path: baselineShotsPath },
      ],
      current: [
        { name: 'a.png', path: currentShotsPath },
        { name: 'd.png', path: currentShotsPath },
        { name: 'c.png', path: currentShotsPath },
        { name: 'e.png', path: customShotsPath },
      ],
      difference: [
        { name: 'a.png', path: differenceShotsPath },
        { name: 'e.png', path: differenceShotsPath },
      ],
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
          path: join(baselineShotsPath, 'c.png'),
          name: 'c.png',
        },
        {
          afterImageUrl: 'https://s3/d.after.png',
          type: 'ADDITION',
          path: join(baselineShotsPath, 'd.png'),
          name: 'd.png',
        },
        {
          beforeImageUrl: 'https://s3/b.before.png',
          type: 'DELETION',
          path: join(baselineShotsPath, 'b.png'),
          name: 'b.png',
        },
        {
          afterImageUrl: 'https://s3/a.after.png',
          beforeImageUrl: 'https://s3/a.before.png',
          differenceImageUrl: 'https://s3/a.difference.png',
          type: 'DIFFERENCE',
          path: join(baselineShotsPath, 'a.png'),
          name: 'a.png',
        },
        {
          afterImageUrl: 'https://s3/e.after.png',
          beforeImageUrl: 'https://s3/e.before.png',
          differenceImageUrl: 'https://s3/e.difference.png',
          name: 'e.png',
          path: join(baselineShotsPath, 'e.png'),
          type: 'DIFFERENCE',
        },
          uploadPath: 'lorem-ipsum/456/a.before.png',
        },
        {
          filePath: join(customShotsPath, 'a.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(customShotsPath, 'a.png'),
            type: 'DIFFERENCE',
          },
          uploadPath: 'lorem-ipsum/456/a.after.png',
        },
        {
          filePath: join(config.imagePathDifference, 'a.png'),
          metaData: {
            'content-type': 'image/png',
            'x-amz-acl': 'public-read',
            original: join(config.imagePathDifference, 'a.png'),
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

describe(readDirIntoShotItems, () => {
  it('should generate correct shot lists from supplied folder', () => {
    expect(readDirIntoShotItems('./fixtures/current')).toEqual([
      {
        filePathBaseline: '.lostpixel/baseline/add-to-cart.png',
        filePathCurrent: 'fixtures/current/add-to-cart.png',
        filePathDifference: '.lostpixel/difference/add-to-cart.png',
        id: 'add-to-cart',
        shotMode: 'custom',
        shotName: 'add-to-cart',
        threshold: 0,
        url: 'add-to-cart',
      },
      {
        filePathBaseline: '.lostpixel/baseline/banner1.png',
        filePathCurrent: 'fixtures/current/banner1.png',
        filePathDifference: '.lostpixel/difference/banner1.png',
        id: 'banner1',
        shotMode: 'custom',
        shotName: 'banner1',
        threshold: 0,
        url: 'banner1',
      },
      {
        filePathBaseline: '.lostpixel/baseline/banner2.png',
        filePathCurrent: 'fixtures/current/banner2.png',
        filePathDifference: '.lostpixel/difference/banner2.png',
        id: 'banner2',
        shotMode: 'custom',
        shotName: 'banner2',
        threshold: 0,
        url: 'banner2',
      },
      {
        filePathBaseline: '.lostpixel/baseline/banner3.png',
        filePathCurrent: 'fixtures/current/banner3.png',
        filePathDifference: '.lostpixel/difference/banner3.png',
        id: 'banner3',
        shotMode: 'custom',
        shotName: 'banner3',
        threshold: 0,
        url: 'banner3',
      },
      {
        filePathBaseline: '.lostpixel/baseline/remove-to-cart.png',
        filePathCurrent: 'fixtures/current/remove-to-cart.png',
        filePathDifference: '.lostpixel/difference/remove-to-cart.png',
        id: 'remove-to-cart',
        shotMode: 'custom',
        shotName: 'remove-to-cart',
        threshold: 0,
        url: 'remove-to-cart',
      },
    ]);
  });
});
