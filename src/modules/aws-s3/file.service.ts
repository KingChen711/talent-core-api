import 'dotenv/config'

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { injectable } from 'inversify'
import sharp from 'sharp'

import { bucketName, s3 } from '../../config/s3.config'

import { randomFileName } from '../../helpers/utils'

@injectable()
export class FileService {
  public upLoadImage = async (
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

  public upLoadPortfolio = async (file: Express.Multer.File, fileName?: string): Promise<string> => {
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

  public getFileUrl = async (imageName: string): Promise<string> => {
    const params = {
      Bucket: bucketName,
      Key: imageName
    }

    const command = new GetObjectCommand(params)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

    return url
  }

  public getFileUrls = async (imageNames: string[]): Promise<string[]> => {
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

  public deleteFile = async (imageName: string): Promise<void> => {
    const params = {
      Bucket: bucketName,
      Key: imageName
    }

    const command = new DeleteObjectCommand(params)
    await s3.send(command)
  }
}
