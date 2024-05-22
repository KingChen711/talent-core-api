import 'reflect-metadata'
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import errorHandlingMiddleware from './middleware/error-handling.middleware'
import clerkRoute from './clerk/clerk.route'
import userRoute from './user/user.route'

const app = express()

app.use('/api/webhook/clerk', clerkRoute) //!Must place before app.use(bodyParser.json()), do not move it.

app.use(bodyParser.json())
app.use(cors())

app.use('/api/users', userRoute)

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'hello world' })
})

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

export default app
