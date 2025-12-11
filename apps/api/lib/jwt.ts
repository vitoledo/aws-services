import fastifyJwt from '@fastify/jwt'
import { FastifyInstance } from 'fastify'
import { env } from '../env'
import { UnauthorizedError } from '@/api/src/errors/unauthorized-error'

export async function jwtSetup(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  app.decorateRequest('getCurrentUserId', async function() {
    try {
      const payload = await this.jwtVerify<{ sub: string }>()
      return payload.sub
    } catch (err) {
      throw new UnauthorizedError('Invalid token')
    }
  })
}