import cors from 'cors'

//TODO: Thêm các url vào env
const allowedOrigins = ['http://localhost:3000', 'https://talent-core.vercel.app']

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
  }
}

const corsMiddleware = cors(corsOptions)

export default corsMiddleware
