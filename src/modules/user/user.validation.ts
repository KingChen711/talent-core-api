import z from 'zod'

export const getProfileSchema = z.object({
  params: z.object({
    email: z.string().trim().toLowerCase()
  })
})

export type TGetProfileSchema = z.infer<typeof getProfileSchema>

export const toBeEmployeeSchemaSchema = z.object({
  params: z.object({
    userId: z.string()
  })
})

export type TToBeEmployeeSchemaSchema = z.infer<typeof toBeEmployeeSchemaSchema>

export const getUsersSchema = z.object({
  query: z.object({
    pageNumber: z.coerce.number().catch(1),
    pageSize: z.coerce
      .number()
      .catch(10)
      .transform((data) => Math.min(data, 50)),
    search: z.coerce.string().trim().optional(),
    role: z.enum(['All', 'Candidate', 'Employee']).catch('All'),
    sort: z
      .enum(['email', '-email', 'fullName', '-fullName', 'bornYear', '-bornYear', 'phone', '-phone'])
      .catch('email')
  })
})

export type TGetUsersSchema = z.infer<typeof getUsersSchema>
