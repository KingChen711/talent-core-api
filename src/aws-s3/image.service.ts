import 'dotenv/config'
import sharp from 'sharp'
import { injectable } from 'inversify'
import { bucketName, s3 } from '../config/s3.config'
import { randomImageName } from '../helpers/utils'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

@injectable()
export class ImageService {
  upLoadImage = async (
    file: Express.Multer.File,
    height: number,
    width: number,
    imageName?: string
  ): Promise<string> => {
    const buffer = await sharp(file.buffer).resize({ height, width, fit: 'contain' }).toBuffer()
    const key = imageName || randomImageName()

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype
    }

    const command = new PutObjectCommand(params)

    await s3.send(command)

    return key
  }

  getImageUrl = async (imageName: string): Promise<string> => {
    const params = {
      Bucket: bucketName,
      Key: imageName
    }

    const command = new GetObjectCommand(params)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

    return url
  }

  deleteImage = async (imageName: string): Promise<void> => {
    const params = {
      Bucket: bucketName,
      Key: imageName
    }

    const command = new DeleteObjectCommand(params)
    await s3.send(command)
  }
}
