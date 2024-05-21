import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { config } from 'dotenv'
import errorHandlingMiddleware from './middleware/error-handling.middleware'

config()

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.use(errorHandlingMiddleware)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
