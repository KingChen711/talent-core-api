import 'dotenv/config'

import nodemailer from 'nodemailer'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../prisma/prisma.service'
import mailTransporter from './mail-transporter'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { replacePlaceholders, toDateTime } from '../../helpers/utils'
import {
  notifyApproveApplicantTemplate,
  notifyInterviewSessionTemplate,
  notifyRejectApplicantTemplate,
  notifySaveApplicantTemplate,
  receivedApplicantTemplate
} from '../../constants/email-templates'

type TSendEmailReceivedApplicant = {
  to: string
  candidate: string
  appliedJob: string
  recruitmentDrive: string
}

type TSendEmailInterviewSession = {
  to: string
  candidate: string
  appliedJob: string
  interviewDate: Date
  location: string
  point: number
}

type TSendEmailApproveApplicant = {
  to: string
  candidate: string
  appliedJob: string
  receiveJobDate: Date
  location: string
}

type TSendEmailSaveApplicant = {
  to: string
  candidate: string
  appliedJob: string
}

type TSendEmailRejectApplicant = {
  to: string
  candidate: string
  appliedJob: string
}

@injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>

  constructor(@inject(PrismaService) private readonly prismaService: PrismaService) {
    this.transporter = mailTransporter
  }

  private readonly APP_EMAIL_ADDRESS = process.env.APP_EMAIL_ADDRESS!

  private buildMailOptions = (to: string, subject: string, html: string) => {
    return {
      from: this.APP_EMAIL_ADDRESS,
      to,
      subject,
      html
    }
  }

  public sendMail = async (to: string, subject: string, html: string) => {
    const mailOptions = this.buildMailOptions(to, subject, html)

    this.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Error:', error)
      } else {
        console.log('Email sent:', info.response)
      }
    })
  }

  public sendEmailReceivedApplicant = async ({
    appliedJob,
    candidate,
    recruitmentDrive,
    to
  }: TSendEmailReceivedApplicant) => {
    const html = replacePlaceholders(receivedApplicantTemplate, { appliedJob, candidate, recruitmentDrive })

    await this.sendMail(to, `Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailInterviewSession = async ({
    appliedJob,
    candidate,
    interviewDate,
    location,
    to,
    point
  }: TSendEmailInterviewSession) => {
    const html = replacePlaceholders(notifyInterviewSessionTemplate, {
      appliedJob,
      candidate,
      location,
      point: point.toString(),
      interviewDate: toDateTime(interviewDate)
    })

    await this.sendMail(to, `Interview Invitation for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailApproveApplicant = async ({
    appliedJob,
    candidate,
    receiveJobDate,
    location,
    to
  }: TSendEmailApproveApplicant) => {
    const html = replacePlaceholders(notifyApproveApplicantTemplate, {
      appliedJob,
      candidate,
      location,
      receiveJobDate: toDateTime(receiveJobDate)
    })

    await this.sendMail(to, `Job Offer for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailSaveApplicant = async ({
    appliedJob,
    candidate,

    to
  }: TSendEmailSaveApplicant) => {
    const html = replacePlaceholders(notifySaveApplicantTemplate, {
      appliedJob,
      candidate
    })

    await this.sendMail(to, `Update on Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailRejectApplicant = async ({
    appliedJob,
    candidate,

    to
  }: TSendEmailRejectApplicant) => {
    const html = replacePlaceholders(notifyRejectApplicantTemplate, {
      appliedJob,
      candidate
    })

    await this.sendMail(to, `Update on Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }
}
