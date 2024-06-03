import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateRecruitmentDriveSchema,
  TGetRecruitmentDriveSchema,
  TGetRecruitmentDrivesSchema,
  TUpdateRecruitmentDriveSchema
} from './recruitment-drive.validation'
import { PagedList } from '../../types'
import { Prisma, RecruitmentDrive } from '@prisma/client'
import ApiError from '../../helpers/api-error'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class RecruitmentDriveService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  private sortMapping = {
    startDate: { startDate: 'asc' },
    '-startDate': { startDate: 'desc' },
    endDate: { endDate: 'asc' },
    '-endDate': { endDate: 'desc' },
    name: { name: 'asc' },
    '-name': { name: 'desc' },
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' }
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

  public getCurrentRecruitmentDrive = async () => {
    return await this.prismaService.client.recruitmentDrive.findFirst({
      where: {
        isOpening: true
      }
    })
  }

  public createRecruitmentDrive = async (schema: TCreateRecruitmentDriveSchema) => {
    const {
      body: { endDate, isOpening, name, startDate, description }
    } = schema

    const recruitmentDriveByName = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { name }
    })

    if (recruitmentDriveByName) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          name: 'This name is already used'
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
      data: { endDate, isOpening, name, startDate, description }
    })
  }

  public updateRecruitmentDrive = async (schema: TUpdateRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId },
      body: { endDate, isOpening, name, startDate, description }
    } = schema

    const recruitmentDriveByName = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { name }
    })

    if (recruitmentDriveByName && recruitmentDriveByName.id !== recruitmentDriveId) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, {
        errors: {
          name: 'This name is already used'
        }
      })
    }

    const recruitmentDrive = recruitmentDriveByName || (await this.getRecruitmentDriveById(recruitmentDriveId, true))!

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
      data: { endDate, isOpening, name, startDate, description }
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
}
