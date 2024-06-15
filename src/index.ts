import 'dotenv/config'

import 'reflect-metadata'

import 'express-async-errors'

import corsMiddleware from './middleware/cors.middleware'
import errorHandlingMiddleware from './middleware/error-handling.middleware'
import multerErrorHandlingMiddleware from './middleware/multer-error-handling.middleware'
import { applicantRoute } from './modules/applicant/applicant.route'
import { clerkRoute } from './modules/clerk/clerk.route'
import { EmailService } from './modules/email/email.service'
import { jobRoute } from './modules/job/job.route'
import { recruitmentDriveRoute } from './modules/recruitment-drive/recruitment-drive.route'
import { testExamRoute } from './modules/test-exam/test-exam.route'
import { userRoute } from './modules/user/user.route'
import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { container } from './config/inversify.config'

import NotFoundException from './helpers/errors/not-found.exception'
import { ok } from './helpers/utils'

//!Just for development
const DELAY = 0

const app = express()

app.use((req, res, next) => {
  setTimeout(next, DELAY)
})

app.use(helmet())
app.use(morgan('dev'))
app.use(express.static('public'))

//!Must place before app.use(bodyParser.), do not move it.
app.use('/api/webhook/clerk', clerkRoute)

app.use(bodyParser.json())
app.use(corsMiddleware)

app.use('/api/users', userRoute)
app.use('/api/jobs', jobRoute)
app.use('/api/test-exams', testExamRoute)
app.use('/api/recruitment-drives', recruitmentDriveRoute)
app.use('/api/applicants', applicantRoute)
app.post('/api/email', async (req, res) => {
  const emailService = container.get(EmailService)

  await emailService.sendMail('vanttse170128@fpt.edu.vn', '[TALENT_CORE][SCHEDULE_TEST_EXAM]', "Let's do test exam")

  return res.status(200).json()
})

app.get('/', (req, res) => {
  return ok(res, { message: 'hello world' })
})

app.all('*', () => {
  throw new NotFoundException()
})

app.use(multerErrorHandlingMiddleware)
app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

export default app
