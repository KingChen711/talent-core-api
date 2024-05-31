import { inject, injectable } from 'inversify'
import { RecruitmentDriveService } from './recruitment-drive.service'

@injectable()
export class RecruitmentDriveController {
  constructor(@inject(RecruitmentDriveService) private readonly recruitmentDriveService: RecruitmentDriveService) {}
}
