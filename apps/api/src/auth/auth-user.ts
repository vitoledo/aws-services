import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '@/api/lib/prisma'
import { Bcrypt } from '@/api/lib/bcript'
import { BadRequestError } from '@/api/src/errors/bad-request-error'
import {
  authUserBodySchema,
  authUserResponseSchema,
} from '@/api/src/schemas/auth-user'

export const authUser = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/user/auth',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Authenticate user',
        body: authUserBodySchema,
        response: authUserResponseSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        throw new BadRequestError('Invalid credentials.')
      }

      const passwordValidated = await Bcrypt.compare(password, user.password)

      if (!passwordValidated) {
        throw new BadRequestError('Invalid credentials.')
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '1d',
          },
        }
      )

      return reply.status(201).send(token)
    }
  )
}
