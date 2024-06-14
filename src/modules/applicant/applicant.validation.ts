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
