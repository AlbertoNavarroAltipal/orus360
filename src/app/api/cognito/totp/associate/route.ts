import { NextResponse } from 'next/server'

import { AssociateSoftwareTokenCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

const getRegion = () => process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const session = String(body?.session || '')

    if (!session) return NextResponse.json({ ok: false, message: 'Falta session de MFA_SETUP' }, { status: 400 })

    const region = getRegion()

    if (!region) return NextResponse.json({ ok: false, message: 'AWS_REGION no configurada' }, { status: 500 })

    const client = new CognitoIdentityProviderClient({ region })
    const cmd = new AssociateSoftwareTokenCommand({ Session: session })
    const resp = await client.send(cmd)

    if (!resp.SecretCode || !resp.Session) {
      return NextResponse.json({ ok: false, message: 'No se pudo generar el secreto TOTP' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, secret: resp.SecretCode, session: resp.Session })
  } catch (e: any) {
    const code = e?.name || e?.__type
    const message = e?.message || 'Error asociando software token'

    return NextResponse.json({ ok: false, code, message }, { status: 400 })
  }
}
