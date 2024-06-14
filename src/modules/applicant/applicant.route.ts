import express from 'express'
import { container } from '../../config/inversify.config'
import { ApplicantController } from './applicant.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import {
  approveApplicantSchema,
  completedInterviewSchema,
  getApplicantDetailSchema,
  rejectApplicantSchema,
  saveApplicantSchema,
  scheduleInterviewSchema,
  scheduleTestExamSchema
} from './applicant.validation'

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

router.patch(
  '/:applicantId/schedule-interview',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(scheduleInterviewSchema),
  applicantController.scheduleInterview
)

router.patch(
  '/:applicantId/complete-interview',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(completedInterviewSchema),
  applicantController.completedInterview
)

router.patch(
  '/:applicantId/approve',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(approveApplicantSchema),
  applicantController.approveApplicant
)

router.patch(
  '/:applicantId/reject',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(rejectApplicantSchema),
  applicantController.rejectApplicant
)

router.patch(
  '/:applicantId/save',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(saveApplicantSchema),
  applicantController.saveApplicant
)

export { router as applicantRoute }
