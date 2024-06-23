import z from 'zod'

export const takeTestSchema = z.object({
  params: z.object({
    applicationId: z.string()
  })
})

export type TTakeTestSchema = z.infer<typeof takeTestSchema>

const keySchema = z.string().refine((val) => /^[0-9]+$/.test(val), {
  message: 'Key must be a string representing a non-negative integer'
})

// Define the value schema
const valueSchema = z.enum(['A', 'B', 'C', 'D'])

// Define the main schema for the object
const mainSchema = z.record(keySchema, valueSchema)

export const submitTestSchema = z.object({
  params: z.object({
    applicationId: z.string()
  }),
  body: z.object({
    answers: mainSchema
  })
})

export type TSubmitTestSchema = z.infer<typeof submitTestSchema>
