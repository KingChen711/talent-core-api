import 'dotenv/config'

import { JobController } from './job.controller'
import {
  addOrRemoveTestExamsSchema,
  createJobSchema,
  deleteJobSchema,
  getAddableTestExamsSchema,
  getJobSchema,
  getJobTestExamsSchema,
  getJobsSchema,
  updateJobSchema
} from './job.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import imageMulterMiddleware from '../../middleware/image-multer.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

const router = express.Router()

const jobController = container.get(JobController)

router.get('/opening-jobs', jobController.getOpeningJobs)

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
  jobController.addTestExams
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
  imageMulterMiddleware,
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
  imageMulterMiddleware,
  validateRequestData(createJobSchema),
  jobController.createJob
)

export { router as jobRoute }
