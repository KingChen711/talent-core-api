import 'dotenv/config'

import { EmailController } from './email.controller'
import { sendMailSchema } from './email.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

const router = express.Router()

const emailController = container.get(EmailController)

router.post(
  '/',
  // ClerkExpressWithAuth(),
  // authorize([Role.EMPLOYEE]),
  validateRequestData(sendMailSchema),
  emailController.sendMail
)

export { router as emailRoute }
