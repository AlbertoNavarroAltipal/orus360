'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import classnames from 'classnames'
import { OTPInput } from 'input-otp'

// Type Imports
// Amplify Auth Imports
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth'

import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { configureAmplify } from '@/libs/amplify/config'

// Styles
import styles from '@/libs/styles/inputOtp.module.css'

const ForgotPasswordV2 = ({ mode }: { mode: Mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { settings } = useSettings()

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  // Configure Amplify once on mount
  useEffect(() => {
    configureAmplify()
  }, [])

  // State
  const [stage, setStage] = useState<'request' | 'confirm'>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email) {
      setError('Ingresa tu email.')

      return
    }

    setLoading(true)

    try {
      await resetPassword({ username: email })
      setStage('confirm')
      setSuccess('Te enviamos un código de verificación a tu correo.')
    } catch (err: any) {
      const name = err?.name as string
      const msg = err?.message as string

      if (name === 'UserNotFoundException') setError('No existe una cuenta con ese correo.')
      else if (name === 'LimitExceededException') setError('Demasiados intentos. Intenta de nuevo más tarde.')
      else setError(msg || 'No se pudo enviar el código. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!code || code.length < 6) {
      setError('Ingresa el código de 6 dígitos.')

      return
    }

    if (!password || password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')

      return
    }

    if (password !== password2) {
      setError('Las contraseñas no coinciden.')

      return
    }

    setLoading(true)

    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword: password })
      setSuccess('Contraseña actualizada. Redirigiendo al login...')
      setTimeout(() => {
        router.replace(getLocalizedUrl('/login', locale as Locale))
      }, 1200)
    } catch (err: any) {
      const name = err?.name as string
      const msg = err?.message as string

      if (name === 'CodeMismatchException') setError('Código inválido. Verifica e intenta nuevamente.')
      else if (name === 'ExpiredCodeException') setError('El código expiró. Solicita uno nuevo.')
      else setError(msg || 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!email) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await resetPassword({ username: email })
      setSuccess('Código reenviado a tu correo.')
    } catch (err: any) {
      setError(err?.message || 'No se pudo reenviar el código.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='plb-12 pis-12'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div>
        <Illustrations
          image1={{ src: '/images/illustrations/objects/tree-2.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Recuperar contraseña 🔒</Typography>
            <Typography className='mbs-1'>
              {stage === 'request'
                ? 'Ingresa tu email y te enviaremos un código para restablecer tu contraseña.'
                : 'Ingresa el código recibido y tu nueva contraseña.'}
            </Typography>
          </div>

          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {stage === 'request' ? (
            <form noValidate autoComplete='off' onSubmit={handleRequest} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                type='email'
                label='Email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading}>
                Enviar código
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center'>
                  <i className='ri-arrow-left-s-line' />
                  <span>Volver al Login</span>
                </Link>
              </Typography>
            </form>
          ) : (
            <form noValidate autoComplete='off' onSubmit={handleConfirm} className='flex flex-col gap-5'>
              <TextField fullWidth type='email' label='Email' value={email} InputProps={{ readOnly: true }} />
              <div className='flex flex-col gap-2'>
                <Typography>Código de verificación</Typography>
                <OTPInput
                  onChange={val => setCode(val)}
                  value={code}
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
              <TextField
                fullWidth
                label='Nueva contraseña'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setShowPassword(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <TextField
                fullWidth
                label='Confirmar contraseña'
                type={showPassword ? 'text' : 'password'}
                value={password2}
                onChange={e => setPassword2(e.target.value)}
              />
              <div className='flex gap-3'>
                <Button className='flex-1' variant='outlined' type='button' disabled={loading} onClick={resendCode}>
                  Reenviar código
                </Button>
                <Button className='flex-1' variant='contained' type='submit' disabled={loading}>
                  Actualizar contraseña
                </Button>
              </div>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center'>
                  <i className='ri-arrow-left-s-line' />
                  <span>Volver al Login</span>
                </Link>
              </Typography>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordV2
