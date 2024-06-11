import { inject, injectable } from 'inversify'
import { RecruitmentDriveService } from './recruitment-drive.service'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApplicationService } from './application.service'

@injectable()
export class RecruitmentDriveController {
  constructor(
    @inject(RecruitmentDriveService) private readonly recruitmentDriveService: RecruitmentDriveService,
    @inject(ApplicationService) private readonly applicationService: ApplicationService
  ) {}

  public getRecruitmentDrives = async (req: Request, res: Response) => {
    const recruitmentDrives = await this.recruitmentDriveService.getRecruitmentDrives(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(recruitmentDrives.metaData))
    return res.status(StatusCodes.OK).json(recruitmentDrives)
  }

  public createRecruitmentDrive = async (req: Request, res: Response) => {
    const recruitmentDrive = await this.recruitmentDriveService.createRecruitmentDrive(res.locals.requestData)
    return res.status(StatusCodes.CREATED).json(recruitmentDrive)
  }

  public updateRecruitmentDrive = async (req: Request, res: Response) => {
    await this.recruitmentDriveService.updateRecruitmentDrive(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public getRecruitmentDrive = async (req: Request, res: Response) => {
    const recruitmentDrive = await this.recruitmentDriveService.getRecruitmentDrive(res.locals.requestData)
    return res.status(StatusCodes.OK).json(recruitmentDrive)
  }

  public getRecruitmentDriveDetail = async (req: Request, res: Response) => {
    const recruitmentDrive = await this.recruitmentDriveService.getRecruitmentDriveDetail(res.locals.requestData)
    return res.status(StatusCodes.OK).json(recruitmentDrive)
  }

  public deleteRecruitmentDrive = async (req: Request, res: Response) => {
    await this.recruitmentDriveService.deleteRecruitmentDrive(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public getAddableJobs = async (req: Request, res: Response) => {
    const addableJobs = await this.recruitmentDriveService.getAddableJobs(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(addableJobs.metaData))
    return res.status(StatusCodes.OK).json(addableJobs)
  }

  public openJob = async (req: Request, res: Response) => {
    const jobDetail = await this.recruitmentDriveService.openJob(res.locals.requestData)
    return res.status(StatusCodes.CREATED).json(jobDetail)
  }

  public closeJob = async (req: Request, res: Response) => {
    await this.recruitmentDriveService.closeJob(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public createApplication = async (req: Request, res: Response) => {
    await this.applicationService.createApplication(res.locals.requestData)
    return res.status(StatusCodes.CREATED)
  }
}
