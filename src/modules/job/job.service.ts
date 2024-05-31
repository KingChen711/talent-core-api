import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateJobSchema,
  TDeleteJobSchema,
  TGetJobAddableTestExamsSchema,
  TGetJobSchema,
  TGetJobTestExamsSchema,
  TGetJobsSchema,
  TJobAddTestExamsSchema,
  TUpdateJobSchema
} from './job.validation'
import { Job, Prisma } from '@prisma/client'
import { PagedList } from '../../types'
import { ImageService } from '../../aws-s3/image.service'
import { defaultImageName, systemImageJobs } from '../../constants/index'
import ApiError from 'src/helpers/api-error'
import { StatusCodes } from 'http-status-codes'
import { TestExamService } from '../test-exam/test-exam.service'

@injectable()
export class JobService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ImageService) private readonly imageService: ImageService,
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
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with id: ${jobId}`)
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
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with code: ${code}`)
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
            recruitmentRound: {
              select: {
                isOpening: true
              }
            }
          }
        }
      }
    })

    if (!job) return null

    const imageUrl = await this.imageService.getImageUrl(job.icon)

    const mappedJob = {
      ...job,
      isOpening: job.jobDetails.some((jd) => jd.recruitmentRound.isOpening),
      icon: imageUrl,
      jobDetails: undefined,
      testExamIds: undefined
    }

    return mappedJob
  }

  public getJobs = async (schema: TGetJobsSchema): Promise<PagedList<Job>> => {
    const {
      query: { pageNumber, pageSize, search, status, sort }
    } = schema

    const where = {
      AND: [
        status === 'opening'
          ? {
              jobDetails: {
                some: {
                  recruitmentRound: {
                    isOpening: true
                  }
                }
              }
            }
          : undefined,
        status === 'closed'
          ? {
              jobDetails: {
                every: {
                  recruitmentRound: {
                    isOpening: false
                  }
                }
              }
            }
          : undefined,
        search
          ? {
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
          : undefined
      ].filter((i) => i !== undefined) as Prisma.JobWhereInput
    }

    const query: Prisma.JobFindManyArgs = { where }

    const totalCount = await this.prismaService.client.job.count(query as Prisma.JobCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    // //TODO: chưa xác nhận phần isOpening có hoạt động đúng hay không
    const jobs = await this.prismaService.client.job.findMany({
      ...query,
      include: {
        jobDetails: {
          select: {
            recruitmentRound: {
              select: {
                isOpening: true
              }
            }
          }
        }
      }
    })

    const imageUrls = await Promise.all(jobs.map((job) => this.imageService.getImageUrl(job.icon)))

    const mappedJobs = jobs.map((job, i) => ({
      ...job,
      isOpening: job.jobDetails.some((jd) => jd.recruitmentRound.isOpening),
      icon: imageUrls[i],
      jobDetails: undefined // key have undefined value will be remove from the returned json
    }))

    return new PagedList<Job>(mappedJobs, totalCount, pageNumber, pageSize)
  }

  public createJob = async (file: Express.Multer.File | undefined, schema: TCreateJobSchema) => {
    const {
      body: {
        code,
        color,
        name,
        // openInCurrentRecruitment,
        description
        // quantityInCurrentRecruitment
      }
    } = schema

    if (await this.getJobByCode(code)) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          code: 'This code is already used'
        }
      })
    }

    let imageName: string
    if (file) {
      imageName = await this.imageService.upLoadImage(file, 240, 240)
    }
    imageName ||= defaultImageName

    const job = await this.prismaService.client.job.create({
      data: { code, color, icon: imageName, name, description }
    })

    //TODO:handle add to CurrentRecruitment

    return job
  }

  public updateJob = async (file: Express.Multer.File | undefined, schema: TUpdateJobSchema) => {
    const {
      params: { jobId },
      body: { code, color, name, testExamIds, description }
    } = schema

    const jobByCode = await this.getJobByCode(code)

    if (jobByCode && jobByCode.id !== jobId) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          code: 'This code is already used'
        }
      })
    }

    const job = jobByCode || (await this.getJobById(jobId, true)!)

    let imageName: string

    console.log(file)

    if (file) {
      console.log('Have file')

      if (systemImageJobs.includes(job!.icon)) {
        console.log('create new image object')
        //create new image object
        imageName = await this.imageService.upLoadImage(file, 240, 240)
      } else {
        console.log('put available image object')
        //put available image object
        imageName = job!.icon
        await this.imageService.upLoadImage(file, 240, 240, imageName)
      }
    } else {
      console.log('Not file')
      imageName = job!.icon
    }

    await this.prismaService.client.job.update({
      where: {
        id: jobId
      },
      data: { code, color, icon: imageName, name, description, testExamIds }
    })
    //TODO: kiểm tra testExamIds có valid không
  }

  public deleteJob = async (schema: TDeleteJobSchema) => {
    const {
      params: { jobId }
    } = schema

    //check exist
    const job = await this.getJobById(jobId, true)!

    //TODO: chưa xác nhận cái này chạy được không
    if (job!._count.jobDetails > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This jobs have already belong to some recruitment rounds')
    }

    await this.prismaService.client.job.delete({
      where: {
        id: jobId
      }
    })
  }

  public getJobTestExams = async (schema: TGetJobTestExamsSchema) => {
    const {
      params: { jobCode }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode },
      include: {
        testExams: true
      }
    })

    if (!job) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with code: ${jobCode}`)
    }

    return job.testExams
  }

  public getJobAddableTestExams = async (schema: TGetJobAddableTestExamsSchema) => {
    const {
      params: { jobCode },
      query
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode }
    })

    if (!job) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with code: ${jobCode}`)
    }

    const addableTestExams = await this.testExamService.getTestExams({ query }, job.testExamIds)

    return addableTestExams
  }

  public jobAddTestExams = async (schema: TJobAddTestExamsSchema) => {
    const {
      params: { jobCode },
      body: { testExamIds }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { code: jobCode }
    })

    if (!job) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with code: ${jobCode}`)
    }

    const testExams = await this.prismaService.client.testExam.findMany({
      where: {
        id: {
          in: testExamIds
        }
      }
    })

    if (testExams.length !== testExamIds.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Some test exams are not found`)
    }

    console.log({
      input: testExamIds,
      exist: job.testExamIds,
      setLength: new Set([...testExamIds, ...job.testExamIds]).size
    })

    const hasSomeTestExamAlreadyAdded =
      new Set([...testExamIds, ...job.testExamIds]).size !== testExamIds.length + job.testExamIds.length

    if (hasSomeTestExamAlreadyAdded) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Some test exams have already added`)
    }

    await this.prismaService.client.job.update({
      where: { code: jobCode },
      data: {
        testExamIds: {
          push: testExamIds
        }
      }
    })
  }
}
