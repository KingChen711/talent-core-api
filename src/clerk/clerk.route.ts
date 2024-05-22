import bodyParser from 'body-parser'
import express from 'express'
import { container } from '../inversify.config'
import { ClerkController } from './clerk.controller'

const router = express.Router()

const clerkController = container.get(ClerkController)

router.post('/', bodyParser.raw({ type: 'application/json' }), clerkController.webhookHandler)

export default router
