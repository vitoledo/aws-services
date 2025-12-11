import bcrypt from 'bcryptjs'
import { BadRequestError } from '@/api/src/errors/bad-request-error'

export const Bcrypt = {
  hash: async (text: string) => {
    try {
      const saltRounds = 10
      const encryptedText = await bcrypt.hash(text, saltRounds)

      return encryptedText
    } catch {
      throw new BadRequestError('Error Generating Hash!')
    }
  },

  compare: async (text: string, hashedtext: string) => {
    try {
      const match = await bcrypt.compare(text, hashedtext)

      return match
    } catch {
      throw new BadRequestError('Error Comparing Password!')
    }
  },
}
