import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import errorHandlingMiddleware from './middleware/error-handling.middleware'
import clerkRoute from './clerk/clerk.route'
import { container } from './inversify.config'
import { UserController } from './user/user.controller'
import { Role } from './types'

const app = express()
const userController = container.get(UserController)

app.use('/api/webhook/clerk', clerkRoute) //!Must place before app.use(bodyParser.json()), do not move it.

app.use(bodyParser.json())
app.use(cors())

app.get('/api/user', userController.getUserById)

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'hello world' })
})

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(Role[Role.Candidate])
  console.log(`Listening on port ${PORT}`)
})

export default app
