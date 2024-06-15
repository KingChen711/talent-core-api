import { inject, injectable } from 'inversify'
import { RecruitmentDriveService } from './recruitment-drive.service'
import { Request, Response } from 'express'
import { ApplicantService } from '../applicant/applicant.service'
import { created, noContent, ok } from '../../helpers/utils'

@injectable()
export class RecruitmentDriveController {
  constructor(
    @inject(RecruitmentDriveService) private readonly recruitmentDriveService: RecruitmentDriveService,
    @inject(ApplicantService) private readonly applicantService: ApplicantService
  ) {}

  public getRecruitmentDrives = async (req: Request, res: Response) => {
    const recruitmentDrives = await this.recruitmentDriveService.getRecruitmentDrives(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(recruitmentDrives.metaData))
    return ok(res, recruitmentDrives)
  }

  public createRecruitmentDrive = async (req: Request, res: Response) => {
    const recruitmentDrive = await this.recruitmentDriveService.createRecruitmentDrive(res.locals.requestData)
    return created(res, recruitmentDrive)
  }

  public updateRecruitmentDrive = async (req: Request, res: Response) => {
    await this.recruitmentDriveService.updateRecruitmentDrive(res.locals.requestData)
    return noContent(res)
  }

  public getRecruitmentDrive = async (req: Request, res: Response) => {
    const recruitmentDrive = await this.recruitmentDriveService.getRecruitmentDrive(res.locals.requestData)
    return ok(res, recruitmentDrive)
  }

  public getRecruitmentDriveDetail = async (req: Request, res: Response) => {
    const recruitmentDrive = await this.recruitmentDriveService.getRecruitmentDriveDetail(res.locals.requestData)
    return ok(res, recruitmentDrive)
  }

  public deleteRecruitmentDrive = async (req: Request, res: Response) => {
    await this.recruitmentDriveService.deleteRecruitmentDrive(res.locals.requestData)
    return noContent(res)
  }

  public getAddableJobs = async (req: Request, res: Response) => {
    const addableJobs = await this.recruitmentDriveService.getAddableJobs(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(addableJobs.metaData))
    return ok(res, addableJobs)
  }

  public openJob = async (req: Request, res: Response) => {
    const jobDetail = await this.recruitmentDriveService.openJob(res.locals.requestData)
    return created(res, jobDetail)
  }

  public addJob = async (req: Request, res: Response) => {
    const jobDetail = await this.recruitmentDriveService.addJob(res.locals.requestData)
    return created(res, jobDetail)
  }

  public closeJob = async (req: Request, res: Response) => {
    await this.recruitmentDriveService.closeJob(res.locals.requestData)
    return noContent(res)
  }

  public createApplicant = async (req: Request, res: Response) => {
    await this.applicantService.createApplicant(req.file, res.locals.requestData)
    return noContent(res)
  }

  public getApplicantsByRecruitmentDrive = async (req: Request, res: Response) => {
    const applicants = await this.applicantService.getCandidateByRecruitmentDrive(res.locals.requestData)
    res.setHeader('X-Pagination', JSON.stringify(applicants.metaData))
    return ok(res, applicants)
  }
}
