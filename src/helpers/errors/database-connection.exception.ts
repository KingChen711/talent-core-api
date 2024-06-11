import { StatusCodes } from 'http-status-codes'
import ApiError from './api-error'

class DatabaseConnectionException extends ApiError {
  constructor() {
    super(StatusCodes.INTERNAL_SERVER_ERROR, 'Error connecting to database')

    this.name = 'DatabaseConnectionException'
    Object.setPrototypeOf(this, DatabaseConnectionException.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export default DatabaseConnectionException
