import { ZodError } from 'zod'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import { Response } from 'express'

export function isZodError<T>(error: unknown): error is ZodError<T> {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError'
}

export const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

export const ok = (res: Response, data: unknown = undefined) => {
  return res.status(StatusCodes.OK).json(data)
}

export const created = (res: Response, data: unknown = undefined) => {
  return res.status(StatusCodes.CREATED).json(data)
}

export const noContent = (res: Response) => {
  return res.status(StatusCodes.NO_CONTENT).json()
}
