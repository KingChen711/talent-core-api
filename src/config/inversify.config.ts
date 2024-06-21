import { Container } from 'inversify'

import { ApplicationController } from '../modules/application/application.controller'
import { ApplicationService } from '../modules/application/application.service'
import { FileService } from '../modules/aws-s3/file.service'
import { ClerkController } from '../modules/clerk/clerk.controller'
import { EmailService } from '../modules/email/email.service'
import { JobController } from '../modules/job/job.controller'
import { JobService } from '../modules/job/job.service'
import { PrismaService } from '../modules/prisma/prisma.service'
import { RecruitmentDriveController } from '../modules/recruitment-drive/recruitment-drive.controller'
import { RecruitmentDriveService } from '../modules/recruitment-drive/recruitment-drive.service'
import { TestExamController } from '../modules/test-exam/test-exam.controller'
import { TestExamService } from '../modules/test-exam/test-exam.service'
import { UserController } from '../modules/user/user.controller'
import { UserService } from '../modules/user/user.service'
import { EmailController } from '../modules/email/email.controller'
import { WishService } from '../modules/application/wish.service'

const container = new Container()

container.bind(PrismaService).toSelf().inRequestScope()
container.bind(FileService).toSelf().inRequestScope()

container.bind(ClerkController).toSelf().inRequestScope()

container.bind(UserService).toSelf().inRequestScope()
container.bind(UserController).toSelf().inRequestScope()

container.bind(JobService).toSelf().inRequestScope()
container.bind(JobController).toSelf().inRequestScope()

container.bind(TestExamService).toSelf().inRequestScope()
container.bind(TestExamController).toSelf().inRequestScope()

container.bind(ApplicationService).toSelf().inRequestScope()
container.bind(WishService).toSelf().inRequestScope()
container.bind(ApplicationController).toSelf().inRequestScope()

container.bind(RecruitmentDriveService).toSelf().inRequestScope()
container.bind(RecruitmentDriveController).toSelf().inRequestScope()

container.bind(EmailService).toSelf().inRequestScope()
container.bind(EmailController).toSelf().inRequestScope()

export { container }
