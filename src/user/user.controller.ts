import { inject, injectable } from 'inversify'
import { UserService } from './user.service'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById('')
      return res.status(StatusCodes.OK).json(user)
    } catch (error) {
      next(error)
    }
  }
}
