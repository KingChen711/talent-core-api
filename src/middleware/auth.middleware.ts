import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
// import User from '../models/user'
import * as dotenv from 'dotenv'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/helpers/api-error'
dotenv.config()

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token not found' })
  }
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
    const userId = decode.userId
    // const user = await User.findById(userId)
    // res.locals.user = user
    next()
  } catch (err) {
    console.log(err)
    next(new ApiError(StatusCodes.FORBIDDEN, 'Invalid token'))
  }
}

export default verifyToken
