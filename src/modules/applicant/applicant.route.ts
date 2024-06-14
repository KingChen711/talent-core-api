import express from 'express'
import { container } from '../../config/inversify.config'
import { ApplicantController } from './applicant.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import { getApplicantDetailSchema, scheduleTestExamSchema } from './applicant.validation'

const router = express.Router()

const applicantController = container.get(ApplicantController)

router.get(
  '/:applicantId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getApplicantDetailSchema),
  applicantController.getApplicantDetail
)

router.patch(
  '/:applicantId/schedule-test-exam',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(scheduleTestExamSchema),
  applicantController.scheduleTestExam
)

export { router as applicantRoute }
