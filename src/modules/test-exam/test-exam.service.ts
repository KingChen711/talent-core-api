import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { PagedList } from 'src/types'
import { Prisma, TestExam } from '@prisma/client'
import {
  TCreateTestExamSchema,
  TDeleteTestExamSchema,
  TGetTestExamSchema,
  TGetTestExamsSchema,
  TUpdateTestExamSchema
} from './test-exam.validation'
import ApiError from 'src/helpers/api-error'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class TestExamService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  private sortMapping = {
    code: { code: 'asc' },
    '-code': { code: 'desc' },
    name: { name: 'asc' },
    '-name': { name: 'desc' },
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' },
    conditionPoint: { conditionPoint: 'asc' },
    '-conditionPoint': { conditionPoint: 'desc' },
    duration: { duration: 'asc' },
    '-duration': { duration: 'desc' }
  } as const

  public getTestExam = async (schema: TGetTestExamSchema) => {
    const {
      params: { testExamId }
    } = schema

    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { id: testExamId },
      include: {
        questions: true
      }
    })

    return testExam
  }

  public getTestExamById = async (testExamId: string, required = false) => {
    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { id: testExamId },
      include: {
        _count: {
          select: {
            testSessions: true
          }
        }
      }
    })

    if (!testExam && required) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found testExam with id: ${testExamId}`)
    }

    return testExam
  }

  public getTestExamByCode = async (code: string, required = false) => {
    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { code }
    })

    if (!testExam && required) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found testExam with code: ${code}`)
    }

    return testExam
  }

  public getTestExams = async (schema: TGetTestExamsSchema): Promise<PagedList<TestExam>> => {
    const {
      query: { pageNumber, pageSize, search, sort }
    } = schema

    const query: Prisma.TestExamFindManyArgs = {}

    if (search) {
      query.where = {
        OR: [
          {
            code: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    const totalCount = await this.prismaService.client.testExam.count(query as Prisma.TestExamCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const testExams = await this.prismaService.client.testExam.findMany(query)

    return new PagedList<TestExam>(testExams, totalCount, pageNumber, pageSize)
  }

  public deleteTestExam = async (schema: TDeleteTestExamSchema) => {
    const {
      params: { testExamId }
    } = schema

    //check exist
    const testExam = await this.getTestExamById(testExamId, true)!

    //TODO: chưa xác nhận cái này chạy được không
    if (testExam!._count.testSessions > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete a test exam have test sessions.')
    }

    await this.prismaService.client.testExam.delete({
      where: {
        id: testExamId
      }
    })
  }

  public createTestExam = async (schema: TCreateTestExamSchema) => {
    const {
      body: { code, duration, name, questions, conditionPoint, description }
    } = schema

    if (await this.getTestExamByCode(code)) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          code: 'This code is already used'
        }
      })
    }

    const testExam = await this.prismaService.client.testExam.create({
      data: {
        code,
        duration,
        name,
        questions: {
          createMany: {
            data: questions
          }
        },
        conditionPoint,
        description
      }
    })

    return testExam
  }

  public updateTestExam = async (file: Express.Multer.File | undefined, schema: TUpdateTestExamSchema) => {
    const {
      params: { testExamId },
      body: { code, description, conditionPoint, duration, name, questions }
    } = schema

    const testExamByCode = await this.getTestExamByCode(code)

    if (testExamByCode && testExamByCode.id !== testExamId) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          code: 'This code is already used'
        }
      })
    }

    const testExam = testExamByCode || (await this.getTestExamById(testExamId, true))!

    await this.prismaService.client.question.deleteMany({
      where: { testExamId: testExam.id }
    })

    await this.prismaService.client.testExam.update({
      where: { id: testExam.id },
      data: {
        code,
        description,
        conditionPoint,
        duration,
        name,
        questions: {
          createMany: {
            data: questions
          }
        }
      }
    })
  }
}
