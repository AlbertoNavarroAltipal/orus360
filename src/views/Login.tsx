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
  statusCode?: number
}

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), minLength(1, 'Este campo es requerido'), email('Por favor ingresa un email válido')),
  password: pipe(string(), nonEmpty('Este campo es requerido'), minLength(1, 'La contraseña es requerida'))
})

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState<ErrorType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
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
    setIsLoading(true)
    setErrorState(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.ok && !result.error) {
        // Login exitoso
        const redirectURL = searchParams.get('redirectTo') ?? '/'
        router.replace(getLocalizedUrl(redirectURL, locale as Locale))
        return
      }

      // Manejar errores
      if (result?.error) {
        try {
          const parsedError = JSON.parse(result.error)
          const statusCode = parsedError.statusCode || 401
          const messages = Array.isArray(parsedError.message)
            ? parsedError.message
            : [parsedError.message || 'Error de autenticación']

          setErrorState({
            message: messages,
            statusCode
          })
        } catch {
          // Si no se puede parsear el error, usar el error directo
          setErrorState({
            message: [result.error || 'Error de autenticación'],
            statusCode: 401
          })
        }
      } else {
        setErrorState({
          message: ['Error de autenticación. Por favor intenta nuevamente.'],
          statusCode: 500
        })
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setErrorState({
        message: ['Error de conexión. Por favor intenta nuevamente.'],
        statusCode: 500
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: getLocalizedUrl(searchParams.get('redirectTo') || '/', locale as Locale)
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      setErrorState({
        message: ['Error al iniciar sesión con Google. Por favor intenta nuevamente.'],
        statusCode: 500
      })
    }
  }

  // Función para obtener el tipo de alerta basado en el código de estado
  const getAlertSeverity = (statusCode?: number) => {
    if (!statusCode) return 'error'
    if (statusCode >= 400 && statusCode < 500) return 'warning'
    return 'error'
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
            <Typography variant='h4'>{`¡Bienvenido a ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Por favor inicia sesión en tu cuenta y comienza la aventura</Typography>
          </div>

          <Button
            fullWidth
            color='secondary'
            variant='outlined'
            size='large'
            disabled={isLoading}
            startIcon={<img src='/images/logos/google.png' alt='Google' width={20} height={20} />}
            onClick={handleGoogleSignIn}
            sx={{
              '& .MuiButton-startIcon': { marginInlineEnd: 2 },
              borderColor: '#dadce0',
              color: '#3c4043',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#dadce0'
              }
            }}
          >
            {isLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
          </Button>

          <Divider className='gap-3'>o</Divider>

          {errorState && (
            <Alert severity={getAlertSeverity(errorState.statusCode)} onClose={() => setErrorState(null)}>
              <div>
                {errorState.message.map((msg, index) => (
                  <div key={index}>{msg}</div>
                ))}
              </div>
            </Alert>
          )}

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
                  disabled={isLoading}
                  onChange={e => {
                    field.onChange(e.target.value)
                    if (errorState !== null) setErrorState(null)
                  }}
                  error={!!errors.email}
                  helperText={errors?.email?.message}
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
                  label='Contraseña'
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  disabled={isLoading}
                  onChange={e => {
                    field.onChange(e.target.value)
                    if (errorState !== null) setErrorState(null)
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            disabled={isLoading}
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
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label='Recordarme' disabled={isLoading} />
              <Typography className='text-end' color='primary.main' component={Link} href='/forgot-password'>
                ¿Olvidaste tu contraseña?
              </Typography>
            </div>

            <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>¿Nuevo en nuestra plataforma?</Typography>
              <Typography component={Link} href='/register' color='primary.main'>
                Crear una cuenta
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
