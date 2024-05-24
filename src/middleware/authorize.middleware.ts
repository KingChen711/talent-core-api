import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../helpers/api-error'
import { Role } from '../types'
import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { container } from '../inversify.config'
import { UserService } from '../user/user.service'

const authorize = (roles?: Role[]) => async (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
  if (!req.auth.sessionId) return next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

  const clerkId = req.auth.userId

  if (!clerkId) return next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

  const userService = container.get(UserService)

  const user = await userService.getUserByClerkIdWithRole(clerkId)

  if (!user) return next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid Token'))

  res.locals.user = user

  if (!roles) return next() //mean that the user's role is not need to check, middleware can go next

  if (!roles.includes(user.role.roleName as Role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'No Permission'))
  }

  next()
}

export { authorize }
