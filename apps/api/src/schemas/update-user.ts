import z from "zod"

export const updateUserBodySchema = z.object({
  name: z.string().optional(),
})