import 'dotenv/config'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import {
  TOpenJobSchema,
  TCreateRecruitmentDriveSchema,
  TDeleteRecruitmentDriveSchema,
  TGetRecruitmentDriveSchema,
  TGetRecruitmentDrivesSchema,
  TUpdateRecruitmentDriveSchema,
  TCloseJobSchema,
  TGetRecruitmentDriveDetailSchema,
  TGetAddableJobsSchema
} from './recruitment-drive.validation'
import { Prisma, RecruitmentDrive } from '@prisma/client'
import { JobService } from '../job/job.service'
import { FileService } from '../aws-s3/file.service'
import { PagedList } from '../../helpers/paged-list'
import NotFoundException from '../../helpers/errors/not-found.exception'
import AlreadyUsedCodeException from '../../helpers/errors/already-used-code.exception'
import OpenRecruitmentDriveException from './recruitment-drive.exception'
import BadRequestException from '../../helpers/errors/bad-request.exception'

@injectable()
export class RecruitmentDriveService {
  constructor(
    @inject(PrismaService) private readonly prismaService: PrismaService,
    @inject(JobService) private readonly jobService: JobService,
    @inject(FileService) private readonly fileService: FileService
  ) {}

  private sortMapping = {
    startDate: { startDate: 'asc' },
    '-startDate': { startDate: 'desc' },
    endDate: { endDate: 'asc' },
    '-endDate': { endDate: 'desc' },
    name: { name: 'asc' },
    '-name': { name: 'desc' },
    createdAt: { createdAt: 'asc' },
    '-createdAt': { createdAt: 'desc' },
    code: { code: 'asc' },
    '-code': { code: 'desc' }
  } as const

