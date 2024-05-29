import z from 'zod'

export const getTestExamsSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    sort: z
      .enum([
        'code',
        '-code',
        'name',
        '-name',
        'createdAt',
        '-createdAt',
        'conditionPoint',
        '-conditionPoint',
        'duration',
        '-duration'
      ])
      .optional()
      .default('createdAt')
  })
})

export type TGetTestExamsSchema = z.infer<typeof getTestExamsSchema>

export const deleteTestExamSchema = z.object({
  params: z.object({
    testExamId: z.string()
  })
})

export type TDeleteTestExamSchema = z.infer<typeof deleteTestExamSchema>
