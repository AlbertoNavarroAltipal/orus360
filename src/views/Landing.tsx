'use client'

import React from 'react'

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar
        position='sticky'
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
          <Box>
            <Button
              href='https://us-east-1s5gznopkq.auth.us-east-1.amazoncognito.com/signup?client_id=5535e1dvldtrr2logi6sqfvkr6&code_challenge=0En9ycDofEFN2lHZGPTc751xoWMtEj23SHOCIq_dGek&code_challenge_method=S256&lang=es&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fcognito&response_type=code&scope=openid+email+profile&state=9LLxIGer2oFI1W_1XVJN_CeMyxeG-ErAxTsCNCJz5Vw'
              color='inherit'
            >
              Crear cuenta
            </Button>
            <Button variant='contained' color='primary' onClick={handleCognitoLogin}>
              Iniciar sesión en ORUS
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container sx={{ py: 10, textAlign: 'center' }}>
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

      {/* Features Section */}
      <Container id='features' sx={{ py: 10 }}>
        <Typography variant='h4' align='center' gutterBottom>
          Todo en uno para tu operación
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
