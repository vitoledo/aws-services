import { NotFoundError } from '@/api/src/errors/not-found-error'
import { prisma } from '@/api/lib/prisma'
import { getUserResponseSchema } from '@/api/src/schemas/get-user'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export const getUser = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/user',
    {
      schema: {
        tags: ['User'],
        summary: 'Get user',
        security: [{ bearerAuth: [] }],
        response: getUserResponseSchema,
      },
    },
    async (request, reply) => {
      const userId = await request.getCurrentUserId()

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          photo: true,
          name: true,
          email: true,
          cpf: true,
        },
      })

      if (!user) {
        throw new NotFoundError('User not found')
      }

      return reply.status(200).send(user)
    }
  )
}
