import z from 'zod'

export const requestChangeTestDateSchema = z.object({
  params: z.object({
    applicationId: z.string()
  }),
  body: z.object({
    wishDate: z.coerce.date().refine((data) => {
      const now = new Date()
      const oneDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      return data.getTime() >= oneDaysLater.getTime()
    }, 'Wish date must be after today at least 1 day'),
    reason: z.string()
  })
})

export type TRequestChangeTestDateSchema = z.infer<typeof requestChangeTestDateSchema>
