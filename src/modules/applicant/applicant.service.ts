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
import {
  TApproveApplicantSchema,
  TCompletedInterviewSchema,
  TGetApplicantDetailSchema,
  TRejectApplicantSchema,
  TSaveApplicantSchema,
  TScheduleInterviewSchema,
  TScheduleTestExamSchema
} from './applicant.validation'
import RequestValidationException from 'src/helpers/errors/request-validation.exception'
import { EmailService } from '../email/email.service'

@injectable()
export class ApplicantService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(FileService) private readonly fileService: FileService,
    @inject(EmailService) private readonly emailService: EmailService
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
        },
        job: true
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

    await this.emailService.sendEmailReceivedApplicant({
      to: email,
      candidate: fullName,
      appliedJob: jobDetail.job.name,
      recruitmentDrive: recruitmentDrive.name
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
        },
        testSession: true,
        interviewSession: true
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

  public scheduleInterview = async (schema: TScheduleInterviewSchema) => {
    const {
      params: { applicantId },
      body: { location, interviewDate }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      },
      include: {
        testSession: true,
        jobDetail: {
          select: {
            job: true
          }
        }
      }
    })

    if (!applicant) throw new NotFoundException(`Not found application with id: ${applicantId}`)

    if (applicant.status !== 'Testing')
      throw new BadRequestException('Only schedule interview for applicant with status Testing')

    if (applicant.testSession?.status !== 'Pass')
      throw new BadRequestException('Candidate must pass the test before schedule a interview')

    //TODO: gửi mail thông báo
    await this.prismaService.client.applicant.update({
      where: {
        id: applicantId
      },
      data: {
        status: 'Interviewing',
        interviewSession: {
          create: {
            location,
            interviewDate,
            status: 'Processing'
          }
        }
      }
    })

    await this.emailService.sendEmailInterviewSession({
      to: applicant.email,
      appliedJob: applicant.jobDetail.job.name,
      candidate: applicant.fullName,
      location,
      interviewDate
    })
  }

  public rejectApplicant = async (schema: TRejectApplicantSchema) => {
    const {
      params: { applicantId }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      }
    })

    if (!applicant) throw new NotFoundException(`Not found application with id: ${applicantId}`)

    if (applicant.status !== 'Approve')
      throw new BadRequestException('Only reject applicant for applicant with status Approve')

    //TODO: gửi mail thông báo
    await this.prismaService.client.applicant.update({
      where: {
        id: applicantId
      },
      data: {
        status: 'Reject'
      }
    })
  }

  public saveApplicant = async (schema: TSaveApplicantSchema) => {
    const {
      params: { applicantId }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      },
      include: {
        interviewSession: true
      }
    })

    if (!applicant) throw new NotFoundException(`Not found application with id: ${applicantId}`)

    if (applicant.status !== 'Screening' && applicant.status !== 'Interviewing')
      throw new BadRequestException('Only save applicant for applicant with status Screening or Interviewing')

    if (applicant.status === 'Interviewing' && applicant.interviewSession?.status !== 'Completed')
      throw new BadRequestException('Only save applicant for applicant with interview status is Completed')

    //TODO: gửi mail thông báo
    await this.prismaService.client.applicant.update({
      where: {
        id: applicantId
      },
      data: {
        status: 'Saved'
      }
    })
  }
  public approveApplicant = async (schema: TApproveApplicantSchema) => {
    const {
      params: { applicantId },
      body: { guide, receiveJobDate }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      },
      include: {
        interviewSession: true
      }
    })

    if (!applicant) throw new NotFoundException(`Not found application with id: ${applicantId}`)

    if (applicant.status !== 'Interviewing')
      throw new BadRequestException('Only approve applicant for applicant with status Interviewing')

    if (applicant.interviewSession?.status !== 'Completed')
      throw new BadRequestException('Only approve applicant for applicant with interview status is Completed')

    //TODO: gửi mail thông báo, gửi với guide
    console.log(guide)

    await this.prismaService.client.applicant.update({
      where: {
        id: applicantId
      },
      data: {
        status: 'Approve',
        receiveJobDate
      }
    })
  }

  public completedInterview = async (schema: TCompletedInterviewSchema) => {
    const {
      params: { applicantId }
    } = schema

    const applicant = await this.prismaService.client.applicant.findUnique({
      where: {
        id: applicantId
      },
      include: {
        interviewSession: true
      }
    })

    if (!applicant) throw new NotFoundException(`Not found application with id: ${applicantId}`)

    if (applicant.status !== 'Interviewing')
      throw new BadRequestException('Only completed interview for applicant with status Interviewing')

    if (applicant.interviewSession?.status !== 'Processing')
      throw new BadRequestException('Only completed interview with status Processing')

    if (applicant.interviewSession?.interviewDate.getTime() >= Date.now())
      throw new BadRequestException('The interview has not been taken')

    //TODO: gửi mail thông báo
    await this.prismaService.client.interviewSession.update({
      where: {
        applicantId
      },
      data: {
        status: 'Completed'
      }
    })
  }
}