const requiredEnvVars = [
  'LOST_PIXEL_URL',
  'LOST_PIXEL_PROJECT_ID',
  'S3_END_POINT',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET_NAME',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
});
