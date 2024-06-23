import { inject, injectable } from 'inversify'
import { ApplicationService } from './application.service'
import { noContent, ok } from '../../helpers/utils'
import { Request, Response } from 'express'
import { ResponseWithUser } from '../../types'
import { WishService } from './wish.service'
import { TestService } from './test.service'

@injectable()
export class ApplicationController {
  constructor(
    @inject(ApplicationService) private readonly applicationService: ApplicationService,
    @inject(WishService) private readonly wishService: WishService,
    @inject(TestService) private readonly testService: TestService
  ) {}

  public getApplicationDetail = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const application = await this.applicationService.getApplicationDetail(user, res.locals.requestData)

    return ok(res, application)
  }

  public scheduleTestExam = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    await this.applicationService.scheduleTestExam(user, res.locals.requestData)
    return noContent(res)
  }

  public editTestSession = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    await this.applicationService.editTestSession(user, res.locals.requestData)
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

  public rejectApplication = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    await this.applicationService.rejectApplication(user, res.locals.requestData)
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

  public requestChangeTestDate = async (req: Request, res: Response) => {
    await this.wishService.createTestSessionWish(res.locals.requestData)
    return noContent(res)
  }

  public requestChangeInterviewDate = async (req: Request, res: Response) => {
    await this.wishService.createInterviewSessionWish(res.locals.requestData)
    return noContent(res)
  }

  public requestChangeReceiveJobDate = async (req: Request, res: Response) => {
    await this.wishService.createReceiveJobSessionWish(res.locals.requestData)
    return noContent(res)
  }

  public updateWish = async (req: Request, res: Response) => {
    await this.wishService.updateWish(res.locals.requestData)
    return noContent(res)
  }

  public submitTest = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    await this.testService.submitTest(user, res.locals.requestData)
    return noContent(res)
  }

  public takeTest = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const test = await this.testService.takeTest(user, res.locals.requestData)
    return ok(res, test)
  }

  public getMyApplications = async (req: Request, res: ResponseWithUser) => {
    const user = res.locals.user
    const applications = await this.applicationService.getMyApplications(user, res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(applications.metaData))
    return ok(res, applications)
  }
}
