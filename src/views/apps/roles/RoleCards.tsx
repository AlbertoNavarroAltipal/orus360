'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

// Types
interface Role {
  code: string
  description: string
  root: boolean
  created_at: string
  created_at_co: string
  created_by: string
}

interface RoleResponse {
  statusCode: number
  message: string
  data: Role[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface RoleDetail extends Role {
  usedByUsers: string[]
  permissions: Array<{
    code: string
    description: string
  }>
}

interface ErrorResponse {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string[]
}

const RoleCards = () => {
  // States
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  // Detail dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [roleDetail, setRoleDetail] = useState<RoleDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    description: '',
    root: false
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  const { data: session } = useSession()

  // API Functions
  const getAuthHeaders = () => {
    const token = (session as any)?.user?.masterToken
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = (session as any)?.user?.masterToken

      if (!token) {
        toast.error('No se encontró token de autenticación')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result: RoleResponse = await response.json()

      if (response.ok) {
        setRoles(result.data)
      } else {
        const errorResult = result as unknown as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al cargar roles')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoleDetail = async (code: string) => {
    try {
      setDetailLoading(true)
      const token = (session as any)?.user?.masterToken

      if (!token) {
        toast.error('No se encontró token de autenticación')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${code}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setRoleDetail(result.data)
        setDetailDialogOpen(true)
      } else {
        const errorResult = result as ErrorResponse
        toast.error(errorResult.message?.join(', ') || 'Error al cargar detalle del rol')
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDetailLoading(false)
    }
  }

  const createRole = async () => {
    try {
      setDialogLoading(true)
      setFormErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          root: formData.root
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Rol creado exitosamente')
        setDialogOpen(false)
        resetForm()
        fetchRoles()
      } else {
        const errorResult = result as ErrorResponse
        setFormErrors(errorResult.message || ['Error desconocido'])
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDialogLoading(false)
    }
  }

  const updateRole = async () => {
    if (!editingRole) return

    try {
      setDialogLoading(true)
      setFormErrors([])

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_ORUS_API}/api/roles/${editingRole.code}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          description: formData.description,
          root: formData.root
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Rol actualizado exitosamente')
        setDialogOpen(false)
        resetForm()
        fetchRoles()
      } else {
        const errorResult = result as ErrorResponse
        setFormErrors(errorResult.message || ['Error desconocido'])
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor')
    } finally {
      setDialogLoading(false)
    }
  }

  // Helper Functions
  const resetForm = () => {
    setFormData({
      description: '',
      root: false
    })
    setFormErrors([])
    setEditingRole(null)
  }

  const handleAddRole = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setFormData({
      description: role.description,
      root: role.root
    })
    setDialogOpen(true)
  }

  const handleDetailClick = (role: Role) => {
    fetchRoleDetail(role.code)
  }

  // Effects
  useEffect(() => {
    if (session) {
      fetchRoles()
    }
  }, [session])

  return (
    <>
      <Grid container spacing={6}>
        {/* Add Role Card */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card className='cursor-pointer bs-full' onClick={handleAddRole}>
            <Grid container className='bs-full'>
              <Grid size={{ xs: 5 }}>
                <div className='flex items-end justify-center bs-full'>
                  <img alt='add-role' src='/images/illustrations/characters/1.png' height={130} />
                </div>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <CardContent>
                  <div className='flex flex-col items-end gap-4 text-right'>
                    <Button variant='contained' size='small'>
                      Agregar Rol
                    </Button>
                    <Typography>
                      Agregar nuevo rol, <br />
                      si no existe.
                    </Typography>
                  </div>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Role Cards */}
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <div className='flex justify-center py-8'>
              <CircularProgress />
            </div>
          </Grid>
        ) : (
          roles.map((role, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={role.code}>
              <Card>
                <CardContent className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <Typography className='flex-grow'>
                      {`Total ${role.code === '1' ? '2' : Math.floor(Math.random() * 10) + 1} usuarios`}
                    </Typography>
                    <AvatarGroup total={role.code === '1' ? 2 : Math.floor(Math.random() * 10) + 1}>
                      {[1, 2, 3].map(num => (
                        <Avatar key={num} alt={role.description} src={`/images/avatars/${num}.png`} />
                      ))}
                    </AvatarGroup>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col items-start gap-1'>
                      <div className='flex items-center gap-2'>
                        <Typography
                          variant='h5'
                          className='cursor-pointer hover:underline'
                          onClick={() => handleDetailClick(role)}
                          color='primary'
                        >
                          {role.description}
                        </Typography>
                        {role.root && <Chip label='Root' color='error' size='small' />}
                      </div>
                      <Typography
                        component='span'
                        color='primary'
                        className='cursor-pointer hover:underline text-sm'
                        onClick={() => handleEditRole(role)}
                      >
                        Editar Rol
                      </Typography>
                    </div>
                    <IconButton onClick={() => handleDetailClick(role)}>
                      <i className='ri-file-copy-line text-secondary' />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{editingRole ? 'Editar Rol' : 'Crear Rol'}</DialogTitle>

        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity='error' className='mb-4'>
              <ul className='list-disc list-inside'>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className='flex flex-col gap-4 mt-4'>
            <TextField
              fullWidth
              label='Descripción'
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder='Descripción del rol'
              helperText='Entre 3 y 100 caracteres'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.root}
                  onChange={e => setFormData(prev => ({ ...prev, root: e.target.checked }))}
                />
              }
              label='Rol root (crítico del sistema)'
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={dialogLoading}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={editingRole ? updateRole : createRole} disabled={dialogLoading}>
            {dialogLoading && <CircularProgress size={16} className='mr-2' />}
            {editingRole ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth='lg' fullWidth>
        <DialogTitle className='flex items-center gap-2'>
          <i className='ri-shield-user-line' />
          Detalle del Rol
        </DialogTitle>

        <DialogContent>
          {detailLoading ? (
            <div className='flex justify-center py-8'>
              <CircularProgress />
            </div>
          ) : roleDetail ? (
            <div className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-1'>
                    Código
                  </Typography>
                  <Typography variant='body1' className='font-medium'>
                    {roleDetail.code}
                  </Typography>
                </div>

                <div>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-1'>
                    Tipo
                  </Typography>
                  <div>
                    {roleDetail.root ? (
                      <Chip label='Root' color='error' size='small' />
                    ) : (
                      <Chip label='Normal' color='default' size='small' />
                    )}
                  </div>
                </div>

                <div className='md:col-span-2'>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-1'>
                    Descripción
                  </Typography>
                  <Typography variant='body1'>{roleDetail.description}</Typography>
                </div>

                <div>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-1'>
                    Fecha de creación
                  </Typography>
                  <Typography variant='body1'>{roleDetail.created_at_co}</Typography>
                </div>

                <div>
                  <Typography variant='subtitle2' color='text.secondary' className='mb-1'>
                    Creado por
                  </Typography>
                  <Typography variant='body1' className='capitalize'>
                    {roleDetail.created_by}
                  </Typography>
                </div>
              </div>

              {/* Users */}
              <div>
                <Typography variant='subtitle1' className='mb-3 font-medium flex items-center gap-2'>
                  <i className='ri-user-line' />
                  Usuarios asignados ({roleDetail.usedByUsers.length})
                </Typography>
                {roleDetail.usedByUsers.length > 0 ? (
                  <div className='flex flex-wrap gap-2'>
                    {roleDetail.usedByUsers.map((email, index) => (
                      <Chip
                        key={index}
                        label={email}
                        variant='outlined'
                        color='primary'
                        size='small'
                        icon={<i className='ri-mail-line text-sm' />}
                      />
                    ))}
                  </div>
                ) : (
                  <Typography color='text.secondary' className='italic'>
                    No hay usuarios asignados a este rol
                  </Typography>
                )}
              </div>

              {/* Permissions */}
              <div>
                <Typography variant='subtitle1' className='mb-3 font-medium flex items-center gap-2'>
                  <i className='ri-shield-keyhole-line' />
                  Permisos asignados ({roleDetail.permissions.length})
                </Typography>
                {roleDetail.permissions.length > 0 ? (
                  <div className='max-h-60 overflow-y-auto'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                      {roleDetail.permissions.map((permission, index) => (
                        <div key={index} className='p-3 border rounded-lg'>
                          <Typography variant='body2' className='font-medium'>
                            {permission.code}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {permission.description}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Typography color='text.secondary' className='italic'>
                    No hay permisos asignados a este rol
                  </Typography>
                )}
              </div>

              {/* Summary */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography variant='subtitle2' className='mb-2 font-medium flex items-center gap-2'>
                  <i className='ri-bar-chart-line' />
                  Resumen
                </Typography>
                <div className='grid grid-cols-3 gap-4 text-sm'>
                  <div>
                    <Typography color='text.secondary'>Usuarios:</Typography>
                    <Typography className='font-medium'>{roleDetail.usedByUsers.length}</Typography>
                  </div>
                  <div>
                    <Typography color='text.secondary'>Permisos:</Typography>
                    <Typography className='font-medium'>{roleDetail.permissions.length}</Typography>
                  </div>
                  <div>
                    <Typography color='text.secondary'>Estado:</Typography>
                    <Typography className='font-medium'>{roleDetail.root ? 'Root' : 'Normal'}</Typography>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
          {roleDetail && (
            <Button
              variant='outlined'
              onClick={() => {
                setDetailDialogOpen(false)
                handleEditRole(roleDetail)
              }}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RoleCards
