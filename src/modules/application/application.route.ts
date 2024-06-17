import { ApplicationController } from './application.controller'
import {
  approveApplicationSchema,
  completedInterviewSchema,
  getApplicationDetailSchema,
  rejectApplicationSchema,
  saveApplicationSchema,
  scheduleInterviewSchema,
  scheduleTestExamSchema
} from './application.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

const router = express.Router()

const applicationController = container.get(ApplicationController)

router.get(
  '/:applicationId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getApplicationDetailSchema),
  applicationController.getApplicationDetail
)

router.patch(
  '/:applicationId/schedule-test-exam',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(scheduleTestExamSchema),
  applicationController.scheduleTestExam
)

router.patch(
  '/:applicationId/schedule-interview',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(scheduleInterviewSchema),
  applicationController.scheduleInterview
)

router.patch(
  '/:applicationId/complete-interview',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(completedInterviewSchema),
  applicationController.completedInterview
)

router.patch(
  '/:applicationId/approve',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(approveApplicationSchema),
  applicationController.approveApplication
)

router.patch(
  '/:applicationId/reject',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(rejectApplicationSchema),
  applicationController.rejectApplication
)

router.patch(
  '/:applicationId/save',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(saveApplicationSchema),
  applicationController.saveApplication
)

export { router as applicationRoute }
