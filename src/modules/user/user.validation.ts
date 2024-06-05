import z from 'zod'

export const getProfileSchema = z.object({
  params: z.object({
    email: z.string()
  })
})

export type TGetProfileSchema = z.infer<typeof getProfileSchema>
