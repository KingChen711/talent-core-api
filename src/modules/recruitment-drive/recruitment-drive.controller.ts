import { inject, injectable } from 'inversify'
import { RecruitmentDriveService } from './recruitment-drive.service'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class RecruitmentDriveController {
  constructor(@inject(RecruitmentDriveService) private readonly recruitmentDriveService: RecruitmentDriveService) {}

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
      return res.status(StatusCodes.NO_CONTENT).json()
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
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      next(error)
    }
  }

  public getRecruitmentDriveAddableJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addableJobs = await this.recruitmentDriveService.getRecruitmentDriveAddableJobs(res.locals.reqParams)
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
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
