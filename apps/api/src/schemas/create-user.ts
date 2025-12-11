import { z } from 'zod'

export const registerUserBodySchema = z.object({
  name: z.string(),
  cpf: z
    .string()
    .min(11)
    .max(11)
    .transform((cpf) => {
      return cpf.replaceAll(/\D/g, '')
    }),
  email: z.email(),
  password: z.string().min(6).max(20),
})

export const registerUserResponseSchema = {
  201: z.object({
    name: z.string(),
    cpf: z.string(),
    email: z.string(),
    password: z.string(),
    id: z.string(),
    photo: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  400: z.object({
    message: z.string(),
  }),
  500: z.object({
    message: z.string(),
  }),
}
