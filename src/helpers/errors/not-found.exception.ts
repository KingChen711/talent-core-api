import { StatusCodes } from 'http-status-codes'

import ApiError from './api-error'

class NotFoundException extends ApiError {
  constructor(message?: string) {
    super(StatusCodes.NOT_FOUND, message || StatusCodes[StatusCodes.NOT_FOUND])

    this.name = 'NotFoundException'
    Object.setPrototypeOf(this, NotFoundException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default NotFoundException
