// Third-party Imports
import GoogleProvider from 'next-auth/providers/google'
import CognitoProvider from 'next-auth/providers/cognito'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'

import crypto from 'crypto'

export const authOptions: NextAuthOptions = {
  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async credentials => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(JSON.stringify({ message: 'Email y contraseña son requeridos' }))
        }

        // Read configuration from env or amplify_outputs.json
        const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
        const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION
        const clientSecret = process.env.COGNITO_CLIENT_SECRET

        let fallback: any = null
        if (!clientId || !region) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            fallback = require('../../amplify_outputs.json')
          } catch {
            // ignore
          }
        }

        const resolvedClientId = clientId || fallback?.auth?.user_pool_client_id
        const resolvedRegion = region || fallback?.auth?.aws_region

        if (!resolvedClientId || !resolvedRegion) {
          throw new Error(JSON.stringify({ message: 'Configuración de Cognito incompleta (ClientId/Region)' }))
        }

        const cognito = new CognitoIdentityProviderClient({ region: resolvedRegion })

        try {
          // SECRET_HASH if client has secret
          const authParams: Record<string, string> = {
            USERNAME: credentials.email,
            PASSWORD: credentials.password
          }

          if (clientSecret) {
            const secretHash = crypto
              .createHmac('sha256', clientSecret)
              .update(credentials.email + resolvedClientId)
              .digest('base64')
            authParams.SECRET_HASH = secretHash
          }

          const cmd = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: resolvedClientId,
            AuthParameters: authParams
          })

          const resp = await cognito.send(cmd)
          const result = resp.AuthenticationResult

          // Handle challenges (e.g., NEW_PASSWORD_REQUIRED)
          if (!result && resp.ChallengeName) {
            if (resp.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
              throw new Error(JSON.stringify({ message: 'Debes actualizar tu contraseña antes de continuar.' }))
            }
            throw new Error(JSON.stringify({ message: `Se requiere completar el reto: ${resp.ChallengeName}` }))
          }
          if (!result?.IdToken) {
            throw new Error(JSON.stringify({ message: 'Autenticación fallida (sin IdToken)' }))
          }

          // Decode JWT payload (base64url)
          const decode = (token: string) => {
            const payload = token.split('.')[1]
            const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
            const json = Buffer.from(b64, 'base64').toString('utf-8')
            return JSON.parse(json)
          }

          const idPayload: any = decode(result.IdToken)
          const sub = idPayload?.sub as string
          const email = idPayload?.email as string | undefined
          const name = idPayload?.name as string | undefined
          const preferred_username = idPayload?.preferred_username as string | undefined
          const exp = idPayload?.exp as number | undefined

          return {
            id: sub,
            name: name || preferred_username || email || 'User',
            email: email,
            // carry tokens for jwt callback
            idToken: result.IdToken,
            accessToken: result.AccessToken,
            refreshToken: result.RefreshToken,
            expiresAt: exp
          } as any
        } catch (e: any) {
          const code = e?.name || e?.__type
          const rawMessage = typeof e?.message === 'string' ? e.message : ''
          let message = 'Credenciales inválidas'

          if (code === 'UserNotConfirmedException') message = 'Usuario no confirmado. Revisa tu correo.'
          else if (code === 'NotAuthorizedException') {
            if (/secret hash/i.test(rawMessage)) {
              message =
                'El App Client requiere client secret. Define COGNITO_CLIENT_SECRET o usa un App Client público (sin secret).'
            } else if (/password|incorrect/i.test(rawMessage)) {
              message = 'Usuario o contraseña incorrectos.'
            } else {
              message = 'No autorizado. Verifica que el App Client permita USER_PASSWORD_AUTH.'
            }
          } else if (code === 'UserNotFoundException') message = 'Usuario no encontrado.'
          else if (code === 'PasswordResetRequiredException') message = 'Debes restablecer tu contraseña.'
          else if (code === 'TooManyRequestsException') message = 'Demasiados intentos. Intenta más tarde.'

          throw new Error(JSON.stringify({ message, code }))
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),

    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      issuer: process.env.COGNITO_ISSUER as string,
      authorization: {
        params: {
          scope: 'openid email profile',
          lang: 'es'
        }
      },
      checks: ['pkce', 'state'],
      client: { token_endpoint_auth_method: 'none' } // cliente público
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Mantener nombre personalizado
        token.name = user.name

        // When logging in via Credentials, capture tokens
        const u: any = user

        if (u?.idToken) token.id_token = u.idToken
        if (u?.accessToken) token.access_token = u.accessToken
        if (u?.expiresAt) token.expires_at = u.expiresAt
      }

      // En el primer login con Cognito, `account` y `profile` vienen poblados
      if (account && profile) {
        // Tokens y expiración (no los expondremos al cliente por seguridad a menos que lo solicites)
        token.access_token = (account as any).access_token
        token.id_token = (account as any).id_token
        token.expires_at = (account as any).expires_at

        // Claims comunes de Cognito disponibles en `profile`
        // Tipos flexibles para evitar romper si faltan
        const p: any = profile

        if (typeof p?.email_verified !== 'undefined') token.email_verified = p.email_verified
        if (typeof p?.phone_number !== 'undefined') token.phone_number = p.phone_number
        if (Array.isArray(p?.['cognito:groups'])) token.cognito_groups = p['cognito:groups']
        if (typeof p?.preferred_username !== 'undefined') token.preferred_username = p.preferred_username
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Sincronizar campos útiles y seguros en el objeto de sesión del cliente
        session.user.name = token.name

        // Mapeos adicionales
        session.user.emailVerified = token.email_verified
        session.user.phoneNumber = token.phone_number
        session.user.cognitoGroups = token.cognito_groups
        session.user.preferredUsername = token.preferred_username
      }

      return session
    }
  }
}
