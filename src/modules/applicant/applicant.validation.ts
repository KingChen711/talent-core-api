import z from 'zod'

export const getApplicantDetailSchema = z.object({
  params: z.object({
    applicantId: z.string()
  })
})

export type TGetApplicantDetailSchema = z.infer<typeof getApplicantDetailSchema>

export const scheduleTestExamSchema = z.object({
  params: z.object({
    applicantId: z.string()
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
    applicantId: z.string()
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
    applicantId: z.string()
  })
})

export type TCompletedInterviewSchema = z.infer<typeof completedInterviewSchema>

export const saveApplicantSchema = z.object({
  params: z.object({
    applicantId: z.string()
  })
})

export type TSaveApplicantSchema = z.infer<typeof saveApplicantSchema>

export const rejectApplicantSchema = z.object({
  params: z.object({
    applicantId: z.string()
  })
})

export type TRejectApplicantSchema = z.infer<typeof rejectApplicantSchema>

export const approveApplicantSchema = z.object({
  params: z.object({
    applicantId: z.string()
  }),
  body: z.object({
    receiveJobDate: z.coerce.date().refine((data) => {
      const now = new Date()
      const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)
      return data.getTime() >= threeDaysLater.getTime()
    }, 'Interview date must be after today at least 3 day'),
    guide: z.string()
  })
})

export type TApproveApplicantSchema = z.infer<typeof approveApplicantSchema>
