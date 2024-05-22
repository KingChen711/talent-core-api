import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/helpers/api-error'
import { Role } from '~/types'
import { WithAuthProp } from '@clerk/clerk-sdk-node'
dotenv.config()

const authorize = (roles?: Role[]) => (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
  if (!req.auth.sessionId) next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

  if (!roles) next()

  const clerkId = req.auth.userId

  // if (!res.locals.user?.role || !roles.map((role) => role.toString()).includes(res.locals.user.role)) {
  //   next(new ApiError(StatusCodes.FORBIDDEN, 'No Permission'))
  // }

  next()
}

export default authorize
