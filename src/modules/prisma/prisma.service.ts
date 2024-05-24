import { injectable } from 'inversify'
import { PrismaClient } from '@prisma/client'

// Đặt bên ngoài constructor để đảm bảo chỉ đc tạo 1 lần.
// Do container của inversify không hoạt động không hiệu quả
// nên constructor bị gọi nhiều lần
const prisma = new PrismaClient()

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
