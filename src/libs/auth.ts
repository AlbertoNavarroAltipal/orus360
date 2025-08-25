import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Tipos para la respuesta de la API
interface LoginResponse {
  statusCode: number
  message: string
  data: {
    id: string
    full_name: string
    email: string
    email_verified_at: string | null
    google_id: string | null
    google_nickname: string
    google_company_domain: string
    avatar: string
    created_at: string
    updated_at: string
    roles: Array<{
      code: string
      description: string
      root: boolean
    }>
    permissions: string[]
    active_tokens: Array<{
      id: string
      token: string
      expires_at: string | null
      created_at: string
      is_master: boolean
    }>
    master_token: string
  }
}

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string[]
}

// Función para autenticar con la API custom
const authenticateUser = async (email: string, password: string): Promise<LoginResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_URL_ORUS_API

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_URL_ORUS_API no está configurada')
  }

  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  const data = await response.json()

  if (!response.ok) {
    const errorData = data as ErrorResponse
    throw new Error(
      JSON.stringify({
        statusCode: errorData.statusCode,
        message: errorData.message
      })
    )
  }

  return data as LoginResponse
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      authorize: async credentials => {
        const email = credentials?.email
        const password = credentials?.password

        if (!email || !password) {
          throw new Error(
            JSON.stringify({
              message: ['Email y contraseña son requeridos'],
              statusCode: 400
            })
          )
        }

        try {
          const response = await authenticateUser(email, password)
          const userData = response.data

          // Retornar el usuario con toda la información necesaria
          return {
            id: userData.id,
            name: userData.full_name,
            email: userData.email,
            image: userData.avatar,
            // Campos personalizados que se incluirán en el token JWT
            customData: {
              fullName: userData.full_name,
              emailVerified: userData.email_verified_at,
              googleId: userData.google_id,
              googleNickname: userData.google_nickname,
              googleCompanyDomain: userData.google_company_domain,
              avatar: userData.avatar,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
              roles: userData.roles,
              permissions: userData.permissions,
              activeTokens: userData.active_tokens,
              masterToken: userData.master_token
            }
          }
        } catch (error: any) {
          let errorMessage = 'Credenciales inválidas'
          let statusCode = 401

          try {
            const parsedError = JSON.parse(error.message)
            statusCode = parsedError.statusCode
            errorMessage = Array.isArray(parsedError.message) ? parsedError.message.join(', ') : parsedError.message
          } catch {
            errorMessage = error.message || 'Error de autenticación'
          }

          // Personalizar mensajes según el código de estado
          switch (statusCode) {
            case 400:
              if (errorMessage.includes('email')) {
                errorMessage = 'Debe proporcionar un email válido'
              } else if (errorMessage.includes('contraseña')) {
                errorMessage = 'La contraseña no cumple con los requisitos'
              }
              break
            case 401:
              errorMessage = 'Credenciales incorrectas'
              break
            default:
              errorMessage = 'Error de autenticación'
          }

          throw new Error(
            JSON.stringify({
              message: [errorMessage],
              statusCode
            })
          )
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: process.env.GOOGLE_SCOPES || 'openid email profile'
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 días
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.name = user.name
        token.email = user.email
        token.picture = user.image

        // Incluir datos personalizados en el token
        const customUser = user as any
        if (customUser.customData) {
          token.customData = customUser.customData
        }

        // Establecer el provider
        if (!account && !token.provider) {
          token.provider = 'credentials'
        }
      }

      if (account && profile) {
        token.provider = account.provider
        token.access_token = account.access_token
        token.id_token = account.id_token
        token.expires_at = account.expires_at

        // Para Google, incluir información del perfil
        if (profile) {
          const googleProfile = profile as any
          token.customData = {
            ...token.customData,
            googleId: googleProfile.sub,
            emailVerified: googleProfile.email_verified,
            avatar: googleProfile.picture,
            fullName: googleProfile.name
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture

        // Incluir datos personalizados en la sesión
        const customSession = session as any
        customSession.user.id = token.sub
        customSession.user.provider = token.provider
        customSession.customData = token.customData

        // Datos específicos para fácil acceso
        if (token.customData) {
          const customData = token.customData as any
          customSession.user.fullName = customData.fullName
          customSession.user.roles = customData.roles
          customSession.user.permissions = customData.permissions
          customSession.user.masterToken = customData.masterToken
          customSession.user.avatar = customData.avatar
          customSession.user.googleNickname = customData.googleNickname
          customSession.user.googleCompanyDomain = customData.googleCompanyDomain
          customSession.user.emailVerified = customData.emailVerified
        }
      }

      return session
    }
  }
}
