export const storage = new Bun.S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: process.env.BUCKET!,
    endpoint: process.env.AWS_ENDPOINT_URL_S3!,
  });