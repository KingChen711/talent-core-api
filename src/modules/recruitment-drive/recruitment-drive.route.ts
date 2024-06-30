import 'dotenv/config'

import { RecruitmentDriveController } from './recruitment-drive.controller'
import {
  addJobSchema,
  closeJobSchema,
  createApplicationSchema,
  createRecruitmentDriveSchema,
  deleteRecruitmentDriveSchema,
  getAddableJobsSchema,
  getApplicationsByRecruitmentDriveSchema,
  getRecruitmentDriveDetailSchema,
  getRecruitmentDriveSchema,
  getRecruitmentDrivesSchema,
  openJobSchema,
  updateRecruitmentDriveSchema
} from './recruitment-drive.validation'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
// To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express from 'express'

import { container } from '../../config/inversify.config'

import { authorize } from '../../middleware/authorize.middleware'
import cvMulterMiddleware from '../../middleware/cv-multer.middleware'
import { validateRequestData } from '../../middleware/validate-request-data.middleware'
import { Role } from '../../types'

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
  authorize(),
  cvMulterMiddleware,
  validateRequestData(createApplicationSchema),
  recruitmentDriveController.createApplication
)

router.post(
  '/:recruitmentDriveCode/jobs',
  ClerkExpressWithAuth(),
  authorize([Role.EMPLOYEE]),
  cvMulterMiddleware,
  validateRequestData(addJobSchema),
  recruitmentDriveController.addJob
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
