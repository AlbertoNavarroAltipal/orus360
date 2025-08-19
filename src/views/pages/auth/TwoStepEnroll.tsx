'use client'

import { useEffect, useMemo, useState } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'

import { OTPInput } from 'input-otp'
import QRCode from 'qrcode'
import classnames from 'classnames'

import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

import Form from '@components/Form'
import Link from '@components/Link'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

import { useImageVariant } from '@core/hooks/useImageVariant'
import { getLocalizedUrl } from '@/utils/i18n'

import styles from '@/libs/styles/inputOtp.module.css'

// Esta página asume que tras confirmar registro guardamos email y password temporalmente en sessionStorage
// y que el servidor (preflight / creds provider) devolverá MFA_SETUP_REQUIRED para iniciar asociación TOTP.

const TwoStepEnroll = ({ mode }: { mode: Mode }) => {
  const [otp, setOtp] = useState('')
  const [secret, setSecret] = useState<string | null>(null)
  const [session, setSession] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'
  const { lang: locale } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const email = useMemo(() => (typeof window !== 'undefined' ? sessionStorage.getItem('enroll:email') || '' : ''), [])

  const password = useMemo(
    () => (typeof window !== 'undefined' ? sessionStorage.getItem('enroll:password') || '' : ''),
    []
  )

  useEffect(() => {
    const run = async () => {
      if (!email || !password) {
        router.replace(getLocalizedUrl('/login', locale as Locale))

        return
      }

      setError(null)
      setLoading(true)

      try {
        const res = await fetch('/api/cognito/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const json = await res.json().catch(() => null)

        if (json?.code === 'MFA_SETUP_REQUIRED' && json?.session) {
          const assoc = await fetch('/api/cognito/totp/associate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: json.session })
          })

          const assocJson = await assoc.json().catch(() => null)

          if (assoc.ok && assocJson?.secret && assocJson?.session) {
            setSecret(assocJson.secret)
            setSession(assocJson.session)
          } else {
            setError(assocJson?.message || 'No se pudo iniciar la configuración de TOTP')
          }

          return
        }

        if (res.ok) {
          router.replace(getLocalizedUrl('/login', locale as Locale))
        } else {
          setError(json?.message || 'Error iniciando enrolamiento')
        }
      } finally {
        setLoading(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const issuer = 'ORUS'

  const otpauth =
    secret && email
      ? `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
      : ''

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const gen = async () => {
      if (!otpauth) {
        setQrDataUrl(null)

        return
      }

      try {
        const url = await QRCode.toDataURL(otpauth, { margin: 1, scale: 4 })

        setQrDataUrl(url)
      } catch {
        setQrDataUrl(null)
      }
    }

    gen()
  }, [otpauth])

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session || !otp || !email || !password) return

    setLoading(true)
    setError(null)

    try {
      const verify = await fetch('/api/cognito/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, code: otp })
      })

      const verifyJson = await verify.json().catch(() => null)

      if (!verify.ok || !verifyJson?.session) {
        const friendly =
          verifyJson?.code === 'EnableSoftwareTokenMFAException'
            ? 'Código TOTP incorrecto. Intenta de nuevo.'
            : verifyJson?.message || 'Código TOTP inválido'

        setError(friendly)

        return
      }

      const res = await (
        await import('next-auth/react')
      ).signIn('credentials', {
        email,
        password,
        completeMfaSetupSession: verifyJson.session,
        redirect: false
      })

      if (res?.ok && !res.error) {
        sessionStorage.removeItem('enroll:email')
        sessionStorage.removeItem('enroll:password')
        const redirectURL = searchParams.get('redirectTo') ?? '/'

        router.replace(getLocalizedUrl(redirectURL, locale as Locale))

        return
      }

      let message = 'No se pudo completar la configuración MFA.'

      if (res?.error) {
        try {
          const parsed = JSON.parse(res.error)

          message = Array.isArray(parsed?.message) ? parsed.message[0] : (parsed?.message ?? message)
        } catch {
          message = res.error
        }
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-1'>
              <Typography variant='h4'>Configura tu app autenticadora</Typography>
              <Typography>
                Escanea el QR o agrega la clave manualmente y luego escribe el código de 6 dígitos.
              </Typography>
            </div>
            {secret ? (
              <>
                {qrDataUrl ? (
                  <div className='flex flex-col items-center gap-2'>
                    <img src={qrDataUrl || undefined} alt='QR TOTP' className='rounded border' />
                    <Typography variant='body2' className='text-center'>
                      Escanea este QR con Google Authenticator u otra app TOTP.
                    </Typography>
                  </div>
                ) : (
                  <TextField
                    fullWidth
                    label='URI TOTP'
                    value={otpauth}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Tooltip title='Copiar URI'>
                            <IconButton size='small' onClick={() => navigator.clipboard.writeText(otpauth)}>
                              <i className='ri-file-copy-line' />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                      }
                    }}
                  />
                )}
                <TextField
                  fullWidth
                  label='Clave manual'
                  value={secret}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Tooltip title='Copiar clave'>
                          <IconButton size='small' onClick={() => navigator.clipboard.writeText(secret)}>
                            <i className='ri-file-copy-line' />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
                <Form noValidate autoComplete='off' className='flex flex-col gap-5' onSubmit={onVerify}>
                  <div className='flex flex-col gap-2'>
                    <Typography>Ingresa tu código de 6 dígitos</Typography>
                    <OTPInput
                      onChange={setOtp}
                      value={otp}
                      maxLength={6}
                      containerClassName='flex items-center'
                      render={({ slots }) => (
                        <div className='flex items-center justify-between w-full gap-4'>
                          {slots.slice(0, 6).map((slot, idx) => (
                            <div key={idx} className={classnames(styles.slot, { [styles.slotActive]: slot.isActive })}>
                              {slot.char !== null && <div>{slot.char}</div>}
                              {slot.hasFakeCaret && (
                                <div className={styles.fakeCaret}>
                                  <div className='w-px h-5 bg-textPrimary' />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                  <Button fullWidth variant='contained' type='submit' disabled={loading}>
                    Verificar TOTP
                  </Button>
                  {error && <Alert severity='error'>{error}</Alert>}
                </Form>
              </>
            ) : (
              <Typography variant='body2'>Preparando enrolamiento TOTP...</Typography>
            )}
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default TwoStepEnroll
