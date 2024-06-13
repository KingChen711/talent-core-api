import { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import RequestValidationException from '../helpers/errors/request-validation.exception'

function multerErrorHandlingMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      throw new RequestValidationException({ cv: 'File size is too large. Max limit is 5MB.' })
    }
  }
  next(err)
}
export default multerErrorHandlingMiddleware
