import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TRequestChangeInterviewDateSchema, TRequestChangeTestDateSchema, TUpdateWishSchema } from './wish.validation'
import NotFoundException from 'src/helpers/errors/not-found.exception'
import BadRequestException from 'src/helpers/errors/bad-request.exception'
import { InterviewSessionWish, TestSessionWish } from '@prisma/client'

@injectable()
export class WishService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public createTestSessionWish = async (schema: TRequestChangeTestDateSchema) => {
    const {
      body: { reason, wishDate },
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        testSession: {
          include: {
            testSessionWish: true
          }
        }
      }
    })

    if (!application) {
      throw new NotFoundException(`Not found application with id: ${applicationId}`)
    }

    if (!application.testSession) {
      throw new NotFoundException(`The test session has not scheduled yet.`)
    }

    if (application.testSession.status !== 'Processing') {
      throw new BadRequestException(
        `Cannot request change test date if the test session have status ${application.testSession.status}`
      )
    }

    const invalidTimeToRequest = new Date(application.testSession.testDate).getTime() < Date.now()
    if (invalidTimeToRequest) {
      throw new BadRequestException(
        'Cannot request change test date, because the test session is on progressing or has done'
      )
    }

    if (application.testSession.testSessionWish) {
      throw new BadRequestException('The request change test date is already exist')
    }

    await this.prismaService.client.testSession.update({
      where: {
        id: application.testSession.id
      },
      data: {
        testSessionWish: {
          create: {
            content: reason,
            wishedTestTime: wishDate
          }
        }
      }
    })
  }

  public createInterviewSessionWish = async (schema: TRequestChangeInterviewDateSchema) => {
    const {
      body: { reason, wishDate, method },
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        interviewSession: {
          include: {
            interviewSessionWish: true
          }
        }
      }
    })

    if (!application) {
      throw new NotFoundException(`Not found application with id: ${applicationId}`)
    }

    if (!application.interviewSession) {
      throw new NotFoundException(`The interview session has not scheduled yet.`)
    }

    if (application.interviewSession.status !== 'Processing') {
      throw new BadRequestException(
        `Cannot request change interview date if the interview session have status ${application.interviewSession.status}`
      )
    }

    const invalidTimeToRequest = new Date(application.interviewSession.interviewDate).getTime() < Date.now()
    if (invalidTimeToRequest) {
      throw new BadRequestException(
        'Cannot request change interview date, because the interview session is on progressing or has done'
      )
    }

    if (application.interviewSession.interviewSessionWish) {
      throw new BadRequestException('The request change interview date is already exist')
    }

    await this.prismaService.client.interviewSession.update({
      where: {
        id: application.interviewSession.id
      },
      data: {
        interviewSessionWish: {
          create: {
            content: reason,
            wishTime: wishDate,
            method
          }
        }
      }
    })
  }

  public updateWish = async (schema: TUpdateWishSchema) => {
    const {
      body: { isApprove, type },
      params: { applicationId }
    } = schema

    const application = await this.prismaService.client.application.findUnique({
      where: {
        id: applicationId
      },
      include: {
        testSession: {
          include: {
            testSessionWish: true
          }
        },
        interviewSession: {
          include: {
            interviewSessionWish: true
          }
        },
        receiveJobSession: {
          include: {
            receiveJobWish: true
          }
        }
      }
    })

    if (!application) {
      throw new NotFoundException(`Not found application with id: ${applicationId}`)
    }

    if (type === 'TestSessionWish') {
      this.updateTestSessionWish(application.testSession?.testSessionWish, isApprove)
      return
    }

    if (type === 'InterviewSessionWish') {
      this.updateInterviewSessionWish(application.interviewSession?.interviewSessionWish, isApprove)
      return
    }
  }

  private updateTestSessionWish = async (testSessionWish: TestSessionWish | null | undefined, isApprove: boolean) => {
    if (!testSessionWish) {
      throw new NotFoundException(`Not found request change test date`)
    }

    if (testSessionWish.status !== 'Processing') {
      throw new BadRequestException(`Request change test date is already approved/rejected`)
    }

    await this.prismaService.client.testSessionWish.update({
      where: {
        id: testSessionWish.id
      },
      data: {
        status: isApprove ? 'Approve' : 'Reject'
      }
    })
  }

  private updateInterviewSessionWish = async (
    interviewSessionWish: InterviewSessionWish | null | undefined,
    isApprove: boolean
  ) => {
    if (!interviewSessionWish) {
      throw new NotFoundException(`Not found request change interview date`)
    }

    if (interviewSessionWish.status !== 'Processing') {
      throw new BadRequestException(`Request change interview date is already approved/rejected`)
    }

    await this.prismaService.client.interviewSessionWish.update({
      where: {
        id: interviewSessionWish.id
      },
      data: {
        status: isApprove ? 'Approve' : 'Reject'
      }
    })
  }
}
