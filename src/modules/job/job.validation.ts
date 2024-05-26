import z from 'zod'

export const getJobSchema = z.object({
  params: z.object({
    jobId: z.string()
  })
})

export type TGetJobSchema = z.infer<typeof getJobSchema>

export const deleteJobSchema = z.object({
  params: z.object({
    jobId: z.string()
  })
})

export type TDeleteJobSchema = z.infer<typeof deleteJobSchema>

export const getJobsSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['all', 'opening', 'closed']).catch('all'),
    sort: z.enum(['code', '-code', 'name', '-name', 'createdAt', '-createdAt']).optional()
  })
})

export type TGetJobsSchema = z.infer<typeof getJobsSchema>

export const createJobSchema = z.object({
  body: z
    .object({
      code: z.string().min(2).max(50),
      name: z.string().min(2).max(50),
      description: z.string().optional(),
      color: z
        .string()
        .optional()
        .default('#29c5ee')
        .refine((data) => {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^$/.test(data)
        }, 'Invalid color')
        .transform((data) => {
          if (data === '') return '#29c5ee'
          return data
        }),
      openInCurrentRecruitment: z.string().transform((data) => data === 'true'),
      quantityInCurrentRecruitment: z.coerce.number().int().optional()
    })
    .refine(
      (data) => {
        return (
          !data.openInCurrentRecruitment ||
          (data.quantityInCurrentRecruitment &&
            Number.isInteger(data.quantityInCurrentRecruitment) &&
            data.quantityInCurrentRecruitment > 0)
        )
      },
      {
        path: ['quantityInCurrentRecruitment'],
        message: 'Number of candidates needed must be a number a greater than 0'
      }
    )
})

export type TCreateJobSchema = z.infer<typeof createJobSchema>

export const updateJobSchema = z.object({
  params: z.object({
    jobId: z.string()
  }),
  body: z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(50),
    description: z.string().optional(),
    color: z
      .string()
      .optional()
      .default('#29c5ee')
      .refine((data) => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^$/.test(data)
      }, 'Invalid color')
      .transform((data) => {
        if (data === '') return '#29c5ee'
        return data
      }),
    testExamIds: z
      .string()
      .transform((data) => JSON.parse(data) as string[])
      .refine((data) => {
        return data.every((v) => typeof v === 'string')
      })
  })
})

export type TUpdateJobSchema = z.infer<typeof updateJobSchema>
