import 'dotenv/config'

import { WebhookEvent } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Webhook } from 'svix'

import BadRequestException from '../../helpers/errors/bad-request.exception'
import InternalServerErrorException from '../../helpers/errors/internal-server-error.exception'
import { created, ok } from '../../helpers/utils'

import { Role } from '../../types'
import { UserService } from '../user/user.service'

@injectable()
export class ClerkController {
  constructor(@inject(UserService) private readonly userService: UserService) {}

  public webhookHandler = async (req: Request, res: Response) => {
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!CLERK_WEBHOOK_SECRET)
      throw new InternalServerErrorException(
        'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
      )

    // Get the headers and body
    const headers = req.headers
    const payload: string = req.body

    // Get the Svix headers for verification
    const svix_id = headers['svix-id'] as string
    const svix_timestamp = headers['svix-timestamp'] as string
    const svix_signature = headers['svix-signature'] as string

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature)
      throw new BadRequestException('Error occured -- no svix headers')

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
      throw new BadRequestException(err.message)
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
        return ok(res, user)
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
          create: {}
        }
      })
      return created(res, user)
    }

    if (eventType === 'user.updated') {
      const { id: clerkId, email_addresses, image_url, first_name, last_name } = evt.data

      const user = await this.userService.updateUserByClerkId(clerkId, {
        email: email_addresses[0].email_address,
        fullName: `${first_name}${last_name ? ` ${last_name}` : ''}`,
        avatar: image_url
      })
      return created(res, user)
    }

    return ok(res, {
      success: true,
      message: 'Webhook received'
    })
  }
}
