import { ZodError } from 'zod'

export function isZodError<T>(error: unknown): error is ZodError<T> {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError'
}
