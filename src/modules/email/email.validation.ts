import z from 'zod'

export const sendMailSchema = z.object({
  body: z.object({
    to: z.string().email(),
    subject: z.string(),
    html: z.string()
  })
})

export type TSendMailSchema = z.infer<typeof sendMailSchema>
