import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TGetJobsSchema } from './job.validation'
import { Job, Prisma } from '@prisma/client'
import { PagedList } from '../../types'

const sortMapping: { [key: string]: { [key: string]: 'asc' | 'desc' } } = {
  code: { code: 'asc' },
  name: { name: 'asc' },
  '-code': { code: 'desc' },
  '-name': { name: 'desc' }
}

@injectable()
export class JobService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

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

    // //TODO: chưa xác nhận phần isOpening có hoạt đúng hay không
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

    const mappedJobs = jobs.map((job) => ({
      ...job,
      isOpening: job.jobDetails.some((jd) => jd.recruitmentRound.isOpening),
      jobDetails: undefined // key have undefined value will be remove from the return json
    }))

    return new PagedList<Job>(mappedJobs, totalCount, pageNumber, pageSize)
  }
}
