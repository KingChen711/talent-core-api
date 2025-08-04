import { EmailService } from './email.service'
import { TSendMailSchema } from './email.validation'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { ok } from '../../helpers/utils'

@injectable()
export class EmailController {
  constructor(@inject(EmailService) private readonly emailService: EmailService) {}

  public sendMail = async (req: Request, res: Response) => {
    const {
      body: { html, subject, to }
    } = res.locals.requestData as TSendMailSchema

    const result = await this.emailService.sendMail(to, subject, html)
    return ok(res, result)
  }
}
