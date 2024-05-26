import { inject, injectable } from 'inversify'
import { JobService } from './job.service'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'

@injectable()
export class JobController {
  constructor(@inject(JobService) private readonly jobService: JobService) {}

  getJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.jobService.getJob(res.locals.reqParams)
      return res.status(StatusCodes.OK).json(job)
    } catch (error) {
      next(error)
    }
  }

  deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.jobService.deleteJob(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      next(error)
    }
  }

  getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.jobService.getJobs(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(jobs.metaData))
      return res.status(StatusCodes.OK).json(jobs)
    } catch (error) {
      next(error)
    }
  }

  createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.jobService.createJob(req.file, res.locals.reqParams)
      return res.status(StatusCodes.CREATED).json(job)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.jobService.updateJob(req.file, res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
