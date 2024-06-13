import { inject, injectable } from 'inversify'
import { ApplicantService } from './applicant.service'
import { ok } from '../../helpers/utils'
import { Request, Response } from 'express'

@injectable()
export class ApplicantController {
  constructor(@inject(ApplicantService) private readonly applicantService: ApplicantService) {}

  public getApplicantDetail = async (req: Request, res: Response) => {
    const applicant = await this.applicantService.getApplicantDetail(res.locals.requestData)
    return ok(res, applicant)
  }
}
