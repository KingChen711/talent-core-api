import bodyParser from 'body-parser'
import express from 'express'
import { container } from '../../config/inversify.config'
import { ClerkController } from './clerk.controller'

const router = express.Router()

const clerkController = container.get(ClerkController)

router.post('/', bodyParser.raw({ type: 'applicant/json' }), clerkController.webhookHandler)

export { router as clerkRoute }
