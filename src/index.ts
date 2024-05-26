import 'reflect-metadata'
import 'dotenv/config'

import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import morgan from 'morgan'

import errorHandlingMiddleware from './middleware/error-handling.middleware'
import clerkRoute from './modules/clerk/clerk.route'
import userRoute from './modules/user/user.route'
import jobRoute from './modules/job/job.route'
import corsMiddleware from './middleware/cors.middleware'

//TODO:for development
const DELAY = 0

const app = express()

app.use((req, res, next) => {
  setTimeout(next, DELAY)
})

app.use(helmet())
app.use(morgan('dev'))
app.use(express.static('public'))

app.use('/api/webhook/clerk', clerkRoute) //!Must place before app.use(bodyParser.json()), do not move it.

app.use(bodyParser.json())
app.use(corsMiddleware)

app.use('/api/users', userRoute)
app.use('/api/jobs', jobRoute)

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'hello world' })
})

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

export default app

//TODO:Created At Created By
