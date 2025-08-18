'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

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

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import classnames from 'classnames'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type ErrorType = {
  message: string[]
}

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Please enter a valid email address')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isMfaStep, setIsMfaStep] = useState(false)
  const [mfaSession, setMfaSession] = useState<string | null>(null)
  const [mfaType, setMfaType] = useState<'SMS_MFA' | 'SOFTWARE_TOKEN_MFA'>('SMS_MFA')
  const [mfaDestination, setMfaDestination] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')

  // TOTP setup se maneja en la página dedicada de Two Step

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: 'admin@materio.com',
      password: 'admin'
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async data => {
    // Step 2: MFA
    if (isMfaStep) {
      if (!mfaSession || !mfaCode) {
        setErrorState({ message: ['Ingresa el código MFA.'] })

        return
      }

      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        mfaCode,
        mfaType,
        session: mfaSession,
        redirect: false
      })

      if (res?.ok && !res.error) {
        const redirectURL = searchParams.get('redirectTo') ?? '/'

        router.replace(getLocalizedUrl(redirectURL, locale as Locale))

        return
      }

      let message = 'Código inválido o expirado'

      if (res?.error) {
        try {
          const parsed = JSON.parse(res.error)

          message = Array.isArray(parsed?.message) ? parsed.message[0] : (parsed?.message ?? message)
        } catch {
          message = res.error
        }
      }

      setErrorState({ message: [message] })

      return
    }

    // Step 1: email + password (preflight to detect MFA_REQUIRED/MFA_SETUP)
    const res = await fetch('/api/cognito/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password })
    })

    if (res.ok) {
      // No MFA required (según preflight), intentamos finalizar con NextAuth credentials
      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (signInRes?.ok && !signInRes.error) {
        const redirectURL = searchParams.get('redirectTo') ?? '/'

        router.replace(getLocalizedUrl(redirectURL, locale as Locale))

        return
      }

      // Si NextAuth devolvió un reto igualmente, manejarlo aquí
      if (signInRes?.error) {
        try {
          const parsed = JSON.parse(signInRes.error)

          if (parsed?.code === 'MFA_REQUIRED') {
            setIsMfaStep(true)
            setMfaSession(parsed.session)
            setMfaType(parsed.challenge === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : 'SMS_MFA')
            setMfaDestination(parsed.destination || null)
            setErrorState({ message: ['Ingresa el código MFA enviado.'] })

            return
          }

          if (parsed?.code === 'MFA_SETUP_REQUIRED') {
            // Guardar credenciales mínimas para Two Step y redirigir
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem('enroll:email', watch('email'))
                sessionStorage.setItem('enroll:password', watch('password'))
              } catch {}
            }

            router.replace(getLocalizedUrl('/pages/auth/two-step', locale as Locale))

            return
          }

          const message = Array.isArray(parsed?.message) ? parsed.message[0] : parsed?.message

          if (message) setErrorState({ message: [message] })
        } catch {
          setErrorState({ message: [signInRes.error] })
        }
      }
    } else {
      const dataJson = await res.json().catch(() => null)

      if (dataJson?.code === 'MFA_REQUIRED') {
        setIsMfaStep(true)
        setMfaSession(dataJson.session)
        setMfaType(dataJson.challenge === 'SOFTWARE_TOKEN_MFA' ? 'SOFTWARE_TOKEN_MFA' : 'SMS_MFA')
        setMfaDestination(dataJson.destination || null)
        setErrorState({ message: ['Ingresa el código MFA enviado.'] })

        return
      }

      if (dataJson?.code === 'MFA_SETUP_REQUIRED') {
        // Redirigir a Two Step y no manejar enrolamiento en esta pantalla
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('enroll:email', data.email)
            sessionStorage.setItem('enroll:password', data.password)
          } catch {}
        }

        router.replace(getLocalizedUrl('/pages/auth/two-step', locale as Locale))

        return
      }
    }

    // Si nada de lo anterior funcionó, muestra error genérico
    setErrorState({ message: ['Invalid credentials'] })
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
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          <Alert icon={false} className='bg-primaryLight'>
            <Typography variant='body2' color='primary.main'>
              Email: <span className='font-medium'>admin@materio.com</span> / Pass:{' '}
              <span className='font-medium'>admin</span>
            </Typography>
          </Alert>

          <form
            noValidate
            action={() => {}}
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type='email'
                  label='Email'
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  {...((errors.email || errorState !== null) && {
                    error: true,
                    helperText: errors?.email?.message || errorState?.message[0]
                  })}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  disabled={isMfaStep}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            {isMfaStep && (
              <TextField
                fullWidth
                label={`Código MFA${mfaDestination ? ` (${mfaDestination})` : ''}`}
                value={mfaCode}
                onChange={e => {
                  setMfaCode(e.target.value)
                  errorState !== null && setErrorState(null)
                }}
              />
            )}
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
              <Typography className='text-end' color='primary.main' component={Link} href='/forgot-password'>
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit'>
              {isMfaStep ? 'Confirmar MFA' : 'Log In'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href='/register' color='primary.main'>
                Create an account
              </Typography>
            </div>
          </form>
          <Divider className='gap-3'>or</Divider>
          <Button
            color='secondary'
            className='self-center text-textPrimary'
            startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
            sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </Button>
          {!isMfaStep && <Button onClick={() => signIn('cognito', { callbackUrl: '/' })}>Sign in with Cognito</Button>}
        </div>
      </div>
    </div>
  )
}

export default Login
