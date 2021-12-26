import { Client as MinioClient, ItemBucketMetadata } from 'minio';

const minio = new MinioClient({
  endPoint: process.env.S3_END_POINT || '--unknown--',
  accessKey: process.env.S3_ACCESS_KEY || '--unknown--',
  secretKey: process.env.S3_SECRET_KEY || '--unknown--',
  port: process.env.S3_END_POINT_PORT
    ? Number(process.env.S3_END_POINT_PORT)
    : 443,
  useSSL: process.env.S3_END_POINT_SSL === '0' ? false : true,
});

type UploadFile = {
  path: string;
  filePath: string;
  metaData: ItemBucketMetadata;
};

export const uploadFile = async ({ path, filePath, metaData }: UploadFile) =>
  minio.fPutObject(
    process.env.S3_BUCKET_NAME || '--unknown--',
    path,
    filePath,
    metaData,
  );
