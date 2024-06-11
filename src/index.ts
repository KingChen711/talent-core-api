import 'dotenv/config'
import 'reflect-metadata'
import 'express-async-errors'

import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import errorHandlingMiddleware from './middleware/error-handling.middleware'
import corsMiddleware from './middleware/cors.middleware'
import NotFoundException from './helpers/errors/not-found.exception'
import { clerkRoute } from './modules/clerk/clerk.route'
import { userRoute } from './modules/user/user.route'
import { jobRoute } from './modules/job/job.route'
import { testExamRoute } from './modules/test-exam/test-exam.route'
import { recruitmentDriveRoute } from './modules/recruitment-drive/recruitment-drive.route'

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

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'hello world' })
})

app.all('*', () => {
  throw new NotFoundException()
})

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

export default app
