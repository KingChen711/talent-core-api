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

export class PagingMetaData {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public totalPages: number,
    public totalCount: number
  ) {}

  get hasPrevious(): boolean {
    return this.pageNumber > 1
  }

  get hasNext(): boolean {
    return this.pageNumber < this.totalPages
  }
}

export class PagedList<T> extends Array<T> {
  public pagingMetaData: PagingMetaData

  constructor(items: T[], count: number, pageNumber: number, pageSize: number) {
    super(...items)

    this.pagingMetaData = new PagingMetaData(pageNumber, pageSize, Math.ceil(count / pageSize), count)
  }

  get metaData() {
    return {
      ...this.pagingMetaData,
      hasPrevious: this.pagingMetaData.hasPrevious,
      hasNext: this.pagingMetaData.hasNext
    }
  }
}
