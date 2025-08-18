import { createHmac } from 'crypto'

import { NextResponse } from 'next/server'

import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'

const getConfig = () => {
  const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION
  const clientSecret = process.env.COGNITO_CLIENT_SECRET

  let fallback: any = null

  if (!clientId || !region) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fallback = require('../../../../../amplify_outputs.json')
    } catch {
      // ignore
    }
  }

  const resolvedClientId = clientId || fallback?.auth?.user_pool_client_id
  const resolvedRegion = region || fallback?.auth?.aws_region

  return { resolvedClientId, resolvedRegion, clientSecret }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || '')
    const password = String(body?.password || '')

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const { resolvedClientId, resolvedRegion, clientSecret } = getConfig()

    if (!resolvedClientId || !resolvedRegion) {
      return NextResponse.json(
        { ok: false, message: 'Configuración de Cognito incompleta (ClientId/Region)' },
        { status: 500 }
      )
    }

    const cognito = new CognitoIdentityProviderClient({ region: resolvedRegion })

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

    if (result?.IdToken) {
      // No MFA required, proceed to finish with NextAuth on client
      return NextResponse.json({ ok: true })
    }

    if (resp.ChallengeName === 'SMS_MFA' || resp.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
      return NextResponse.json({
        ok: false,
        code: 'MFA_REQUIRED',
        challenge: resp.ChallengeName,
        session: resp.Session,
        destination: resp.ChallengeParameters?.CODE_DELIVERY_DESTINATION
      })
    }

    if (resp.ChallengeName === 'MFA_SETUP') {
      return NextResponse.json({ ok: false, code: 'MFA_SETUP_REQUIRED', session: resp.Session })
    }

    return NextResponse.json(
      { ok: false, message: `Reto no soportado: ${resp.ChallengeName || 'desconocido'}` },
      { status: 400 }
    )
  } catch (e: any) {
    const code = e?.name || e?.__type
    let message = 'Error de autenticación'

    if (code === 'NotAuthorizedException') message = 'Usuario o contraseña incorrectos.'
    else if (code === 'UserNotConfirmedException') message = 'Usuario no confirmado. Revisa tu correo.'
    else if (code === 'TooManyRequestsException') message = 'Demasiados intentos. Intenta más tarde.'

    return NextResponse.json({ ok: false, message, code }, { status: 401 })
  }
}
