import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AnyZodObject } from 'zod'
import ApiError from '~/helpers/api-error'

const validateRequestData = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid request data'))
  }
}

export { validateRequestData }
