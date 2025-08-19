'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { signIn } from 'next-auth/react'

// AWS Amplify Auth (modular v6)
import { signUp as cognitoSignUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
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

const RegisterV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<'form' | 'confirm' | 'done'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

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

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  // Configure Amplify once on mount
  useEffect(() => {
    configureAmplify()
  }, [])

  const canSubmit = useMemo(() => {
    if (stage === 'form') return !!email && !!password && acceptTerms
    if (stage === 'confirm') return !!email && !!code

    return false
  }, [stage, email, password, code, acceptTerms])

  const handleSignUp = async () => {
    if (loading) return
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      // In this user pool, email is the username
      await cognitoSignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: username || undefined
          },
          autoSignIn: false
        }
      })
      setStage('confirm')
      setInfo('Te enviamos un código a tu correo para confirmar tu cuenta.')
    } catch (e: any) {
      const msg = e?.message || ''
      const name = e?.name || ''

      if (name === 'NotAuthorizedException' || msg.includes('SignUp is not permitted')) {
        setError(
          'El registro de usuarios está deshabilitado en este User Pool. Pide al administrador que habilite el self sign-up o usa el botón "Continuar con Cognito" si tu Hosted UI lo permite.'
        )
      } else if (name === 'UsernameExistsException') {
        // El usuario ya existe (puede estar sin confirmar). Ofrecer pasar a confirmación y reenvío de código.
        setStage('confirm')
        setInfo(
          'El usuario ya existe. Si no confirmaste, ingresa el código que recibiste o solicita reenviar el código.'
        )
      } else if (name === 'LimitExceededException' || /Attempt limit exceeded/i.test(msg)) {
        setError('Demasiados intentos. Intenta de nuevo en unos minutos.')
      } else {
        setError(msg || 'Error al registrar. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (loading) return
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      await confirmSignUp({ username: email, confirmationCode: code })
      setStage('done')
      setInfo('Cuenta confirmada. Redirigiendo a verificación en 2 pasos...')

      // Guardar temporalmente para el enrolamiento TOTP en Two Step
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('enroll:email', email)
          sessionStorage.setItem('enroll:password', password)
        } catch {
          // ignore
        }
      }

      // Redirigir a la nueva página de Two Step para completar MFA (TOTP) dentro de la app
      router.replace(getLocalizedUrl('/pages/auth/two-step', locale as any))
    } catch (e: any) {
      setError(e?.message || 'Error al confirmar el código.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      await resendSignUpCode({ username: email })
      setInfo('Código reenviado. Revisa tu correo.')
    } catch (e: any) {
      setError(e?.message || 'No se pudo reenviar el código.')
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
          image1={{ src: '/images/illustrations/objects/tree-3.png' }}
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
            <Typography variant='h4'>Adventure starts here 🚀</Typography>
            <Typography className='mbe-1'>Make your app management easy and fun!</Typography>
          </div>
          <form
            noValidate
            autoComplete='off'
            onSubmit={e => {
              e.preventDefault()
              if (stage === 'form') handleSignUp()
              else if (stage === 'confirm') handleConfirm()
            }}
            className='flex flex-col gap-5'
          >
            {error ? <Alert severity='error'>{error}</Alert> : null}
            {info ? <Alert severity='info'>{info}</Alert> : null}

            {stage === 'form' && (
              <>
                <TextField
                  autoFocus
                  fullWidth
                  label='Nombre (opcional)'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <TextField
                  fullWidth
                  type='email'
                  label='Email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label='Password'
                  type={isPasswordShown ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
                <div className='flex justify-between items-center gap-3'>
                  <FormControlLabel
                    control={<Checkbox checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />}
                    label={
                      <>
                        <span>Acepto </span>
                        <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                          la política de privacidad y términos
                        </Link>
                      </>
                    }
                  />
                </div>
              </>
            )}

            {stage === 'confirm' && (
              <>
                <TextField
                  fullWidth
                  label='Código de verificación'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  inputMode='numeric'
                />
                <div className='flex justify-between'>
                  <Button variant='text' onClick={handleResend} disabled={loading}>
                    Reenviar código
                  </Button>
                </div>
              </>
            )}

            <Button fullWidth variant='contained' type='submit' disabled={!canSubmit || loading}>
              {loading ? <CircularProgress size={18} /> : stage === 'form' ? 'Crear cuenta' : 'Confirmar'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>¿Ya tienes cuenta?</Typography>
              <Typography component={Link} href='/login' color='primary.main'>
                Inicia sesión
              </Typography>
            </div>
            <Divider className='gap-3'>o</Divider>
            <div className='flex justify-center items-center gap-2'>
              <IconButton size='small' onClick={() => signIn('google')}>
                <i className='ri-google-fill text-googlePlus' />
              </IconButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterV2
