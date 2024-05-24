import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { isZodError } from '../helpers/utils'
import { AnyZodObject } from 'zod'

const validateRequestData = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals.reqParams = await schema.parseAsync(req)
    next()
  } catch (error) {
    if (!isZodError(error)) {
      return next(error)
    }

    const result: Record<string, string> = {}

    error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      result[path] = issue.message
    })

    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ error: result })
  }
}

export { validateRequestData }
