import z from "zod";

export const getUserResponseSchema = {
    200: z.object({
        name: z.string(),
        cpf: z.string(),
        email: z.string(),
        photo: z.string().nullable(),
      }),
      404: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
}