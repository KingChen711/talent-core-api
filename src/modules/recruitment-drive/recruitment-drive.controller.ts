import { inject, injectable } from 'inversify'
import { RecruitmentDriveService } from './recruitment-drive.service'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApplicationService } from './application.service'

@injectable()
export class RecruitmentDriveController {
  constructor(
    @inject(RecruitmentDriveService) private readonly recruitmentDriveService: RecruitmentDriveService,
    @inject(ApplicationService) private readonly applicationService: ApplicationService
  ) {}

  public getRecruitmentDrives = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recruitmentDrives = await this.recruitmentDriveService.getRecruitmentDrives(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(recruitmentDrives.metaData))
      return res.status(StatusCodes.OK).json(recruitmentDrives)
    } catch (error) {
      next(error)
    }
  }

  public createRecruitmentDrive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recruitmentDrive = await this.recruitmentDriveService.createRecruitmentDrive(res.locals.reqParams)
      return res.status(StatusCodes.CREATED).json(recruitmentDrive)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public updateRecruitmentDrive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.recruitmentDriveService.updateRecruitmentDrive(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public getRecruitmentDrive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recruitmentDrive = await this.recruitmentDriveService.getRecruitmentDrive(res.locals.reqParams)
      return res.status(StatusCodes.OK).json(recruitmentDrive)
    } catch (error) {
      next(error)
    }
  }

  public getRecruitmentDriveDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recruitmentDrive = await this.recruitmentDriveService.getRecruitmentDriveDetail(res.locals.reqParams)
      return res.status(StatusCodes.OK).json(recruitmentDrive)
    } catch (error) {
      next(error)
    }
  }

  public deleteRecruitmentDrive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.recruitmentDriveService.deleteRecruitmentDrive(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT)
    } catch (error) {
      next(error)
    }
  }

  public getAddableJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addableJobs = await this.recruitmentDriveService.getAddableJobs(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(addableJobs.metaData))
      return res.status(StatusCodes.OK).json(addableJobs)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public openJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobDetail = await this.recruitmentDriveService.openJob(res.locals.reqParams)
      return res.status(StatusCodes.CREATED).json(jobDetail)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public closeJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.recruitmentDriveService.closeJob(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public createApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const application = await this.applicationService.createApplication(res.locals.reqParams)
      // return res.status(StatusCodes.CREATED).json(application)
      return res.status(200).json(res.locals.reqParams)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
