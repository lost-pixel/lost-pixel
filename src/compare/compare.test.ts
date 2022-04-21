import { existsSync, mkdirSync } from 'fs';
import { checkThreshold, compareImages } from './compare';

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

describe(compareImages, () => {
  it('should recognize identic images', async () => {
    expect(
      await compareImages(
        'fixtures/baseline/banner.png',
        'fixtures/baseline/banner.png',
        'fixtures/difference/banner.png',
      ),
    ).toBe(0);
  });

  it('should recoginze differences in images', async () => {
    expect(
      await compareImages(
        'fixtures/baseline/banner.png',
        'fixtures/current/banner1.png',
        'fixtures/test-results/banner1.png',
      ),
    ).toBeGreaterThan(0);

    expect(
      await compareImages(
        'fixtures/difference/banner1.png',
        'fixtures/test-results/banner1.png',
      ),
    ).toBe(0);

    expect(
      await compareImages(
        'fixtures/baseline/banner.png',
        'fixtures/current/banner2.png',
        'fixtures/test-results/banner2.png',
      ),
    ).toBeGreaterThan(0);

    expect(
      await compareImages(
        'fixtures/difference/banner2.png',
        'fixtures/test-results/banner2.png',
      ),
    ).toBe(0);

    expect(
      await compareImages(
        'fixtures/baseline/banner.png',
        'fixtures/current/banner3.png',
        'fixtures/test-results/banner3.png',
      ),
    ).toBeGreaterThan(0);

    expect(
      await compareImages(
        'fixtures/difference/banner3.png',
        'fixtures/test-results/banner3.png',
      ),
    ).toBe(0);
  }, 12000);
});
