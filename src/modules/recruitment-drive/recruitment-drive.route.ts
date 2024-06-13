import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { RecruitmentDriveController } from './recruitment-drive.controller'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { authorize } from '../../middleware/authorize.middleware'
import { Role } from '../../types'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import {
  openJobSchema,
  createRecruitmentDriveSchema,
  deleteRecruitmentDriveSchema,
  getAddableJobsSchema,
  getRecruitmentDriveSchema,
  getRecruitmentDrivesSchema,
  updateRecruitmentDriveSchema,
  closeJobSchema,
  createApplicationSchema,
  getRecruitmentDriveDetailSchema,
  getApplicationsByRecruitmentDriveSchema
} from './recruitment-drive.validation'
import cvMulterMiddleware from 'src/middleware/cv-multer.middleware'

const router = express.Router()

const recruitmentDriveController = container.get(RecruitmentDriveController)

router.delete(
  '/close-job/:jobCode',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(closeJobSchema),
  recruitmentDriveController.closeJob
)

router.post(
  '/open-job',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(openJobSchema),
  recruitmentDriveController.openJob
)

router.post(
  '/:recruitmentDriveCode/jobs/:jobCode/applications',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  cvMulterMiddleware,
  validateRequestData(createApplicationSchema),
  recruitmentDriveController.createApplication
)

router.get(
  '/:recruitmentDriveCode/applications',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getApplicationsByRecruitmentDriveSchema),
  recruitmentDriveController.getApplicationsByRecruitmentDrive
)

router.get(
  '/:recruitmentDriveCode/addable-jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getAddableJobsSchema),
  recruitmentDriveController.getAddableJobs
)

router.get(
  '/:recruitmentDriveCode/detail',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  validateRequestData(getRecruitmentDriveDetailSchema),
  recruitmentDriveController.getRecruitmentDriveDetail
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

export { router as recruitmentDriveRoute }
