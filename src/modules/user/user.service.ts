import { Prisma, Role, User } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'

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

  getUserEmail = async (email: string): Promise<User | null> => {
    return await this.prismaService.client.user.findUnique({
      where: {
        email
      }
    })
  }

  createUser = async (user: Prisma.UserCreateInput): Promise<User> => {
    return await this.prismaService.client.user.create({
      data: user
    })
  }

  updateUserByClerkId = async (clerkId: string, user: Prisma.UserUpdateInput): Promise<User> => {
    return await this.prismaService.client.user.update({
      where: { clerkId },
      data: user
    })
  }

  updateUserByEmail = async (email: string, user: Prisma.UserUpdateInput): Promise<User> => {
    return await this.prismaService.client.user.update({
      where: { email },
      data: user
    })
  }
}
