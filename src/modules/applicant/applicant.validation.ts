import z from 'zod'

export const getApplicantDetailSchema = z.object({
  params: z.object({
    applicantId: z.string()
  })
})

export type TGetApplicantDetailSchema = z.infer<typeof getApplicantDetailSchema>
