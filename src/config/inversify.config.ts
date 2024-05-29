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

container.bind(PrismaService).toSelf()
container.bind(ImageService).toSelf()

container.bind(ClerkController).toSelf()

container.bind(UserService).toSelf()
container.bind(UserController).toSelf()

container.bind(JobService).toSelf()
container.bind(JobController).toSelf()

container.bind(TestExamService).toSelf()
container.bind(TestExamController).toSelf()

export { container }
