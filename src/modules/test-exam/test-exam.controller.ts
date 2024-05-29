import { inject, injectable } from 'inversify'
import { TestExamService } from './test-exam.service'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class TestExamController {
  constructor(@inject(TestExamService) private readonly testExamService: TestExamService) {}

  public getTestExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testExams = await this.testExamService.getTestExams(res.locals.reqParams)
      res.setHeader('X-Pagination', JSON.stringify(testExams.metaData))
      return res.status(StatusCodes.OK).json(testExams)
    } catch (error) {
      next(error)
    }
  }
}
