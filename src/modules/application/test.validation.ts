import z from 'zod'

export const takeTestSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TTakeTestSchema = z.infer<typeof takeTestSchema>
