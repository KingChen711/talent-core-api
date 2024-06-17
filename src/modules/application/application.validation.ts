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
      const now = new Date()
      const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)
      return data.getTime() >= threeDaysLater.getTime()
    }, 'Test date must be after today at least 3 day'),
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
      const now = new Date()
      const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)
      return data.getTime() >= threeDaysLater.getTime()
    }, 'Interview date must be after today at least 3 day'),
    location: z.string()
  })
})

export type TScheduleInterviewSchema = z.infer<typeof scheduleInterviewSchema>

export const completedInterviewSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TCompletedInterviewSchema = z.infer<typeof completedInterviewSchema>

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

export const approveApplicationSchema = z.object({
  params: z.object({
    applicationId: z.string()
  }),
  body: z.object({
    receiveJobDate: z.coerce.date().refine((data) => {
      const now = new Date()
      const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)
      return data.getTime() >= threeDaysLater.getTime()
    }, 'Interview date must be after today at least 3 day'),
    location: z.string()
  })
})

export type TApproveApplicationSchema = z.infer<typeof approveApplicationSchema>
