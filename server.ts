import { app } from './app'
import { env } from './apps/api/env'

const start = async () => {
  try {
    await app.listen({
      host: '0.0.0.0',
      port: env.PORT,
    })

    console.log(`⚙️  HTTP Server Running on http://localhost:${env.PORT}`)
    console.log(
      `📚  API Docs available on http://localhost:${env.PORT}/api-docs`
    )
  } catch (error) {
    console.error('Server error =>', error)
    process.exit(1)
  }
}

start()
