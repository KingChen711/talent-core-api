import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../inversify.config'
import { JobController } from './job.controller'
import { validateRequestData } from 'src/middleware/validate-request-data.middleware'
import { getJobsSchema } from './job.validation'

const router = express.Router()

const jobController = container.get(JobController)

router.get('/', validateRequestData(getJobsSchema), jobController.getJobs)

export default router
