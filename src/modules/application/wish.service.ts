import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TRequestChangeTestDateSchema } from './wish.validation'
import NotFoundException from 'src/helpers/errors/not-found.exception'
import BadRequestException from 'src/helpers/errors/bad-request.exception'

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
}
