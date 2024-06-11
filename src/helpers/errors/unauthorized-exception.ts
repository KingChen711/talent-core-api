import { StatusCodes } from 'http-status-codes'
import ApiError from './api-error'

class UnauthorizedException extends ApiError {
  constructor(message?: string) {
    super(StatusCodes.UNAUTHORIZED, message || StatusCodes[StatusCodes.UNAUTHORIZED])

    this.name = 'UnauthorizedException'
    Object.setPrototypeOf(this, UnauthorizedException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default UnauthorizedException
