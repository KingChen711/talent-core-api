import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { JobController } from './job.controller'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import {
  createJobSchema,
  deleteJobSchema,
  addOrRemoveTestExamsSchema,
  getAddableTestExamsSchema,
  getJobSchema,
  getJobTestExamsSchema,
  getJobsSchema,
  updateJobSchema
} from './job.validation'
import multerMiddleware from '../../middleware/multer.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'

const router = express.Router()

const jobController = container.get(JobController)

router.get(
  '/:jobCode/addable-test-exams',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getAddableTestExamsSchema),
  jobController.getAddableTestExams
)

router.patch(
  '/:jobCode/test-exams',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(addOrRemoveTestExamsSchema),
  jobController.removeTestExams
)

router.post(
  '/:jobCode/test-exams',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(addOrRemoveTestExamsSchema),
  jobController.jobAddTestExams
)

router.get(
  '/:jobCode/test-exams',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getJobTestExamsSchema),
  jobController.getJobTestExams
)

router.get(
  '/:jobId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getJobSchema),
  jobController.getJob
)

router.delete(
  '/:jobId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(deleteJobSchema),
  jobController.deleteJob
)

router.put(
  '/:jobId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  multerMiddleware,
  validateRequestData(updateJobSchema),
  jobController.updateJob
)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getJobsSchema),
  jobController.getJobs
)

router.post(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  multerMiddleware,
  validateRequestData(createJobSchema),
  jobController.createJob
)

export { router as jobRoute }
