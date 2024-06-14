import 'dotenv/config'

import nodemailer from 'nodemailer'

const mailTransporterSingleton = () => {
  return nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

declare const globalThis: {
  mailTransporterGlobal: ReturnType<typeof mailTransporterSingleton>
} & typeof global

const mailTransporter = globalThis.mailTransporterGlobal ?? mailTransporterSingleton()

export default mailTransporter

if (process.env.NODE_ENV !== 'production') globalThis.mailTransporterGlobal = mailTransporter
