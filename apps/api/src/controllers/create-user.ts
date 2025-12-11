import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { registerUserBodySchema } from '../schemas/create-user'
import { prisma } from '@/api/lib/prisma'
import { ConflictExceptionError } from '@/api/src/errors/conflict-exception-error'
import { Bcrypt } from '@/api/lib/bcript'
import { uploadToR2 } from '@/api/lib/cloudflare'

export const registerUser = async (app: FastifyInstance) => {
  app.addHook('onReady', async () => {
    if (app.swagger) {
      app.swagger().paths['/user/register'] = {
        post: {
          tags: ['User'],
          summary: 'Register user',
          description: 'Register a new user with optional photo upload',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'User full name',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'User email address',
                    },
                    cpf: {
                      type: 'string',
                      description: 'User CPF (11 digits)',
                    },
                    password: {
                      type: 'string',
                      minLength: 6,
                      description: 'User password (min 6 characters)',
                    },
                    photo: {
                      type: 'string',
                      format: 'binary',
                      description: 'User photo (optional, max 5MB)',
                    },
                  },
                  required: ['name', 'email', 'cpf', 'password'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      cpf: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      }
    }
  })
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/user/register', async (request, reply) => {
      const parts = request.parts()

      const fields: Record<string, any> = {}
      let photoBuffer: Buffer | undefined
      let photoFilename: string | undefined
      let photoMimeType: string | undefined

      for await (const part of parts) {
        if (part.type === 'file') {
          if (part.fieldname === 'photo') {
            photoBuffer = await part.toBuffer()
            photoFilename = part.filename
            photoMimeType = part.mimetype
          }
        } else {
          fields[part.fieldname] = part.value
        }
      }

      const { email, name, cpf, password } =
        registerUserBodySchema.parse(fields)

      const emailExists = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (emailExists) {
        throw new ConflictExceptionError('Invalid credentials.')
      }

      const userExists = await prisma.user.findFirst({
        where: {
          cpf,
        },
      })

      if (userExists) {
        throw new ConflictExceptionError('Invalid credentials.')
      }

      const hashedPassword = await Bcrypt.hash(password)

      let photoUrl: string | null = null

      if (photoBuffer && photoFilename && photoMimeType) {
        photoUrl = await uploadToR2(photoBuffer, photoFilename, photoMimeType)
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          cpf,
          password: hashedPassword,
          photo: photoUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        omit: {
          photo: true,
          password: true,
        },
      })

      return reply.status(201).send(user)
    })
}
