import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { JobController } from './job.controller'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { createJobSchema, getJobSchema, getJobsSchema } from './job.validation'
import multerMiddleware from '../../middleware/multer.middleware'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'

const router = express.Router()

const jobController = container.get(JobController)

router.get(
  '/:jobId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getJobSchema),
  jobController.getJob
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

export default router
