import { inject, injectable } from 'inversify'
import { JobService } from './job.service'
import { Request, Response } from 'express'
import { created, noContent, ok } from 'src/helpers/utils'

@injectable()
export class JobController {
  constructor(@inject(JobService) private readonly jobService: JobService) {}

  public getJob = async (req: Request, res: Response) => {
    const job = await this.jobService.getJob(res.locals.requestData)
    return ok(res, job)
  }

  public deleteJob = async (req: Request, res: Response) => {
    await this.jobService.deleteJob(res.locals.requestData)
    return noContent(res)
  }

  public getJobs = async (req: Request, res: Response) => {
    const jobs = await this.jobService.getJobs(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(jobs.metaData))
    return ok(res, jobs)
  }

  public createJob = async (req: Request, res: Response) => {
    const job = await this.jobService.createJob(req.file, res.locals.requestData)
    return created(res, job)
  }

  public updateJob = async (req: Request, res: Response) => {
    await this.jobService.updateJob(req.file, res.locals.requestData)
    return noContent(res)
  }

  public getJobTestExams = async (req: Request, res: Response) => {
    const testExams = await this.jobService.getJobTestExams(res.locals.requestData)

    return ok(res, testExams)
  }

  public getAddableTestExams = async (req: Request, res: Response) => {
    const addableTestExams = await this.jobService.getAddableTestExams(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(addableTestExams.metaData))
    return ok(res, addableTestExams)
  }

  public jobAddTestExams = async (req: Request, res: Response) => {
    console.log('jobAddTestExamsControllers')

    await this.jobService.jobAddTestExams(res.locals.requestData)

    console.log('9')
    return noContent(res)
  }

  public removeTestExams = async (req: Request, res: Response) => {
    await this.jobService.removeTestExams(res.locals.requestData)
    return noContent(res)
  }
}
