import { createHmac } from 'crypto'

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminSetUserPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider'

const decodeJwt = (token: string) => {
  const payload = token.split('.')[1]
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const json = Buffer.from(b64, 'base64').toString('utf-8')

  return JSON.parse(json)
}

// Upsert de usuario en Cognito a partir del perfil de Google
const upsertCognitoUserFromGoogle = async (profile: any, account?: any) => {
  const email: string | undefined = profile?.email

  if (!email) return

  // Region & UserPoolId
  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION
  let userPoolId = process.env.COGNITO_USER_POOL_ID as string | undefined

  if (!region || !userPoolId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fallback = require('../../amplify_outputs.json')

      userPoolId = userPoolId || fallback?.auth?.user_pool_id
    } catch {
      // ignore
    }
  }

  if (!region || !userPoolId) return

  const client = new CognitoIdentityProviderClient({ region })

  // Buscar por email
  const listCmd = new ListUsersCommand({
    UserPoolId: userPoolId,
    Filter: `email = \"${email}\"`
  })

  const listRes = await client.send(listCmd)
  const existing = listRes.Users && listRes.Users[0]

  // Mapear atributos desde Google (usar lo disponible por scopes actuales)
  const attrs: { Name: string; Value: string }[] = []

  const pushIf = (name: string, val?: any) => {
    if (typeof val === 'undefined' || val === null) return

    const str = typeof val === 'string' ? val : String(val)

    attrs.push({ Name: name, Value: str })
  }

  pushIf('email', profile?.email)
  pushIf('email_verified', profile?.email_verified ? 'true' : 'false')
  pushIf('name', profile?.name)
  pushIf('given_name', profile?.given_name)
  pushIf('family_name', profile?.family_name)
  pushIf('picture', profile?.picture)

  // Intentar enriquecer con Google People API si hay access_token y scopes
  try {
    const accessToken = account?.access_token

    if (accessToken) {
      const resp = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=genders,birthdays,phoneNumbers',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (resp.ok) {
        const people: any = await resp.json()
        const genderVal = people?.genders?.[0]?.value
        const phoneVal = people?.phoneNumbers?.[0]?.value
        const b = people?.birthdays?.[0]?.date

        const birthdate =
          b && b.year && b.month && b.day
            ? `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`
            : undefined

        pushIf('gender', genderVal)
        pushIf('phone_number', phoneVal)
        pushIf('birthdate', birthdate)
      }
    }
  } catch {
    // Ignorar fallo de People API
  }

  // Datos sensibles que requieren scopes adicionales: gender, birthdate, phone_number
  // pushIf('gender', profile?.gender)
  // pushIf('birthdate', profile?.birthdate)
  // pushIf('phone_number', profile?.phone_number)
  // preferred_username con el sub de Google

  pushIf('preferred_username', profile?.sub)

  if (!existing) {
    // Crear usuario con Username = email, sin enviar invitación
    const createCmd = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      MessageAction: 'SUPPRESS',
      UserAttributes: attrs
    })

    await client.send(createCmd)

    // Establecer contraseña permanente aleatoria para evitar FORCE_CHANGE_PASSWORD
    try {
      const tempPass = `${Math.random().toString(36).slice(2)}A9!${Math.random().toString(36).slice(2)}`

      const setPassCmd = new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: email,
        Password: tempPass,
        Permanent: true
      })

      await client.send(setPassCmd)
    } catch {
      // Ignorar si la política no permite setear password
    }
  } else {
    // Actualizar atributos existentes con datos de Google como fuente de verdad
    const updateCmd = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: existing.Username as string,
      UserAttributes: attrs
    })

    await client.send(updateCmd)

    // Si quedó en FORCE_CHANGE_PASSWORD, establecer contraseña permanente para pasarlo a CONFIRMED
    if (existing.UserStatus === 'FORCE_CHANGE_PASSWORD') {
      try {
        const tempPass = `${Math.random().toString(36).slice(2)}A9!${Math.random().toString(36).slice(2)}`

        const setPassCmd = new AdminSetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: existing.Username as string,
          Password: tempPass,
          Permanent: true
        })

        await client.send(setPassCmd)
      } catch {
        // no-op
      }
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },

        // Extra fields for MFA second-step
        mfaCode: { label: 'Código MFA', type: 'text' },
        mfaType: { label: 'Tipo de MFA', type: 'text' },
        session: { label: 'Sesión', type: 'text' },

        // Complete MFA setup (TOTP): session from VerifySoftwareToken
        completeMfaSetupSession: { label: 'Sesión para completar configuración MFA', type: 'text' }
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
              name: name || preferred_username || email || 'Usuario',
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
              name: name || preferred_username || email || 'Usuario',
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
            name: name || preferred_username || emailClaim || email || 'Usuario',
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
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: process.env.GOOGLE_SCOPES || 'openid email profile'
        }
      }
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
        // Si viene de Google, sincroniza/crea el usuario en Cognito con datos de Google como fuente de verdad
        if (account.provider === 'google') {
          try {
            await upsertCognitoUserFromGoogle(profile, account)
          } catch {
            // no-op
          }
        }

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
