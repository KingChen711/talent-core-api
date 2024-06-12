import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateApplicationSchema,
  TGetApplicationsByRecruitmentDriveSchema
} from '../recruitment-drive/recruitment-drive.validation'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'
import { Application, Prisma } from '@prisma/client'
import { PagedList } from 'src/helpers/paged-list'
import { FileService } from '../aws-s3/file.service'

@injectable()
export class ApplicationService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(FileService) private readonly fileService: FileService
  ) {}

  private sortMapping: Record<string, Prisma.ApplicationOrderByWithRelationInput> = {
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' },
    candidateName: {
      candidate: {
        user: {
          fullName: 'asc'
        }
      }
    },
    '-candidateName': {
      candidate: {
        user: {
          fullName: 'desc'
        }
      }
    },
    appliedJob: {
      jobDetail: {
        job: {
          name: 'asc'
        }
      }
    },
    '-appliedJob': {
      jobDetail: {
        job: {
          name: 'desc'
        }
      }
    }
  } as const

  public createApplication = async (schema: TCreateApplicationSchema) => {
    const {
      params: { jobCode, recruitmentDriveCode },
      body: { candidateEmail, createCandidate, candidateData }
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: {
        code: recruitmentDriveCode
      }
    })

    if (!recruitmentDrive) throw new NotFoundException(`Not found recruitment drive with code: ${recruitmentDriveCode}`)

    if (!recruitmentDrive.isOpening) throw new BadRequestException(`Cannot apply a job in closed recruitment drive`)

    const jobDetail = await this.prismaService.client.jobDetail.findUnique({
      where: {
        jobCode_recruitmentDriveCode: {
          jobCode,
          recruitmentDriveCode
        }
      },
      include: {
        _count: {
          //only count approved applications
          select: {
            applications: {
              where: {
                status: 'Approve'
              }
            }
          }
        }
      }
    })

    if (!jobDetail) throw new NotFoundException(`Not found job with code: ${jobCode} in this recruitment drive`)

    if (jobDetail._count.applications >= jobDetail.quantity)
      throw new BadRequestException(`This job position has reached its capacity.`)

    const hasAlreadyApply = !!(await this.prismaService.client.application.findFirst({
      where: {
        candidate: {
          user: { email: candidateEmail }
        },
        jobDetailId: jobDetail.id
      }
    }))

    if (hasAlreadyApply) throw new BadRequestException(`This candidate is already apply this job`)

    const candidate = await this.prismaService.client.user.findUnique({
      where: {
        email: candidateEmail
      }
    })

    if (!candidate && !createCandidate) throw new NotFoundException(`Not found candidate with email: ${candidateEmail}`)

    if (candidate && createCandidate) throw new BadRequestException(`This candidate is already exists`)

    if (!createCandidate) {
      await this.prismaService.client.user.update({
        where: { email: candidateEmail },
        data: {
          ...candidateData,
          candidate: {
            update: {
              applications: {
                create: {
                  jobDetailId: jobDetail.id
                }
              }
            }
          }
        }
      })

      return
    }

    await this.prismaService.client.user.create({
      data: {
        ...candidateData,
        email: candidateEmail,
        role: {
          connect: {
            roleName: 'Candidate'
          }
        },
        candidate: {
          create: {
            applications: {
              create: {
                jobDetailId: jobDetail.id
              }
            }
          }
        }
      }
    })
  }

  public getCandidateByRecruitmentDrive = async (schema: TGetApplicationsByRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveCode },
      query: { pageNumber, pageSize, sort, status, search }
    } = schema

    let statusQuery: Prisma.ApplicationWhereInput = {}
    if (status !== 'All') {
      statusQuery = {
        status
      }
    }

    let searchQuery: Prisma.ApplicationWhereInput = {}
    if (search) {
      searchQuery = {
        OR: [
          {
            candidate: {
              user: {
                fullName: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            jobDetail: {
              job: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      }
    }

    const query: Prisma.ApplicationFindManyArgs = {
      where: {
        AND: [
          {
            jobDetail: {
              recruitmentDriveCode
            }
          },
          statusQuery,
          searchQuery
        ]
      }
    }

    const totalCount = await this.prismaService.client.application.count(query as Prisma.ApplicationCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const applications = await this.prismaService.client.application.findMany({
      ...query,
      include: {
        jobDetail: {
          select: {
            job: true
          }
        },
        candidate: {
          select: {
            user: true
          }
        }
      }
    })

    const imageUrls = await Promise.all(
      applications.map((application) => this.fileService.getFileUrl(application.jobDetail.job.icon))
    )

    const mappedApplications = applications.map((a, index) => {
      a.jobDetail.job.icon = imageUrls[index]
      return a
    })

    return new PagedList<Application>(mappedApplications, totalCount, pageNumber, pageSize)
  }
}
