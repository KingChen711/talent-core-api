import { Container } from 'inversify'
import { PrismaService } from '../modules/prisma/prisma.service'
import { UserService } from '../modules/user/user.service'
import { UserController } from '../modules/user/user.controller'
import { ClerkController } from '../modules/clerk/clerk.controller'
import { JobService } from '../modules/job/job.service'
import { JobController } from '../modules/job/job.controller'
import { ImageService } from '../aws-s3/image.service'
import { TestExamService } from '../modules/test-exam/test-exam.service'
import { TestExamController } from '../modules/test-exam/test-exam.controller'

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

export { container }
