import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY

import express from 'express'
import { container } from '../../config/inversify.config'
import { RecruitmentDriveController } from './recruitment-drive.controller'

const router = express.Router()

const recruitmentDriveController = container.get(RecruitmentDriveController)

// router.get(
//   '/:recruitmentDriveCode/addable-test-exams',
//   ClerkExpressWithAuth(),
//   authorize([Role.EMPLOYEE]),
//   validateRequestData(getRecruitmentDriveAddableTestExamsSchema),
//   recruitmentDriveController.getRecruitmentDriveAddableTestExams
// )

export default router
