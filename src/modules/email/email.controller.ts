import { inject, injectable } from 'inversify'
import { EmailService } from './email.service'
import { Request, Response } from 'express'
import { ok } from '../../helpers/utils'
import { TSendMailSchema } from './email.validation'

@injectable()
export class EmailController {
  constructor(@inject(EmailService) private readonly emailService: EmailService) {}

  public sendMail = async (req: Request, res: Response) => {
    const {
      body: { html, subject, to }
    } = res.locals.requestData as TSendMailSchema

    await this.emailService.sendMail(to, subject, html)
    return ok(res)
  }
}
