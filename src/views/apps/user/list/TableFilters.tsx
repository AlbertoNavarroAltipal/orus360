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
  const [emailVerified, setEmailVerified] = useState<string>('')
  const [status, setStatus] = useState<UsersType['status']>('')
  const [phoneVerified, setPhoneVerified] = useState<string>('')

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (role && user.role !== role) return false

      if (emailVerified) {
        const want = emailVerified === 'true'

        if ((user as UsersType).emailVerified !== want) return false
      }

      if (phoneVerified) {
        const wantPhone = phoneVerified === 'true'

        if ((user as UsersType).phoneVerified !== wantPhone) return false
      }

      if (status && (user.cognitoStatus || user.status) !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [role, emailVerified, phoneVerified, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 3 }}>
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
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth>
            <InputLabel id='verified-select'>Correo verificado</InputLabel>
            <Select
              fullWidth
              id='select-verified'
              value={emailVerified}
              onChange={e => setEmailVerified(e.target.value)}
              label='Correo verificado'
              labelId='verified-select'
              inputProps={{ placeholder: 'Correo verificado' }}
            >
              <MenuItem value=''>Todos</MenuItem>
              <MenuItem value='true'>Sí</MenuItem>
              <MenuItem value='false'>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth>
            <InputLabel id='phone-verified-select'>Teléfono verificado</InputLabel>
            <Select
              fullWidth
              id='select-phone-verified'
              value={phoneVerified}
              onChange={e => setPhoneVerified(e.target.value)}
              label='Teléfono verificado'
              labelId='phone-verified-select'
              inputProps={{ placeholder: 'Teléfono verificado' }}
            >
              <MenuItem value=''>Todos</MenuItem>
              <MenuItem value='true'>Sí</MenuItem>
              <MenuItem value='false'>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
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
              <MenuItem value=''>Todos</MenuItem>
              <MenuItem value='UNCONFIRMED'>No confirmado</MenuItem>
              <MenuItem value='CONFIRMED'>Confirmado</MenuItem>
              <MenuItem value='ARCHIVED'>Archivado</MenuItem>
              <MenuItem value='COMPROMISED'>Comprometido</MenuItem>
              <MenuItem value='UNKNOWN'>Desconocido</MenuItem>
              <MenuItem value='RESET_REQUIRED'>Reinicio requerido</MenuItem>
              <MenuItem value='FORCE_CHANGE_PASSWORD'>Cambio de contraseña forzado</MenuItem>
              <MenuItem value='EXTERNAL_PROVIDER'>Proveedor externo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
