import { Container } from 'inversify'
import { PrismaService } from '../modules/prisma/prisma.service'
import { UserService } from '../modules/user/user.service'
import { UserController } from '../modules/user/user.controller'
import { ClerkController } from '../modules/clerk/clerk.controller'
import { JobService } from '../modules/job/job.service'
import { JobController } from '../modules/job/job.controller'
import { ImageService } from '../modules/aws-s3/image.service'
import { TestExamService } from '../modules/test-exam/test-exam.service'
import { TestExamController } from '../modules/test-exam/test-exam.controller'
import { RecruitmentDriveService } from '../modules/recruitment-drive/recruitment-drive.service'
import { RecruitmentDriveController } from '../modules/recruitment-drive/recruitment-drive.controller'
import { ApplicationService } from '../modules/recruitment-drive/application.service'

const container = new Container()

container.bind(PrismaService).toSelf().inRequestScope()
container.bind(ImageService).toSelf().inRequestScope()

container.bind(ClerkController).toSelf().inRequestScope()

container.bind(UserService).toSelf().inRequestScope()
container.bind(UserController).toSelf().inRequestScope()

container.bind(JobService).toSelf().inRequestScope()
container.bind(JobController).toSelf().inRequestScope()

container.bind(TestExamService).toSelf().inRequestScope()
container.bind(TestExamController).toSelf().inRequestScope()

container.bind(ApplicationService).toSelf().inRequestScope()
container.bind(RecruitmentDriveService).toSelf().inRequestScope()
container.bind(RecruitmentDriveController).toSelf().inRequestScope()

export { container }
