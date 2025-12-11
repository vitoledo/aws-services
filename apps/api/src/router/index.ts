import type { FastifyInstanceProps } from '@/api/src/@types/fastify-instance'
import { authUser } from '@/api/src/auth/auth-user'
import { registerUser } from '@/api/src/controllers/create-user'
import { getUser } from '@/api/src/controllers/get-user'
import { updateUser } from '@/api/src/controllers/update-user'

export default function registerRoutes(app: FastifyInstanceProps) {
  app.register(registerUser)
  app.register(authUser)
  app.register(getUser)
  app.register(updateUser)
}
