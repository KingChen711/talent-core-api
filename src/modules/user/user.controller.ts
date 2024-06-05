import { inject, injectable } from 'inversify'
import { UserService } from './user.service'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request } from 'express'
import { ResponseWithUser } from '../../types'
import ApiError from '../../helpers/api-error'

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  whoAmI = async (req: Request, res: ResponseWithUser, next: NextFunction) => {
    try {
      const user = res.locals.user

      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED')
      }

      return res.status(StatusCodes.OK).json(user)
    } catch (error) {
      next(error)
    }
  }

  getCandidateProfile = async (req: Request, res: ResponseWithUser, next: NextFunction) => {
    try {
      const user = await this.userService.getCandidateProfile(res.locals.user, res.locals.reqParams)
      return res.status(StatusCodes.OK).json(user)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
