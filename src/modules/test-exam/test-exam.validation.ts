import z from 'zod'

export const getTestExamAddableJobsSchema = z.object({
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

export type TGetTestExamAddableJobsSchema = z.infer<typeof getTestExamAddableJobsSchema>

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

const questionOptionSchema = z.object({
  content: z.string().min(1),
  correct: z.boolean()
})

const questionSchema = z
  .object({
    content: z.string().min(1),
    options: z.array(questionOptionSchema).length(4)
  })
  .refine(
    (data) => {
      const count = data.options.reduce((acc, num) => (num.correct ? acc + 1 : acc), 0)
      return count === 1
    },
    {
      message: 'Question need one and only one correct option'
    }
  )

export const createTestExamSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(50),
    conditionPoint: z
      .number()
      .min(0)
      .max(10)
      .transform((data) => Number(data.toFixed(2))),
    duration: z.number().int().min(0),
    description: z.string().optional(),
    questions: z.array(questionSchema).catch([])
  })
})

export type TCreateTestExamSchema = z.infer<typeof createTestExamSchema>

export const updateTestExamSchema = z.object({
  params: z.object({
    testExamId: z.string()
  }),
  body: z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(50),
    conditionPoint: z
      .number()
      .min(0)
      .max(10)
      .transform((data) => Number(data.toFixed(2))),
    duration: z.number().int().min(0),
    description: z.string().optional(),
    questions: z.array(questionSchema).catch([])
  })
})

export type TUpdateTestExamSchema = z.infer<typeof updateTestExamSchema>

export const getTestExamSchema = z.object({
  params: z.object({
    testExamId: z.string()
  })
})

export type TGetTestExamSchema = z.infer<typeof getTestExamSchema>
