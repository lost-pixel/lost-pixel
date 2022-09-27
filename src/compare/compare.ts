import { readFileSync, writeFileSync } from 'node:fs';
import pixelmatch from 'pixelmatch';
import { compare as odiffCompare } from 'odiff-bin';
import { PNG } from 'pngjs';
import { config } from '../config';
import { resizeImage } from './utils';
import { log } from '../log';

export const checkThreshold = (
  threshold: number,
  pixelsTotal: number,
  pixelDifference: number,
) => {
  // Treat theshold as percentage
  if (threshold < 1) {
    return pixelDifference <= pixelsTotal * threshold;
  }

  // Treat threshold as absolute value
  return pixelDifference <= threshold;
};

export const compareImagesViaPixelmatch = async (
  threshold: number,
  baselineShotPath: string,
  currentShotPath: string,
  differenceShotPath?: string,
): Promise<{
  pixelDifference: number;
  pixelDifferencePercentage: number;
  isWithinThreshold: boolean;
}> => {
  const baselineImageBuffer = readFileSync(baselineShotPath);
  const currentImageBuffer = readFileSync(currentShotPath);

  if (baselineImageBuffer.equals(currentImageBuffer)) {
    return {
      pixelDifference: 0,
      pixelDifferencePercentage: 0,
      isWithinThreshold: true,
    };
  }

  let baselineImage: PNG = PNG.sync.read(baselineImageBuffer);
  let currentImage: PNG = PNG.sync.read(currentImageBuffer);

  const maxWidth = Math.max(
    baselineImage.width || 100,
    currentImage.width || 100,
  );
  const maxHeight = Math.max(
    baselineImage.height || 100,
    currentImage.height || 100,
  );

  if (
    baselineImage.width !== currentImage.width ||
    baselineImage.height !== currentImage.height
  ) {
    baselineImage = resizeImage(baselineImage, maxWidth, maxHeight);
    currentImage = resizeImage(currentImage, maxWidth, maxHeight);
  }

  const differenceImage = new PNG({ width: maxWidth, height: maxHeight });

  const pixelDifference = pixelmatch(
    baselineImage.data,
    currentImage.data,
    differenceImage.data,
    maxWidth,
    maxHeight,
    { threshold: 0 },
  );

  const pixelsTotal = baselineImage.width * baselineImage.height;

  if (pixelDifference > 0 && differenceShotPath) {
    const isWithinThreshold = checkThreshold(
      threshold,
      pixelsTotal,
      pixelDifference,
    );

    if (!isWithinThreshold) {
      writeFileSync(differenceShotPath, PNG.sync.write(differenceImage));
    }

    return {
      pixelDifference,
      pixelDifferencePercentage: pixelDifference / pixelsTotal,
      isWithinThreshold,
    };
  }

  return {
    pixelDifference,
    pixelDifferencePercentage: pixelDifference / pixelsTotal,
    isWithinThreshold: true,
  };
};

export const compareImagesViaOdiff = async (
  threshold: number,
  baselineShotPath: string,
  currentShotPath: string,
  differenceShotPath: string,
): Promise<{
  pixelDifference: number;
  pixelDifferencePercentage: number;
  isWithinThreshold: boolean;
}> => {
  const result = await odiffCompare(
    baselineShotPath,
    currentShotPath,
    differenceShotPath,
    {
      failOnLayoutDiff: false,
    },
  );

  if (result.match) {
    return {
      pixelDifference: 0,
      pixelDifferencePercentage: 0,
      isWithinThreshold: true,
    };
  }

  if (result.reason === 'pixel-diff') {
    let isWithinThreshold = true;

    // Treat theshold as percentage
    if (threshold < 1) {
      isWithinThreshold = result.diffPercentage <= threshold;
    } else {
      // Treat threshold as absolute value
      isWithinThreshold = result.diffCount <= threshold;
    }

    return {
      pixelDifference: Number(result.diffCount),
      pixelDifferencePercentage: Number(result.diffPercentage / 100),
      isWithinThreshold,
    };
  }

  throw new Error("Couldn't compare images");
};

export const compareImages = async (
  threshold: number,
  baselineShotPath: string,
  currentShotPath: string,
  differenceShotPath: string,
): Promise<{
  pixelDifference: number;
  pixelDifferencePercentage: number;
  isWithinThreshold: boolean;
}> => {
  if (config.compareEngine === 'pixelmatch') {
    return compareImagesViaPixelmatch(
      threshold,
      baselineShotPath,
      currentShotPath,
      differenceShotPath,
    );
  }

  return compareImagesViaOdiff(
    threshold,
    baselineShotPath,
    currentShotPath,
    differenceShotPath,
  );
};
