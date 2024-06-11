import { StatusCodes } from 'http-status-codes'
import ApiError from './api-error'

class BadRequestException extends ApiError {
  constructor(message?: string) {
    super(StatusCodes.BAD_REQUEST, message || StatusCodes[StatusCodes.BAD_REQUEST])

    this.name = 'BadRequestException'
    Object.setPrototypeOf(this, BadRequestException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default BadRequestException
