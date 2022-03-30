import { compareImages } from './compare';

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