  public getRecruitmentDriveById = async (recruitmentDriveId: string, required = false) => {
    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { id: recruitmentDriveId }
    })

    if (!recruitmentDrive && required) {
      throw new NotFoundException(`Not found recruitment drive with id: ${recruitmentDriveId}`)
    }

    return recruitmentDrive
  }

  public getCurrentRecruitmentDrive = async (required = false) => {
    const currentRecruitmentDrive = await this.prismaService.client.recruitmentDrive.findFirst({
      where: {
        isOpening: true
      },
      include: {
        jobDetails: true
      }
    })

    if (!currentRecruitmentDrive && required) {
      throw new NotFoundException(`Not found recruitment drive is opening`)
    }

    return currentRecruitmentDrive
  }

  public getRecruitmentDriveDetail = async (schema: TGetRecruitmentDriveDetailSchema) => {
    const {
      params: { recruitmentDriveCode }
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findFirst({
      where: {
        code: recruitmentDriveCode
      },
      include: {
        jobDetails: {
          select: {
            createdAt: true,
            job: true,
            quantity: true,
            applicants: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!recruitmentDrive) {
      throw new NotFoundException(`Not found recruitment drive with code: ${recruitmentDriveCode}`)
    }

    const imageNames = recruitmentDrive.jobDetails.map((jd) => jd.job.icon)
    const imageUrls = await this.fileService.getFileUrls(imageNames)

    const mappedRecruitmentDrive = {
      ...recruitmentDrive,
      jobDetails: recruitmentDrive.jobDetails.map((jd, index) => ({
        ...jd,
        job: {
          ...jd.job,
          icon: imageUrls[index]
        },
        countApplicants: jd.applicants.length,
        countApplicantsLastWeek: jd.applicants.reduce((total, applicant) => {
          const isApplyInLastWeek =
            applicant.createdAt.getTime() > new Date(new Date().setDate(new Date().getDate() - 7)).getTime()
          return total + (isApplyInLastWeek ? 1 : 0)
        }, 0),
        countApplicantsApproved: jd.applicants.reduce((total, applicant) => {
          return total + (applicant.status == 'Approve' ? 1 : 0)
        }, 0)
      }))
    }

    return mappedRecruitmentDrive
  }

  public createRecruitmentDrive = async (schema: TCreateRecruitmentDriveSchema) => {
    const {
      body: { endDate, isOpening, name, startDate, description, code }
    } = schema

    const recruitmentDriveByCode = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { code }
    })

    if (recruitmentDriveByCode) throw new AlreadyUsedCodeException()

    if (isOpening && (await this.getCurrentRecruitmentDrive())) {
      throw new OpenRecruitmentDriveException()
    }

    return await this.prismaService.client.recruitmentDrive.create({
      data: { endDate, isOpening, name, startDate, description, code }
    })
  }

  public updateRecruitmentDrive = async (schema: TUpdateRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId },
      body: { endDate, isOpening, name, startDate, description, code }
    } = schema

    const recruitmentDriveByCode = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { code }
    })

    if (recruitmentDriveByCode && recruitmentDriveByCode.id !== recruitmentDriveId) {
      throw new AlreadyUsedCodeException()
    }

    const recruitmentDrive = recruitmentDriveByCode || (await this.getRecruitmentDriveById(recruitmentDriveId, true))!

    if (isOpening) {
      const currentRecruitmentDrive = await this.getCurrentRecruitmentDrive()
      if (currentRecruitmentDrive && currentRecruitmentDrive.id !== recruitmentDrive.id) {
        throw new OpenRecruitmentDriveException()
      }
    }

    return await this.prismaService.client.recruitmentDrive.update({
      where: {
        id: recruitmentDriveId
      },
      data: { endDate, isOpening, name, code, startDate, description }
    })
  }

  public getRecruitmentDrives = async (schema: TGetRecruitmentDrivesSchema): Promise<PagedList<RecruitmentDrive>> => {
    const {
      query: { pageNumber, pageSize, search, status, sort }
    } = schema

    let statusQuery: Prisma.RecruitmentDriveWhereInput = {}

    switch (status) {
      case 'opening': {
        statusQuery = {
          isOpening: true
        }
        break
      }

      case 'closed': {
        statusQuery = {
          isOpening: false
        }
        break
      }
    }

    let searchQuery: Prisma.RecruitmentDriveWhereInput = {}

    if (search) {
      searchQuery = {
        OR: [
          {
            code: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    const query: Prisma.RecruitmentDriveFindManyArgs = {
      where: {
        AND: [searchQuery, statusQuery]
      }
    }

    const totalCount = await this.prismaService.client.recruitmentDrive.count(query as Prisma.RecruitmentDriveCountArgs)

    if (sort && sort in this.sortMapping) {
      query.orderBy = this.sortMapping[sort]
    }

    query.skip = pageSize * (pageNumber - 1)
    query.take = pageSize

    const recruitmentDrives = await this.prismaService.client.recruitmentDrive.findMany(query)

    return new PagedList<RecruitmentDrive>(recruitmentDrives, totalCount, pageNumber, pageSize)
  }

  public getRecruitmentDrive = async (schema: TGetRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId }
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { id: recruitmentDriveId }
    })

    return recruitmentDrive
  }

  public deleteRecruitmentDrive = async (schema: TDeleteRecruitmentDriveSchema) => {
    const {
      params: { recruitmentDriveId }
    } = schema

    //check exist
    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { id: recruitmentDriveId },
      include: {
        jobDetails: {
          select: {
            _count: {
              select: {
                applicants: true
              }
            }
          }
        }
      }
    })

    if (!recruitmentDrive) {
      throw new NotFoundException(`Not found recruitment drive with id: ${recruitmentDriveId}`)
    }

    const countApplicants = recruitmentDrive.jobDetails.reduce((total, jd) => total + jd._count.applicants, 0)

    if (countApplicants > 0) {
      throw new BadRequestException('Cannot delete a recruitment drive already having some applicants')
    }

    await this.prismaService.client.recruitmentDrive.delete({
      where: {
        id: recruitmentDriveId
      }
    })
  }

  public getRecruitmentDriveByCode = async (code: string, required = false) => {
    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: { code }
    })

    if (!recruitmentDrive && required) {
      throw new NotFoundException(`Not found recruitmentDrive with code: ${code}`)
    }

    return recruitmentDrive
  }

  public openJob = async (schema: TOpenJobSchema) => {
    const {
      body: { jobCode, quantity }
    } = schema

    const currentRecruitmentDrive = (await this.getCurrentRecruitmentDrive(true))!

    if (currentRecruitmentDrive.jobDetails.some((jd) => jd.jobCode === jobCode)) {
      throw new BadRequestException(`This job is already open in current recruitment drive`)
    }

    return await this.prismaService.client.jobDetail.create({
      data: {
        jobCode,
        recruitmentDriveCode: currentRecruitmentDrive.code,
        quantity
      }
    })
  }

  public closeJob = async (schema: TCloseJobSchema) => {
    const {
      params: { jobCode }
    } = schema

    const currentRecruitmentDrive = (await this.getCurrentRecruitmentDrive(true))!

    const jobDetail = currentRecruitmentDrive.jobDetails.find((jd) => jd.jobCode === jobCode)

    if (!jobDetail) {
      throw new BadRequestException(`This job is not open in current recruitment drive`)
    }

    const hasApplicants = !!(await this.prismaService.client.applicant.findFirst({
      where: {
        jobDetailId: jobDetail.id
      }
    }))

    if (hasApplicants) {
      throw new BadRequestException(`Cannot close a job already has some applicants`)
    }

    return await this.prismaService.client.jobDetail.delete({
      where: {
        id: jobDetail.id
      }
    })
  }

  public getAddableJobs = async (schema: TGetAddableJobsSchema) => {
    const {
      params: { recruitmentDriveCode },
      query
    } = schema

    const recruitmentDrive = await this.prismaService.client.recruitmentDrive.findUnique({
      where: {
        code: recruitmentDriveCode
      },
      include: {
        jobDetails: true
      }
    })

    if (!recruitmentDrive) {
      throw new NotFoundException(`Not found recruitment drive with code: ${recruitmentDriveCode}`)
    }

    if (!recruitmentDrive.isOpening) {
      throw new BadRequestException(`Cannot get addable jobs of closed recruitment drive`)
    }

    const jobIdsInRecruitmentDrive = recruitmentDrive?.jobDetails.map((jd) => jd.jobCode)

    return this.jobService.getJobs({ query }, jobIdsInRecruitmentDrive)
  }
}
