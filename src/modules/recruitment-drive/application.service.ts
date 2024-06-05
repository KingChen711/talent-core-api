import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { TCreateApplicationSchema } from './recruitment-drive.validation'
import ApiError from 'src/helpers/api-error'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class ApplicationService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  public createApplication = async (schema: TCreateApplicationSchema) => {
    const {
      params: { jobCode, recruitmentDriveCode }
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

    // const jobDetail = await this.prismaService.client.jobDetail.findUnique({
    //   where: {
    //     jobId_recruitmentDriveId: {}
    //   }
    // })
  }
}
