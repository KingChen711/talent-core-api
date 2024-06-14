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

  public scheduleInterview = async (req: Request, res: Response) => {
    await this.applicantService.scheduleInterview(res.locals.requestData)
    return noContent(res)
  }

  public completedInterview = async (req: Request, res: Response) => {
    await this.applicantService.completedInterview(res.locals.requestData)
    return noContent(res)
  }

  public approveApplicant = async (req: Request, res: Response) => {
    await this.applicantService.approveApplicant(res.locals.requestData)
    return noContent(res)
  }

  public rejectApplicant = async (req: Request, res: Response) => {
    await this.applicantService.rejectApplicant(res.locals.requestData)
    return noContent(res)
  }

  public saveApplicant = async (req: Request, res: Response) => {
    await this.applicantService.saveApplicant(res.locals.requestData)
    return noContent(res)
  }
}
