import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { PagedList } from 'src/types'
import { Prisma, TestExam } from '@prisma/client'
import { TGetTestExamsSchema } from './test-exam.validation'

@injectable()
export class TestExamService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  private sortMapping: { [key: string]: { [key: string]: 'asc' | 'desc' } } = {
    code: { code: 'asc' },
    '-code': { code: 'desc' },
    name: { name: 'asc' },
    '-name': { name: 'desc' },
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' },
    conditionPoint: { conditionPoint: 'asc' },
    '-conditionPoint': { conditionPoint: 'desc' },
    duration: { duration: 'asc' },
    '-duration': { conditionPoint: 'desc' }
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
}
