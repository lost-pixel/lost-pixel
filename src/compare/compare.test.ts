import { existsSync, mkdirSync } from 'node:fs';
import {
  checkThreshold,
  compareImagesViaPixelmatch,
  compareImagesViaOdiff,
} from './compare';

beforeAll(() => {
  if (!existsSync('fixtures/test-results')) {
    mkdirSync('fixtures/test-results', { recursive: true });
  }
});

describe(checkThreshold, () => {
  it('should check if changes are within threshold', async () => {
    expect(checkThreshold(0, 100, 0)).toBe(true);
    expect(checkThreshold(0, 100, 1)).toBe(false);

    expect(checkThreshold(0.1, 100, 0)).toBe(true);
    expect(checkThreshold(0.1, 100, 10)).toBe(true);
    expect(checkThreshold(0.1, 100, 11)).toBe(false);

    expect(checkThreshold(1, 100, 0)).toBe(true);
    expect(checkThreshold(1, 100, 1)).toBe(true);
    expect(checkThreshold(1, 100, 2)).toBe(false);

    expect(checkThreshold(123, 10_000, 0)).toBe(true);
    expect(checkThreshold(123, 10_000, 123)).toBe(true);
    expect(checkThreshold(123, 10_000, 124)).toBe(false);
  });
});

describe(compareImagesViaPixelmatch, () => {
  it('should recognize identic images', async () => {
    expect(
      await compareImagesViaPixelmatch(
        0,
        'fixtures/baseline/banner.png',
        'fixtures/baseline/banner.png',
        'fixtures/difference/banner.png',
      ),
    ).toStrictEqual({
      pixelDifference: 0,
      pixelDifferencePercentage: 0,
      isWithinThreshold: true,
    });
  });

  it('should recoginze differences in images', async () => {
    const result1 = await compareImagesViaPixelmatch(
      0,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner1.png',
      'fixtures/test-results/banner1.png',
    );

    expect(result1.isWithinThreshold).toBe(false);
    expect(result1.pixelDifference).toBeGreaterThan(50_000);

    expect(
      await compareImagesViaPixelmatch(
        0,
        'fixtures/difference/banner1.png',
        'fixtures/test-results/banner1.png',
      ),
    ).toStrictEqual({
      pixelDifference: 0,
      pixelDifferencePercentage: 0,
      isWithinThreshold: true,
    });

    const result2 = await compareImagesViaPixelmatch(
      0,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner2.png',
      'fixtures/test-results/banner2.png',
    );

    expect(result2.isWithinThreshold).toBe(false);
    expect(result2.pixelDifference).toBeGreaterThan(350_000);

    expect(
      await compareImagesViaPixelmatch(
        0,
        'fixtures/difference/banner2.png',
        'fixtures/test-results/banner2.png',
      ),
    ).toStrictEqual({
      pixelDifference: 0,
      pixelDifferencePercentage: 0,
      isWithinThreshold: true,
    });

    const result3 = await compareImagesViaPixelmatch(
      0,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner3.png',
      'fixtures/test-results/banner3.png',
    );

    expect(result3.isWithinThreshold).toBe(false);
    expect(result3.pixelDifference).toBeGreaterThan(40_000);

    expect(
      await compareImagesViaPixelmatch(
        0,
        'fixtures/difference/banner3.png',
        'fixtures/test-results/banner3.png',
      ),
    ).toStrictEqual({
      pixelDifference: 0,
      pixelDifferencePercentage: 0,
      isWithinThreshold: true,
    });
  }, 12_000);

  it('should accept differences in images within a given threshold', async () => {
    const result1 = await compareImagesViaPixelmatch(
      0.4,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner1.png',
      'fixtures/test-results/banner1.png',
    );

    expect(result1.isWithinThreshold).toBe(true);
    expect(result1.pixelDifference).toBeGreaterThan(50_000);

    const result2 = await compareImagesViaPixelmatch(
      400_000,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner2.png',
      'fixtures/test-results/banner2.png',
    );

    expect(result2.isWithinThreshold).toBe(true);
    expect(result2.pixelDifference).toBeGreaterThan(350_000);

    const result3 = await compareImagesViaPixelmatch(
      50_000,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner3.png',
      'fixtures/test-results/banner3.png',
    );

    expect(result3.isWithinThreshold).toBe(true);
    expect(result3.pixelDifference).toBeGreaterThan(40_000);
  }, 12_000);

  it('should accept differences in images within a given threshold if using odiff', async () => {
    const result1 = await compareImagesViaOdiff(
      0.4,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner1.png',
      'fixtures/test-results/banner1.png',
    );

    expect(result1.isWithinThreshold).toBe(true);
    expect(result1.pixelDifference).toBeGreaterThan(50_000);

    const result3 = await compareImagesViaOdiff(
      50_000,
      'fixtures/baseline/banner.png',
      'fixtures/current/banner3.png',
      'fixtures/test-results/banner3.png',
    );

    expect(result3.isWithinThreshold).toBe(true);
    expect(result3.pixelDifference).toBeGreaterThan(40_000);
  }, 12_000);
});
