import 'dotenv/config'

import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Role } from '../types'
import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { container } from '../config/inversify.config'
import { UserService } from '../modules/user/user.service'
import UnauthorizedException from 'src/helpers/errors/unauthorized-exception'
import ForbiddenException from 'src/helpers/errors/forbidden-exception'

const authorize = (roles?: Role[]) => async (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
  try {
    if (!req.auth.sessionId) throw new UnauthorizedException('Invalid Token')

    const clerkId = req.auth.userId
    if (!clerkId) throw new UnauthorizedException('Invalid Token')

    const userService = container.get(UserService)
    const user = await userService.getUserByClerkIdWithRole(clerkId)
    if (!user) throw new UnauthorizedException('Invalid Token')

    res.locals.user = user

    if (!roles) return next() //mean that just the token is required, every roles is allowed, middleware can go next

    const hasPermission = roles.includes(user.role.roleName as Role)
    if (!hasPermission) {
      throw new ForbiddenException('You have no permission for this action')
    }

    next()
  } catch (error) {
    return res.status(StatusCodes.FORBIDDEN)
  }
}

export { authorize }
