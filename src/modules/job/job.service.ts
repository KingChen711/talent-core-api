import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TCreateJobSchema, TGetJobSchema, TGetJobsSchema, TUpdateJobSchema } from './job.validation'
import { Job, Prisma } from '@prisma/client'
import { PagedList } from '../../types'
import { ImageService } from '../../aws-s3/image.service'
import { defaultImageName, systemImageJobs } from '../../constants/index'
import ApiError from 'src/helpers/api-error'
import { StatusCodes } from 'http-status-codes'

const sortMapping: { [key: string]: { [key: string]: 'asc' | 'desc' } } = {
  code: { code: 'asc' },
  name: { name: 'asc' },
  '-code': { code: 'desc' },
  '-name': { name: 'desc' }
}

@injectable()
export class JobService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(ImageService) private readonly imageService: ImageService
  ) {}

  getJobById = async (jobId: string, required = false) => {
    const job = await this.prismaService.client.job.findUnique({ where: { id: jobId } })

    if (!job && required) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with id: ${jobId}`)
    }

    return job
  }

  getJob = async (schema: TGetJobSchema) => {
    const {
      params: { jobId }
    } = schema

    const job = await this.prismaService.client.job.findUnique({
      where: { id: jobId },
      include: {
        testExams: true,
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

  getJobs = async (schema: TGetJobsSchema): Promise<PagedList<Job>> => {
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

    if (sort && sort in sortMapping) {
      query.orderBy = sortMapping[sort]
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

  createJob = async (file: Express.Multer.File | undefined, schema: TCreateJobSchema) => {
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

  updateJob = async (file: Express.Multer.File | undefined, schema: TUpdateJobSchema) => {
    const {
      params: { jobId },
      body: { code, color, name, testExamIds, description }
    } = schema

    const job = await this.getJobById(jobId, true)!

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

  //TODO: kiểm tra testExamIds có valid không
}
