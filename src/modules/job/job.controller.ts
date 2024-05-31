import { inject, injectable } from 'inversify'
import { JobService } from './job.service'
import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'

@injectable()
export class JobController {
  constructor(@inject(JobService) private readonly jobService: JobService) {}

  public getJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.jobService.getJob(res.locals.reqParams)
      return res.status(StatusCodes.OK).json(job)
    } catch (error) {
      next(error)
    }
  }

  public deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.jobService.deleteJob(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      next(error)
    }
  }

  public getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.jobService.getJobs(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(jobs.metaData))
      return res.status(StatusCodes.OK).json(jobs)
    } catch (error) {
      next(error)
    }
  }

  public createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.jobService.createJob(req.file, res.locals.reqParams)
      return res.status(StatusCodes.CREATED).json(job)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.jobService.updateJob(req.file, res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public getJobTestExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testExams = await this.jobService.getJobTestExams(res.locals.reqParams)

      return res.status(StatusCodes.OK).json(testExams)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public getJobAddableTestExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addableTestExams = await this.jobService.getJobAddableTestExams(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(addableTestExams.metaData))
      return res.status(StatusCodes.OK).json(addableTestExams)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public jobAddTestExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.jobService.jobAddTestExams(res.locals.reqParams)
      return res.status(StatusCodes.CREATED).json()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
