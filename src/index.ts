import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import errorHandlingMiddleware from '~/middleware/error-handling.middleware'
import clerkRoute from '~/clerk/clerk.route'

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.use('/api/webhook/clerk', clerkRoute)
// app.get('/api/user', userController.getUserById)

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
