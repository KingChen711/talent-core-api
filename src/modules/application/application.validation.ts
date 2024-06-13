import z from 'zod'

export const getApplicationDetailSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TGetApplicationDetailSchema = z.infer<typeof getApplicationDetailSchema>
