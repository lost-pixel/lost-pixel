import { PNG } from 'pngjs';

export const resizeImage = (
  originalImage: PNG,
  width: number,
  height: number,
) => {
  const newImage = new PNG({
    width,
    height,
    fill: true,
    inputHasAlpha: true,
  });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = ((width * y + x) << 2) + 3;
      newImage.data[index] = 64;
    }
  }

  PNG.bitblt(
    originalImage,
    newImage,
    0,
    0,
    originalImage.width,
    originalImage.height,
    0,
    0,
  );

  return newImage;
};
