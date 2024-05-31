import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class RecruitmentDriveService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}
}
