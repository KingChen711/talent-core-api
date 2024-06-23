import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TSubmitTestSchema, TTakeTestSchema } from './test.validation'
import NotFoundException from 'src/helpers/errors/not-found.exception'
import BadRequestException from 'src/helpers/errors/bad-request.exception'
import { UserWithRole } from 'src/types'
import ForbiddenException from 'src/helpers/errors/forbidden-exception'
import { TestSessionStatus } from '@prisma/client'

@injectable()
export class TestService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

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

  public submitTest = async (user: UserWithRole, schema: TSubmitTestSchema) => {
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

    if (testSession.application.candidate.user.id !== user.id) {
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

    const point = +(correctAnswers / testSession.testExam.questions.length).toFixed(2) * 10
    const status: TestSessionStatus = point > testSession.testExam.conditionPoint ? 'Pass' : 'Fail'

    //TODO:send email

    await this.prismaService.client.testSession.update({
      where: {
        id: testSession.id
      },
      data: {
        point,
        status
      }
    })
  }
}
