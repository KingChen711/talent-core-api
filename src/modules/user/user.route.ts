import 'dotenv/config'

import { UserController } from './user.controller'
import { getProfileSchema } from './user.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'

const router = express.Router()

const userController = container.get(UserController)

router.get('/who-am-i', ClerkExpressWithAuth(), authorize(), userController.whoAmI)

router.get(
  '/candidate-profile/:email',
  ClerkExpressWithAuth(),
  authorize(),
  validateRequestData(getProfileSchema),
  userController.getCandidateProfile
)

export { router as userRoute }
