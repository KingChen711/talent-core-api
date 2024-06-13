import express from 'express'
import { container } from '../../config/inversify.config'
import { ApplicationController } from './application.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import { getApplicationDetailSchema } from './application.validation'

const router = express.Router()

const applicationController = container.get(ApplicationController)

router.get(
  '/:applicationId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getApplicationDetailSchema),
  applicationController.getApplicationDetail
)

export { router as applicationRoute }
