import { TGetProfileSchema, TGetUsersSchema, TToBeEmployeeSchemaSchema } from './user.validation'
import { Prisma, Role, User } from '@prisma/client'
import { inject, injectable } from 'inversify'

import BadRequestException from '../../helpers/errors/bad-request.exception'
import ForbiddenException from '../../helpers/errors/forbidden-exception'
import NotFoundException from '../../helpers/errors/not-found.exception'
import { PagedList } from 'src/helpers/paged-list'

import { Role as ERole, UserWithRole } from '../../types'
import { PrismaService } from '../prisma/prisma.service'

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {}

  private sortMapping = {
    email: { email: 'asc' },
    '-email': { email: 'desc' },
    fullName: { fullName: 'asc' },
    '-fullName': { fullName: 'desc' },
    bornYear: { bornYear: 'asc' },
    '-bornYear': { bornYear: 'desc' },
    phone: { phone: 'asc' },
    '-phone': { phone: 'desc' }
  } as const

  public getUserByClerkIdWithRole = async (clerkId: string): Promise<(User & { role: Role }) | null> => {
    return await this.prismaService.client.user.findUnique({
      where: {
        clerkId
      },
      include: {
        role: true
      }
    })
  }

  public toBeEmployee = async (schema: TToBeEmployeeSchemaSchema) => {
    const {
      params: { userId }
    } = schema

    const user = await this.prismaService.client.user.findUnique({
      where: { id: userId },
      include: {
        role: true
      }
    })

    if (!user) throw new NotFoundException(`Not found user with id: ${userId}`)

    if (user.role.roleName === 'Employee') throw new BadRequestException(`This account is already a Employee`)

    return await this.prismaService.client.user.update({
      where: {
        id: userId
      },
      data: {
        role: {
          connect: {
            roleName: 'Employee'
          }
        },
        employee: {
          create: {}
        }
      }
    })
  }

  public getUserEmail = async (email: string) => {
    return await this.prismaService.client.user.findUnique({
      where: {
        email
      }
    })
  }

  public createUser = async (user: Prisma.UserCreateInput) => {
    return await this.prismaService.client.user.create({
      data: user
    })
  }

  public updateUserByClerkId = async (clerkId: string, user: Prisma.UserUpdateInput) => {
    return await this.prismaService.client.user.update({
      where: { clerkId },
      data: user
    })
  }

  public updateUserByEmail = async (email: string, user: Prisma.UserUpdateInput) => {
    return await this.prismaService.client.user.update({
      where: { email },
      data: user
    })
  }

  public getCandidateProfile = async (sender: UserWithRole, schema: TGetProfileSchema) => {
    const {
      params: { email }
    } = schema

    const user = await this.prismaService.client.user.findUnique({
      where: { email },
      include: { role: true }
    })

    if (!user) {
      throw new NotFoundException(`Not found user with email: ${email}`)
    }

    if (sender.role.roleName === ERole.CANDIDATE && sender.id !== user.id) {
      throw new ForbiddenException()
    }

    if (user.role.roleName !== ERole.CANDIDATE) {
      throw new BadRequestException(`This user is having role ${user.role.roleName}. Not a Candidate`)
    }

    return user
  }

  public getUsers = async (schema: TGetUsersSchema): Promise<PagedList<User>> => {
    const {
      query: { pageNumber, pageSize, search, role, sort }
    } = schema

    let searchQuery: Prisma.UserWhereInput = {}

    if (search) {
      searchQuery = {
        OR: [
          {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            fullName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    let roleQuery: Prisma.UserWhereInput = {}

    if (role !== 'All') {
      roleQuery = { role: { roleName: role } }
    }

    const query: Prisma.UserFindManyArgs = { where: { AND: [roleQuery, searchQuery] } }

    const totalCount = await this.prismaService.client.user.count(query as Prisma.UserCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const users = await this.prismaService.client.user.findMany({
      ...query,
      include: {
        role: true
      }
    })

    return new PagedList<User>(users, totalCount, pageNumber, pageSize)
  }
}
