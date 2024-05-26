import { S3Client } from '@aws-sdk/client-s3'
import 'dotenv/config'

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!
  },
  region: process.env.BUCKET_REGION
})

const bucketName = process.env.BUCKET_NAME

export { s3, bucketName }
