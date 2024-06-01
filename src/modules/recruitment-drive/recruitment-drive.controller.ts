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
}
