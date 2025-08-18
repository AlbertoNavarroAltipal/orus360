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
import Paper from '@mui/material/Paper'
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

// Hooks

// Icons
import SecurityIcon from '@mui/icons-material/Security'
import GroupIcon from '@mui/icons-material/Group'
import LayersIcon from '@mui/icons-material/Layers'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import CloudIcon from '@mui/icons-material/Cloud'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useSettings } from '@core/hooks/useSettings'
import { useImageVariant } from '@core/hooks/useImageVariant'

export default function SuperAppLanding() {
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar
        position='fixed'
        color='default'
        elevation={settings.skin === 'bordered' ? 0 : 1}
        sx={theme => ({
          backgroundColor: theme.palette.background.paper,
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
            >
              Crear cuenta
            </Button>
            <Button variant='contained' color='primary' onClick={handleCognitoLogin}>
              Iniciar sesión en ORUS
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Spacer para header fijo */}
      <Toolbar />

      {/* Hero Section */}
      <Container id='hero' sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant='h3' component='h1' gutterBottom>
          ORUS 360: la super app corporativa para operar, colaborar y escalar
        </Typography>
        <Typography variant='h6' color='text.secondary' paragraph>
          Unifica procesos, datos y comunicación en una sola plataforma con seguridad empresarial.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant='contained' size='large' color='primary' onClick={handleCognitoLogin}>
            Iniciar sesión en ORUS
          </Button>
          <Button variant='outlined' size='large' sx={{ ml: 2 }} component={Link} href='#features'>
            Ver características
          </Button>
        </Box>
      </Container>

      {/* ¿Qué es? */}
      <Container id='que-es' sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems='center'>
          <Grid item xs={12} md={6}>
            <Typography variant='h4' gutterBottom>
              ¿Qué es ORUS 360?
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              ORUS 360 es una plataforma modular que centraliza la operación corporativa en una sola experiencia:
              personas, procesos, datos y comunicación, con seguridad empresarial y escalabilidad.
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Desde inventario y logística hasta colaboración y analítica, ORUS 360 integra tus flujos clave para
              acelerar la ejecución de tu negocio.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              sx={theme => ({ p: 4, backgroundColor: theme.palette.background.paper, textAlign: 'center' })}
              elevation={settings.skin === 'bordered' ? 0 : 3}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt='ORUS 360' height={80} />
              <Typography variant='subtitle1' sx={{ mt: 2 }}>
                Una sola plataforma. Todo tu negocio.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container id='caracteristicas' sx={{ py: 10 }}>
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
              <Paper
                sx={theme => ({
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  backgroundColor: theme.palette.background.paper,
                  border: settings.skin === 'bordered' ? `1px solid ${theme.palette.divider}` : undefined
                })}
                elevation={settings.skin === 'bordered' ? 0 : 3}
              >
                {f.icon}
                <Typography variant='h6' gutterBottom>
                  {f.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Preguntas frecuentes */}
      <Container id='faq' sx={{ py: 10 }}>
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

      {/* Colocar ticket */}
      <Container id='ticket' sx={{ py: 10 }}>
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
                  <Stack spacing={2}>
                    <TextField
                      label='Nombre'
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      required
                      fullWidth
                    />
                    <TextField
                      type='email'
                      label='Email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      fullWidth
                    />
                    <TextField label='Asunto' value={asunto} onChange={e => setAsunto(e.target.value)} fullWidth />
                    <TextField
                      label='Mensaje'
                      value={mensaje}
                      onChange={e => setMensaje(e.target.value)}
                      required
                      multiline
                      minRows={4}
                      fullWidth
                    />
                    <Stack direction='row' spacing={2}>
                      <Button type='submit' variant='contained'>
                        Enviar
                      </Button>
                      <Button variant='outlined' href='mailto:soporte@orus360.com'>
                        Enviar por correo
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA final */}
      <Container id='cta' sx={{ py: 10, textAlign: 'center' }}>
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
