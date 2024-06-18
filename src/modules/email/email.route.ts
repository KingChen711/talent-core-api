import 'dotenv/config'

import { EmailController } from './email.controller'

import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'
import { authorize } from 'src/middleware/authorize.middleware'
import { Role } from 'src/types'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import { sendMailSchema } from './email.validation'

const router = express.Router()

const emailController = container.get(EmailController)

router.post(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(sendMailSchema),
  emailController.sendMail
)

export { router as emailRoute }
