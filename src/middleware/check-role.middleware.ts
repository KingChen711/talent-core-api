import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/helpers/api-error'
import { Role } from '~/types'

const checkRole = (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.user?.role || !roles.map((role) => role.toString()).includes(res.locals.user.role)) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'No Permission'))
  }

  next()
}

export default checkRole
