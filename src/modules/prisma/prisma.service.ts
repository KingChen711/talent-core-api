import { injectable } from 'inversify'
import { PrismaClient } from '@prisma/client'
import prisma from './prisma'

@injectable()
export class PrismaService {
  private readonly _prisma: PrismaClient

  constructor() {
    this._prisma = prisma
  }

  get client(): PrismaClient {
    return this._prisma
  }
}
