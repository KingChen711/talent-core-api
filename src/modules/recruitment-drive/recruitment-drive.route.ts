import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { RecruitmentDriveController } from './recruitment-drive.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import {
  addJobToCurrentRecruitmentDriveSchema,
  createRecruitmentDriveSchema,
  deleteRecruitmentDriveSchema,
  getRecruitmentDriveAddableJobsSchema,
  getRecruitmentDriveSchema,
  getRecruitmentDrivesSchema,
  updateRecruitmentDriveSchema
} from './recruitment-drive.validation'

const router = express.Router()

const recruitmentDriveController = container.get(RecruitmentDriveController)

router.get(
  '/:recruitmentDriveCode/addable-jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getRecruitmentDriveAddableJobsSchema),
  recruitmentDriveController.getRecruitmentDriveAddableJobs
)

router.get(
  '/:recruitmentDriveId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getRecruitmentDriveSchema),
  recruitmentDriveController.getRecruitmentDrive
)

router.put(
  '/:recruitmentDriveId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(updateRecruitmentDriveSchema),
  recruitmentDriveController.updateRecruitmentDrive
)

router.delete(
  '/:recruitmentDriveId',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(deleteRecruitmentDriveSchema),
  recruitmentDriveController.deleteRecruitmentDrive
)

router.post(
  '/add-job-to-current-drive',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(addJobToCurrentRecruitmentDriveSchema),
  recruitmentDriveController.addJobToCurrentRecruitmentDrive
)

router.get(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getRecruitmentDrivesSchema),
  recruitmentDriveController.getRecruitmentDrives
)

router.post(
  '/',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(createRecruitmentDriveSchema),
  recruitmentDriveController.createRecruitmentDrive
)

export default router
