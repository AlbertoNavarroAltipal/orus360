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
  const pendientes = data.filter(u => (u.cognitoStatus || '').toUpperCase() !== 'CONFIRMED').length
  const externos = data.filter(u => (u.email || '').toLowerCase().endsWith('@altipal.com.co') === false).length
  const verificados = data.filter(u => (u as any).emailVerified === true).length
  const pctVerificados = total ? Math.round((verificados / total) * 100) : 0
  const pctExternos = total ? Math.round((externos / total) * 100) : 0
  const pctActivos = total ? Math.round((activos / total) * 100) : 0
  const pctPendientes = total ? Math.round((pendientes / total) * 100) : 0

  const cards: UserDataType[] = [
    {
      title: 'Usuarios',
      stats: String(total),
      avatarIcon: 'ri-group-line',
      avatarColor: 'primary',
      trend: 'positive',
      trendNumber: '',
      subtitle: 'La cantidad total de usuarios internos y externos'
    },
    {
      title: 'Usuarios externos',
      stats: String(externos),
      avatarIcon: 'ri-user-shared-line',
      avatarColor: 'error',
      trend: 'neutral',
      trendNumber: `${pctExternos}% del total`,
      subtitle: 'Dominio distinto a @altipal.com.co'
    },
    {
      title: 'Usuarios activos',
      stats: String(activos),
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success',
      trend: 'neutral',
      trendNumber: `${pctActivos}% del total · ${pctVerificados}% `,
      subtitle: `Todos los usuarios activos y que están verificados`
    },
    {
      title: 'Usuarios pendientes',
      stats: String(pendientes),
      avatarIcon: 'ri-user-search-line',
      avatarColor: 'warning',
      trend: 'neutral',
      trendNumber: `${pctPendientes}% del total`,
      subtitle: 'Todo usuario que el estado sea diferente a verificado'
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
