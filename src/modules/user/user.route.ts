import 'dotenv/config'

import { UserController } from './user.controller'
import { getProfileSchema, getUsersSchema, toBeEmployeeSchemaSchema } from './user.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

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

router.patch(
  '/:userId/to-be-employee',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(toBeEmployeeSchemaSchema),
  userController.toBeEmployee
)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getUsersSchema),
  userController.getUsers
)

export { router as userRoute }
