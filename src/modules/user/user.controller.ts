import { inject, injectable } from 'inversify'
import { UserService } from './user.service'
import { Request } from 'express'
import { ResponseWithUser } from '../../types'
import { ok } from '../../helpers/utils'

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  whoAmI = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    return ok(res, user)
  }

  getCandidateProfile = async (req: Request, res: ResponseWithUser) => {
    const user = await this.userService.getCandidateProfile(res.locals.user, res.locals.requestData)
    return ok(res, user)
  }
}
