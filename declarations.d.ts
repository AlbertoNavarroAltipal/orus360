declare module 'tailwindcss-logical'

// Extensiones de tipos para NextAuth (JWT y Session)
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      emailVerified?: boolean
      phoneNumber?: string
      cognitoGroups?: string[]
      preferredUsername?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string
    id_token?: string
    expires_at?: number
    email_verified?: boolean
    phone_number?: string
    cognito_groups?: string[]
    preferred_username?: string
  }
}
