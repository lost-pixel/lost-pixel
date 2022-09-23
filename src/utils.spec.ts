import { getChanges, extendFileName, readDirIntoShotItems } from './utils';
import { configure } from './config';
import { defaultTestConfig } from './testUtils';

beforeAll(async () => {
  await configure({
    ...defaultTestConfig,
    lostPixelProjectId: 'lorem-ipsum',
    ciBuildId: '456',
  });
});

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
