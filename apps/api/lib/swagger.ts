import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from 'fastify-type-provider-zod'

import type { FastifyInstanceProps } from '@/api/src/@types/fastify-instance'
import { env } from '../env'
import { UnauthorizedError } from '@/api/src/errors/unauthorized-error'

export async function swaggerSetup(app: FastifyInstanceProps) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'AWS SERVICES',
        version: '1.0.0',
        contact: {
          name: 'Victor de Toledo',
        },
        description: 'API documentation',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  })

  async function authenticateDocs(req: FastifyRequest, reply: FastifyReply) {
    const authHeader = req.headers.authorization
    const validUser = env.API_DOCS_LOGIN
    const validPassword = env.API_DOCS_PASSWORD

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      reply.header('WWW-Authenticate', 'Basic')
      reply.header('Cache-Control', 'no-cache')
      throw new UnauthorizedError()
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8'
    )
    const [username, password] = credentials.split(':')

    if (username !== validUser || password !== validPassword) {
      reply.header('Cache-Control', 'no-cache')
    }
  }

  app.register(fastifySwaggerUI, {
    routePrefix: '/api-docs',
    uiHooks: {
      preHandler: authenticateDocs,
    },
    theme: {
      title: 'AWS SERVICES',
    },
    uiConfig: {
      filter: true,
      displayRequestDuration: true,
    },
  })
}
