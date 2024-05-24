import z from 'zod'

export const getJobsSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['all', 'opening', 'closed']).catch('all'),
    sort: z.enum(['code', '-code', 'name', '-name']).optional()
  })
})

export type TGetJobsSchema = z.infer<typeof getJobsSchema>
