import { inject, injectable } from 'inversify'
import { TestExamService } from './test-exam.service'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JobService } from '../job/job.service'
import { TGetAddableJobsSchema } from './test-exam.validation'

@injectable()
export class TestExamController {
  constructor(
    @inject(TestExamService) private readonly testExamService: TestExamService,
    @inject(JobService) private readonly jobService: JobService
  ) {}

  public getTestExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testExam = await this.testExamService.getTestExam(res.locals.reqParams)
      return res.status(StatusCodes.OK).json(testExam)
    } catch (error) {
      next(error)
    }
  }

  public getTestExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testExams = await this.testExamService.getTestExams(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(testExams.metaData))
      return res.status(StatusCodes.OK).json(testExams)
    } catch (error) {
      next(error)
    }
  }

  public createTestExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testExam = await this.testExamService.createTestExam(res.locals.reqParams)
      return res.status(StatusCodes.CREATED).json(testExam)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public deleteTestExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.testExamService.deleteTestExam(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT)
    } catch (error) {
      next(error)
    }
  }

  public updateTestExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.testExamService.updateTestExam(req.file, res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public addJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.testExamService.testExamAddJobs(res.locals.reqParams)
      return res.status(StatusCodes.CREATED)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public getAddableJobs = async (req: Request, res: Response, next: NextFunction) => {
    //because circular dependency problem, can not do all works in one service method
    try {
      const {
        params: { testExamCode },
        query
      } = res.locals.reqParams as TGetAddableJobsSchema

      const testExam = (await this.testExamService.getTestExamByCode(testExamCode, true))!

      const addableJobs = await this.jobService.getJobs({ query }, testExam.jobIds)
      res.setHeader('X-Pagination', JSON.stringify(addableJobs.metaData))
      return res.status(StatusCodes.OK).json(addableJobs)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public getTestExamJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testExams = await this.testExamService.getTestExamJobs(res.locals.reqParams)
      return res.status(StatusCodes.OK).json(testExams)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public removeJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.testExamService.removeJobs(res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
