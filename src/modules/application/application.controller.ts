import { inject, injectable } from 'inversify'
import { ApplicationService } from './application.service'
import { ok } from '../../helpers/utils'
import { Request, Response } from 'express'

@injectable()
export class ApplicationController {
  constructor(@inject(ApplicationService) private readonly applicationService: ApplicationService) {}

  public getApplicationDetail = async (req: Request, res: Response) => {
    const application = await this.applicationService.getApplicationDetail(res.locals.requestData)
    return ok(res, application)
  }
}
