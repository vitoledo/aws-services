import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { jwtSetup } from '@/api/lib/jwt'
import { swaggerSetup } from '@/api/lib/swagger'
import { errorHandler } from '@/api/src/errors/error-handler'
import registerRoutes from '@/api/src/router/index'
import multipart from '@fastify/multipart'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(multipart, {
  attachFieldsToBody: false,
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
})

app.setErrorHandler(errorHandler)

swaggerSetup(app)

jwtSetup(app)

app.register(fastifyCors)

registerRoutes(app)

export { app }
