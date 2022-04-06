module.exports = {
  storybookUrl: 'storybook-static',
  lostPixelProjectId: 'my-project-id',
  ciBuildId: process.env.GITHUB_RUN_ID,
  ciBuildNumber: process.env.GITHUB_RUN_NUMBER,
  repository: process.env.REPOSITORY,
  commitRef: process.env.COMMIT_REF,
  commitRefName: process.env.COMMIT_REF,
  commitHash: process.env.COMMIT_HASH,
  s3: {
    endPoint: '127.0.0.1',
    port: 9000,
    ssl: false,
    accessKey: 'minio',
    secretKey: 'm1n105ecr3t',
    bucketName: 'lost-pixel',
    baseUrl: 'http://127.0.0.1:9000/lost-pixel',
  },
};
