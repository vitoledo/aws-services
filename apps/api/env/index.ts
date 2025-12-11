import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
  API_DOCS_LOGIN: z.string(),
  API_DOCS_PASSWORD: z.string(),
  CLOUDFLARE_ENDPOINT: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_BUCKET_NAME: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    '❌ Invalid environment variables',
    z.flattenError(_env.error).fieldErrors
  )

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
