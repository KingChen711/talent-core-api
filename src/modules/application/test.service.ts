import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TTakeTestSchema } from './test.validation'
import NotFoundException from 'src/helpers/errors/not-found.exception'
import BadRequestException from 'src/helpers/errors/bad-request.exception'
import { UserWithRole } from 'src/types'
import ForbiddenException from 'src/helpers/errors/forbidden-exception'

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
}
