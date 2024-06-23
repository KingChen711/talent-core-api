import z from 'zod'

export const getApplicationDetailSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TGetApplicationDetailSchema = z.infer<typeof getApplicationDetailSchema>

export const scheduleTestExamSchema = z.object({
  params: z.object({
    applicationId: z.string()
  }),
  body: z.object({
    testDate: z.coerce.date().refine((data) => {
      const now = new Date().getTime()
      return data.getTime() > now
    }, 'Invalid date'),
    testExamCode: z.string()
  })
})

export type TScheduleTestExamSchema = z.infer<typeof scheduleTestExamSchema>

export const scheduleInterviewSchema = z.object({
  params: z.object({
    applicationId: z.string()
  }),
  body: z.object({
    interviewDate: z.coerce.date().refine((data) => {
      const now = new Date().getTime()
      return data.getTime() > now
    }, 'Invalid date'),
    location: z.string(),
    method: z.enum(['Online', 'Offline'])
  })
})

export type TScheduleInterviewSchema = z.infer<typeof scheduleInterviewSchema>

export const completedInterviewSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TCompletedInterviewSchema = z.infer<typeof completedInterviewSchema>

export const confirmHiredSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TConfirmHiredSchema = z.infer<typeof confirmHiredSchema>

export const saveApplicationSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TSaveApplicationSchema = z.infer<typeof saveApplicationSchema>

export const rejectApplicationSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TRejectApplicationSchema = z.infer<typeof rejectApplicationSchema>

export const getMyApplicationsSchemaSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().default(1),
    pageSize: z.coerce
      .number()
      .default(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    status: z.enum(['All', 'Screening', 'Testing', 'Interviewing', 'Saved', 'Approve', 'Reject']).catch('All'),
    sort: z
      .enum(['createdAt', '-createdAt', 'appliedJob', '-appliedJob', 'recruitmentDrive', '-recruitmentDrive'])
      .optional()
      .default('-createdAt')
  })
})

export type TGetMyApplicationsSchemaSchema = z.infer<typeof getMyApplicationsSchemaSchema>

export const approveApplicationSchema = z.object({
  params: z.object({
    applicationId: z.string()
  }),
  body: z.object({
    receiveJobDate: z.coerce.date().refine((data) => {
      const now = new Date().getTime()
      return data.getTime() > now
    }, 'Invalid date'),
    location: z.string()
  })
})

export type TApproveApplicationSchema = z.infer<typeof approveApplicationSchema>
