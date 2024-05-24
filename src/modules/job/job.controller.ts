import { inject, injectable } from 'inversify'
import { JobService } from './job.service'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'

@injectable()
export class JobController {
  constructor(@inject(JobService) private readonly jobService: JobService) {}

  getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.jobService.getJobs(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(jobs.metaData))
      return res.status(StatusCodes.OK).json(jobs)
    } catch (error) {
      next(error)
    }
  }
}
