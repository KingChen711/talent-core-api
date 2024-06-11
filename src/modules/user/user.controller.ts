import { inject, injectable } from 'inversify'
import { UserService } from './user.service'
import { StatusCodes } from 'http-status-codes'
import { Request } from 'express'
import { ResponseWithUser } from '../../types'

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  whoAmI = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    return res.status(StatusCodes.OK).json(user)
  }

  getCandidateProfile = async (req: Request, res: ResponseWithUser) => {
    const user = await this.userService.getCandidateProfile(res.locals.user, res.locals.requestData)
    return res.status(StatusCodes.OK).json(user)
  }
}
