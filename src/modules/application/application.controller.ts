import { inject, injectable } from 'inversify'
import { ApplicationService } from './application.service'
import { noContent, ok } from '../../helpers/utils'
import { Request, Response } from 'express'

@injectable()
export class ApplicationController {
  constructor(@inject(ApplicationService) private readonly applicationService: ApplicationService) {}

  public getApplicationDetail = async (req: Request, res: Response) => {
    const application = await this.applicationService.getApplicationDetail(res.locals.requestData)
    return ok(res, application)
  }

  public scheduleTestExam = async (req: Request, res: Response) => {
    await this.applicationService.scheduleTestExam(res.locals.requestData)
    return noContent(res)
  }

  public scheduleInterview = async (req: Request, res: Response) => {
    await this.applicationService.scheduleInterview(res.locals.requestData)
    return noContent(res)
  }

  public completedInterview = async (req: Request, res: Response) => {
    await this.applicationService.completedInterview(res.locals.requestData)
    return noContent(res)
  }

  public approveApplication = async (req: Request, res: Response) => {
    await this.applicationService.approveApplication(res.locals.requestData)
    return noContent(res)
  }

  public rejectApplication = async (req: Request, res: Response) => {
    await this.applicationService.rejectApplication(res.locals.requestData)
    return noContent(res)
  }

  public saveApplication = async (req: Request, res: Response) => {
    await this.applicationService.saveApplication(res.locals.requestData)
    return noContent(res)
  }
}
