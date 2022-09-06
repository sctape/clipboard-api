import { z } from 'zod'

export const employeeCreateRequest = z.object({
  body: z.object({
    name: z.string(),
    salary: z.string(),
    currency: z.string(),
    on_contract: z.string().optional(),
    department: z.string(),
    sub_department: z.string()
  })
})
