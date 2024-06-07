import { Prisma, Role, User } from '@prisma/client'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import { Role as ERole, UserWithRole } from '../../types'
import { TGetProfileSchema } from './user.validation'
import ApiError from '../../helpers/api-error'
import { StatusCodes } from 'http-status-codes'

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

  getUserEmail = async (email: string) => {
    return await this.prismaService.client.user.findUnique({
      where: {
        email
      }
    })
  }

  createUser = async (user: Prisma.UserCreateInput) => {
    return await this.prismaService.client.user.create({
      data: user
    })
  }

  updateUserByClerkId = async (clerkId: string, user: Prisma.UserUpdateInput) => {
    return await this.prismaService.client.user.update({
      where: { clerkId },
      data: user
    })
  }

  updateUserByEmail = async (email: string, user: Prisma.UserUpdateInput) => {
    return await this.prismaService.client.user.update({
      where: { email },
      data: user
    })
  }

  getCandidateProfile = async (sender: UserWithRole, schema: TGetProfileSchema) => {
    const {
      params: { email }
    } = schema

    const user = await this.prismaService.client.user.findUnique({
      where: { email },
      include: { role: true }
    })

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found user with email: ${email}`)
    }

    if (sender.role.roleName === ERole.CANDIDATE && sender.id !== user.id) {
      //actually forbidden403, but return notfound404 will be better security, it will make the sender do not know that this user is exist or not exist in the system
      throw new ApiError(StatusCodes.NOT_FOUND, `Not found user with email: ${email}`)
    }

    if (user.role.roleName !== ERole.CANDIDATE) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `This user is having role ${user.role.roleName}. Not a Candidate`)
    }

    return user
  }
}
