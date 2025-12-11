import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '@/api/lib/prisma'
import { NotFoundError } from '@/api/src/errors/not-found-error'
import { updateUserBodySchema } from '@/api/src/schemas/update-user'
import { BadRequestError } from '@/api/src/errors/bad-request-error'
import { deleteFromR2, uploadToR2 } from '@/api/lib/cloudflare'

export const updateUser = async (app: FastifyInstance) => {
  app.addHook('onReady', async () => {
    if (app.swagger) {
      app.swagger().paths['/user/update'] = {
        post: {
          tags: ['User'],
          summary: 'Update user',
          description: 'Update user information with optional photo upload',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'User full name (optional)',
                    },
                    photo: {
                      type: 'string',
                      format: 'binary',
                      description: 'User photo (optional, max 5MB)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'User updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      cpf: { type: 'string' },
                      photo: { type: 'string', nullable: true },
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
    .post('/user/update', async (request, reply) => {
      const userId = await request.getCurrentUserId()

      const parts = request.parts()

      const fields: Record<string, any> = {}
      let photoBuffer: Buffer | undefined
      let photoFilename: string | undefined
      let photoMimeType: string | undefined

      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'photo') {
          photoBuffer = await part.toBuffer()
          photoFilename = part.filename
          photoMimeType = part.mimetype
        } else if (part.type === 'field') {
          fields[part.fieldname] = part.value
        }
      }

      const { name } = updateUserBodySchema.parse(fields)

      if (!name && !photoBuffer) {
        throw new BadRequestError('At least one field must be provided.')
      }

      const userExists = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!userExists) {
        throw new NotFoundError('User not found.')
      }

      const dataToUpdate: {
        name?: string
        photo?: string
      } = {}

      if (name) {
        dataToUpdate.name = name
      }

      if (photoBuffer && photoFilename && photoMimeType) {
        const photoUrl = await uploadToR2(
            photoBuffer,
            photoFilename,
            photoMimeType
          )

          dataToUpdate.photo = photoUrl

          await deleteFromR2(userExists.photo)
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          updatedAt: true,
        },
      })

      return reply.status(200).send(updatedUser)
    })
}
