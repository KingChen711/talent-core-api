import { StatusCodes } from 'http-status-codes'

import ApiError from './api-error'

class InternalServerErrorException extends ApiError {
  constructor(message?: string) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message || StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR])

    this.name = 'InternalServerErrorException'
    Object.setPrototypeOf(this, InternalServerErrorException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default InternalServerErrorException
