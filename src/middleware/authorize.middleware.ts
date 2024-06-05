import 'dotenv/config'

import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../helpers/api-error'
import { Role } from '../types'
import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { container } from '../config/inversify.config'
import { UserService } from '../modules/user/user.service'

const authorize = (roles?: Role[]) => async (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
  try {
    if (!req.auth.sessionId) return next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

    const clerkId = req.auth.userId
    if (!clerkId) return next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

    const userService = container.get(UserService)
    const user = await userService.getUserByClerkIdWithRole(clerkId)
    if (!user) return next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

    res.locals.user = user

    if (!roles) return next() //mean that just the token is required, every roles is allowed, middleware can go next

    if (!roles.includes(user.role.roleName as Role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'No Permission'))
    }

    next()
  } catch (error) {
    return res.status(StatusCodes.FORBIDDEN)
  }
}

export { authorize }
