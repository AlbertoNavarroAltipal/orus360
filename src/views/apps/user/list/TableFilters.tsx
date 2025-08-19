// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

const TableFilters = ({ setData, tableData }: { setData: (data: UsersType[]) => void; tableData?: UsersType[] }) => {
  // States
  const [role, setRole] = useState<UsersType['role']>('')
  const [plan, setPlan] = useState<UsersType['currentPlan']>('')
  const [status, setStatus] = useState<UsersType['status']>('')

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (role && user.role !== role) return false
      if (plan && user.currentPlan !== plan) return false
      if (status && user.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [role, plan, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='role-select'>Selecciona rol</InputLabel>
            <Select
              fullWidth
              id='select-role'
              value={role}
              onChange={e => setRole(e.target.value)}
              label='Selecciona rol'
              labelId='role-select'
              inputProps={{ placeholder: 'Selecciona rol' }}
            >
              <MenuItem value=''>Selecciona rol</MenuItem>
              <MenuItem value='admin'>Administrador</MenuItem>
              <MenuItem value='author'>Autor</MenuItem>
              <MenuItem value='editor'>Editor</MenuItem>
              <MenuItem value='maintainer'>Mantenedor</MenuItem>
              <MenuItem value='subscriber'>Suscriptor</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='plan-select'>Selecciona plan</InputLabel>
            <Select
              fullWidth
              id='select-plan'
              value={plan}
              onChange={e => setPlan(e.target.value)}
              label='Selecciona plan'
              labelId='plan-select'
              inputProps={{ placeholder: 'Selecciona plan' }}
            >
              <MenuItem value=''>Selecciona plan</MenuItem>
              <MenuItem value='basic'>Basic</MenuItem>
              <MenuItem value='company'>Company</MenuItem>
              <MenuItem value='enterprise'>Enterprise</MenuItem>
              <MenuItem value='team'>Team</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Selecciona estado</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Selecciona estado'
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
              inputProps={{ placeholder: 'Selecciona estado' }}
            >
              <MenuItem value=''>Selecciona estado</MenuItem>
              <MenuItem value='pending'>Pendiente</MenuItem>
              <MenuItem value='active'>Activo</MenuItem>
              <MenuItem value='inactive'>Inactivo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
