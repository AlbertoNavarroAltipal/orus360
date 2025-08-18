'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { signIn } from 'next-auth/react'

// MUI Imports
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { alpha, lighten, useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'

// Hooks

// Icons
import SecurityIcon from '@mui/icons-material/Security'
import GroupIcon from '@mui/icons-material/Group'
import LayersIcon from '@mui/icons-material/Layers'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import CloudIcon from '@mui/icons-material/Cloud'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LoginIcon from '@mui/icons-material/Login'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

import { useSettings } from '@core/hooks/useSettings'
import { useImageVariant } from '@core/hooks/useImageVariant'

export default function SuperAppLanding() {
  const theme = useTheme()
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const handleCognitoLogin = () => signIn('cognito', { callbackUrl: '/' })

  const logoSrc = useImageVariant(
    (settings.mode as any) ?? 'system',
    '/images/Altipal/logo_orus_azul_fondo_transparente_sin_texto.png',
    '/images/Altipal/logo_orus_blanco_fondo_transparente.png'
  )

  // Estado simple para "Crear ticket"
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [asunto, setAsunto] = useState('Soporte ORUS 360')
  const [mensaje, setMensaje] = useState('')

  const onCrearTicket = (e: React.FormEvent) => {
    e.preventDefault()

    const mailto = `mailto:soporte@orus360.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
      `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`
    )}`

    window.location.href = mailto
  }

  return (
    <Box
      sx={theme => ({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        backgroundImage:
          theme.palette.mode === 'light'
            ? `linear-gradient(135deg, #ffffff 0%, ${lighten(theme.palette.primary.main, 0.88)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`
      })}
    >
      {/* Header */}
      <AppBar
        position='fixed'
        color='default'
        elevation={settings.skin === 'bordered' ? 0 : 1}
        sx={theme => ({
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'saturate(180%) blur(10px)',
          WebkitBackdropFilter: 'saturate(180%) blur(10px)',
          borderBottom: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : undefined
        })}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt='ORUS logo' height={28} width={28} />
            <Typography variant='h6' color='inherit' noWrap>
              ORUS 360
            </Typography>
          </Box>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Button color='inherit' component={Link} href='#que-es'>
              ¿Qué es?
            </Button>
            <Button color='inherit' component={Link} href='#caracteristicas'>
              Características
            </Button>
            <Button color='inherit' component={Link} href='#faq'>
              Preguntas
            </Button>
            <Button color='inherit' component={Link} href='#ticket'>
              Crear ticket
            </Button>
            <Button
              href='https://us-east-1s5gznopkq.auth.us-east-1.amazoncognito.com/signup?client_id=5535e1dvldtrr2logi6sqfvkr6&code_challenge=0En9ycDofEFN2lHZGPTc751xoWMtEj23SHOCIq_dGek&code_challenge_method=S256&lang=es&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fcognito&response_type=code&scope=openid+email+profile&state=9LLxIGer2oFI1W_1XVJN_CeMyxeG-ErAxTsCNCJz5Vw'
              color='inherit'
              startIcon={<RocketLaunchIcon />}
            >
              Crear cuenta
            </Button>
            <Button variant='contained' color='primary' onClick={handleCognitoLogin} startIcon={<LoginIcon />}>
              Iniciar sesión en ORUS
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Spacer para header fijo */}
      <Toolbar />

      {/* Hero Section */}
      <Box
        id='hero'
        sx={theme => ({
          textAlign: 'center',
          pt: { xs: 14, md: 18 },
          pb: { xs: 10, md: 14 },
          backgroundImage: `radial-gradient(800px 400px at -10% -10%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 60%),
            radial-gradient(800px 400px at 110% -10%, ${alpha(theme.palette.primary.dark, 0.12)}, transparent 60%)`
        })}
      >
        <Container maxWidth='lg'>
          <Stack alignItems='center' spacing={2} sx={{ mb: 2 }}>
            <Chip
              label='Plataforma empresarial'
              color='primary'
              variant='outlined'
              size={isSmDown ? 'small' : 'medium'}
            />
          </Stack>
          <Typography variant='h3' component='h1' gutterBottom sx={{ fontWeight: 800 }}>
            ORUS 360: la super app corporativa para operar, colaborar y escalar
          </Typography>
          <Typography variant='h6' color='text.secondary' paragraph>
            Unifica procesos, datos y comunicación en una sola plataforma con seguridad empresarial.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' sx={{ mt: 4 }}>
            <Button
              variant='contained'
              size='large'
              color='primary'
              onClick={handleCognitoLogin}
              startIcon={<LoginIcon />}
            >
              Iniciar sesión en ORUS
            </Button>
            <Button
              variant='outlined'
              size='large'
              component={Link}
              href='#caracteristicas'
              startIcon={<RocketLaunchIcon />}
            >
              Ver características
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Barra de confianza (logos) */}
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Grid container spacing={3} alignItems='center' justifyContent='center'>
          {[
            '/images/logos/google.png',
            '/images/logos/github.png',
            '/images/logos/slack.png',
            '/images/logos/stripe.png',
            '/images/logos/aws.png'
          ].map((src, i) => (
            <Grid key={i} item xs={6} sm='auto'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt='logo confianza' height={22} style={{ opacity: 0.7 }} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ¿Qué es? */}
      <Container id='que-es' sx={{ py: { xs: 8, md: 12 } }} maxWidth='lg'>
        <Grid container spacing={8} alignItems='center'>
          <Grid item xs={12} md={6}>
            <Typography variant='h4' gutterBottom>
              ¿Qué es ORUS 360?
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              ORUS 360 es una plataforma modular que centraliza la operación corporativa en una sola experiencia:
              personas, procesos, datos y comunicación, con seguridad empresarial y escalabilidad.
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {[
                'Módulos plug-and-play para acelerar adopción.',
                'Seguridad y gobierno a nivel corporativo.',
                'Integración vía APIs con tu stack existente.'
              ].map((txt, i) => (
                <Stack key={i} direction='row' spacing={1.5} alignItems='center'>
                  <CheckCircleIcon color='primary' fontSize='small' />
                  <Typography variant='body1' color='text.secondary'>
                    {txt}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={theme => ({
                p: 4,
                textAlign: 'center',
                border: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : undefined,
                boxShadow: settings.skin === 'bordered' ? 'none' : undefined
              })}
              elevation={settings.skin === 'bordered' ? 0 : 3}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt='ORUS 360' height={80} />
              <Typography variant='subtitle1' sx={{ mt: 2 }}>
                Una sola plataforma. Todo tu negocio.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container id='caracteristicas' sx={{ py: { xs: 8, md: 12 } }} maxWidth='lg'>
        <Typography variant='h4' align='center' gutterBottom>
          Características principales
        </Typography>
        <Typography variant='body1' align='center' color='text.secondary' paragraph>
          Módulos listos para usar y extensibles vía APIs.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            {
              icon: <SecurityIcon fontSize='large' color='primary' />,
              title: 'Seguridad avanzada',
              desc: 'SSO, MFA y cumplimiento corporativo.'
            },
            {
              icon: <GroupIcon fontSize='large' color='primary' />,
              title: 'Colaboración',
              desc: 'Flujos de trabajo internos y externos unificados.'
            },
            {
              icon: <LayersIcon fontSize='large' color='primary' />,
              title: 'Módulos escalables',
              desc: 'Inventario, facturación, logística y más.'
            },
            {
              icon: <PhoneIphoneIcon fontSize='large' color='primary' />,
              title: 'Movilidad',
              desc: 'Aplicaciones móviles nativas con soporte offline.'
            },
            {
              icon: <CloudIcon fontSize='large' color='primary' />,
              title: 'Cloud-first',
              desc: 'Integraciones con tu stack de datos y BI.'
            },
            {
              icon: <CheckCircleIcon fontSize='large' color='primary' />,
              title: 'Cumplimiento',
              desc: 'Auditoría y controles granulares por rol.'
            }
          ].map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={theme => ({
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  border: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : 'none',
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow:
                      settings.skin === 'bordered' ? `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}` : undefined
                  }
                })}
                elevation={settings.skin === 'bordered' ? 0 : 2}
              >
                <Box
                  sx={theme => ({
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    mx: 'auto',
                    mb: 2,
                    display: 'grid',
                    placeItems: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.15)})`
                  })}
                >
                  {f.icon}
                </Box>
                <Typography variant='h6' gutterBottom>
                  {f.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {f.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Estadísticas / indicadores */}
      <Container maxWidth='lg' sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          {[
            { k: '99.9%', v: 'Uptime' },
            { k: '50+', v: 'Integraciones' },
            { k: '12', v: 'Módulos' },
            { k: 'SLA', v: 'Empresarial' }
          ].map((s, i) => (
            <Grid key={i} item xs={6} md={3}>
              <Card
                elevation={settings.skin === 'bordered' ? 0 : 1}
                sx={theme => ({
                  py: 4,
                  textAlign: 'center',
                  border: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : undefined
                })}
              >
                <Typography variant='h4' sx={{ fontWeight: 800 }}>
                  {s.k}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {s.v}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Preguntas frecuentes */}
      <Container id='faq' sx={{ py: { xs: 8, md: 12 } }} maxWidth='lg'>
        <Typography variant='h4' align='center' gutterBottom>
          Preguntas frecuentes
        </Typography>
        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>¿ORUS 360 reemplaza mis sistemas actuales?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color='text.secondary'>
                  ORUS 360 puede integrarse con sistemas existentes o reemplazarlos gradualmente. Comienza con los
                  módulos que más valor te aportan y escala a tu ritmo.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>¿Cómo funciona la seguridad y el acceso?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color='text.secondary'>
                  Contamos con SSO, MFA y controles por rol. Las auditorías y registros de actividad permiten cumplir
                  estándares corporativos.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>¿Puedo personalizar módulos?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color='text.secondary'>
                  Sí. Dispones de módulos listos y opciones de personalización e integración vía APIs para cubrir casos
                  específicos.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonios */}
      <Container id='testimonios' maxWidth='lg' sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant='h4' align='center' gutterBottom>
          Lo que dicen nuestros usuarios
        </Typography>
        <Grid container spacing={4} sx={{ mt: 1 }}>
          {[
            {
              name: 'María Gómez',
              role: 'Operaciones',
              text: 'Centralizamos procesos y aceleramos despliegues. El equipo adoptó ORUS 360 en semanas.'
            },
            {
              name: 'Juan Pérez',
              role: 'TI',
              text: 'Integraciones limpias y seguridad sólida. La gobernanza por rol nos dio tranquilidad.'
            },
            {
              name: 'Laura Martínez',
              role: 'Logística',
              text: 'Mejor visibilidad y menos fricción entre áreas. El flujo de trabajo es claro y medible.'
            }
          ].map((t, i) => (
            <Grid key={i} item xs={12} md={4}>
              <Card
                elevation={settings.skin === 'bordered' ? 0 : 1}
                sx={theme => ({
                  height: '100%',
                  p: 3,
                  border: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : undefined
                })}
              >
                <Typography color='text.secondary'>“{t.text}”</Typography>
                <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 3 }}>
                  <Avatar>{t.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant='subtitle2'>{t.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {t.role}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Colocar ticket */}
      <Container id='ticket' sx={{ py: { xs: 8, md: 12 } }} maxWidth='lg'>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
            <Card
              elevation={settings.skin === 'bordered' ? 0 : 3}
              sx={theme => ({
                border: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : undefined
              })}
            >
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  Crear ticket de soporte
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  Describe tu solicitud y nos pondremos en contacto. También puedes escribir a soporte@orus360.com.
                </Typography>
                <Box component='form' onSubmit={onCrearTicket} noValidate>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label='Nombre'
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        type='email'
                        label='Email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label='Asunto' value={asunto} onChange={e => setAsunto(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label='Mensaje'
                        value={mensaje}
                        onChange={e => setMensaje(e.target.value)}
                        required
                        multiline
                        minRows={4}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction='row' spacing={2}>
                        <Button type='submit' variant='contained'>
                          Enviar
                        </Button>
                        <Button variant='outlined' href='mailto:soporte@orus360.com'>
                          Enviar por correo
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA final */}
      <Box
        sx={theme => ({
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          backgroundImage: `radial-gradient(800px 400px at 50% 120%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 60%)`
        })}
      >
        <Container id='cta' maxWidth='lg'>
          <Typography variant='h4' gutterBottom>
            ¿Listo para empezar?
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Crea tu cuenta o inicia sesión para explorar ORUS 360.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant='contained' color='primary' onClick={handleCognitoLogin}>
              Iniciar sesión en ORUS
            </Button>
            <Button
              href='https://us-east-1s5gznopkq.auth.us-east-1.amazoncognito.com/signup?client_id=5535e1dvldtrr2logi6sqfvkr6&code_challenge=0En9ycDofEFN2lHZGPTc751xoWMtEj23SHOCIq_dGek&code_challenge_method=S256&lang=es&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fcognito&response_type=code&scope=openid+email+profile&state=9LLxIGer2oFI1W_1XVJN_CeMyxeG-ErAxTsCNCJz5Vw'
              variant='outlined'
              sx={{ ml: 2 }}
            >
              Crear cuenta
            </Button>
          </Box>
        </Container>
      </Box>

      <Divider />

      {/* Footer */}
      <Box component='footer' sx={theme => ({ py: 4, mt: 'auto', bgcolor: theme.palette.background.paper })}>
        <Container sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant='body2' color='text.secondary'>
            © {new Date().getFullYear()} ORUS 360. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href='/terms' passHref>
              <Typography variant='body2' color='text.secondary' sx={{ cursor: 'pointer' }}>
                Términos
              </Typography>
            </Link>
            <Link href='/privacy' passHref>
              <Typography variant='body2' color='text.secondary' sx={{ cursor: 'pointer' }}>
                Privacidad
              </Typography>
            </Link>
            <Link href='/security' passHref>
              <Typography variant='body2' color='text.secondary' sx={{ cursor: 'pointer' }}>
                Seguridad
              </Typography>
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
