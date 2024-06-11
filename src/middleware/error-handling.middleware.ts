import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../helpers/api-error'
import RequestValidationException, { ValidationErrors } from 'src/helpers/errors/request-validation.exception'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandlingMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  if (!err?.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  console.log(err.data)

  const responseError = err.data || {
    // stack: err.stack
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    errors: undefined as ValidationErrors | undefined
  }

  if (err instanceof RequestValidationException) {
    responseError.errors = err.errors
  }

  res.status(err.statusCode).json(responseError)
}

export default errorHandlingMiddleware
