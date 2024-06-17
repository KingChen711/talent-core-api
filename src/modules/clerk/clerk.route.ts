import { ClerkController } from './clerk.controller'
import bodyParser from 'body-parser'
import express from 'express'

import { container } from '../../config/inversify.config'

const router = express.Router()

const clerkController = container.get(ClerkController)

router.post('/', bodyParser.raw({ type: 'application/json' }), clerkController.webhookHandler)

export { router as clerkRoute }
