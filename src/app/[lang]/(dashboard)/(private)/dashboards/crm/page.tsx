// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// Third-party / Auth Imports
import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

// Components Imports
import CardStatWithImage from '@components/card-statistics/Character'
import CardStatVertical from '@components/card-statistics/Vertical'
import Transactions from '@views/dashboards/crm/Transactions'
import TotalSales from '@views/dashboards/crm/TotalSales'
import RevenueReport from '@views/dashboards/crm/RevenueReport'
import CardWidgetsSalesOverview from '@views/dashboards/crm/SalesOverview'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'
import WeeklySales from '@views/dashboards/crm/WeeklySales'
import LineAreaChart from '@views/dashboards/crm/LineAreaChart'
import UpgradePlan from '@views/dashboards/crm/UpgradePlan'
import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
import DeveloperMeetup from '@views/dashboards/crm/DeveloperMeetup'

const DashboardCRM = async () => {
  const session = await getServerSession(authOptions)

  return (
    <Grid container spacing={6}>
      {/* Card: Información de la sesión del usuario */}
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card>
          <CardHeader
            avatar={<Avatar alt={session?.user?.name || ''} src={session?.user?.image || ''} />}
            title='Sesión de usuario'
            subheader={session ? 'Sesión activa' : 'Sin sesión'}
          />
          <CardContent>
            {session ? (
              <Box className='flex flex-col gap-2'>
                <Typography variant='body2'>
                  <strong>Nombre:</strong> {session.user?.name || '—'}
                </Typography>
                <Typography variant='body2'>
                  <strong>Email:</strong> {session.user?.email || '—'}
                </Typography>
                {session.user?.image ? (
                  <Typography variant='body2'>
                    <strong>Avatar:</strong> {session.user.image}
                  </Typography>
                ) : null}
                {session.expires ? (
                  <Typography variant='body2'>
                    <strong>Expira:</strong> {new Date(session.expires).toLocaleString()}
                  </Typography>
                ) : null}

                <Divider className='mlb-2' />
                <Typography variant='subtitle2' className='mbs-2'>
                  Datos completos
                </Typography>
                <Box component='pre' className='overflow-auto max-h-[260px] rounded bg-actionHover p-3 text-xs'>
                  {JSON.stringify(session, null, 2)}
                </Box>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No hay información de sesión disponible.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
        <CardStatWithImage
          stats='13k'
          title='Ratings'
          trendNumber='15.6%'
          chipColor='primary'
          src='/images/illustrations/characters/9.png'
          chipText={`Year of ${new Date().getFullYear()}`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }} className='self-end'>
        <CardStatWithImage
          stats='24.5k'
          trend='negative'
          title='Sessions'
          trendNumber='20%'
          chipText='Last Week'
          src='/images/illustrations/characters/10.png'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} className='self-end'>
        <Transactions />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TotalSales />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <RevenueReport />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CardWidgetsSalesOverview />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ActivityTimeline />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <WeeklySales />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 6, sm: 12 }}>
                <LineAreaChart />
              </Grid>
              <Grid size={{ xs: 6, sm: 12 }}>
                <CardStatVertical
                  stats='862'
                  trend='negative'
                  trendNumber='18%'
                  title='New Project'
                  subtitle='Yearly Project'
                  avatarColor='primary'
                  avatarIcon='ri-file-word-2-line'
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <UpgradePlan />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <MeetingSchedule />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <DeveloperMeetup />
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
