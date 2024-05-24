import { inject, injectable } from 'inversify'
import { UserService } from './user.service'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import { ResponseWithUser } from '../types'
import ApiError from '../helpers/api-error'

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

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById()
      return res.status(StatusCodes.OK).json(user)
    } catch (error) {
      next(error)
    }
  }
}
