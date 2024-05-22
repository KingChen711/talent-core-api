import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import errorHandlingMiddleware from '~/middleware/error-handling.middleware'
import clerkRoute from '~/clerk/clerk.route'
import { container } from './inversify.config'
import { UserController } from './user/user.controller'

const app = express()
const userController = container.get(UserController)

app.use(bodyParser.json())
app.use(cors())

app.use('/api/webhook/clerk', clerkRoute)
app.get('/api/user', userController.getUserById)

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

export default app;