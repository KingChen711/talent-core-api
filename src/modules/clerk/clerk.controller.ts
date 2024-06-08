import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import ApiError from '../../helpers/api-error'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/clerk-sdk-node'
import { UserService } from '../user/user.service'
import { Role } from '../../types'

@injectable()
export class ClerkController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

      if (!CLERK_WEBHOOK_SECRET) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
        )
      }

      // Get the headers and body
      const headers = req.headers
      const payload: string = req.body

      // Get the Svix headers for verification
      const svix_id = headers['svix-id'] as string
      const svix_timestamp = headers['svix-timestamp'] as string
      const svix_signature = headers['svix-signature'] as string

      // If there are no Svix headers, error out
      if (!svix_id || !svix_timestamp || !svix_signature) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Error occured -- no svix headers')
      }

      // Create a new Svix instance with your secret.
      const wh = new Webhook(CLERK_WEBHOOK_SECRET)

      let evt: WebhookEvent

      try {
        evt = wh.verify(payload, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature
        }) as WebhookEvent
      } catch (err: any) {
        console.log('Error verifying webhook:', err.message)
        throw new ApiError(StatusCodes.BAD_REQUEST, err.message)
      }

      const eventType = evt.type

      if (eventType === 'user.created') {
        const { id, email_addresses, image_url, first_name, last_name } = evt.data

        const userByEmail = await this.userService.getUserEmail(email_addresses[0].email_address)

        if (userByEmail) {
          const user = await this.userService.updateUserByEmail(userByEmail.email, {
            clerkId: id,
            avatar: image_url
          })
          return res.status(StatusCodes.CREATED).json(user)
        }

        const user = await this.userService.createUser({
          clerkId: id,
          email: email_addresses[0].email_address,
          fullName: `${first_name}${last_name ? ` ${last_name}` : ''}`,
          avatar: image_url,
          role: {
            connect: {
              roleName: Role.CANDIDATE
            }
          },
          candidate: {
            create: true
          }
        })
        return res.status(StatusCodes.CREATED).json(user)
      }

      if (eventType === 'user.updated') {
        const { id: clerkId, email_addresses, image_url, first_name, last_name } = evt.data

        const user = await this.userService.updateUserByClerkId(clerkId, {
          email: email_addresses[0].email_address,
          fullName: `${first_name}${last_name ? ` ${last_name}` : ''}`,
          avatar: image_url
        })
        return res.status(StatusCodes.CREATED).json(user)
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Webhook received'
      })
    } catch (error) {
      return res.status(500).json(error)
      // next(error)
    }
  }
}
