import { ApplicationStatus, Gender } from '@prisma/client'
import z from 'zod'

export const getRecruitmentDrivesSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['All', 'Open', 'Closed', 'Upcoming']).catch('All'),
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
      description: z.string().optional()
    })
    .refine(
      (data) => {
        return new Date(data.endDate) > new Date(data.startDate)
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
      description: z.string().optional()
    })
    .refine(
      (data) => {
        return data.endDate.getTime() > data.startDate.getTime()
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

export const getRecruitmentDriveDetailSchema = z.object({
  params: z.object({
    recruitmentDriveCode: z.string()
  })
})

export type TGetRecruitmentDriveDetailSchema = z.infer<typeof getRecruitmentDriveDetailSchema>

export const getApplicationsByRecruitmentDriveSchema = z.object({
  params: z.object({
    recruitmentDriveCode: z.string()
  }),
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['All', 'Screening', 'Testing', 'Interviewing', 'Saved', 'Approve', 'Reject']).catch('All'),
    sort: z
      .enum(['createdAt', '-createdAt', 'candidateName', '-candidateName', 'appliedJob', '-appliedJob'])
      .optional()
      .default('-createdAt')
  })
})

export type TGetApplicationsByRecruitmentDriveSchema = z.infer<typeof getApplicationsByRecruitmentDriveSchema>

export const deleteRecruitmentDriveSchema = z.object({
  params: z.object({
    recruitmentDriveId: z.string()
  })
})

export type TDeleteRecruitmentDriveSchema = z.infer<typeof deleteRecruitmentDriveSchema>

export const getAddableJobsSchema = z.object({
  params: z.object({
    recruitmentDriveCode: z.string()
  }),
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

export type TGetAddableJobsSchema = z.infer<typeof getAddableJobsSchema>

export const openJobSchema = z.object({
  body: z.object({
    jobCode: z.string(),
    quantity: z.coerce.number().int().min(1)
  })
})

export type TOpenJobSchema = z.infer<typeof openJobSchema>

export const closeJobSchema = z.object({
  params: z.object({
    jobCode: z.string()
  })
})

export type TCloseJobSchema = z.infer<typeof closeJobSchema>

export const addJobSchema = z.object({
  params: z.object({
    recruitmentDriveCode: z.string()
  }),
  body: z.object({
    jobCode: z.string(),
    quantity: z.coerce.number().int().min(1)
  })
})

export type TAddJobSchema = z.infer<typeof addJobSchema>

export const createApplicationSchema = z.object({
  params: z.object({
    jobCode: z.string(),
    recruitmentDriveCode: z.string()
  }),
  body: z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    phone: z.string().regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/),
    gender: z.enum([Gender.Male, Gender.Female, Gender.Other]),
    bornYear: z.coerce.number().int().min(1900),
    personalIntroduction: z.string().optional()
  })
})

export type TCreateApplicationSchema = z.infer<typeof createApplicationSchema>
