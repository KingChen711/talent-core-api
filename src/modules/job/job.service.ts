import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TGetJobsSchema } from './job.validation'
import { Job, Prisma } from '@prisma/client'
import { PagedList } from '../../types'

@injectable()
export class JobService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  getJobs = async (schema: TGetJobsSchema): Promise<PagedList<Job>> => {
    const {
      query: { pageNumber, pageSize, search }
    } = schema

    const query: Prisma.JobFindManyArgs = {}

    if (search) {
      query.where = {
        OR: [
          {
            code: {
              contains: search
            }
          },
          {
            description: {
              contains: search
            }
          },
          {
            name: {
              contains: search
            }
          }
        ]
      }
    }

    const totalCount = await this.prismaService.client.job.count(query as Prisma.JobCountArgs)

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    //TODO: chưa xác nhận phần isOpening có hoạt đúng hay không
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
