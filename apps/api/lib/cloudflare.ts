import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { env } from '../env'
import { BadRequestError } from '../src/errors/bad-request-error'

const r2 = new S3Client({
  region: 'auto',
  endpoint: env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(fileBuffer: Buffer, originalFilename: string, mimeType: string) {
  const fileExtension = originalFilename.split('.').pop()
  const fileName = `${randomUUID()}.${fileExtension}`

  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: 'public-read',
  })

  await r2.send(command)

  const publicUrl = `${env.CLOUDFLARE_PUBLIC_URL}/${fileName}`
  
  return publicUrl
}

export async function deleteFromR2(fileUrl: string | null) {
  try {

    if(!fileUrl){
        return 'No files to delete.'
    }

    const fileKey = fileUrl.split('/').pop()

    if (!fileKey) {
        throw new BadRequestError(`Unable to extract filename from URL: ${fileUrl}`)
    }

    const command = new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: fileKey,
    })

    await r2.send(command)
    console.log(`File deleted successfully: ${fileKey}`)

  } catch (err) {

    throw new BadRequestError(`Error deleting R2 file: ${err}`)
  }
}