import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { JobController } from './job.controller'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { createJobSchema, getJobsSchema } from './job.validation'
import multerMiddleware from 'src/middleware/multer.middleware'

const router = express.Router()

const jobController = container.get(JobController)

router.get('/', validateRequestData(getJobsSchema), jobController.getJobs)
router.post('/', multerMiddleware, validateRequestData(createJobSchema), jobController.createJob)

export default router
