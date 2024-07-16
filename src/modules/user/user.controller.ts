import { UserService } from './user.service'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { noContent, ok } from '../../helpers/utils'

import { ResponseWithUser } from '../../types'

@injectable()
export class UserController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  public whoAmI = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    return ok(res, user)
  }

  public toBeEmployee = async (req: Request, res: Response) => {
    await this.userService.toBeEmployee(res.locals.requestData)
    return noContent(res)
  }

  public getCandidateProfile = async (req: Request, res: ResponseWithUser) => {
    const user = await this.userService.getCandidateProfile(res.locals.user, res.locals.requestData)
    return ok(res, user)
  }

  public getUsers = async (req: Request, res: Response) => {
    const users = await this.userService.getUsers(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(users.metaData))
    return ok(res, users)
  }
}
