import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateApplicantSchema,
  TGetApplicantsByRecruitmentDriveSchema
} from '../recruitment-drive/recruitment-drive.validation'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'
import { Applicant, Prisma } from '@prisma/client'
import { PagedList } from 'src/helpers/paged-list'
import { FileService } from '../aws-s3/file.service'
import { TGetApplicantDetailSchema, TScheduleTestExamSchema } from './applicant.validation'
import RequestValidationException from 'src/helpers/errors/request-validation.exception'

@injectable()
export class ApplicantService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(FileService) private readonly fileService: FileService
  ) {}

  private sortMapping: Record<string, Prisma.ApplicantOrderByWithRelationInput> = {
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

  public createApplicant = async (file: Express.Multer.File | undefined, schema: TCreateApplicantSchema) => {
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
          //only count approved applicants
          select: {
            applicants: {
              where: {
                status: 'Approve'
              }
            }
          }
        }
      }
    })

    if (!jobDetail) throw new NotFoundException(`Not found job with code: ${jobCode} in this recruitment drive`)

    if (jobDetail._count.applicants >= jobDetail.quantity)
      throw new BadRequestException(`This job position has reached its capacity.`)

    const hasAlreadyApply = !!(await this.prismaService.client.applicant.findFirst({
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
            applicants: {
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

  public getCandidateByRecruitmentDrive = async (schema: TGetApplicantsByRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveCode },
      query: { pageNumber, pageSize, sort, status, search }
    } = schema

    let statusQuery: Prisma.ApplicantWhereInput = {}
    if (status !== 'All') {
      statusQuery = {
        status
      }
    }

    let searchQuery: Prisma.ApplicantWhereInput = {}
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

    const query: Prisma.ApplicantFindManyArgs = {
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

    const totalCount = await this.prismaService.client.applicant.count(query as Prisma.ApplicantCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const applicants = await this.prismaService.client.applicant.findMany({
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
      applicants.map((applicant) => this.fileService.getFileUrl(applicant.jobDetail.job.icon))
    )

    const mappedApplicants = applicants.map((a, index) => {
      a.jobDetail.job.icon = imageUrls[index]
      return a
    })

    return new PagedList<Applicant>(mappedApplicants, totalCount, pageNumber, pageSize)
  }

  public getApplicantDetail = async (schema: TGetApplicantDetailSchema) => {
    const {
      params: { applicantId }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      },
      include: {
        jobDetail: {
          select: {
            createdAt: true,
            job: true,
            quantity: true
          }
        }
      }
    })

    if (!applicant) throw new NotFoundException(`Not found applicant with id: ${applicantId}`)

    return applicant
  }

  public scheduleTestExam = async (schema: TScheduleTestExamSchema) => {
    const {
      params: { applicantId },
      body: { testDate, testExamCode }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      }
    })

    if (!applicant) throw new NotFoundException(`Not found application with id: ${applicantId}`)

    if (applicant.status !== 'Screening')
      throw new BadRequestException('Only schedule test exam for applicant with status Screening')

    const testExam = await this.prismaService.client.testExam.findUnique({
      where: {
        code: testExamCode
      }
    })

    if (!testExam) throw new NotFoundException(`Not found application with code: ${testExamCode}`)

    //TODO: set background task handle test session
    await this.prismaService.client.applicant.update({
      where: {
        id: applicantId
      },
      data: {
        status: 'Testing',
        testSession: {
          create: {
            testDate,
            testExamCode,
            status: 'Processing'
          }
        }
      }
    })
  }
}
