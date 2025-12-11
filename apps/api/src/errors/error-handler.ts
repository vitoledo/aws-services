import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from '@/api/src/errors/bad-request-error'
import { UnauthorizedError } from '@/api/src/errors/unauthorized-error'
import { ConflictExceptionError } from './conflict-exception-error'
import { NotFoundError } from './not-found-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof NotFoundError) {
    reply.status(404).send({
      message: error.message,
    })
  }

  if (error instanceof ConflictExceptionError) {
    reply.status(409).send({
      message: error.message,
    })
  }

  console.error(error)

  reply.status(500).send({ message: 'Internal server error' })
}
