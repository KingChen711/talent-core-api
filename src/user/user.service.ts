import { Prisma, User } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { PrismaService } from '~/prisma.service'

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  // getUserByClerkId = async (clerkId: string): Promise<User | null> => {
  //   return await this.prismaService.user.findUnique({
  //     where: {
  //       clerkId
  //     }
  //   })
  // }

  // getUserById = async (id: string): Promise<User | null> => {
  //   return await this.prismaService.client.user.findUnique({
  //     where: {
  //       id: '664ddf0c796aadfc97448ab3'
  //     }
  //   })
  // }

  createUser = async (user: Prisma.UserCreateInput): Promise<User> => {
    return await this.prismaService.client.user.create({
      data: user
    })
  }
}
