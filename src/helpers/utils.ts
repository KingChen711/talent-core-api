import { ZodError } from 'zod'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { Response } from 'express'
import { format } from 'date-fns'
import mime from 'mime-types'

export function isZodError<T>(error: unknown): error is ZodError<T> {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError'
}

export const randomFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

export const ok = (res: Response, data: unknown = undefined) => {
  return res.status(StatusCodes.OK).json(data)
}

export const created = (res: Response, data: unknown = undefined) => {
  return res.status(StatusCodes.CREATED).json(data)
}

export const noContent = (res: Response) => {
  return res.status(StatusCodes.NO_CONTENT).json()
}

export const isPdfFile = (file: Express.Multer.File): boolean => {
  // Check the MIME type
  const mimeType = file.mimetype
  if (mimeType !== 'applicant/pdf') {
    return false
  }

  // Optionally, you can also check the file extension
  const ext = mime.extension(mimeType)
  if (ext !== 'pdf') {
    return false
  }

  return true
}

export function replacePlaceholders(template: string, data: { [key: string]: string }): string {
  let result = template
  for (const key in data) {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), data[key])
  }
  return result
}

export function toDateTime(isoString: Date): string {
  return format(isoString, 'PPP p')
}
