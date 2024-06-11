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
import { ImageService } from '../aws-s3/image.service'
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
      isOpening: job.jobDetails.some((jd) => jd.recruitmentDrive.isOpening),
      icon: imageUrl,
      jobDetails: undefined,
      testExamIds: undefined
    }

    return mappedJob
  }

  public getJobs = async (schema: TGetJobsSchema, exceptCodes: string[] = []): Promise<PagedList<Job>> => {
    const {
      query: { pageNumber, pageSize, search, status, sort }
    } = schema

    const where = {
      AND: [
        exceptCodes.length > 0
          ? {
              NOT: {
                code: {
                  in: exceptCodes
                }
              }
            }
          : undefined,
        status === 'opening'
          ? {
              jobDetails: {
                some: {
                  recruitmentDrive: {
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
                  recruitmentDrive: {
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

    const jobs = await this.prismaService.client.job.findMany({
      ...query,
      include: {
        jobDetails: {
          select: {
            recruitmentDrive: {
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
      isOpening: job.jobDetails.some((jd) => jd.recruitmentDrive.isOpening),
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
      throw new AlreadyUsedCodeException()
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

    if (jobByCode && jobByCode.id !== jobId) throw new AlreadyUsedCodeException()

    const job = jobByCode || (await this.getJobById(jobId, true)!)

    let imageName: string

    if (file) {
      if (systemImageJobs.includes(job!.icon)) {
        //create new image object
        imageName = await this.imageService.upLoadImage(file, 240, 240)
      } else {
        //put available image object
        imageName = job!.icon
        await this.imageService.upLoadImage(file, 240, 240, imageName)
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
      throw new NotFoundException(`Not found job with code: ${jobCode}`)
    }

    //A job will not have to to much test exam, no need to pagination, search, sort
    return job.testExams
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

  public jobAddTestExams = async (schema: TAddOrRemoveTestExamsSchema) => {
    console.log('jobAddTestExams Service')
    const {
      params: { jobCode },
      body: { testExamIds }
    } = schema

    console.log(1)

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
