import 'dotenv/config'

import sharp from 'sharp'
import { injectable } from 'inversify'
import { bucketName, s3 } from '../../config/s3.config'
import { randomFileName } from '../../helpers/utils'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

@injectable()
export class FileService {
  upLoadImage = async (
    file: Express.Multer.File,
    height: number,
    width: number,
    imageName?: string
  ): Promise<string> => {
    const buffer = await sharp(file.buffer).resize({ height, width, fit: 'contain' }).toBuffer()
    const key = imageName || randomFileName()

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

  upLoadPortfolio = async (file: Express.Multer.File, fileName?: string): Promise<string> => {
    const buffer = file.buffer
    const key = fileName || randomFileName()

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

  getFileUrl = async (imageName: string): Promise<string> => {
    const params = {
      Bucket: bucketName,
      Key: imageName
    }

    const command = new GetObjectCommand(params)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

    return url
  }

  getFileUrls = async (imageNames: string[]): Promise<string[]> => {
    const urlsData = imageNames.map((imageName) => {
      const params = {
        Bucket: bucketName,
        Key: imageName
      }
      const command = new GetObjectCommand(params)
      return getSignedUrl(s3, command, { expiresIn: 3600 })
    })

    return await Promise.all(urlsData)
  }

  deleteFile = async (imageName: string): Promise<void> => {
    const params = {
      Bucket: bucketName,
      Key: imageName
    }

    const command = new DeleteObjectCommand(params)
    await s3.send(command)
  }
}
