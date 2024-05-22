import { User } from '@prisma/client'
import { Response } from 'express'

export enum Role {
  EMPLOYEE = 'Employee',
  CANDIDATE = 'Candidate'
}

export type ResponseWithUser = Response & {
  locals: {
    user: User & { role: Role }
  }
}
