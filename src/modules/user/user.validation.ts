import z from 'zod'

export const getProfileSchema = z.object({
  params: z.object({
    email: z.string().trim().toLowerCase()
  })
})

export type TGetProfileSchema = z.infer<typeof getProfileSchema>
