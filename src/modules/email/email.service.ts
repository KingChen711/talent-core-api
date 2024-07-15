import 'dotenv/config'

import mailTransporter from './mail-transporter'
import { Method } from '@prisma/client'
import { inject, injectable } from 'inversify'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

import { replacePlaceholders, toDateTime } from '../../helpers/utils'

import {
  notifyApproveApplicationTemplate,
  notifyInterviewSessionTemplate,
  notifyRejectApplicationTemplate,
  notifySaveApplicationTemplate,
  notifyTakeTestTemplate,
  receivedApplicationTemplate
} from '../../constants/email-templates'
import { PrismaService } from '../prisma/prisma.service'

type TSendEmailReceivedApplication = {
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
  method: Method
}

type TSendEmailApproveApplication = {
  to: string
  candidate: string
  appliedJob: string
  receiveJobDate: Date
  location: string
}

type TSendEmailSaveApplication = {
  to: string
  candidate: string
  appliedJob: string
}

type TSendEmailRejectApplication = {
  to: string
  candidate: string
  appliedJob: string
}

type TSendEmailTakeTest = {
  to: string
  candidate: string
  appliedJob: string
  applicationId: string
  testDate: Date
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

  public sendEmailReceivedApplication = async ({
    appliedJob,
    candidate,
    recruitmentDrive,
    to
  }: TSendEmailReceivedApplication) => {
    const html = replacePlaceholders(receivedApplicationTemplate, { appliedJob, candidate, recruitmentDrive })

    await this.sendMail(to, `Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailInterviewSession = async ({
    appliedJob,
    candidate,
    interviewDate,
    location,
    to,
    point,
    method
  }: TSendEmailInterviewSession) => {
    const html = replacePlaceholders(notifyInterviewSessionTemplate, {
      appliedJob,
      candidate,
      location,
      point: point.toString(),
      interviewDate: toDateTime(interviewDate),
      method
    })

    await this.sendMail(to, `Interview Invitation for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailApproveApplication = async ({
    appliedJob,
    candidate,
    receiveJobDate,
    location,
    to
  }: TSendEmailApproveApplication) => {
    const html = replacePlaceholders(notifyApproveApplicationTemplate, {
      appliedJob,
      candidate,
      location,
      receiveJobDate: toDateTime(receiveJobDate)
    })

    await this.sendMail(to, `Job Offer for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailSaveApplication = async ({
    appliedJob,
    candidate,

    to
  }: TSendEmailSaveApplication) => {
    const html = replacePlaceholders(notifySaveApplicationTemplate, {
      appliedJob,
      candidate
    })

    await this.sendMail(to, `Update on Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailRejectApplication = async ({ appliedJob, candidate, to }: TSendEmailRejectApplication) => {
    const html = replacePlaceholders(notifyRejectApplicationTemplate, {
      appliedJob,
      candidate
    })

    await this.sendMail(to, `Update on Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }

  public sendEmailTakeTest = async ({ appliedJob, candidate, to, applicationId, testDate }: TSendEmailTakeTest) => {
    const html = replacePlaceholders(notifyTakeTestTemplate, {
      appliedJob,
      candidate,
      testDate: toDateTime(testDate),
      to,
      signUpLink: `${process.env.CLIENT_URL}/sign-up`,
      linkToTakeTest: `${process.env.CLIENT_URL}/my-applications/${applicationId}`
    })

    await this.sendMail(to, `Update on Your Application for ${appliedJob} at Talent Core Corporation`, html)
  }
}
