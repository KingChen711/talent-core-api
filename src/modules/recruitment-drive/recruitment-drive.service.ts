import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TGetRecruitmentDrivesSchema } from './recruitment-drive.validation'
import { PagedList } from 'src/types'
import { Prisma, RecruitmentDrive } from '@prisma/client'

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
}
