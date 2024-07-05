import { TSubmitTestSchema, TTakeTestSchema } from './test.validation'
import { TestSessionStatus } from '@prisma/client'
import { inject, injectable } from 'inversify'

import BadRequestException from '../../helpers/errors/bad-request.exception'
import ForbiddenException from '../../helpers/errors/forbidden-exception'
import NotFoundException from '../../helpers/errors/not-found.exception'

import { UserWithRole } from '../../types'
import { EmailService } from '../email/email.service'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class TestService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(EmailService) private readonly emailService: EmailService
  ) {}

  public takeTest = async (user: UserWithRole, schema: TTakeTestSchema) => {
    const {
      params: { applicationId }
    } = schema

    const testSession = await this.prismaService.client.testSession.findUnique({
      where: {
        applicationId
      },
      include: {
        testExam: {
          include: {
            questions: true
          }
        },
        application: {
          include: {
            candidate: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!testSession) {
      throw new NotFoundException('Not found test session')
    }

    if (testSession.application.candidate.user.id !== user.id) {
      throw new ForbiddenException()
    }

    if (testSession.status !== 'Processing') {
      throw new BadRequestException('Only take the test exam on status Processing')
    }

    const now = Date.now()
    const testDate = new Date(testSession.testDate).getTime()
    const expiredTestDate = testDate + testSession.testExam.duration * 1000 * 60
    const validTimeToTakeTest = now >= testDate && now <= expiredTestDate

    if (!validTimeToTakeTest) {
      throw new BadRequestException('Invalid time to take test')
    }

    const mappedTestSession = {
      ...testSession,
      testExam: {
        ...testSession.testExam,
        questions: testSession.testExam.questions.map((question) => ({
          ...question,
          options: question.options.map((o) => ({
            content: o.content
          }))
        }))
      }
    }

    return mappedTestSession
  }

  public submitTest = async (user: UserWithRole, schema: TSubmitTestSchema, ignorePermission = false) => {
    const {
      params: { applicationId },
      body: { answers }
    } = schema

    const testSession = await this.prismaService.client.testSession.findUnique({
      where: {
        applicationId
      },
      include: {
        testExam: {
          include: {
            questions: true
          }
        },
        application: {
          include: {
            candidate: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!testSession) {
      throw new NotFoundException('Not found test session')
    }

    if (!ignorePermission && testSession.application.candidate.user.id !== user.id) {
      throw new ForbiddenException()
    }

    if (testSession.status !== 'Processing') {
      throw new BadRequestException('Only submit on status Processing')
    }

    const now = Date.now()
    const testDate = new Date(testSession.testDate).getTime()
    const expiredTestDate = testDate + testSession.testExam.duration * 1000 * 60 + 1000 * 60 //add more 1 minutes
    const validTimeToSubmit = now >= testDate && now <= expiredTestDate

    if (!validTimeToSubmit) {
      throw new BadRequestException('Invalid time to submit test')
    }

    let correctAnswers = 0
    Object.entries(answers).map((entry) => {
      const questionIndex = Number(entry[0])
      const optionIndex = { A: 0, B: 1, C: 2, D: 3 }[entry[1]]

      if (testSession.testExam.questions[questionIndex].options[optionIndex].correct) {
        correctAnswers++
      }
    })

    const point = +((correctAnswers / testSession.testExam.questions.length) * 10).toFixed(2)
    const status: TestSessionStatus = point >= testSession.testExam.conditionPoint ? 'Pass' : 'Fail'

    await this.prismaService.client.testSession.update({
      where: {
        id: testSession.id
      },
      data: {
        point,
        status
      }
    })

    if (status === 'Fail') {
      const application = await this.prismaService.client.application.update({
        where: {
          id: applicationId
        },
        data: {
          status: 'Saved'
        },
        include: {
          candidate: {
            include: {
              user: true
            }
          },
          jobDetail: {
            include: {
              job: true
            }
          }
        }
      })

      await this.emailService.sendEmailSaveApplication({
        to: application.candidate.user.email,
        candidate: application.candidate.user.fullName,
        appliedJob: application.jobDetail.job.name
      })
    }
  }
}
