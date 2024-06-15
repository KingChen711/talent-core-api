import { StatusCodes } from 'http-status-codes'

import ApiError from './api-error'

class ForbiddenException extends ApiError {
  constructor(message?: string) {
    super(StatusCodes.FORBIDDEN, message || StatusCodes[StatusCodes.FORBIDDEN])

    this.name = 'ForbiddenException'
    Object.setPrototypeOf(this, ForbiddenException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ForbiddenException
