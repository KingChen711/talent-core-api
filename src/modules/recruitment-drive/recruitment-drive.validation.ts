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
      .enum([
        'startDate',
        '-startDate',
        'endDate',
        '-endDate',
        'name',
        '-name',
        'code',
        '-code',
        'createdAt',
        '-createdAt'
      ])
      .optional()
      .default('-createdAt')
  })
})

export type TGetRecruitmentDrivesSchema = z.infer<typeof getRecruitmentDrivesSchema>

export const createRecruitmentDriveSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .min(2)
        .max(50)
        .refine((value) => !/\s/.test(value), {
          message: 'Code must not contain any whitespace'
        }),
      name: z.string().min(2).max(50),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      description: z.string().optional(),
      isOpening: z.boolean()
    })
    .refine(
      (data) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return data.startDate.getTime() >= today.getTime()
      },
      {
        message: 'Start Date must be today or after',
        path: ['startDate']
      }
    )
    .refine(
      (data) => {
        return data.endDate > data.startDate
      },
      {
        message: 'End Date must be after Start Date',
        path: ['startDate', 'endDate']
      }
    )
})

export type TCreateRecruitmentDriveSchema = z.infer<typeof createRecruitmentDriveSchema>

export const updateRecruitmentDriveSchema = z.object({
  params: z.object({
    recruitmentDriveId: z.string()
  }),
  body: z
    .object({
      code: z
        .string()
        .min(2)
        .max(50)
        .refine((value) => !/\s/.test(value), {
          message: 'Code must not contain any whitespace'
        }),
      name: z.string().min(2).max(50),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      description: z.string().optional(),
      isOpening: z.boolean()
    })
    .refine(
      (data) => {
        return data.endDate > data.startDate
      },
      {
        message: 'End Date must be after Start Date',
        path: ['startDate', 'endDate']
      }
    )
})

export type TUpdateRecruitmentDriveSchema = z.infer<typeof updateRecruitmentDriveSchema>

export const getRecruitmentDriveSchema = z.object({
  params: z.object({
    recruitmentDriveId: z.string()
  })
})

export type TGetRecruitmentDriveSchema = z.infer<typeof getRecruitmentDriveSchema>
