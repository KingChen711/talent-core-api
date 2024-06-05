import { User } from '@prisma/client'
import { Response } from 'express'
import { Role as TRole } from '@prisma/client'

export enum Role {
  EMPLOYEE = 'Employee',
  CANDIDATE = 'Candidate'
}

export type UserWithRole = User & { role: TRole }

export type ResponseWithUser = Response & {
  locals: {
    user: UserWithRole
  }
}
