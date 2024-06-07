import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TCreateApplicationSchema } from './recruitment-drive.validation'
import ApiError from '../../helpers/api-error'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class ApplicationService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

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

    if (!recruitmentDrive) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found recruitment drive with code: ${recruitmentDriveCode}`)
    }

    if (!recruitmentDrive.isOpening) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Cannot apply a job in closed recruitment drive`)
    }

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

    if (!jobDetail) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found job with code: ${jobCode} in this recruitment drive`)
    }

    if (jobDetail._count.applications >= jobDetail.quantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `This job position has reached its capacity.`)
    }

    const hasAlreadyApply = !!(await this.prismaService.client.application.findFirst({
      where: {
        candidate: {
          user: { email: candidateEmail }
        },
        jobDetailId: jobDetail.id
      }
    }))

    if (hasAlreadyApply) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `This candidate is already apply this job`)
    }

    const candidate = await this.prismaService.client.user.findUnique({
      where: {
        email: candidateEmail
      }
    })

    if (!candidate && !createCandidate) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found candidate with email: ${candidateEmail}`)
    }

    if (candidate && createCandidate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `This candidate is already exists`)
    }

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
}
