import 'dotenv/config'

import { TestExamController } from './test-exam.controller'
import {
  addOrRemoveJobsSchema,
  createTestExamSchema,
  deleteTestExamSchema,
  getAddableJobsSchema,
  getTestExamJobsSchema,
  getTestExamSchema,
  getTestExamsSchema,
  updateTestExamSchema
} from './test-exam.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

const router = express.Router()

const testExamController = container.get(TestExamController)

router.get(
  '/:testExamCode/addable-jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getAddableJobsSchema),
  testExamController.getAddableJobs
)

router.patch(
  '/:testExamCode/jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(addOrRemoveJobsSchema),
  testExamController.removeJobs
)

router.get(
  '/:testExamCode/jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getTestExamJobsSchema),
  testExamController.getTestExamJobs
)

router.post(
  '/:testExamCode/jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(addOrRemoveJobsSchema),
  testExamController.addJobs
)

router.delete(
  '/:testExamId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(deleteTestExamSchema),
  testExamController.deleteTestExam
)

router.get(
  '/:testExamId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getTestExamSchema),
  testExamController.getTestExam
)

router.put(
  '/:testExamId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(updateTestExamSchema),
  testExamController.updateTestExam
)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getTestExamsSchema),
  testExamController.getTestExams
)

router.post(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(createTestExamSchema),
  testExamController.createTestExam
)

export { router as testExamRoute }
