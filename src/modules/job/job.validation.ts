import z from 'zod'

export const getJobSchema = z.object({
  params: z.object({
    jobId: z.string()
  })
})

export type TGetJobSchema = z.infer<typeof getJobSchema>

export const addOrRemoveTestExamsSchema = z.object({
  params: z.object({
    jobCode: z.string()
  }),
  body: z.object({
    testExamIds: z.array(z.string()).catch([])
  })
})

export type TAddOrRemoveTestExamsSchema = z.infer<typeof addOrRemoveTestExamsSchema>

export const getJobTestExamsSchema = z.object({
  params: z.object({
    jobCode: z.string()
  })
})

export type TGetJobTestExamsSchema = z.infer<typeof getJobTestExamsSchema>

export const getAddableTestExamsSchema = z.object({
  params: z.object({
    jobCode: z.string()
  }),
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

export type TGetAddableTestExamsSchema = z.infer<typeof getAddableTestExamsSchema>

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
    status: z.enum(['All', 'Open', 'Closed', 'Upcoming']).catch('All'),
    sort: z.enum(['code', '-code', 'name', '-name', 'createdAt', '-createdAt']).optional().default('createdAt')
  })
})

export type TGetJobsSchema = z.infer<typeof getJobsSchema>

export const createJobSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(2)
      .max(50)
      .refine((value) => !/\s/.test(value), {
        message: 'Code must not contain any whitespace'
      }),
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
      })
  })
})

export type TCreateJobSchema = z.infer<typeof createJobSchema>

export const updateJobSchema = z.object({
  params: z.object({
    jobId: z.string()
  }),
  body: z.object({
    code: z
      .string()
      .min(2)
      .max(50)
      .refine((value) => !/\s/.test(value), {
        message: 'Code must not contain any whitespace'
      }),
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
      })
  })
})

export type TUpdateJobSchema = z.infer<typeof updateJobSchema>
