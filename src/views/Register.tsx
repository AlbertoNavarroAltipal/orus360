'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

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

// =============================
// CONFIG
// =============================
// Para exponer en el cliente, usa NEXT_PUBLIC_URL_ORUS_API en .env
// Ejemplo: NEXT_PUBLIC_URL_ORUS_API=http://localhost:3001
const API_BASE = process.env.NEXT_PUBLIC_URL_ORUS_API || ''

// Helper para componer mensajes de error de la API NestJS
function extractErrorMessage(err: unknown): string {
  try {
    if (typeof err === 'string') return err

    // Si viene de fetch response.json()
    if (err && typeof err === 'object') {
      const anyErr = err as any
      const msg = anyErr?.message

      if (Array.isArray(msg)) return msg.join(' \n')
      if (typeof msg === 'string' && msg.trim()) return msg

      if (anyErr?.statusCode) {
        return `Error ${anyErr.statusCode}.` + (anyErr?.path ? ` (${anyErr.path})` : '')
      }
    }
  } catch (_) {}
  return 'Ocurrió un error inesperado.'
}

async function registerUser(payload: { full_name?: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw data || { statusCode: res.status, message: 'Registro falló' }
  }

  return data as {
    statusCode: number
    message: string
    data: {
      id: string
      full_name: string
      email: string
      master_token: string
      created_at: string
      updated_at: string
      message?: string
    }
  }
}

const RegisterV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
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

  // Eliminado: Amplify/Cognito
  useEffect(() => {
    // No-op: dejamos aquí por si en el futuro se requiere inicialización
  }, [])

  const canSubmit = useMemo(() => {
    return !!email && !!password && acceptTerms
  }, [email, password, acceptTerms])

  const handleSignUp = async () => {
    if (loading) return
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const payload = {
        full_name: username?.trim() || undefined,
        email: email.trim(),
        password
      }

      const res = await registerUser(payload)

      // Guarda el master_token temporalmente si necesitas onboarding inmediato
      try {
        sessionStorage.setItem('orus:master_token', res.data.master_token)
        sessionStorage.setItem('orus:email', res.data.email)
      } catch {}

      setInfo(res?.data?.message || 'Usuario registrado exitosamente.')

      // Redirige a login (o a onboarding si ya existe)
      setTimeout(() => {
        router.replace(getLocalizedUrl('/login', (locale as Locale) || 'es'))
      }, 1200)
    } catch (e) {
      setError(extractErrorMessage(e))
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
          href={getLocalizedUrl('/', (locale as Locale) || 'es')}
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
              handleSignUp()
            }}
            className='flex flex-col gap-5'
          >
            {error ? <Alert severity='error'>{error}</Alert> : null}
            {info ? <Alert severity='info'>{info}</Alert> : null}

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

            <Button fullWidth variant='contained' type='submit' disabled={!canSubmit || loading}>
              {loading ? <CircularProgress size={18} /> : 'Crear cuenta'}
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
