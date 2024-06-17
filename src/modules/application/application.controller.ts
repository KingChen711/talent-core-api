import { inject, injectable } from 'inversify'
import { ApplicationService } from './application.service'
import { noContent, ok } from '../../helpers/utils'
import { Request, Response } from 'express'
import { ResponseWithUser } from '../../types'

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

  public editTestSession = async (req: Request, res: Response) => {
    await this.applicationService.editTestSession(res.locals.requestData)
    return noContent(res)
  }

  public scheduleInterview = async (req: Request, res: Response) => {
    await this.applicationService.scheduleInterview(res.locals.requestData)
    return noContent(res)
  }

  public editInterviewSession = async (req: Request, res: Response) => {
    await this.applicationService.editInterviewSession(res.locals.requestData)
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

  public editReceiveJobSession = async (req: Request, res: Response) => {
    await this.applicationService.editReceiveJobSession(res.locals.requestData)
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

  public confirmHired = async (req: Request, res: Response) => {
    await this.applicationService.confirmHired(res.locals.requestData)
    return noContent(res)
  }

  public getMyApplications = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const applications = await this.applicationService.getMyApplications(user, res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(applications.metaData))
    return ok(res, applications)
  }
}
