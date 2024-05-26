import { ZodError } from 'zod'
import crypto from 'crypto'

export function isZodError<T>(error: unknown): error is ZodError<T> {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError'
}

export const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
