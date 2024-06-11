import { inject, injectable } from 'inversify'
import { TestExamService } from './test-exam.service'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JobService } from '../job/job.service'
import { TGetAddableJobsSchema } from './test-exam.validation'

@injectable()
export class TestExamController {
  constructor(
    @inject(TestExamService) private readonly testExamService: TestExamService,
    @inject(JobService) private readonly jobService: JobService
  ) {}

  public getTestExam = async (req: Request, res: Response) => {
    const testExam = await this.testExamService.getTestExam(res.locals.requestData)
    return res.status(StatusCodes.OK).json(testExam)
  }

  public getTestExams = async (req: Request, res: Response) => {
    const testExams = await this.testExamService.getTestExams(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(testExams.metaData))
    return res.status(StatusCodes.OK).json(testExams)
  }

  public createTestExam = async (req: Request, res: Response) => {
    const testExam = await this.testExamService.createTestExam(res.locals.requestData)
    return res.status(StatusCodes.CREATED).json(testExam)
  }

  public deleteTestExam = async (req: Request, res: Response) => {
    await this.testExamService.deleteTestExam(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public updateTestExam = async (req: Request, res: Response) => {
    await this.testExamService.updateTestExam(req.file, res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }

  public addJobs = async (req: Request, res: Response) => {
    await this.testExamService.testExamAddJobs(res.locals.requestData)
    return res.status(StatusCodes.CREATED)
  }

  public getAddableJobs = async (req: Request, res: Response) => {
    //because circular dependency problem, can not do all works in one service method
    const {
      params: { testExamCode },
      query
    } = res.locals.requestData as TGetAddableJobsSchema

    const testExam = (await this.testExamService.getTestExamByCode(testExamCode, true))!

    const addableJobs = await this.jobService.getJobs({ query }, testExam.jobIds)
    res.setHeader('X-Pagination', JSON.stringify(addableJobs.metaData))
    return res.status(StatusCodes.OK).json(addableJobs)
  }

  public getTestExamJobs = async (req: Request, res: Response) => {
    const testExams = await this.testExamService.getTestExamJobs(res.locals.requestData)
    return res.status(StatusCodes.OK).json(testExams)
  }

  public removeJobs = async (req: Request, res: Response) => {
    await this.testExamService.removeJobs(res.locals.requestData)
    return res.status(StatusCodes.NO_CONTENT)
  }
}
