import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma, TestExam } from '@prisma/client'
import {
  TCreateTestExamSchema,
  TDeleteTestExamSchema,
  TGetTestExamJobsSchema,
  TGetTestExamSchema,
  TGetTestExamsSchema,
  TAddOrRemoveJobsSchema,
  TUpdateTestExamSchema
} from './test-exam.validation'
import { FileService } from '../aws-s3/file.service'
import { PagedList } from '../../helpers/paged-list'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'
import AlreadyUsedCodeException from '../../helpers/errors/already-used-code.exception'

@injectable()
export class TestExamService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(FileService) private readonly fileService: FileService
  ) {}

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
      throw new NotFoundException(`Not found testExam with id: ${testExamId}`)
    }

    return testExam
  }

  public getTestExamByCode = async (code: string, required = false) => {
    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { code }
    })

    if (!testExam && required) {
      throw new NotFoundException(`Not found testExam with code: ${code}`)
    }

    return testExam
  }

  public getTestExams = async (schema: TGetTestExamsSchema, exceptIds: string[] = []): Promise<PagedList<TestExam>> => {
    const {
      query: { pageNumber, pageSize, search, sort }
    } = schema

    let searchQuery: Prisma.TestExamWhereInput = {}
    if (search) {
      searchQuery = {
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

    let exceptsQuery: Prisma.TestExamWhereInput = {}
    if (exceptIds.length > 0) {
      exceptsQuery = {
        NOT: {
          id: {
            in: exceptIds
          }
        }
      }
    }

    const query: Prisma.TestExamFindManyArgs = {
      where: {
        AND: [searchQuery, exceptsQuery]
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

    if (testExam!._count.testSessions > 0) {
      throw new BadRequestException('Cannot delete a test exam have test sessions.')
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
      throw new AlreadyUsedCodeException()
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
      throw new AlreadyUsedCodeException()
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

  public testExamAddJobs = async (schema: TAddOrRemoveJobsSchema) => {
    const {
      params: { testExamCode },
      body: { jobIds }
    } = schema

    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { code: testExamCode }
    })

    if (!testExam) {
      throw new NotFoundException(`Not found test exam with code: ${testExamCode}`)
    }

    const jobs = await this.prismaService.client.job.findMany({
      where: {
        id: {
          in: jobIds
        }
      }
    })

    if (jobs.length !== jobIds.length) {
      throw new BadRequestException(`Some jobs are not found`)
    }

    const hasSomeJobsAlreadyAdded =
      new Set([...jobIds, ...testExam.jobIds]).size < jobIds.length + testExam.jobIds.length

    if (hasSomeJobsAlreadyAdded) {
      throw new BadRequestException(`Some jobs have already added`)
    }

    const updateTestExamPromises = jobIds.map((jobId) =>
      this.prismaService.client.testExam.update({
        where: { code: testExamCode },
        data: {
          jobs: {
            connect: {
              id: jobId
            }
          }
        }
      })
    )

    await Promise.all(updateTestExamPromises)
  }

  public getTestExamJobs = async (schema: TGetTestExamJobsSchema) => {
    const {
      params: { testExamCode }
    } = schema

    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { code: testExamCode },
      include: {
        jobs: true
      }
    })

    if (!testExam) {
      throw new NotFoundException(`Not found test exam with code: ${testExamCode}`)
    }

    const imageUrls = await Promise.all(testExam.jobs.map((job) => this.fileService.getFileUrl(job.icon)))

    const mappedJobs = testExam.jobs.map((job, i) => ({
      ...job,
      icon: imageUrls[i]
    }))

    //A test exam will not have to to much jobs, no need to pagination, search, sort
    return mappedJobs
  }

  public removeJobs = async (schema: TAddOrRemoveJobsSchema) => {
    const {
      params: { testExamCode },
      body: { jobIds }
    } = schema

    const testExam = await this.prismaService.client.testExam.findUnique({
      where: { code: testExamCode }
    })

    if (!testExam) {
      throw new NotFoundException(`Not found test exam with code: ${testExamCode}`)
    }

    const hasSomeJobsNotExistInTestExam = new Set([...jobIds, ...testExam.jobIds]).size > testExam.jobIds.length

    if (hasSomeJobsNotExistInTestExam) {
      throw new BadRequestException(`Some jobs do not exist in this test exam`)
    }

    const updateTestExamPromises = jobIds.map((jobId) =>
      this.prismaService.client.testExam.update({
        where: { code: testExamCode },
        data: {
          jobs: {
            disconnect: {
              id: jobId
            }
          }
        }
      })
    )

    await Promise.all(updateTestExamPromises)
  }
}
