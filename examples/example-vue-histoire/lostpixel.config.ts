import { CustomProjectConfig } from 'lost-pixel';

import sharp from "sharp"
import fs from "node:fs/promises"
import path from "node:path"

export const config: CustomProjectConfig = {
  histoireShots:{
    histoireUrl: './.histoire/dist',
  },
  threshold: 0.0005,
  generateOnly: true,
  failOnDifference: true,
  async afterScreenshot (_, { filePathCurrent }) {
    const { base, dir } = path.parse(filePathCurrent)
    const tmpShotPath = path.join(dir, `tmp.${base}`)
    await sharp(filePathCurrent).trim().toFile(tmpShotPath)
    await fs.rename(tmpShotPath, filePathCurrent)
  },
};
