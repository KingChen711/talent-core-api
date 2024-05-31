import z from 'zod'

export const getRecruitmentDrivesSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['all', 'opening', 'closed']).catch('all'),
    sort: z
      .enum(['startDate', '-startDate', 'endDate', '-endDate', 'name', '-name', 'createdAt', '-createdAt'])
      .optional()
      .default('-createdAt')
  })
})

export type TGetRecruitmentDrivesSchema = z.infer<typeof getRecruitmentDrivesSchema>
