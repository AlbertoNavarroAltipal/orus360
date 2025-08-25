// MUI Imports
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import RoleCards from './RoleCards'
import RolesTable from './RolesTable'

const Roles = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' className='mbe-1'>
          Lista de Roles
        </Typography>
        <Typography>
          Un rol proporciona acceso a menús y funcionalidades predefinidas, permitiendo que según el rol asignado, un
          administrador tenga acceso a lo que necesita.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RoleCards />
      </Grid>
      <Grid size={{ xs: 12 }} className='!pbs-12'>
        <Typography variant='h4' className='mbe-1'>
          Total de usuarios con sus roles
        </Typography>
        <Typography>Encuentra todas las cuentas administrativas de tu empresa y sus roles asociados.</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RolesTable />
      </Grid>
    </Grid>
  )
}

export default Roles
