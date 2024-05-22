import { Prisma, Role, User } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma.service'

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  getUserByClerkIdWithRole = async (clerkId: string): Promise<(User & { role: Role }) | null> => {
    return await this.prismaService.client.user.findUnique({
      where: {
        clerkId
      },
      include: {
        role: true
      }
    })
  }

  getUserById = async (): Promise<User | null> => {
    return await this.prismaService.client.user.findUnique({
      where: {
        id: '664ddf0c796aadfc97448ab3'
      }
    })
  }

  createUser = async (user: Prisma.UserCreateInput): Promise<User> => {
    return await this.prismaService.client.user.create({
      data: user
    })
  }

  updateUser = async (clerkId: string, user: Prisma.UserUpdateInput): Promise<User> => {
    return await this.prismaService.client.user.update({
      where: { clerkId },
      data: user
    })
  }
}
