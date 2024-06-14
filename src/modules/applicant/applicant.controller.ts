import { inject, injectable } from 'inversify'
import { ApplicantService } from './applicant.service'
import { noContent, ok } from '../../helpers/utils'
import { Request, Response } from 'express'

@injectable()
export class ApplicantController {
  constructor(@inject(ApplicantService) private readonly applicantService: ApplicantService) {}

  public getApplicantDetail = async (req: Request, res: Response) => {
    const applicant = await this.applicantService.getApplicantDetail(res.locals.requestData)
    return ok(res, applicant)
  }

  public scheduleTestExam = async (req: Request, res: Response) => {
    await this.applicantService.scheduleTestExam(res.locals.requestData)
    return noContent(res)
  }
}
