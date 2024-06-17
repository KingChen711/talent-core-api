import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateApplicationSchema,
  TGetApplicationsByRecruitmentDriveSchema
} from '../recruitment-drive/recruitment-drive.validation'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'
import { Application, Prisma } from '@prisma/client'
import { PagedList } from '../../helpers/paged-list'
import { FileService } from '../aws-s3/file.service'
import {
  TApproveApplicationSchema,
  TCompletedInterviewSchema,
  TConfirmHiredSchema,
  TGetApplicationDetailSchema,
  TGetMyApplicationsSchemaSchema,
  TRejectApplicationSchema,
  TSaveApplicationSchema,
  TScheduleInterviewSchema,
  TScheduleTestExamSchema
} from './application.validation'
import RequestValidationException from '../../helpers/errors/request-validation.exception'
import { EmailService } from '../email/email.service'
import { UserWithRole } from 'src/types'
import { ppid } from 'process'

@injectable()
export class ApplicationService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(FileService) private readonly fileService: FileService,
    @inject(EmailService) private readonly emailService: EmailService
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
    },
    recruitmentDrive: {
      jobDetail: {
        recruitmentDrive: {
          name: 'asc'
        }
      }
    },
    '-recruitmentDrive': {
      jobDetail: {
        recruitmentDrive: {
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

    if (recruitmentDrive.status !== 'Open')
      throw new BadRequestException(`Cannot apply for a job in a ${recruitmentDrive.status} recruitment drive`)

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
        },
        job: true
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

    await this.emailService.sendEmailReceivedApplication({
      to: email,
      candidate: fullName,
      appliedJob: jobDetail.job.name,
      recruitmentDrive: recruitmentDrive.name
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
        testSession: {
          include: {
            testExam: {
              include: {
                _count: {
                  select: {
                    questions: true
                  }
                }
              }
            }
          }
        },
        interviewSession: true,
        receiveJobSession: true,
        candidate: {
          select: {
            user: true
          }
        }
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    const mappedApplication = {
      ...application,
      testSession: {
        ...application.testSession,
        testExam: {
          ...application.testSession?.testExam,
          countQuestions: application.testSession?.testExam._count.questions,
          _count: undefined
        }
      }
    }

    return mappedApplication
  }

  public scheduleTestExam = async (schema: TScheduleTestExamSchema) => {
    const {
      params: { applicationId },
      body: { testDate, testExamCode }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Screening')
      throw new BadRequestException('Only schedule test exam for application with status Screening')

    const testExam = await this.prismaService.client.testExam.findUnique({
      where: {
        code: testExamCode
      }
    })

    if (!testExam) throw new NotFoundException(`Not found application with code: ${testExamCode}`)

    //TODO: set background task handle test session
    await this.prismaService.client.application.update({
      where: {
        id: applicationId
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
      params: { applicationId },
      body: { location, interviewDate, method }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
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

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Testing')
      throw new BadRequestException('Only schedule interview for application with status Testing')

    if (application.testSession?.status !== 'Pass')
      throw new BadRequestException('Candidate must pass the test before schedule a interview')

    await this.prismaService.client.application.update({
      where: {
        id: applicationId
      },
      data: {
        status: 'Interviewing',
        interviewSession: {
          create: {
            location,
            method,
            interviewDate,
            status: 'Processing'
          }
        }
      }
    })

    await this.emailService.sendEmailInterviewSession({
      to: application.email,
      appliedJob: application.jobDetail.job.name,
      candidate: application.fullName,
      location,
      interviewDate,
      method,
      point: application.testSession.point!
    })
  }

  public rejectApplication = async (schema: TRejectApplicationSchema) => {
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
            job: true
          }
        }
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Approve')
      throw new BadRequestException('Only reject application for application with status Approve')

    await this.prismaService.client.application.update({
      where: {
        id: applicationId
      },
      data: {
        status: 'Reject'
      }
    })

    await this.emailService.sendEmailRejectApplication({
      to: application.email,
      appliedJob: application.jobDetail.job.name,
      candidate: application.fullName
    })
  }

  public saveApplication = async (schema: TSaveApplicationSchema) => {
    const {
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        interviewSession: true,
        jobDetail: {
          select: {
            job: true
          }
        }
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Screening' && application.status !== 'Interviewing')
      throw new BadRequestException('Only save application for application with status Screening or Interviewing')

    if (application.status === 'Interviewing' && application.interviewSession?.status !== 'Completed')
      throw new BadRequestException('Only save application for application with interview status is Completed')

    await this.prismaService.client.application.update({
      where: {
        id: applicationId
      },
      data: {
        status: 'Saved'
      }
    })

    await this.emailService.sendEmailSaveApplication({
      to: application.email,
      appliedJob: application.jobDetail.job.name,
      candidate: application.fullName
    })
  }
  public approveApplication = async (schema: TApproveApplicationSchema) => {
    const {
      params: { applicationId },
      body: { location, receiveJobDate }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        interviewSession: true,
        jobDetail: {
          select: {
            job: true
          }
        }
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Interviewing')
      throw new BadRequestException('Only approve application for application with status Interviewing')

    if (application.interviewSession?.status !== 'Completed')
      throw new BadRequestException('Only approve application for application with interview status is Completed')

    await this.prismaService.client.application.update({
      where: {
        id: applicationId
      },
      data: {
        status: 'Approve',
        receiveJobSession: {
          create: {
            receiveJobDate,
            isConfirmed: false,
            location
          }
        }
      }
    })

    await this.emailService.sendEmailApproveApplication({
      to: application.email,
      appliedJob: application.jobDetail.job.name,
      candidate: application.fullName,
      location,
      receiveJobDate
    })
  }

  public completedInterview = async (schema: TCompletedInterviewSchema) => {
    const {
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        interviewSession: true
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Interviewing')
      throw new BadRequestException('Only completed interview for application with status Interviewing')

    if (application.interviewSession?.status !== 'Processing')
      throw new BadRequestException('Only completed interview with status Processing')

    if (application.interviewSession?.interviewDate.getTime() >= Date.now())
      throw new BadRequestException('The interview has not been taken')

    await this.prismaService.client.interviewSession.update({
      where: {
        applicationId
      },
      data: {
        status: 'Completed'
      }
    })
  }

  public confirmHired = async (schema: TConfirmHiredSchema) => {
    const {
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        receiveJobSession: true
      }
    })

    if (!application) throw new NotFoundException(`Not found application with id: ${applicationId}`)

    if (application.status !== 'Approve')
      throw new BadRequestException('Only confirm hired for application with status Approve')

    //isConfirmed can be undefined, so check equal with true
    if (application.receiveJobSession?.isConfirmed === true)
      throw new BadRequestException('This applications is already confirmed')

    await this.prismaService.client.receiveJobSession.update({
      where: {
        applicationId
      },
      data: {
        isConfirmed: true
      }
    })
  }

  public getMyApplications = async (user: UserWithRole, schema: TGetMyApplicationsSchemaSchema) => {
    const {
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
            jobDetail: {
              job: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            jobDetail: {
              recruitmentDrive: {
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
            candidate: {
              user: {
                id: user.id
              }
            }
          },
          searchQuery,
          statusQuery
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
            job: true,
            recruitmentDrive: true
          }
        }
      }
    })

    const imageUrls = await this.fileService.getFileUrls(applications.map((a) => a.jobDetail.job.icon))

    const mappedApplications = applications.map((application, i) => {
      application.jobDetail.job.icon = imageUrls[i]
      return application
    })

    return new PagedList<Application>(mappedApplications, totalCount, pageNumber, pageSize)
  }
}
