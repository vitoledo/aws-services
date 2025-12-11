import { z } from 'zod'

export const authUserBodySchema = z.object({
  email: z.string(),
  password: z.string().min(6).max(20),
})

export const authUserResponseSchema = {
  201: z.string(),
  400: z.object({
    message: z.string(),
  }),
  500: z.object({
    message: z.string(),
  }),
}
