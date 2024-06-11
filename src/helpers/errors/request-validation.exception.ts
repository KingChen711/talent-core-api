import { StatusCodes } from 'http-status-codes'
import ApiError from './api-error'

export type ValidationErrors = Record<string, string>

class RequestValidationException extends ApiError {
  errors: ValidationErrors

  constructor(errors: ValidationErrors) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, StatusCodes[StatusCodes.UNPROCESSABLE_ENTITY])

    this.errors = errors
    this.name = 'RequestValidationException'
    Object.setPrototypeOf(this, RequestValidationException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default RequestValidationException
