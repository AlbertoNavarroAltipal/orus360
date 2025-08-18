import { NextResponse } from 'next/server'

import { CognitoIdentityProviderClient, VerifySoftwareTokenCommand } from '@aws-sdk/client-cognito-identity-provider'

const getRegion = () => process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const session = String(body?.session || '')
    const code = String(body?.code || '')

    if (!session || !code) return NextResponse.json({ ok: false, message: 'Faltan session o code' }, { status: 400 })

    const region = getRegion()

    if (!region) return NextResponse.json({ ok: false, message: 'AWS_REGION no configurada' }, { status: 500 })

    const client = new CognitoIdentityProviderClient({ region })
    const cmd = new VerifySoftwareTokenCommand({ Session: session, UserCode: code })
    const resp = await client.send(cmd)

    if (resp.Status !== 'SUCCESS' || !resp.Session) {
      return NextResponse.json({ ok: false, message: 'Código TOTP inválido' }, { status: 400 })
    }

    // Return new session to complete MFA_SETUP with RespondToAuthChallenge
    return NextResponse.json({ ok: true, session: resp.Session })
  } catch (e: any) {
    const code = e?.name || e?.__type
    const message = e?.message || 'Error verificando software token'

    return NextResponse.json({ ok: false, code, message }, { status: 400 })
  }
}
