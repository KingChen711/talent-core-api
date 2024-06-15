import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'

import RequestValidationException from '../helpers/errors/request-validation.exception'
import { isZodError } from '../helpers/utils'

const validateRequestData = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals.requestData = await schema.parseAsync(req)
    next()
  } catch (error) {
    if (!isZodError(error)) throw error

    const result: Record<string, string> = {}

    error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      result[path] = issue.message
    })

    throw new RequestValidationException(result)
  }
}

export { validateRequestData }
