import { createHmac } from 'crypto'

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand
} from '@aws-sdk/client-cognito-identity-provider'

const decodeJwt = (token: string) => {
  const payload = token.split('.')[1]
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const json = Buffer.from(b64, 'base64').toString('utf-8')

  return JSON.parse(json)
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },

        // Extra fields for MFA second-step
        mfaCode: { label: 'MFA Code', type: 'text' },
        mfaType: { label: 'MFA Type', type: 'text' },
        session: { label: 'Session', type: 'text' },

        // Complete MFA setup (TOTP): session from VerifySoftwareToken
        completeMfaSetupSession: { label: 'Complete MFA Setup Session', type: 'text' }
      },
      authorize: async credentials => {
        const email = (credentials?.email as string) || undefined
        const password = (credentials?.password as string) || undefined
        const mfaCode = (credentials?.mfaCode as string) || undefined
        const mfaType = ((credentials?.mfaType as string) || 'SMS_MFA') as 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA'
        const sessionToken = (credentials?.session as string) || undefined
        const completeMfaSetupSession = (credentials?.completeMfaSetupSession as string) || undefined

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
          // Step 2: MFA RespondToAuthChallenge
          if (email && mfaCode && sessionToken) {
            const challengeName = mfaType === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : 'SMS_MFA'

            const challengeResponses: Record<string, string> = {
              USERNAME: email,
              [challengeName === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA_CODE' : 'SMS_MFA_CODE']: mfaCode
            }

            if (clientSecret) {
              const secretHash = createHmac('sha256', clientSecret)
                .update(email + resolvedClientId)
                .digest('base64')

              challengeResponses.SECRET_HASH = secretHash
            }

            const respond = new RespondToAuthChallengeCommand({
              ChallengeName: challengeName as any,
              ClientId: resolvedClientId,
              ChallengeResponses: challengeResponses,
              Session: sessionToken
            })

            const resp = await cognito.send(respond)
            const result = resp.AuthenticationResult

            if (!result?.IdToken) {
              throw new Error(JSON.stringify({ message: 'Código MFA inválido o expirado.' }))
            }

            const idPayload: any = decodeJwt(result.IdToken)
            const sub = idPayload?.sub as string
            const name = idPayload?.name as string | undefined
            const preferred_username = idPayload?.preferred_username as string | undefined
            const exp = idPayload?.exp as number | undefined

            return {
              id: sub,
              name: name || preferred_username || email || 'User',
              email,
              idToken: result.IdToken,
              accessToken: result.AccessToken,
              refreshToken: result.RefreshToken,
              expiresAt: exp
            } as any
          }

          // Step 3: Complete MFA_SETUP after VerifySoftwareToken
          if (email && completeMfaSetupSession) {
            const challengeResponses: Record<string, string> = { USERNAME: email }

            if (clientSecret) {
              const secretHash = createHmac('sha256', clientSecret)
                .update(email + resolvedClientId)
                .digest('base64')

              challengeResponses.SECRET_HASH = secretHash
            }

            const respondSetup = new RespondToAuthChallengeCommand({
              ChallengeName: 'MFA_SETUP' as any,
              ClientId: resolvedClientId,
              ChallengeResponses: challengeResponses,
              Session: completeMfaSetupSession
            })

            const setupResp = await cognito.send(respondSetup)
            const setupResult = setupResp.AuthenticationResult

            if (!setupResult?.IdToken) {
              throw new Error(JSON.stringify({ message: 'No se pudo completar la configuración de MFA.' }))
            }

            const idPayload: any = decodeJwt(setupResult.IdToken)
            const sub = idPayload?.sub as string
            const name = idPayload?.name as string | undefined
            const preferred_username = idPayload?.preferred_username as string | undefined
            const exp = idPayload?.exp as number | undefined

            return {
              id: sub,
              name: name || preferred_username || email || 'User',
              email,
              idToken: setupResult.IdToken,
              accessToken: setupResult.AccessToken,
              refreshToken: setupResult.RefreshToken,
              expiresAt: exp
            } as any
          }

          // Step 1: USER_PASSWORD_AUTH
          if (!email || !password) {
            throw new Error(JSON.stringify({ message: 'Email y contraseña son requeridos' }))
          }

          const authParameters: Record<string, string> = {
            USERNAME: email,
            PASSWORD: password
          }

          if (clientSecret) {
            const secretHash = createHmac('sha256', clientSecret)
              .update(email + resolvedClientId)
              .digest('base64')

            authParameters.SECRET_HASH = secretHash
          }

          const cmd = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: resolvedClientId,
            AuthParameters: authParameters
          })

          const resp = await cognito.send(cmd)
          const result = resp.AuthenticationResult

          if (!result && resp.ChallengeName) {
            if (resp.ChallengeName === 'SMS_MFA' || resp.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
              const dest = resp.ChallengeParameters?.CODE_DELIVERY_DESTINATION

              throw new Error(
                JSON.stringify({
                  code: 'MFA_REQUIRED',
                  challenge: resp.ChallengeName,
                  session: resp.Session,
                  destination: dest
                })
              )
            }

            if (resp.ChallengeName === 'MFA_SETUP') {
              throw new Error(
                JSON.stringify({
                  code: 'MFA_SETUP_REQUIRED',
                  session: resp.Session
                })
              )
            }

            if (resp.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
              throw new Error(JSON.stringify({ message: 'Debes actualizar tu contraseña antes de continuar.' }))
            }

            throw new Error(JSON.stringify({ message: `Se requiere completar el reto: ${resp.ChallengeName}` }))
          }

          if (!result?.IdToken) {
            throw new Error(JSON.stringify({ message: 'Autenticación fallida (sin IdToken)' }))
          }

          const idPayload: any = decodeJwt(result.IdToken)
          const sub = idPayload?.sub as string
          const emailClaim = idPayload?.email as string | undefined
          const name = idPayload?.name as string | undefined
          const preferred_username = idPayload?.preferred_username as string | undefined
          const exp = idPayload?.exp as number | undefined

          return {
            id: sub,
            name: name || preferred_username || emailClaim || email || 'User',
            email: emailClaim || email,
            idToken: result.IdToken,
            accessToken: result.AccessToken,
            refreshToken: result.RefreshToken,
            expiresAt: exp
          } as any
        } catch (e: any) {
          const code = e?.name || e?.__type
          const rawMessage = typeof e?.message === 'string' ? e.message : ''
          let message = 'Credenciales inválidas'

          // Bubble up MFA_REQUIRED/MFA_SETUP_REQUIRED as-is so the client can handle steps
          if (/MFA_REQUIRED|MFA_SETUP_REQUIRED/.test(rawMessage)) {
            throw new Error(rawMessage)
          }

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
    })

    // (Hosted UI Google removed per request to avoid redirects)

    // (Generic Hosted UI removed to keep auth in-app with Credentials + Google direct)
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.name = user.name
        const u: any = user

        if (u?.idToken) token.id_token = u.idToken
        if (u?.accessToken) token.access_token = u.accessToken
        if (u?.expiresAt) token.expires_at = u.expiresAt
      }

      if (account && profile) {
        token.access_token = (account as any).access_token
        token.id_token = (account as any).id_token
        token.expires_at = (account as any).expires_at

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
        session.user.name = token.name
        session.user.emailVerified = token.email_verified
        session.user.phoneNumber = token.phone_number
        session.user.cognitoGroups = token.cognito_groups
        session.user.preferredUsername = token.preferred_username
      }

      return session
    }
  }
}
