import { inject, injectable } from 'inversify'
import { JobService } from './job.service'
import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'

@injectable()
export class JobController {
  constructor(@inject(JobService) private readonly jobService: JobService) {}

  public getJob = async (req: Request, res: Response) => {
    const job = await this.jobService.getJob(res.locals.requestData)
    return res.status(StatusCodes.OK).json(job)
  }

  public deleteJob = async (req: Request, res: Response) => {
    await this.jobService.deleteJob(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public getJobs = async (req: Request, res: Response) => {
    const jobs = await this.jobService.getJobs(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(jobs.metaData))
    return res.status(StatusCodes.OK).json(jobs)
  }

  public createJob = async (req: Request, res: Response) => {
    const job = await this.jobService.createJob(req.file, res.locals.requestData)
    return res.status(StatusCodes.CREATED).json(job)
  }

  public updateJob = async (req: Request, res: Response) => {
    await this.jobService.updateJob(req.file, res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public getJobTestExams = async (req: Request, res: Response) => {
    const testExams = await this.jobService.getJobTestExams(res.locals.requestData)

    return res.status(StatusCodes.OK).json(testExams)
  }

  public getAddableTestExams = async (req: Request, res: Response) => {
    const addableTestExams = await this.jobService.getAddableTestExams(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(addableTestExams.metaData))
    return res.status(StatusCodes.OK).json(addableTestExams)
  }

  public jobAddTestExams = async (req: Request, res: Response) => {
    await this.jobService.jobAddTestExams(res.locals.requestData)
    return res.status(StatusCodes.CREATED)
  }

  public removeTestExams = async (req: Request, res: Response) => {
    await this.jobService.removeTestExams(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }
}
