import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/helpers/api-error'

const errorHandlingMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  if (!err?.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  }

  res.status(responseError.statusCode).json(responseError)
}

export default errorHandlingMiddleware
