import { inject, injectable } from 'inversify'
import { TestExamService } from './test-exam.service'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class TestExamController {
  constructor(@inject(TestExamService) private readonly testExamService: TestExamService) {}

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
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      next(error)
    }
  }

  public updateTestExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.testExamService.updateTestExam(req.file, res.locals.reqParams)
      return res.status(StatusCodes.NO_CONTENT).json()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  public getTestExamAddableJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const addableTestExams = await this.testExamService.getTestExamAddableJobs(res.locals.reqParams)
      // res.setHeader('X-Pagination', JSON.stringify(addableTestExams.metaData))
      // return res.status(StatusCodes.OK).json(addableTestExams)
      return res.json()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
