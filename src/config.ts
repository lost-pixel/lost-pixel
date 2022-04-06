type FullConfig = {
  lostPixelUrl: string;
  lostPixelProjectId: string;
  ciBuildId: string;
  ciBuildNumber: string;
  repository: string;
  commitRef: string;
  commitRefName: string;
  commitHash: string;
  storybookPath: string;
  s3EndPoint: string;
  s3EndPointPort: number;
  s3EndPointSsl: boolean;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3SessionToken: string;
  s3BucketName: string;
  s3BaseUrl: string;
  imagePathBaseline: string;
  imagePathCurrent: string;
  imagePathDifference: string;
};

type ProjectConfig = Pick<FullConfig, 'lostPixelProjectId'>;

const defaultConfig: FullConfig = {
  lostPixelUrl: 'https://app.lost-pixel.com/api/callback',
  lostPixelProjectId: '--unknown--',
  ciBuildId: '--unknown--',
  ciBuildNumber: '--unknown--',
  repository: '--unknown--',
  commitRef: '--unknown--',
  commitRefName: '--unknown--',
  commitHash: '--unknown--',
  storybookUrl: 'storybook-static',
  s3EndPoint: '--unknown--',
  s3EndPointSsl: true,
  s3Region: '--unknown--',
  s3AccessKey: '--unknown--',
  s3SecretKey: '--unknown--',
  s3BucketName: '--unknown--',
  imagePathBaseline: '.lostpixel/baseline/',
  imagePathCurrent: '.lostpixel/current/',
  imagePathDifference: '.lostpixel/difference/',
};

