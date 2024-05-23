import { inject, injectable } from 'inversify'
import { PrismaService } from 'src/prisma.service'
import { TGetJobsSchema } from './job.validation'
import { Job, Prisma } from '@prisma/client'
import { PagedList } from 'src/types'

@injectable()
export class JobService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  getJobs = async (schema: TGetJobsSchema): Promise<PagedList<Job>> => {
    const {
      query: { pageNumber, pageSize, search }
    } = schema

    const query: Prisma.JobCountArgs = {}

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

    const totalCount = await this.prismaService.client.job.count(query)

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const jobs = await this.prismaService.client.job.findMany(query as Prisma.JobFindManyArgs)

    return new PagedList<Job>(jobs, totalCount, pageNumber, pageSize)
  }
}
