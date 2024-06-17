import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateJobSchema,
  TDeleteJobSchema,
  TGetAddableTestExamsSchema,
  TGetJobSchema,
  TGetJobTestExamsSchema,
  TGetJobsSchema,
  TAddOrRemoveTestExamsSchema,
  TUpdateJobSchema
} from './job.validation'
import { Job, Prisma } from '@prisma/client'
import { FileService } from '../aws-s3/file.service'
import { defaultImageName, systemImageJobs } from '../../constants/index'
import { TestExamService } from '../test-exam/test-exam.service'
import { PagedList } from '../../helpers/paged-list'
import NotFoundException from '../../helpers/errors/not-found.exception'
import AlreadyUsedCodeException from '../../helpers/errors/already-used-code.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'

@injectable()
export class JobService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(FileService) private readonly fileService: FileService,
    @inject(TestExamService) private readonly testExamService: TestExamService
  ) {}

  private sortMapping = {
    code: { code: 'asc' },
    '-code': { code: 'desc' },
    name: { name: 'asc' },
    '-name': { name: 'desc' },
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' }
  } as const

  public getJobById = async (jobId: string, required = false) => {
    const job = await this.prismaService.client.job.findUnique({
      where: { id: jobId },
      include: {
        _count: {
          select: {
            jobDetails: true
          }
        }
      }
    })

    if (!job && required) {
      throw new NotFoundException(`Not found job with id: ${jobId}`)
    }

    return job
  }

  public getJobByCode = async (code: string, required = false) => {
    const job = await this.prismaService.client.job.findUnique({
      where: { code },
      include: {
        _count: {
          select: {
            jobDetails: true
          }
        }
      }
    })

    if (!job && required) {
      throw new NotFoundException(`Not found job with code: ${code}`)
    }

    return job
  }

  public getJob = async (schema: TGetJobSchema) => {
    const {
      params: { jobId }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { id: jobId },
      include: {
        jobDetails: {
          select: {
            recruitmentDrive: {
              select: {
                status: true
              }
            }
          }
        }
      }
    })

    if (!job) return null

    const imageUrl = await this.fileService.getFileUrl(job.icon)

    let status = [...new Set(job.jobDetails.map((jd) => jd.recruitmentDrive.status))]

    if (status.includes('Closed') && status.length > 1) {
      status = status.filter((s) => s !== 'Closed')
    }

    const mappedJob = {
      ...job,
      status,
      icon: imageUrl,
      jobDetails: undefined,
      testExamIds: undefined
    }

    return mappedJob
  }

  public getJobs = async (schema: TGetJobsSchema, exceptIds: string[] = []): Promise<PagedList<Job>> => {
    const {
      query: { pageNumber, pageSize, search, status, sort }
    } = schema

    let exceptIdsQuery: Prisma.JobWhereInput = {}

    if (exceptIds.length > 0) {
      exceptIdsQuery = {
        NOT: {
          id: {
            in: exceptIds
          }
        }
      }
    }

    let searchQuery: Prisma.JobWhereInput = {}

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

    let statusQuery: Prisma.JobWhereInput = {}

    switch (status) {
      case 'Closed': {
        statusQuery = {
          jobDetails: {
            every: {
              recruitmentDrive: {
                status: { notIn: ['Open', 'Upcoming'] }
              }
            }
          }
        }
        break
      }
      case 'Open': {
        statusQuery = {
          jobDetails: {
            some: {
              recruitmentDrive: {
                status: 'Open'
              }
            }
          }
        }
        break
      }
      case 'Upcoming': {
        statusQuery = {
          jobDetails: {
            some: {
              recruitmentDrive: {
                status: 'Upcoming'
              }
            }
          }
        }
        break
      }
    }

    const query: Prisma.JobFindManyArgs = { where: { AND: [statusQuery, searchQuery, exceptIdsQuery] } }

    const totalCount = await this.prismaService.client.job.count(query as Prisma.JobCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const jobs = await this.prismaService.client.job.findMany({
      ...query,
      include: {
        jobDetails: {
          select: {
            recruitmentDrive: {
              select: {
                status: true
              }
            }
          }
        }
      }
    })

    const imageUrls = await Promise.all(jobs.map((job) => this.fileService.getFileUrl(job.icon)))

    const mappedJobs = jobs.map((job, i) => {
      let status = [...new Set(job.jobDetails.map((jd) => jd.recruitmentDrive.status))]

      if (status.includes('Closed') && status.length > 1) {
        status = status.filter((s) => s !== 'Closed')
      }

      return {
        ...job,
        status: status.length > 0 ? status : ['Closed'],
        icon: imageUrls[i],
        jobDetails: undefined // key have undefined value will be remove from the returned json
      }
    })

    return new PagedList<Job>(mappedJobs, totalCount, pageNumber, pageSize)
  }

  public createJob = async (file: Express.Multer.File | undefined, schema: TCreateJobSchema) => {
    const {
      body: { code, color, name, description }
    } = schema

    if (await this.getJobByCode(code)) {
      throw new AlreadyUsedCodeException()
    }

    let imageName: string
    if (file) {
      imageName = await this.fileService.upLoadImage(file, 240, 240)
    }
    imageName ||= defaultImageName

    const job = await this.prismaService.client.job.create({
      data: { code, color, icon: imageName, name, description }
    })

    return job
  }

  public updateJob = async (file: Express.Multer.File | undefined, schema: TUpdateJobSchema) => {
    const {
      params: { jobId },
      body: { code, color, name, testExamIds, description }
    } = schema

    const jobByCode = await this.getJobByCode(code)

    if (jobByCode && jobByCode.id !== jobId) throw new AlreadyUsedCodeException()

    const job = jobByCode || (await this.getJobById(jobId, true)!)

    let imageName: string

    if (file) {
      if (systemImageJobs.includes(job!.icon)) {
        //create new image object
        imageName = await this.fileService.upLoadImage(file, 240, 240)
      } else {
        //put available image object
        imageName = job!.icon
        await this.fileService.upLoadImage(file, 240, 240, imageName)
      }
    } else {
      imageName = job!.icon
    }

    await this.prismaService.client.job.update({
      where: {
        id: jobId
      },
      data: { code, color, icon: imageName, name, description, testExamIds }
    })
  }

  public deleteJob = async (schema: TDeleteJobSchema) => {
    const {
      params: { jobId }
    } = schema

    //check exist
    const job = await this.getJobById(jobId, true)!

    if (job!._count.jobDetails > 0) {
      throw new BadRequestException('This jobs have already belong to some recruitment drives')
    }

    const deleteIconPromise = !systemImageJobs.includes(job!.icon) ? this.fileService.deleteFile(job!.icon) : undefined

    const deleteJobPromise = this.prismaService.client.job.delete({
      where: {
        id: jobId
      }
    })

    await Promise.all([deleteIconPromise, deleteJobPromise])
  }

  public getJobTestExams = async (schema: TGetJobTestExamsSchema) => {
    const {
      params: { jobCode }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode },
      include: {
        testExams: {
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        }
      }
    })

    if (!job) {
      throw new NotFoundException(`Not found job with code: ${jobCode}`)
    }

    //A job will not have to to much test exam, no need to pagination, search, sort
    const mappedTestExams = job.testExams.map((test) => ({
      ...test,
      countQuestions: test._count.questions,
      _count: undefined
    }))

    return mappedTestExams
  }

  public getAddableTestExams = async (schema: TGetAddableTestExamsSchema) => {
    const {
      params: { jobCode },
      query
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode }
    })

    if (!job) {
      throw new NotFoundException(`Not found job with code: ${jobCode}`)
    }

    const addableTestExams = await this.testExamService.getTestExams({ query }, job.testExamIds)

    return addableTestExams
  }

  public addTestExams = async (schema: TAddOrRemoveTestExamsSchema) => {
    const {
      params: { jobCode },
      body: { testExamIds }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode }
    })

    console.log(2)

    if (!job) throw new NotFoundException(`Not found job with code: ${jobCode}`)

    console.log(3)

    const testExams = await this.prismaService.client.testExam.findMany({
      where: {
        id: {
          in: testExamIds
        }
      }
    })

    console.log(4)

    console.log({ testExamIds })

    console.log({ testExams })

    if (testExams.length !== testExamIds.length) throw new BadRequestException(`Some test exams are not found`)

    const hasSomeTestExamAlreadyAdded =
      new Set([...testExamIds, ...job.testExamIds]).size < testExamIds.length + job.testExamIds.length

    if (hasSomeTestExamAlreadyAdded) throw new BadRequestException(`Some test exams have already added`)

    console.log(5)

    const updateJobPromises = testExamIds.map((testExamId) =>
      this.prismaService.client.job.update({
        where: { code: jobCode },
        data: {
          testExams: {
            connect: {
              id: testExamId
            }
          }
        }
      })
    )

    console.log(6)

    await Promise.all(updateJobPromises)

    console.log(7)
  }

  public removeTestExams = async (schema: TAddOrRemoveTestExamsSchema) => {
    const {
      params: { jobCode },
      body: { testExamIds }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode }
    })

    if (!job) throw new NotFoundException(`Not found job with code: ${jobCode}`)

    const hasSomeTestExamNotExistInJob = new Set([...testExamIds, ...job.testExamIds]).size > job.testExamIds.length

    if (hasSomeTestExamNotExistInJob) throw new BadRequestException(`Some test exams do not exist in this job`)

    const updateJobPromises = testExamIds.map((testExamId) =>
      this.prismaService.client.job.update({
        where: { code: jobCode },
        data: {
          testExams: {
            disconnect: {
              id: testExamId
            }
          }
        }
      })
    )

    await Promise.all(updateJobPromises)
  }
}
