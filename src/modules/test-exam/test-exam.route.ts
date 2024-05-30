import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { TestExamController } from './test-exam.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authorize } from 'src/middleware/authorize.middleware'
import { Role } from 'src/types'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import { deleteTestExamSchema, getTestExamsSchema, createTestExamSchema } from './test-exam.validation'

const router = express.Router()

const testExamController = container.get(TestExamController)

router.delete(
  '/:testExamId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(deleteTestExamSchema),
  testExamController.deleteTestExam
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

export default router