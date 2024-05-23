import { Container } from 'inversify'
import { PrismaService } from './prisma.service'
import { UserService } from './user/user.service'
import { UserController } from './user/user.controller'
import { ClerkController } from './clerk/clerk.controller'
import { JobService } from './job/job.service'
import { JobController } from './job/job.controller'

const container = new Container()

container.bind(PrismaService).toSelf()

container.bind(ClerkController).toSelf()

container.bind(UserService).toSelf()
container.bind(UserController).toSelf()

container.bind(JobService).toSelf()
container.bind(JobController).toSelf()

export { container }
