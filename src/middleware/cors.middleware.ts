import 'dotenv/config'

import cors from 'cors'

const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(',')

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true)
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  allowedHeaders: '*',
  exposedHeaders: 'X-Pagination'
}

const corsMiddleware = cors(corsOptions)

export default corsMiddleware
