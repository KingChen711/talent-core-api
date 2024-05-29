import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { PagedList } from 'src/types'
import { Prisma, TestExam } from '@prisma/client'
import { TDeleteTestExamSchema, TGetTestExamsSchema } from './test-exam.validation'
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

  public getTestExams = async (schema: TGetTestExamsSchema): Promise<PagedList<TestExam>> => {
    const {
      query: { pageNumber, pageSize, search, sort }
    } = schema

    const query: Prisma.TestExamFindManyArgs = {
      where: {}
    }

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
}
