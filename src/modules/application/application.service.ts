import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TCreateApplicationSchema,
  TGetApplicationsByRecruitmentDriveSchema
} from '../recruitment-drive/recruitment-drive.validation'
import NotFoundException from '../../helpers/errors/not-found.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'
import { Prisma } from '@prisma/client'

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

    // let searchQuery: Prisma.ApplicationWhereInput = {}s
    // if (search) {
    //   searchQuery = {
    //     OR: [
    //       {
    //         code: {
    //           contains: search,
    //           mode: 'insensitive'
    //         }
    //       },
    //       {
    //         name: {
    //           contains: search,
    //           mode: 'insensitive'
    //         }
    //       },
    //       {
    //         description: {
    //           contains: search,
    //           mode: 'insensitive'
    //         }
    //       }
    //     ]
    //   }
    // }
  }
}
