import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TAddJobToCurrentRecruitmentDriveSchema,
  TCreateRecruitmentDriveSchema,
  TDeleteRecruitmentDriveSchema,
  TGetRecruitmentDriveAddableJobsSchema,
  TGetRecruitmentDriveSchema,
  TGetRecruitmentDrivesSchema,
  TUpdateRecruitmentDriveSchema
} from './recruitment-drive.validation'
import { PagedList } from '../../types'
import { Application, JobDetail, Prisma, RecruitmentDrive } from '@prisma/client'
import ApiError from '../../helpers/api-error'
import { StatusCodes } from 'http-status-codes'
import { JobService } from '../job/job.service'

@injectable()
export class RecruitmentDriveService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(JobService) private readonly jobService: JobService
  ) {}

  private sortMapping = {
    startDate: { startDate: 'asc' },
    '-startDate': { startDate: 'desc' },
    endDate: { endDate: 'asc' },
    '-endDate': { endDate: 'desc' },
    name: { name: 'asc' },
    '-name': { name: 'desc' },
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' },
    code: { code: 'asc' },
    '-code': { code: 'desc' }
  } as const

  public getRecruitmentDriveById = async (recruitmentDriveId: string, required = false) => {
    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { id: recruitmentDriveId }
    })

    if (!recruitmentDrive && required) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitment drive with id: ${recruitmentDriveId}`)
    }

    return recruitmentDrive
  }

  public getCurrentRecruitmentDrive = async (required = false) => {
    const currentRecruitmentDrive = await this.prismaService.client.recruitmentDrive.findFirst({
      where: {
        isOpening: true
      },
      include: {
        jobDetails: true
      }
    })

    if (!currentRecruitmentDrive && required) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitment drive is opening`)
    }

    return currentRecruitmentDrive
  }

  public getRecruitmentDriveDetail = async (schema: TGetRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId }
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findFirst({
      where: {
        id: recruitmentDriveId
      },
      include: {
        jobDetails: {
          select: {
            job: true,
            quantity: true,
            applications: {
              include: {
                candidate: true
              }
            }
          }
        }
      }
    })

    if (!recruitmentDrive) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitment drive with id: ${recruitmentDriveId}`)
    }

    const mappedRecruitmentDrive = {
      ...recruitmentDrive,
      jobDetails: recruitmentDrive.jobDetails.map((jd) => ({
        ...jd,
        countApplicationsLastWeek: jd.applications.reduce((total, application) => {
          if (application.createdAt.getTime() > new Date(new Date().setDate(new Date().getDate() - 7)).getTime()) {
            return total + 1
          }
          return total
        }, 0)
      }))
    }

    return mappedRecruitmentDrive
  }

  public createRecruitmentDrive = async (schema: TCreateRecruitmentDriveSchema) => {
    const {
      body: { endDate, isOpening, name, startDate, description, code }
    } = schema

    const recruitmentDriveByCode = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { code }
    })

    if (recruitmentDriveByCode) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          code: 'This code is already used'
        }
      })
    }

    if (isOpening && (await this.getCurrentRecruitmentDrive())) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          isOpening: 'Cannot open a recruitment drive while there is another recruitment drive is opening'
        }
      })
    }

    return await this.prismaService.client.recruitmentDrive.create({
      data: { endDate, isOpening, name, startDate, description, code }
    })
  }

  public updateRecruitmentDrive = async (schema: TUpdateRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId },
      body: { endDate, isOpening, name, startDate, description, code }
    } = schema

    const recruitmentDriveByCode = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { code }
    })

    if (recruitmentDriveByCode && recruitmentDriveByCode.id !== recruitmentDriveId) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          code: 'This code is already used'
        }
      })
    }

    const recruitmentDrive = recruitmentDriveByCode || (await this.getRecruitmentDriveById(recruitmentDriveId, true))!

    if (isOpening) {
      const currentRecruitmentDrive = await this.getCurrentRecruitmentDrive()
      if (currentRecruitmentDrive && currentRecruitmentDrive.id !== recruitmentDrive.id) {
        throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
          errors: {
            isOpening: 'Cannot open a recruitment drive while there is another recruitment drive is opening'
          }
        })
      }
    }

    return await this.prismaService.client.recruitmentDrive.update({
      where: {
        id: recruitmentDriveId
      },
      data: { endDate, isOpening, name, code, startDate, description }
    })
  }

  public getRecruitmentDrives = async (schema: TGetRecruitmentDrivesSchema): Promise<PagedList<RecruitmentDrive>> => {
    const {
      query: { pageNumber, pageSize, search, status, sort }
    } = schema

    let statusQuery: Prisma.RecruitmentDriveWhereInput = {}

    switch (status) {
      case 'opening': {
        statusQuery = {
          isOpening: true
        }
        break
      }

      case 'closed': {
        statusQuery = {
          isOpening: false
        }
        break
      }
    }

    let searchQuery: Prisma.RecruitmentDriveWhereInput = {}

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
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    const query: Prisma.RecruitmentDriveFindManyArgs = {
      where: {
        AND: [searchQuery, statusQuery]
      }
    }

    const totalCount = await this.prismaService.client.recruitmentDrive.count(query as Prisma.RecruitmentDriveCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const recruitmentDrives = await this.prismaService.client.recruitmentDrive.findMany(query)

    return new PagedList<RecruitmentDrive>(recruitmentDrives, totalCount, pageNumber, pageSize)
  }

  public getRecruitmentDrive = async (schema: TGetRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId }
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { id: recruitmentDriveId }
    })

    return recruitmentDrive
  }

  public deleteRecruitmentDrive = async (schema: TDeleteRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId }
    } = schema

    //check exist
    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { id: recruitmentDriveId },
      include: {
        jobDetails: {
          select: {
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      }
    })

    if (!recruitmentDrive) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitment drive with id: ${recruitmentDriveId}`)
    }

    const countApplications = recruitmentDrive.jobDetails.reduce((total, jd) => total + jd._count.applications, 0)

    //TODO: chưa xác nhận cái này chạy được không
    if (countApplications > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete a recruitment drive already having some applications')
    }

    await this.prismaService.client.recruitmentDrive.delete({
      where: {
        id: recruitmentDriveId
      }
    })
  }

  public getRecruitmentDriveByCode = async (code: string, required = false) => {
    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { code }
    })

    if (!recruitmentDrive && required) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitmentDrive with code: ${code}`)
    }

    return recruitmentDrive
  }

  public addJobToCurrentRecruitmentDrive = async (schema: TAddJobToCurrentRecruitmentDriveSchema) => {
    const {
      body: { jobId, quantity }
    } = schema

    const currentRecruitmentDrive = (await this.getCurrentRecruitmentDrive(true))!

    if (currentRecruitmentDrive.jobDetails.some((jd) => jd.jobId === jobId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `This job is already open in current recruitment drive`)
    }

    return await this.prismaService.client.jobDetail.create({
      data: {
        jobId,
        recruitmentDriveId: currentRecruitmentDrive.id,
        quantity
      }
    })
  }

  public getRecruitmentDriveAddableJobs = async (schema: TGetRecruitmentDriveAddableJobsSchema) => {
    const {
      params: { recruitmentDriveCode },
      query
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: {
        code: recruitmentDriveCode
      },
      include: {
        jobDetails: true
      }
    })

    if (!recruitmentDrive) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitment drive with code: ${recruitmentDriveCode}`)
    }

    if (!recruitmentDrive.isOpening) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Cannot get addable jobs of closed recruitment drive`)
    }

    const jobIdsInRecruitmentDrive = recruitmentDrive?.jobDetails.map((jd) => jd.jobId)

    return this.jobService.getJobs({ query }, jobIdsInRecruitmentDrive)
  }
}
