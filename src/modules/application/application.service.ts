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
import { TGetApplicationDetailSchema } from './application.validation'
import RequestValidationException from 'src/helpers/errors/request-validation.exception'

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
      fullName: 'asc'
    },
    '-candidateName': {
      fullName: 'desc'
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

  public createApplication = async (file: Express.Multer.File | undefined, schema: TCreateApplicationSchema) => {
    const {
      params: { jobCode, recruitmentDriveCode },
      body: { bornYear, email, fullName, gender, phone, personalIntroduction }
    } = schema

    console.log({ file })

    if (!file) {
      throw new RequestValidationException({ cv: 'CV is required' })
    }

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: {
        code: recruitmentDriveCode
      }
    })

    if (!recruitmentDrive) throw new NotFoundException(`Not found recruitment drive with code: ${recruitmentDriveCode}`)

    if (!recruitmentDrive.isOpening)
      throw new BadRequestException(`Cannot apply for a job in a not opening recruitment drive`)

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
          user: { email }
        },
        jobDetailId: jobDetail.id
      }
    }))

    if (hasAlreadyApply) throw new BadRequestException(`This candidate is already apply this job`)

    const cv = await this.fileService.upLoadPortfolio(file)

    await this.prismaService.client.user.update({
      where: { email },
      data: {
        //fullName trong bảng User chỉ nên có thể đổi bằng cách tương tác với Clerk component + Webhook
        bornYear,
        gender,
        phone,
        candidate: {
          update: {
            applications: {
              create: {
                jobDetailId: jobDetail.id,
                bornYear,
                email,
                fullName,
                gender,
                personalIntroduction,
                phone,
                cv
              }
            }
          }
        }
      }
    })

    return
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
            fullName: {
              contains: search,
              mode: 'insensitive'
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

  public getApplicationDetail = async (schema: TGetApplicationDetailSchema) => {
    const {
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        jobDetail: {
          select: {
            createdAt: true,
            job: true,
            quantity: true
          }
        },
        candidate: {
          select: { user: true }
        }
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    return application
  }
}
