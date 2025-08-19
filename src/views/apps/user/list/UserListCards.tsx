// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

type Props = { data?: Array<{ email?: string; status?: string; cognitoStatus?: string }> }

const UserListCards = ({ data = [] }: Props) => {
  const total = data.length
  const activos = data.filter(u => (u.cognitoStatus || '').toUpperCase() === 'CONFIRMED').length
  const pendientes = data.filter(u => (u.cognitoStatus || '').toUpperCase() !== 'INACTIVE').length
  const externos = data.filter(u => (u.email || '').toLowerCase().endsWith('@altipal.com.co') === false).length

  const cards: UserDataType[] = [
    {
      title: 'Sesiones',
      stats: String(total),
      avatarIcon: 'ri-group-line',
      avatarColor: 'primary',
      trend: 'positive',
      trendNumber: '',
      subtitle: 'Usuarios totales'
    },
    {
      title: 'Usuarios externos',
      stats: String(externos),
      avatarIcon: 'ri-user-add-line',
      avatarColor: 'error',
      trend: 'positive',
      trendNumber: '',
      subtitle: 'Dominio distinto a @altipal.com.co'
    },
    {
      title: 'Usuarios activos',
      stats: String(activos),
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success',
      trend: 'neutral',
      trendNumber: '',
      subtitle: 'Cognito CONFIRMED'
    },
    {
      title: 'Usuarios pendientes',
      stats: String(pendientes),
      avatarIcon: 'ri-user-search-line',
      avatarColor: 'warning',
      trend: 'neutral',
      trendNumber: '',
      subtitle: 'No inactivos'
    }
  ]

  return (
    <Grid container spacing={6}>
      {cards.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
